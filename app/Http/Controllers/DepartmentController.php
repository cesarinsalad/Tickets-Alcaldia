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
        $departments = Department::with('headOfArea')->withCount('users')->orderBy('name')->get();

        $availableAdmins = User::role('admin_departamento')
            ->whereNull('department_id')
            ->where('is_active', true)
            ->get()
            ->append('full_name');

        return Inertia::render('Departments/Index', [
            'departments' => $departments,
            'availableAdmins' => $availableAdmins,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:departments'],
            'physical_address' => ['nullable', 'string', 'max:500'],
            'head_of_area_id' => ['required', 'exists:users,id'],
        ]);

        $admin = User::where('id', $validated['head_of_area_id'])
            ->where('is_active', true)
            ->whereNull('department_id')
            ->role('admin_departamento')
            ->first();

        if (! $admin) {
            return back()->with('error', 'El usuario seleccionado no es un administrador de departamento disponible.');
        }

        $department = Department::create([
            'name' => $validated['name'],
            'physical_address' => $validated['physical_address'],
            'head_of_area_id' => $admin->id,
        ]);

        $admin->update(['department_id' => $department->id]);

        return back()->with('success', 'Departamento creado exitosamente.');
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

        return back()->with('success', 'Departamento actualizado exitosamente.');
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
