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
            ['name' => 'crear ticket',              'module' => 'tickets'],
            ['name' => 'gestionar ticket',          'module' => 'tickets'],
            ['name' => 'asignar ticket',            'module' => 'tickets'],
            ['name' => 'ver todos los tickets',     'module' => 'tickets'],
            ['name' => 'ver tickets de direccion',  'module' => 'tickets'],
            ['name' => 'ver tickets asignados',     'module' => 'tickets'],
            ['name' => 'gestionar usuarios',        'module' => 'usuarios'],
            ['name' => 'gestionar categorias',      'module' => 'categorias'],
            ['name' => 'gestionar departamentos',   'module' => 'departamentos'],
            ['name' => 'generar reportes',          'module' => 'reportes'],
            ['name' => 'ver equipos',               'module' => 'equipos'],
            ['name' => 'gestionar equipos',         'module' => 'equipos'],
            ['name' => 'ver articulos',             'module' => 'knowledge'],
            ['name' => 'crear articulos',           'module' => 'knowledge'],
            ['name' => 'publicar articulos',        'module' => 'knowledge'],
            ['name' => 'eliminar articulos',        'module' => 'knowledge'],
            ['name' => 'gestionar roles',           'module' => 'roles'],
            ['name' => 'gestionar sla',             'module' => 'sla'],
            ['name' => 'ver rendimiento',           'module' => 'rendimiento'],
            ['name' => 'ver reportes administrativos', 'module' => 'reportes_admin'],
        ];

        foreach ($permissions as $p) {
            Permission::findOrCreate($p['name']);
        }

        foreach ($permissions as $p) {
            Permission::where('name', $p['name'])->update(['module' => $p['module']]);
        }

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $solicitante = Role::findOrCreate('solicitante');
        $tecnico = Role::findOrCreate('tecnico');
        $adminDepartamento = Role::findOrCreate('admin_departamento');
        $adminTickets = Role::findOrCreate('admin_tickets');
        $superAdmin = Role::findOrCreate('super_admin');

        $templates = ['solicitante', 'tecnico', 'admin_departamento', 'admin_tickets', 'super_admin'];
        foreach ($templates as $name) {
            Role::where('name', $name)->update(['dashboard_template' => $name]);
        }

        $solicitante->syncPermissions(Permission::whereIn('name', [
            'crear ticket',
        ])->get());

        $tecnico->syncPermissions(Permission::whereIn('name', [
            'gestionar ticket',
            'ver tickets asignados',
            'generar reportes',
            'ver equipos',
            'gestionar equipos',
            'ver articulos',
            'crear articulos',
        ])->get());

        $adminTickets->syncPermissions(Permission::whereIn('name', [
            'crear ticket',
            'gestionar ticket',
            'asignar ticket',
            'ver todos los tickets',
            'generar reportes',
            'ver equipos',
            'gestionar equipos',
            'ver articulos',
            'crear articulos',
            'publicar articulos',
            'ver rendimiento',
            'ver reportes administrativos',
        ])->get());

        $superAdmin->syncPermissions(Permission::whereIn('name', [
            'crear ticket',
            'gestionar ticket',
            'asignar ticket',
            'ver todos los tickets',
            'gestionar usuarios',
            'gestionar categorias',
            'gestionar departamentos',
            'generar reportes',
            'ver equipos',
            'gestionar equipos',
            'ver articulos',
            'crear articulos',
            'publicar articulos',
            'eliminar articulos',
            'gestionar roles',
            'gestionar sla',
            'ver rendimiento',
            'ver reportes administrativos',
        ])->get());
    }
}
