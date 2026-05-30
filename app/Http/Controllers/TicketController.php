<?php

namespace App\Http\Controllers;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Category;
use App\Models\Department;
use App\Models\Ticket;
use App\Models\User;
use App\Services\SlaCalculator;
use App\Services\TicketStateManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TicketController extends Controller
{
    public function __construct(
        private TicketStateManager $stateManager,
        private SlaCalculator $slaCalculator,
    ) {}

    public function index(Request $request)
    {
        $query = Ticket::query()
            ->with(['creator.department', 'assigned', 'category'])
            ->visibleTo($request->user());

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('code', 'ilike', "%{$search}%")
                    ->orWhere('title', 'ilike', "%{$search}%")
                    ->orWhere('description', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->input('priority'));
        }

        if ($request->filled('category')) {
            $query->where('category_id', $request->input('category'));
        }

        if ($request->filled('department')) {
            $query->whereHas('creator', function ($q) use ($request) {
                $q->where('department_id', $request->input('department'));
            });
        }

        if ($request->filled('assigned')) {
            $query->where('assigned_id', $request->input('assigned'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('entry_date', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('entry_date', '<=', $request->input('date_to'));
        }

        $tickets = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        $categories = Category::all();
        $departments = Department::all();
        $users = User::role(['tecnico', 'admin_departamento'])->where('is_active', true)->get();

        return Inertia::render('Tickets/Index', [
            'tickets' => $tickets,
            'categories' => $categories,
            'departments' => $departments,
            'users' => $users,
            'filters' => $request->only([
                'search', 'status', 'priority', 'category', 'department', 'assigned', 'date_from', 'date_to',
            ]),
            'statuses' => collect(TicketStatus::cases())->map(fn ($s) => [
                'value' => $s->value,
                'label' => $s->label(),
                'color' => $s->color(),
            ]),
            'priorities' => collect(TicketPriority::cases())->map(fn ($p) => [
                'value' => $p->value,
                'label' => $p->label(),
                'color' => $p->color(),
            ]),
        ]);
    }

    public function create()
    {
        $categories = Category::all();
        $priorities = collect(TicketPriority::cases())->map(fn ($p) => [
            'value' => $p->value,
            'label' => $p->label(),
            'description' => $p->description(),
        ]);

        return Inertia::render('Tickets/Create', [
            'categories' => $categories,
            'priorities' => $priorities,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'priority' => ['required', 'string', 'in:baja,media,alta,critica'],
            'category_id' => ['required', 'exists:categories,id'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $ticket = new Ticket();
        $ticket->code = Ticket::generateCode();
        $ticket->title = $validated['title'];
        $ticket->description = $validated['description'];
        $ticket->priority = TicketPriority::from($validated['priority']);
        $ticket->status = TicketStatus::Abierto;
        $ticket->creator_id = $request->user()->id;
        $ticket->category_id = $validated['category_id'];
        $ticket->entry_date = now();

        if ($request->hasFile('photo')) {
            $ticket->photo_path = $request->file('photo')->store('tickets/photos', 'public');
        }

        $ticket->save();

        $ticket->sla_response_deadline = $this->slaCalculator->calculateResponseDeadline($ticket);
        $ticket->sla_resolution_deadline = $this->slaCalculator->calculateResolutionDeadline($ticket);
        $ticket->save();

        $admins = User::role('admin_departamento')
            ->where('department_id', $request->user()->department_id)
            ->where('is_active', true)
            ->get();

        foreach ($admins as $admin) {
            $admin->notifications()->create([
                'ticket_id' => $ticket->id,
                'type' => 'ticket_created',
                'title' => 'Nuevo ticket creado',
                'message' => "Se ha creado el ticket {$ticket->code}: {$ticket->title}",
            ]);
        }

        return redirect()->route('tickets.show', $ticket)
            ->with('success', 'Ticket creado exitosamente.');
    }

    public function show(Ticket $ticket, Request $request)
    {
        Gate::authorize('view', $ticket);

        $ticket->load([
            'creator.department',
            'assigned',
            'category',
            'comments.user',
        ]);

        $slaInfo = [
            'response_deadline' => $ticket->sla_response_deadline?->toIso8601String(),
            'resolution_deadline' => $ticket->sla_resolution_deadline?->toIso8601String(),
            'is_overdue' => $this->slaCalculator->isOverdue($ticket),
            'is_response_overdue' => $this->slaCalculator->isResponseOverdue($ticket),
            'remaining_hours' => $this->slaCalculator->remainingTime($ticket),
            'total_hours' => $ticket->priority->slaHours(),
            'progress' => $this->slaCalculator->progressPercentage($ticket),
        ];

        $availableTransitions = [];
        foreach (TicketStatus::cases() as $status) {
            if ($this->stateManager->canTransition($ticket, $status, $request->user())) {
                $availableTransitions[] = [
                    'value' => $status->value,
                    'label' => $status->label(),
                ];
            }
        }

        $canAssign = $request->user()->hasAnyRole(['admin_departamento', 'super_admin']);
        $canChangePriority = $request->user()->hasAnyRole(['admin_departamento', 'super_admin']);

        $technicians = User::role('tecnico')
            ->where('is_active', true)
            ->get();

        $priorityLabels = collect(TicketPriority::cases())->mapWithKeys(fn ($p) => [
            $p->value => $p->description(),
        ]);

        return Inertia::render('Tickets/Show', [
            'ticket' => array_merge($ticket->toArray(), [
                'code' => $ticket->code,
                'title' => $ticket->title,
                'description' => $ticket->description,
                'priority' => $ticket->priority->value,
                'status' => $ticket->status->value,
                'status_label' => $ticket->status->label(),
                'priority_label' => $ticket->priority->label(),
                'creator' => $ticket->creator,
                'assigned' => $ticket->assigned,
                'category' => $ticket->category,
                'department' => $ticket->department,
                'comments' => $ticket->comments->map(fn ($c) => [
                    'id' => $c->id,
                    'body' => $c->body,
                    'is_internal' => $c->is_internal,
                    'created_at' => $c->created_at,
                    'user' => $c->user,
                ]),
                'entry_date' => $ticket->entry_date,
                'exit_date' => $ticket->exit_date,
                'photo_url' => $ticket->photo_path ? Storage::url($ticket->photo_path) : null,
                'assigned_id' => $ticket->assigned_id,
                'sla_response_deadline' => $ticket->sla_response_deadline,
                'sla_resolution_deadline' => $ticket->sla_resolution_deadline,
            ]),
            'sla' => $slaInfo,
            'transitions' => $availableTransitions,
            'canAssign' => $canAssign,
            'canChangePriority' => $canChangePriority,
            'technicians' => $technicians,
            'priorityLabels' => $priorityLabels,
        ]);
    }

    public function assign(Ticket $ticket, Request $request)
    {
        Gate::authorize('assign', $ticket);

        $validated = $request->validate([
            'assigned_id' => ['required', 'exists:users,id'],
        ]);

        $tech = User::where('id', $validated['assigned_id'])
            ->where('is_active', true)
            ->firstOrFail();

        $ticket->assigned_id = $tech->id;
        $ticket->save();

        $tech->notifications()->create([
            'ticket_id' => $ticket->id,
            'type' => 'ticket_assigned',
            'title' => 'Ticket asignado',
            'message' => "Se te ha asignado el ticket {$ticket->code}: {$ticket->title}",
        ]);

        return back()->with('success', 'Ticket asignado exitosamente.');
    }

    public function transition(Ticket $ticket, Request $request)
    {
        $validated = $request->validate([
            'status' => ['required', 'string'],
            'motivo' => ['nullable', 'string', 'required_if:status,abierto', 'max:1000'],
        ]);

        $newStatus = TicketStatus::from($validated['status']);

        try {
            $this->stateManager->transition($ticket, $newStatus, $request->user());
        } catch (\InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        if ($request->filled('motivo')) {
            $ticket->comments()->create([
                'user_id' => $request->user()->id,
                'body' => "Ticket reabierto. Motivo: {$validated['motivo']}",
                'is_internal' => false,
            ]);
        }

        $creator = $ticket->creator;
        if ($creator && $creator->id !== $request->user()->id) {
            $creator->notifications()->create([
                'ticket_id' => $ticket->id,
                'type' => 'status_changed',
                'title' => 'Estado de ticket actualizado',
                'message' => "El ticket {$ticket->code} ahora está en estado: {$newStatus->label()}",
            ]);
        }

        return back()->with('success', 'Estado del ticket actualizado exitosamente.');
    }

    public function changePriority(Ticket $ticket, Request $request)
    {
        if (! $request->user()->hasAnyRole(['admin_departamento', 'super_admin'])) {
            abort(403, 'No autorizado.');
        }

        $validated = $request->validate([
            'priority' => ['required', 'string', 'in:baja,media,alta,critica'],
        ]);

        $oldPriority = $ticket->priority;
        $newPriority = TicketPriority::from($validated['priority']);

        $ticket->priority = $newPriority;

        // Recalculate resolution deadline from the ORIGINAL entry_date with new priority
        $ticket->sla_resolution_deadline = $this->slaCalculator->recalculateResolutionDeadline($ticket, $newPriority);
        $ticket->save();

        return back()->with('success', "Prioridad cambiada de {$oldPriority->label()} a {$newPriority->label()}.");
    }

    public function destroy(Ticket $ticket)
    {
        Gate::authorize('delete', $ticket);

        $ticket->delete();

        return redirect()->route('tickets.index')
            ->with('success', 'Ticket eliminado exitosamente.');
    }
}
