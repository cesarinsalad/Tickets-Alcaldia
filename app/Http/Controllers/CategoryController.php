<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        if (! $request->user()->hasRole('super_admin')) {
            abort(403, 'No autorizado.');
        }

        $query = Category::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'ilike', "%{$search}%");
        }

        $categories = $query->orderBy('name')->get();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        if (! $request->user()->hasRole('super_admin')) {
            abort(403, 'No autorizado.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories'],
            'estimated_hours' => ['nullable', 'integer', 'min:1'],
        ]);

        Category::create($validated);

        return back()->with('success', 'Categoría creada exitosamente.');
    }

    public function update(Request $request, Category $category)
    {
        if (! $request->user()->hasRole('super_admin')) {
            abort(403, 'No autorizado.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name,' . $category->id],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $category->update($validated);

        return back()->with('success', 'Categoría actualizada exitosamente.');
    }

    public function destroy(Category $category)
    {
        if (! request()->user()->hasRole('super_admin')) {
            abort(403, 'No autorizado.');
        }

        $activeTickets = Ticket::where('category_id', $category->id)
            ->whereNotIn('status', ['cerrado'])
            ->count();

        if ($activeTickets > 0) {
            return back()->with('error', 'No se puede eliminar la categoría porque tiene tickets activos.');
        }

        $category->delete();

        return back()->with('success', 'Categoría eliminada exitosamente.');
    }
}
