<?php

use App\Models\Category;
use App\Models\Department;
use App\Models\Ticket;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->seed(\Database\Seeders\RoleSeeder::class);
    $this->department = Department::factory()->create(['name' => 'Soporte Técnico']);
    $this->category = Category::factory()->create(['name' => 'Soporte TI']);
    
    $this->solicitante = User::factory()->create([
        'department_id' => $this->department->id,
        'is_active' => true,
    ]);
    $this->solicitante->assignRole('solicitante');

    $this->ticket = Ticket::factory()->create([
        'creator_id' => $this->solicitante->id,
        'category_id' => $this->category->id,
    ]);
});

test('can download tickets list PDF', function () {
    $response = $this->actingAs($this->solicitante)
        ->get(route('tickets.report.index'));

    $response->assertOk();
    $response->assertHeader('content-type', 'application/pdf');
});

test('can download ticket detailed report PDF', function () {
    $response = $this->actingAs($this->solicitante)
        ->get(route('tickets.report', $this->ticket));

    $response->assertOk();
    $response->assertHeader('content-type', 'application/pdf');
});

test('can download satisfaction receipt PDF', function () {
    $response = $this->actingAs($this->solicitante)
        ->get(route('tickets.receipt', $this->ticket));

    $response->assertOk();
    $response->assertHeader('content-type', 'application/pdf');
});
