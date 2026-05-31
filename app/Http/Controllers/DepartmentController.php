<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Department::query()->with('headOfArea')->withCount('users');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'ilike', "%{$search}%");
        }

        $perPage = (int) $request->input('per_page', 10);
        if (! in_array($perPage, [10, 25, 50, 100])) {
            $perPage = 10;
        }

        $departments = $query->orderBy('name')->paginate($perPage)->withQueryString();

        return Inertia::render('Departments/Index', [
            'departments' => $departments,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Departments/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:departments'],
            'physical_address' => ['nullable', 'string', 'max:500'],
        ]);

        Department::create([
            'name' => $validated['name'],
            'physical_address' => $validated['physical_address'],
        ]);

        return redirect()->route('departments.index')
            ->with('success', 'Departamento creado exitosamente.');
    }

    public function edit(Department $department)
    {
        $department->load('headOfArea');

        $availableAdmins = User::role('admin_departamento')
            ->where('is_active', true)
            ->where(function ($q) use ($department) {
                $q->whereNull('department_id')
                    ->orWhere('id', $department->head_of_area_id);
            })
            ->whereNotIn('id', function ($q) use ($department) {
                $q->select('head_of_area_id')
                    ->from('departments')
                    ->whereNotNull('head_of_area_id')
                    ->where('id', '!=', $department->id);
            })
            ->get()
            ->append('full_name');

        return Inertia::render('Departments/Edit', [
            'department' => $department,
            'availableAdmins' => $availableAdmins,
        ]);
    }

    public function update(Request $request, Department $department)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:departments,name,' . $department->id],
            'physical_address' => ['nullable', 'string', 'max:500'],
            'head_of_area_id' => ['nullable', 'exists:users,id'],
        ]);

        if ($validated['head_of_area_id'] !== $department->head_of_area_id) {
            $oldAdmin = $department->headOfArea;
            if ($oldAdmin) {
                $oldAdmin->update(['department_id' => null]);
            }

            if ($validated['head_of_area_id']) {
                $alreadyHead = Department::where('head_of_area_id', $validated['head_of_area_id'])
                    ->where('id', '!=', $department->id)
                    ->exists();

                if ($alreadyHead) {
                    return back()->with('error', 'El usuario seleccionado ya es jefe de otro departamento.');
                }

                $newAdmin = User::where('id', $validated['head_of_area_id'])
                    ->where('is_active', true)
                    ->whereNull('department_id')
                    ->role('admin_departamento')
                    ->first();

                if (! $newAdmin) {
                    return back()->with('error', 'El usuario seleccionado no es un administrador de departamento disponible.');
                }

                $newAdmin->update(['department_id' => $department->id]);
            }
        }

        $department->update([
            'name' => $validated['name'],
            'physical_address' => $validated['physical_address'],
            'head_of_area_id' => $validated['head_of_area_id'],
        ]);

        return redirect()->route('departments.index')
            ->with('success', 'Departamento actualizado exitosamente.');
    }

    public function destroy(Department $department)
    {
        $activeUsers = User::where('department_id', $department->id)
            ->where('is_active', true)
            ->where('id', '!=', $department->head_of_area_id)
            ->count();

        if ($activeUsers > 0) {
            return back()->with('error', 'No se puede eliminar el departamento porque tiene usuarios activos.');
        }

        if ($department->headOfArea) {
            $department->headOfArea->update(['department_id' => null]);
        }

        $department->delete();

        return back()->with('success', 'Departamento eliminado exitosamente.');
    }
}
