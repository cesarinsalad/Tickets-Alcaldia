<?php

use App\Enums\TicketStatus;
use App\Models\Category;
use App\Models\Department;
use App\Models\Ticket;
use App\Models\User;
use App\Services\SlaCalculator;
use App\Services\TicketStateManager;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->seed(\Database\Seeders\RoleSeeder::class);
    $this->department = Department::factory()->create(['name' => 'Soporte Técnico']);
    $this->category = Category::factory()->create(['name' => 'Soporte TI', 'description' => 'Soporte técnico general']);

    $this->solicitante = User::factory()->create([
        'department_id' => $this->department->id,
        'is_active' => true,
    ]);
    $this->solicitante->assignRole('solicitante');

    $this->tecnico = User::factory()->create([
        'department_id' => $this->department->id,
        'is_active' => true,
    ]);
    $this->tecnico->assignRole('tecnico');

    $this->admin = User::factory()->create([
        'department_id' => $this->department->id,
        'is_active' => true,
    ]);
    $this->admin->assignRole('admin_departamento');

    $this->adminTickets = User::factory()->create([
        'department_id' => $this->department->id,
        'is_active' => true,
    ]);
    $this->adminTickets->assignRole('admin_tickets');

    $this->superAdmin = User::factory()->create([
        'department_id' => $this->department->id,
        'is_active' => true,
    ]);
    $this->superAdmin->assignRole('super_admin');
});

