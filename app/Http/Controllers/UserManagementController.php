<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = User::query()->with(['department', 'roles']);

        if ($user->hasRole('admin_departamento')) {
            $query->where('department_id', $user->department_id);
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('last_name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        $users = $query->orderBy('name')->paginate(15)->withQueryString();
        $departments = Department::all();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'departments' => $departments,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        $departments = Department::all();
        $roles = [
            'solicitante' => 'Solicitante',
            'tecnico' => 'Técnico',
            'admin_departamento' => 'Administrador de Departamento',
        ];

        if (request()->user()->hasRole('super_admin')) {
            $roles['super_admin'] = 'Super Administrador';
        }

        return Inertia::render('Users/Create', [
            'departments' => $departments,
            'roles' => $roles,
        ]);
    }

    public function edit(User $user)
    {
        $departments = Department::all();
        $roles = [
            'solicitante' => 'Solicitante',
            'tecnico' => 'Técnico',
            'admin_departamento' => 'Administrador de Departamento',
        ];

        if (request()->user()->hasRole('super_admin')) {
            $roles['super_admin'] = 'Super Administrador';
        }

        $user->load('roles');
        $user->append('full_name');

        return Inertia::render('Users/Edit', [
            'user' => $user,
            'departments' => $departments,
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $allowedRoles = ['solicitante', 'tecnico', 'admin_departamento'];

        if ($request->user()->hasRole('super_admin')) {
            $allowedRoles[] = 'super_admin';
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'department_id' => ['required', 'exists:departments,id'],
            'role' => ['required', 'string', 'in:' . implode(',', $allowedRoles)],
        ]);

        if ($validated['role'] === 'admin_departamento') {
            $existing = User::role('admin_departamento')
                ->where('department_id', $validated['department_id'])
                ->where('is_active', true)
                ->exists();

            if ($existing) {
                return back()->with('error', 'Este departamento ya tiene un Administrador de Departamento asignado.');
            }
        }

        $password = Str::random(10);

        $user = User::create([
            'name' => $validated['name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'] ?? null,
            'department_id' => $validated['department_id'],
            'password' => Hash::make($password),
            'is_active' => true,
        ]);

        $user->assignRole($validated['role']);

        try {
            $this->syncDepartmentHead($user, $validated['role'], $validated['department_id']);
        } catch (\InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()
            ->with('success', "Usuario creado exitosamente.")
            ->with('new_password', $password);
    }

    public function update(Request $request, User $user)
    {
        $allowedRoles = ['solicitante', 'tecnico', 'admin_departamento'];

        if ($request->user()->hasRole('super_admin')) {
            $allowedRoles[] = 'super_admin';
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'department_id' => ['required', 'exists:departments,id'],
            'role' => ['nullable', 'string', 'in:' . implode(',', $allowedRoles)],
        ]);

        if ($request->filled('role') && $validated['role'] === 'admin_departamento') {
            $existing = User::role('admin_departamento')
                ->where('department_id', $validated['department_id'])
                ->where('is_active', true)
                ->where('id', '!=', $user->id)
                ->exists();

            if ($existing) {
                return back()->with('error', 'Este departamento ya tiene un Administrador de Departamento asignado.');
            }
        }

        $oldRole = $user->getRoleNames()->first();
        $oldDepartmentId = $user->department_id;

        $user->update([
            'name' => $validated['name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'] ?? null,
            'department_id' => $validated['department_id'],
        ]);

        if ($request->filled('role')) {
            $user->syncRoles([$validated['role']]);

            try {
                if ($validated['role'] !== $oldRole) {
                    if ($oldRole === 'admin_departamento') {
                        $this->releaseDepartmentHead($user);
                    }
                    if ($validated['role'] === 'admin_departamento') {
                        $this->assignDepartmentHead($user, $validated['department_id']);
                    }
                } elseif ($oldRole === 'admin_departamento' && $validated['department_id'] != $oldDepartmentId) {
                    $this->releaseDepartmentHead($user);
                    $this->assignDepartmentHead($user, $validated['department_id']);
                }
            } catch (\InvalidArgumentException $e) {
                return back()->with('error', $e->getMessage());
            }
        }

        return back()->with('success', 'Usuario actualizado exitosamente.');
    }

    private function assignDepartmentHead(User $user, int $departmentId): void
    {
        $department = Department::findOrFail($departmentId);

        if ($department->head_of_area_id && $department->head_of_area_id !== $user->id) {
            throw new \InvalidArgumentException('Este departamento ya tiene un Administrador de Departamento asignado.');
        }

        $department->update(['head_of_area_id' => $user->id]);
    }

    private function releaseDepartmentHead(User $user): void
    {
        Department::where('head_of_area_id', $user->id)->update(['head_of_area_id' => null]);
    }

    private function syncDepartmentHead(User $user, string $role, int $departmentId): void
    {
        if ($role !== 'admin_departamento') {
            return;
        }

        $department = Department::findOrFail($departmentId);

        if ($department->head_of_area_id && $department->head_of_area_id !== $user->id) {
            throw new \InvalidArgumentException('Este departamento ya tiene un Administrador de Departamento asignado.');
        }

        $department->update(['head_of_area_id' => $user->id]);
    }

    public function resetPassword(User $user)
    {
        $password = Str::random(10);

        $user->update([
            'password' => Hash::make($password),
        ]);

        return back()
            ->with('success', "Contraseña restablecida exitosamente.")
            ->with('new_password', $password);
    }

    public function toggle(User $user)
    {
        $user->update([
            'is_active' => ! $user->is_active,
        ]);

        $estado = $user->is_active ? 'activado' : 'desactivado';

        return back()->with('success', "Usuario {$estado} exitosamente.");
    }

    public function destroy(User $user)
    {
        $user->delete();

        return back()->with('success', 'Usuario eliminado exitosamente.');
    }
}
