<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    public function index()
    {
        $departments = Department::withCount('users')->orderBy('name')->get();

        return Inertia::render('Departments/Index', [
            'departments' => $departments,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:departments'],
            'physical_address' => ['nullable', 'string', 'max:500'],
            'head_of_area' => ['required', 'string', 'max:255'],
        ]);

        Department::create($validated);

        return back()->with('success', 'Departamento creado exitosamente.');
    }

    public function update(Request $request, Department $department)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:departments,name,' . $department->id],
            'physical_address' => ['nullable', 'string', 'max:500'],
            'head_of_area' => ['required', 'string', 'max:255'],
        ]);

        $department->update($validated);

        return back()->with('success', 'Departamento actualizado exitosamente.');
    }

    public function destroy(Department $department)
    {
        $activeUsers = User::where('department_id', $department->id)
            ->where('is_active', true)
            ->count();

        if ($activeUsers > 0) {
            return back()->with('error', 'No se puede eliminar el departamento porque tiene usuarios activos.');
        }

        $department->delete();

        return back()->with('success', 'Departamento eliminado exitosamente.');
    }
}
