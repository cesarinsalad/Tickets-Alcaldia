<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionController extends Controller
{
    protected array $baseRoles = ['super_admin', 'admin_tickets', 'admin_departamento', 'tecnico', 'solicitante'];

    public function index()
    {
        if (! request()->user()->hasPermissionTo('gestionar roles')) {
            abort(403);
        }

        $roles = Role::with('permissions')->get()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'label' => $this->roleLabel($role->name),
                'is_base' => in_array($role->name, $this->baseRoles),
                'permissions' => $role->permissions->pluck('name'),
                'permissions_count' => $role->permissions->count(),
                'dashboard_template' => $role->dashboard_template,
            ];
        });

        $permissions = Permission::select('id', 'name', 'module')
            ->orderBy('module')
            ->orderBy('name')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'module' => $p->module,
            ])
            ->values();

        return Inertia::render('Roles/Index', [
            'roles' => $roles,
            'allPermissions' => $permissions,
        ]);
    }

    public function store(Request $request)
    {
        if (! $request->user()->hasPermissionTo('gestionar roles')) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50', 'unique:roles,name'],
            'permissions' => ['array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
            'dashboard_template' => ['required', 'string', 'exists:roles,dashboard_template'],
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'dashboard_template' => $request->input('dashboard_template'),
        ]);
        $role->syncPermissions($validated['permissions'] ?? []);
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        return back()->with('success', 'Rol creado exitosamente.');
    }

    public function update(Request $request, Role $role)
    {
        if (! $request->user()->hasPermissionTo('gestionar roles')) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50', 'unique:roles,name,' . $role->id],
            'permissions' => ['array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role->update(['name' => $validated['name']]);
        $role->syncPermissions($validated['permissions'] ?? []);
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        return back()->with('success', 'Rol actualizado exitosamente.');
    }

    public function destroy(Role $role)
    {
        if (! request()->user()->hasPermissionTo('gestionar roles')) {
            abort(403);
        }

        if (in_array($role->name, $this->baseRoles)) {
            return back()->with('error', 'No se puede eliminar un rol base del sistema.');
        }

        if ($role->users()->count() > 0) {
            return back()->with('error', 'No se puede eliminar un rol con usuarios asignados.');
        }

        $role->delete();

        return back()->with('success', 'Rol eliminado exitosamente.');
    }

    public function storePermission(Request $request)
    {
        if (! $request->user()->hasPermissionTo('gestionar roles')) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50', 'unique:permissions,name'],
            'module' => ['nullable', 'string', 'max:50'],
        ]);

        Permission::create([
            'name' => $validated['name'],
            'module' => $validated['module'] ?? null,
        ]);

        return back()->with('success', 'Permiso creado exitosamente.');
    }

    public function destroyPermission(Permission $permission)
    {
        if (! request()->user()->hasPermissionTo('gestionar roles')) {
            abort(403);
        }

        $permission->delete();

        return back()->with('success', 'Permiso eliminado exitosamente.');
    }

    public function batchSync(Request $request)
    {
        if (! $request->user()->hasPermissionTo('gestionar roles')) {
            abort(403);
        }

        $validated = $request->validate([
            'roles' => ['required', 'array'],
            'roles.*' => ['array'],
            'roles.*.*' => ['string', 'exists:permissions,name'],
        ]);

        foreach ($validated['roles'] as $roleName => $permissions) {
            $role = Role::where('name', $roleName)->first();
            if ($role) {
                $role->syncPermissions($permissions);
            }
        }
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        return back()->with('success', 'Permisos actualizados exitosamente.');
    }

    private function roleLabel(string $name): string
    {
        return match ($name) {
            'super_admin' => 'Super Administrador',
            'admin_tickets' => 'Administrador de Tickets',
            'admin_departamento' => 'Administrador de Departamento',
            'tecnico' => 'Técnico',
            'solicitante' => 'Solicitante',
            default => $name,
        };
    }
}
