<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MetricasController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $dateFrom = $request->filled('date_from')
            ? Carbon::parse($request->input('date_from'))->startOfDay()
            : now()->startOfMonth();
        $dateTo = $request->filled('date_to')
            ? Carbon::parse($request->input('date_to'))->endOfDay()
            : now()->endOfMonth();

        $topDepartments = DB::table('tickets')
            ->join('users', 'tickets.creator_id', '=', 'users.id')
            ->join('departments', 'users.department_id', '=', 'departments.id')
            ->select('departments.id', 'departments.name', DB::raw('count(*) as count'))
            ->whereNull('tickets.deleted_at')
            ->whereNull('users.deleted_at')
            ->whereNull('departments.deleted_at')
            ->whereBetween('tickets.entry_date', [$dateFrom, $dateTo])
            ->groupBy('departments.id', 'departments.name')
            ->orderByDesc('count')
            ->take(5)
            ->get();

        $categoryDistribution = Category::select('id', 'name')
            ->withCount(['tickets' => function ($q) use ($dateFrom, $dateTo) {
                $q->whereNull('tickets.deleted_at')
                  ->whereBetween('entry_date', [$dateFrom, $dateTo]);
            }])
            ->orderByDesc('tickets_count')
            ->get()
            ->filter(fn ($c) => $c->tickets_count > 0)
            ->values()
            ->map(fn ($c) => ['id' => $c->id, 'name' => $c->name, 'count' => $c->tickets_count]);

        return Inertia::render('Metricas/Index', [
            'topDepartments' => $topDepartments,
            'categoryDistribution' => $categoryDistribution,
            'dateFrom' => $dateFrom->toDateString(),
            'dateTo' => $dateTo->toDateString(),
        ]);
    }
}
