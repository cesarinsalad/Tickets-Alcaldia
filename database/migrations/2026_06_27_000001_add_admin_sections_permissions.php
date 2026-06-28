<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    public function up(): void
    {
        $permissions = [
            ['name' => 'ver rendimiento', 'module' => 'rendimiento'],
            ['name' => 'ver reportes administrativos', 'module' => 'reportes_admin'],
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(
                ['name' => $perm['name'], 'guard_name' => 'web'],
                $perm,
            );
        }

        foreach (['super_admin', 'admin_tickets'] as $roleName) {
            $role = Role::where('name', $roleName)->first();
            if ($role) {
                $role->givePermissionTo('ver rendimiento');
                $role->givePermissionTo('ver reportes administrativos');
            }
        }

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    }

    public function down(): void
    {
        foreach (['super_admin', 'admin_tickets'] as $roleName) {
            $role = Role::where('name', $roleName)->first();
            if ($role) {
                $role->revokePermissionTo('ver rendimiento');
                $role->revokePermissionTo('ver reportes administrativos');
            }
        }

        Permission::whereIn('name', [
            'ver rendimiento', 'ver reportes administrativos',
        ])->delete();

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    }
};
