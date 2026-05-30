<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'crear ticket',
            'gestionar ticket',
            'asignar ticket',
            'ver todos los tickets',
            'ver tickets de direccion',
            'ver tickets asignados',
            'gestionar usuarios',
            'gestionar categorias',
            'generar reportes',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission);
        }

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $solicitante = Role::findOrCreate('solicitante');
        $tecnico = Role::findOrCreate('tecnico');
        $adminDireccion = Role::findOrCreate('admin_departamento');
        $superAdmin = Role::findOrCreate('super_admin');

        $solicitante->syncPermissions(Permission::whereIn('name', [
            'crear ticket',
        ])->get());

        $tecnico->syncPermissions(Permission::whereIn('name', [
            'gestionar ticket',
            'ver tickets asignados',
            'generar reportes',
        ])->get());

        $adminDireccion->syncPermissions(Permission::whereIn('name', [
            'crear ticket',
            'gestionar ticket',
            'asignar ticket',
            'ver tickets de direccion',
            'gestionar usuarios',
            'generar reportes',
        ])->get());

        $superAdmin->syncPermissions(Permission::whereIn('name', [
            'crear ticket',
            'gestionar ticket',
            'asignar ticket',
            'ver todos los tickets',
            'gestionar usuarios',
            'gestionar categorias',
            'generar reportes',
        ])->get());
    }
}