test('solicitante can create a ticket', function () {
    $response = $this->actingAs($this->solicitante)
        ->post(route('tickets.store'), [
            'title' => 'Impresora no funciona',
            'description' => 'La impresora del pasillo principal no imprime',
            'priority' => 'media',
            'category_id' => $this->category->id,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('tickets', [
        'title' => 'Impresora no funciona',
        'creator_id' => $this->solicitante->id,
        'status' => TicketStatus::Abierto->value,
    ]);
});

test('ticket code follows TKT-YYYY-NNNN format', function () {
    $ticket = Ticket::factory()->create([
        'creator_id' => $this->solicitante->id,
        'category_id' => $this->category->id,
    ]);

    expect($ticket->code)->toMatch('/^TKT-\d{4}-\d{4}$/');
});

test('solicitante can upload photo evidence', function () {
    if (! extension_loaded('gd') && ! extension_loaded('imagick')) {
        $this->markTestSkipped('GD or Imagick extension is not installed, skipping image upload test.');
    }

    Storage::fake('public');

    $file = UploadedFile::fake()->image('evidencia.jpg');

    $response = $this->actingAs($this->solicitante)
        ->post(route('tickets.store'), [
            'title' => 'Test con foto',
            'description' => 'Descripción',
            'priority' => 'baja',
            'category_id' => $this->category->id,
            'photo' => $file,
        ]);

    $response->assertRedirect();
    $ticket = Ticket::latest()->first();
    expect($ticket->photo_path)->not->toBeNull();
    Storage::disk('public')->assertExists($ticket->photo_path);
});

test('admin_tickets can assign ticket to technician', function () {
    $ticket = Ticket::factory()->create([
        'creator_id' => $this->solicitante->id,
        'category_id' => $this->category->id,
        'status' => TicketStatus::Abierto,
    ]);

    $response = $this->actingAs($this->adminTickets)
        ->post(route('tickets.assign', $ticket), [
            'assigned_id' => $this->tecnico->id,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('tickets', [
        'id' => $ticket->id,
        'assigned_id' => $this->tecnico->id,
    ]);
});

test('admin_departamento cannot assign tickets', function () {
    $ticket = Ticket::factory()->create([
        'creator_id' => $this->solicitante->id,
        'category_id' => $this->category->id,
    ]);

    $response = $this->actingAs($this->admin)
        ->post(route('tickets.assign', $ticket), [
            'assigned_id' => $this->tecnico->id,
        ]);

    $response->assertForbidden();
});

test('solicitante cannot assign tickets', function () {
    $ticket = Ticket::factory()->create([
        'creator_id' => $this->solicitante->id,
        'category_id' => $this->category->id,
    ]);

    $response = $this->actingAs($this->solicitante)
        ->post(route('tickets.assign', $ticket), [
            'assigned_id' => $this->tecnico->id,
        ]);

    $response->assertForbidden();
});

test('technician can transition ticket through workflow', function () {
    $ticket = Ticket::factory()->create([
        'creator_id' => $this->solicitante->id,
        'category_id' => $this->category->id,
        'assigned_id' => $this->tecnico->id,
        'status' => TicketStatus::Abierto,
    ]);

    $stateManager = app(TicketStateManager::class);

    // Abierto -> En Proceso
    $response = $this->actingAs($this->tecnico)
        ->post(route('tickets.transition', $ticket), [
            'status' => TicketStatus::EnProceso->value,
        ]);
    $response->assertRedirect();
    $ticket->refresh();
    expect($ticket->status)->toBe(TicketStatus::EnProceso);

    // En Proceso -> Resuelto
    $response = $this->actingAs($this->tecnico)
        ->post(route('tickets.transition', $ticket), [
            'status' => TicketStatus::Resuelto->value,
        ]);
    $response->assertRedirect();
    $ticket->refresh();
    expect($ticket->status)->toBe(TicketStatus::Resuelto);
    expect($ticket->exit_date)->not->toBeNull();
});

test('solicitante can close their resolved ticket', function () {
    $ticket = Ticket::factory()->create([
        'creator_id' => $this->solicitante->id,
        'category_id' => $this->category->id,
        'assigned_id' => $this->tecnico->id,
        'status' => TicketStatus::Resuelto,
    ]);

    $response = $this->actingAs($this->solicitante)
        ->post(route('tickets.transition', $ticket), [
            'status' => TicketStatus::Cerrado->value,
        ]);

    $response->assertRedirect();
    $ticket->refresh();
    expect($ticket->status)->toBe(TicketStatus::Cerrado);
});

test('solicitante cannot transition to en_proceso directly', function () {
    $ticket = Ticket::factory()->create([
        'creator_id' => $this->solicitante->id,
        'category_id' => $this->category->id,
        'status' => TicketStatus::Abierto,
    ]);

    $response = $this->actingAs($this->solicitante)
        ->post(route('tickets.transition', $ticket), [
            'status' => TicketStatus::EnProceso->value,
        ]);

    $ticket->refresh();
    expect($ticket->status)->toBe(TicketStatus::Abierto);
});

test('closed ticket can be reopened by creator with motivo', function () {
    $ticket = Ticket::factory()->create([
        'creator_id' => $this->solicitante->id,
        'category_id' => $this->category->id,
        'assigned_id' => $this->tecnico->id,
        'status' => TicketStatus::Cerrado,
        'exit_date' => now(),
    ]);

    $response = $this->actingAs($this->solicitante)
        ->post(route('tickets.transition', $ticket), [
            'status' => TicketStatus::Abierto->value,
            'motivo' => 'El problema persiste',
        ]);

    $response->assertRedirect();
    $ticket->refresh();
    expect($ticket->status)->toBe(TicketStatus::Abierto);
    expect($ticket->exit_date)->toBeNull();
});

test('admin_tickets can see all tickets', function () {
    Ticket::factory()->count(2)->create([
        'creator_id' => $this->solicitante->id,
        'category_id' => $this->category->id,
    ]);

    $visible = Ticket::query()->visibleTo($this->adminTickets)->count();
    expect($visible)->toBeGreaterThanOrEqual(2);
});

test('admin_tickets can change priority', function () {
    $ticket = Ticket::factory()->create([
        'creator_id' => $this->solicitante->id,
        'category_id' => $this->category->id,
        'priority' => \App\Enums\TicketPriority::Baja,
        'status' => TicketStatus::Abierto,
        'entry_date' => Carbon::parse('next monday')->setTime(8, 0, 0),
    ]);

    $response = $this->actingAs($this->adminTickets)
        ->post(route('tickets.change-priority', $ticket), [
            'priority' => 'critica',
        ]);

    $response->assertRedirect();
    expect($ticket->fresh()->priority->value)->toBe('critica');
});

test('admin_tickets can add internal comment', function () {
    $ticket = Ticket::factory()->create([
        'creator_id' => $this->solicitante->id,
        'category_id' => $this->category->id,
        'assigned_id' => $this->tecnico->id,
    ]);

    $response = $this->actingAs($this->adminTickets)
        ->post(route('tickets.comments.store', $ticket), [
            'body' => 'Nota de prueba',
            'is_internal' => true,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('comments', [
        'ticket_id' => $ticket->id,
        'is_internal' => true,
    ]);
});

test('admin_departamento cannot add internal comment', function () {
    $ticket = Ticket::factory()->create([
        'creator_id' => $this->solicitante->id,
        'category_id' => $this->category->id,
    ]);

    $response = $this->actingAs($this->admin)
        ->post(route('tickets.comments.store', $ticket), [
            'body' => 'Intento de nota interna',
            'is_internal' => true,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('comments', [
        'ticket_id' => $ticket->id,
        'body' => 'Intento de nota interna',
        'is_internal' => false,
    ]);
});

test('solicitante can add public comment', function () {
    $ticket = Ticket::factory()->create([
        'creator_id' => $this->solicitante->id,
        'category_id' => $this->category->id,
    ]);

    $response = $this->actingAs($this->solicitante)
        ->post(route('tickets.comments.store', $ticket), [
            'body' => '¿Cuándo estará listo?',
            'is_internal' => false,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('comments', [
        'ticket_id' => $ticket->id,
        'body' => '¿Cuándo estará listo?',
        'is_internal' => false,
    ]);
});

test('technician can add internal comment', function () {
    $ticket = Ticket::factory()->create([
        'creator_id' => $this->solicitante->id,
        'category_id' => $this->category->id,
        'assigned_id' => $this->tecnico->id,
    ]);

    $response = $this->actingAs($this->tecnico)
        ->post(route('tickets.comments.store', $ticket), [
            'body' => 'Se necesita reemplazar el cartucho',
            'is_internal' => true,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('comments', [
        'ticket_id' => $ticket->id,
        'body' => 'Se necesita reemplazar el cartucho',
        'is_internal' => true,
    ]);
});

test('dashboard shows KPIs for solicitante', function () {
    Ticket::factory()->count(3)->create([
        'creator_id' => $this->solicitante->id,
        'category_id' => $this->category->id,
        'status' => TicketStatus::Abierto,
    ]);

    $response = $this->actingAs($this->solicitante)
        ->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->has('stats.kpis'));
});

test('dashboard shows KPIs for super_admin', function () {
    Ticket::factory()->count(2)->create([
        'creator_id' => $this->solicitante->id,
        'category_id' => $this->category->id,
        'status' => TicketStatus::Abierto,
    ]);

    $response = $this->actingAs($this->superAdmin)
        ->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->has('stats.kpis'));
});

test('SLA calculator calculates deadline correctly', function () {
    $ticket = Ticket::factory()->create([
        'creator_id' => $this->solicitante->id,
        'category_id' => $this->category->id,
        'priority' => \App\Enums\TicketPriority::Critica,
        'status' => TicketStatus::Abierto,
        'entry_date' => Carbon::parse('next monday')->setTime(8, 0, 0),
    ]);

    $calculator = app(SlaCalculator::class);
    $deadline = $calculator->calculateResolutionDeadline($ticket);

    expect($deadline)->not->toBeNull();
    // Critica = 1h SLA, entry at 08:00, deadline should be 09:00 on same day
    expect($deadline->hour)->toBe(9);
    expect($deadline->minute)->toBe(0);
});

test('ticket is created with SLA deadlines', function () {
    $response = $this->actingAs($this->solicitante)
        ->post(route('tickets.store'), [
            'title' => 'Test SLA',
            'description' => 'Probar deadlines',
            'priority' => 'critica',
            'category_id' => $this->category->id,
        ]);

    $response->assertRedirect();
    $ticket = Ticket::latest()->first();
    expect($ticket->sla_response_deadline)->not->toBeNull();
    expect($ticket->sla_resolution_deadline)->not->toBeNull();
    expect($ticket->sla_response_deadline->greaterThan(now()))->toBeTrue();
    expect($ticket->sla_resolution_deadline->greaterThan(now()))->toBeTrue();
});

test('admin can change ticket priority', function () {
    $ticket = Ticket::factory()->create([
        'creator_id' => $this->solicitante->id,
        'category_id' => $this->category->id,
        'priority' => \App\Enums\TicketPriority::Baja,
        'status' => TicketStatus::Abierto,
        'entry_date' => Carbon::parse('next monday')->setTime(8, 0, 0),
    ]);

    $deadlineBefore = $ticket->sla_resolution_deadline;

    $response = $this->actingAs($this->superAdmin)
        ->post(route('tickets.change-priority', $ticket), [
            'priority' => 'critica',
        ]);

    $response->assertRedirect();
    $ticket->refresh();
    expect($ticket->priority->value)->toBe('critica');
});

test('solicitante cannot change ticket priority', function () {
    $ticket = Ticket::factory()->create([
        'creator_id' => $this->solicitante->id,
        'category_id' => $this->category->id,
        'priority' => \App\Enums\TicketPriority::Baja,
        'status' => TicketStatus::Abierto,
    ]);

    $response = $this->actingAs($this->solicitante)
        ->post(route('tickets.change-priority', $ticket), [
            'priority' => 'critica',
        ]);

    $response->assertForbidden();
});

test('super_admin can manage categories', function () {
    $response = $this->actingAs($this->superAdmin)
        ->post(route('categories.store'), [
            'name' => 'Redes',
            'estimated_hours' => 2,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('categories', ['name' => 'Redes']);
});

test('non-admin cannot manage categories', function () {
    $response = $this->actingAs($this->solicitante)
        ->post(route('categories.store'), [
            'name' => 'Redes',
            'description' => 'Redes y conectividad',
        ]);

    $response->assertForbidden();
});

test('super_admin can manage departments', function () {
    $response = $this->actingAs($this->superAdmin)
        ->post(route('departments.store'), [
            'name' => 'Recursos Humanos',
            'physical_address' => 'Piso 3',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('departments', ['name' => 'Recursos Humanos']);
});

test('non-admin cannot manage departments', function () {
    $response = $this->actingAs($this->solicitante)
        ->post(route('departments.store'), [
            'name' => 'Recursos Humanos',
        ]);

    $response->assertForbidden();
});

test('department with active users cannot be deleted', function () {
    $dept = Department::factory()->create(['name' => 'Test Dept']);

    $this->solicitante->update(['department_id' => $dept->id]);

    $response = $this->actingAs($this->superAdmin)
        ->delete(route('departments.destroy', $dept));

    $response->assertRedirect();
    $this->assertDatabaseHas('departments', ['id' => $dept->id]);
});

test('deleting department frees its admin', function () {
    $dept = Department::factory()->create(['name' => 'Temp Dept']);

    $adminUser = User::factory()->create(['is_active' => true, 'department_id' => $dept->id]);
    $adminUser->assignRole('admin_departamento');
    $dept->update(['head_of_area_id' => $adminUser->id]);

    $this->actingAs($this->superAdmin)
        ->delete(route('departments.destroy', $dept));

    expect($adminUser->fresh()->department_id)->toBeNull();
});

test('only one admin per department', function () {
    $dept = Department::factory()->create(['name' => 'Finanzas']);

    $admin1 = User::factory()->create(['department_id' => $dept->id, 'is_active' => true]);
    $admin1->assignRole('admin_departamento');

    $admin2 = User::factory()->create(['department_id' => $dept->id, 'is_active' => true]);

    $response = $this->actingAs($this->superAdmin)
        ->post(route('users.store'), [
            'name' => 'Otro',
            'last_name' => 'Admin',
            'email' => 'otro@test.com',
            'department_id' => $dept->id,
            'role' => 'admin_departamento',
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('error');
});

test('creating admin_departamento assigns department head', function () {
    $dept = Department::factory()->create(['name' => 'Test Dept', 'head_of_area_id' => null]);

    $response = $this->actingAs($this->superAdmin)
        ->post(route('users.store'), [
            'name' => 'Nuevo',
            'last_name' => 'Admin',
            'email' => 'nuevoadmin@test.com',
            'department_id' => $dept->id,
            'role' => 'admin_departamento',
        ]);

    $response->assertRedirect();
    $user = User::where('email', 'nuevoadmin@test.com')->first();
    expect($dept->fresh()->head_of_area_id)->toBe($user->id);
});

test('changing user from admin_departamento releases department head', function () {
    $dept = Department::factory()->create(['name' => 'Test Dept', 'head_of_area_id' => null]);

    $adminUser = User::factory()->create([
        'is_active' => true,
        'department_id' => $dept->id,
        'last_name' => 'Admin',
    ]);
    $adminUser->assignRole('admin_departamento');
    $dept->update(['head_of_area_id' => $adminUser->id]);

    $response = $this->actingAs($this->superAdmin)
        ->put(route('users.update', $adminUser), [
            'name' => $adminUser->name,
            'last_name' => 'Admin',
            'email' => $adminUser->email,
            'department_id' => $dept->id,
            'role' => 'solicitante',
        ]);

    $response->assertRedirect();
    expect($dept->fresh()->head_of_area_id)->toBeNull();
});
