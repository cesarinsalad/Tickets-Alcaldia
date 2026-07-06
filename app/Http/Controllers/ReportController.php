<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Ticket;
use App\Models\User;
use App\Exports\TicketsExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
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
            $statuses = explode(',', $request->input('status'));
            $query->whereIn('status', $statuses);
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

        if ($request->filled('creator')) {
            $query->where('creator_id', $request->input('creator'));
        }

        if ($request->filled('overdue')) {
            $query->whereIn('status', ['abierto', 'en_proceso', 'pendiente_informacion'])
                ->whereNotNull('sla_resolution_deadline')
                ->where('sla_resolution_deadline', '<', now())
                ->orderBy('assigned_id');
        }

        if ($request->filled('critical_overdue')) {
            $query->whereIn('status', ['abierto', 'en_proceso', 'pendiente_informacion'])
                ->where(function ($q) {
                    $q->where('priority', 'critica')
                      ->orWhere(function ($q2) {
                          $q2->whereNotNull('sla_resolution_deadline')
                             ->where('sla_resolution_deadline', '<', now());
                      });
                })
                ->orderBy('assigned_id');
        }

        if ($request->input('sla') === 'missed' && str_contains($request->input('status', ''), 'resuelto')) {
            $query->whereNotNull('sla_resolution_deadline')
                ->whereColumn('exit_date', '>', 'sla_resolution_deadline');
        }

        $statusValue = $request->input('status', '');
        $dateField = $statusValue && (str_contains($statusValue, 'resuelto') || str_contains($statusValue, 'cerrado'))
            ? 'exit_date' : 'entry_date';

        if ($request->filled('date_from')) {
            $query->whereDate($dateField, '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate($dateField, '<=', $request->input('date_to'));
        }

        $tickets = $query->orderBy('created_at', 'desc')->get();

        $categoryLabel = null;
        if ($request->filled('category')) {
            $categoryLabel = Category::find($request->input('category'))?->name;
        }

        $filters = [
            'search' => $request->input('search'),
            'status' => $request->input('status'),
            'priority' => $request->input('priority'),
            'category' => $request->input('category'),
            'category_label' => $categoryLabel,
            'date_from' => $request->input('date_from'),
            'date_to' => $request->input('date_to'),
        ];

        $rows = collect($tickets->map(fn ($t) => [
            $t->code,
            $t->title,
            $t->creator?->full_name ?? '—',
            $t->creator?->department?->name ?? '—',
            $t->priority->label(),
            $t->status->label(),
            $t->category?->name ?? '—',
            $t->assigned?->full_name ?? '—',
            $t->entry_date?->format('d/m/Y H:i'),
        ])->toArray());

        return Excel::download(
            new TicketsExport($rows),
            'reporte-tickets-' . now()->format('Ymd-His') . '.xlsx',
        );
    }

    public function show(Ticket $ticket)
    {
        Gate::authorize('view', $ticket);

        $ticket->load([
            'creator.department',
            'assigned',
            'category',
            'comments' => function ($query) {
                $query->with('user')->orderBy('created_at');
            },
        ]);

        $publicComments = $ticket->comments->where('is_internal', false);
        $internalComments = $ticket->comments->where('is_internal', true);

        $pdf = Pdf::loadView('pdf.ticket-report', [
            'ticket' => $ticket,
            'publicComments' => $publicComments,
            'internalComments' => $internalComments,
        ]);

        return $pdf->download("reporte-{$ticket->code}.pdf");
    }

    public function receipt(Ticket $ticket)
    {
        Gate::authorize('view', $ticket);

        $ticket->load([
            'creator.department',
            'assigned',
            'category',
        ]);

        $pdf = Pdf::loadView('pdf.satisfaction-receipt', [
            'ticket' => $ticket,
        ]);

        return $pdf->download("constancia-{$ticket->code}.pdf");
    }
}
