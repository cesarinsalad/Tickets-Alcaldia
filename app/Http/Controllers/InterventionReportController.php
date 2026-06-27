<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use App\Models\InterventionReport;
use App\Models\Ticket;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class InterventionReportController extends Controller
{
    public function index(Request $request)
    {
        if (! $request->user()->hasPermissionTo('ver equipos')) {
            abort(403);
        }

        $query = Equipment::query()
            ->withCount('interventionReports')
            ->with(['interventionReports' => fn ($q) => $q->latest()->limit(1)->with('ticket')]);

        $allowedSorts = ['sku', 'brand', 'model', 'processor', 'ram_memory', 'storage_disk', 'intervention_reports_count'];
        $sort = $request->input('sort', 'updated_at');
        $dir = strtolower($request->input('dir', 'desc'));
        if (!in_array($sort, $allowedSorts)) {
            $sort = 'updated_at';
        }
        if (!in_array($dir, ['asc', 'desc'])) {
            $dir = 'desc';
        }

        if ($sort === 'intervention_reports_count') {
            $query->orderBy('intervention_reports_count', $dir);
        } else {
            $query->orderBy($sort, $dir);
        }

        if ($request->filled('search')) {
            $term = $request->input('search');
            $query->where(function ($q) use ($term) {
                $q->where('sku', 'ilike', "%{$term}%")
                  ->orWhere('brand', 'ilike', "%{$term}%")
                  ->orWhere('model', 'ilike', "%{$term}%");
            });
        }

        if ($request->boolean('recurrence')) {
            $query->whereHas('interventionReports', function ($q) {
                $q->whereMonth('created_at', now()->month)
                  ->whereYear('created_at', now()->year);
            }, '>=', 2);
        }

        if ($request->boolean('ram_lt')) {
            $query->whereNotNull('ram_memory')
                  ->where('ram_memory', '!=', '')
                  ->whereRaw("ram_memory ~ '^\\d+GB'")
                  ->whereRaw("CAST(regexp_replace(ram_memory, '^(\\d+)GB.*$', '\\1') AS INTEGER) < ?", [8]);
        }

        if ($request->boolean('disk_hdd')) {
            $query->where('storage_disk', 'ilike', '%HDD%');
        }

        $equipment = $query->paginate(15)->withQueryString();

        $totalCount = Equipment::count();
        $highRecurrenceCount = Equipment::whereHas('interventionReports', function ($q) {
            $q->whereMonth('created_at', now()->month)
              ->whereYear('created_at', now()->year);
        }, '>=', 2)->count();

        $bajaRamCount = Equipment::whereNotNull('ram_memory')
            ->where('ram_memory', '!=', '')
            ->whereRaw("ram_memory ~ '^\\d+GB'")
            ->whereRaw("CAST(regexp_replace(ram_memory, '^(\\d+)GB.*$', '\\1') AS INTEGER) < ?", [8])
            ->count();

        $hddCount = Equipment::where('storage_disk', 'ilike', '%HDD%')->count();

        return Inertia::render('Equipments/Index', [
            'equipment' => $equipment,
            'filters' => array_merge(
                $request->only(['search']),
                [
                    'recurrence' => $request->boolean('recurrence'),
                    'ram_lt' => $request->boolean('ram_lt'),
                    'disk_hdd' => $request->boolean('disk_hdd'),
                    'sort' => $sort,
                    'dir' => $dir,
                ],
            ),
            'totalCount' => $totalCount,
            'highRecurrenceCount' => $highRecurrenceCount,
            'bajaRamCount' => $bajaRamCount,
            'hddCount' => $hddCount,
        ]);
    }

    public function show(Equipment $equipment)
    {
        if (! request()->user()->hasPermissionTo('ver equipos')) {
            abort(403);
        }

        $equipment->load([
            'interventionReports' => fn ($q) => $q->latest()->with([
                'ticket.creator.department',
                'ticket.assigned',
            ]),
        ]);

        return Inertia::render('Equipments/Show', [
            'equipment' => $equipment,
        ]);
    }

    public function lookup(Request $request)
    {
        if (! $request->user()->hasPermissionTo('gestionar equipos')) {
            abort(403);
        }

        $equipment = Equipment::where('sku', $request->route('sku'))->first();

        if (! $equipment) {
            return response()->json(null, 404);
        }

        return response()->json([
            'sku' => $equipment->sku,
            'brand' => $equipment->brand,
            'model' => $equipment->model,
            'processor' => $equipment->processor,
            'ram_memory' => $equipment->ram_memory,
            'storage_disk' => $equipment->storage_disk,
        ]);
    }

    public function generate(Request $request, Ticket $ticket)
    {
        if (! $request->user()->hasPermissionTo('gestionar equipos')) {
            abort(403);
        }

        Gate::authorize('view', $ticket);

        $validated = $request->validate([
            'sku' => ['required', 'string', 'max:100'],
            'brand' => ['nullable', 'string', 'max:20'],
            'model' => ['nullable', 'string', 'max:30'],
            'processor' => ['nullable', 'string', 'max:35'],
            'ram_memory' => ['nullable', 'string', 'max:100'],
            'storage_disk' => ['nullable', 'string', 'max:100'],
            'diagnostic' => ['required', 'string', 'max:5000'],
        ]);

        $equipment = Equipment::updateOrCreate(
            ['sku' => $validated['sku']],
            collect($validated)->only(['brand', 'model', 'processor', 'ram_memory', 'storage_disk'])->toArray()
        );

        $report = $ticket->interventionReports()->create([
            'equipment_id' => $equipment->id,
            'diagnostic' => $validated['diagnostic'],
        ]);

        $ticket->load(['creator.department', 'assigned', 'category']);

        $pdf = Pdf::loadView('pdf.intervention-report', [
            'ticket' => $ticket,
            'equipment' => $equipment,
            'report' => $report,
        ]);

        return $pdf->download("informe-retiro-{$ticket->code}.pdf");
    }

    public function showPdf(InterventionReport $report)
    {
        // Auth check removed temporarily

        $report->load(['ticket.creator.department', 'ticket.assigned', 'ticket.category', 'equipment']);

        $ticket = $report->ticket;

        // Gate::authorize removed temporarily

        $pdf = Pdf::loadView('pdf.intervention-report', [
            'ticket' => $ticket,
            'equipment' => $report->equipment,
            'report' => $report,
        ]);

        return $pdf->stream("informe-retiro-{$ticket->code}.pdf");
    }
}
