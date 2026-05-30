<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $department = Department::firstOrCreate(
            ['name' => 'Administración General'],
            ['physical_address' => 'Sede Principal', 'head_of_area' => 'Administrador General']
        );

        $admin = User::firstOrCreate(
            ['email' => 'admin@alcaldia.gob.ve'],
            [
                'name' => 'Super',
                'last_name' => 'Administrador',
                'phone_number' => '0295-0000000',
                'department_id' => $department->id,
                'password' => Hash::make('admin123'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $admin->assignRole('super_admin');

        Department::firstOrCreate(
            ['name' => 'Soporte Técnico'],
            ['physical_address' => 'Piso 1 - Oficina 102', 'head_of_area' => 'Jefe de Soporte']
        );

        Department::firstOrCreate(
            ['name' => 'Infraestructura'],
            ['physical_address' => 'Piso 2 - Oficina 204', 'head_of_area' => 'Jefe de Infraestructura']
        );

        echo "Super Admin creado: admin@alcaldia.gob.ve / admin123\n";
    }
}
