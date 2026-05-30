<?php

namespace Database\Seeders;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Category;
use App\Models\Comment;
use App\Models\Department;
use App\Models\Notification;
use App\Models\Ticket;
use App\Models\User;
use App\Services\SlaCalculator;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    private SlaCalculator $slaCalculator;

    private array $deptNames = [
        'Dirección de Hacienda',
        'Recursos Humanos',
        'Servicios Públicos',
        'Planificación Urbana',
        'Transporte',
        'Cultura',
        'Deportes',
        'Protección Civil',
        'Desarrollo Social',
        'Informática',
    ];

    private array $categoryNames = [
        ['name' => 'Soporte Técnico', 'description' => 'Asistencia técnica general para equipos de cómputo y software'],
        ['name' => 'Infraestructura', 'description' => 'Problemas con cableado, electricidad, aires acondicionados y estructuras'],
        ['name' => 'Redes', 'description' => 'Conectividad, internet, VPN y acceso remoto'],
        ['name' => 'Correo Electrónico', 'description' => 'Problemas con cuentas de correo, spam y configuraciones'],
        ['name' => 'Impresoras', 'description' => 'Averías de impresión, cambio de tóner y mantenimiento'],
        ['name' => 'Software Administrativo', 'description' => 'Sistemas de gestión municipal, contabilidad y presupuesto'],
        ['name' => 'Hardware', 'description' => 'Daños físicos en equipos, repuestos y reparaciones'],
        ['name' => 'Telefonía', 'description' => 'Líneas telefónicas, extensiones y centralitas'],
        ['name' => 'Solicitud de Equipos', 'description' => 'Requerimientos de nuevos equipos, licencias y periféricos'],
        ['name' => 'Mantenimiento', 'description' => 'Mantenimiento preventivo y correctivo de equipos'],
    ];

    public function run(): void
    {
        $this->slaCalculator = app(SlaCalculator::class);

        $this->command?->info('Creando datos de prueba...');

        $categories = $this->createCategories();
        $departments = $this->createDepartments();
        $users = $this->createUsers($departments);
        $this->command?->info('Usuarios creados: ' . count($users));

        $tickets = $this->createTickets($users, $categories, $departments);
        $this->command?->info('Tickets creados: ' . count($tickets));

        $this->createComments($tickets, $users);
        $this->createNotifications($tickets, $users);
        $this->createPhotos($tickets);

        $this->command?->info('Datos de prueba creados exitosamente.');
    }

    private function createCategories(): array
    {
        $categories = [];
        foreach ($this->categoryNames as $catData) {
            $categories[] = Category::create($catData);
        }
        return $categories;
    }

    private function createDepartments(): array
    {
        $departments = [];
        foreach ($this->deptNames as $name) {
            $departments[] = Department::create([
                'name' => $name,
                'physical_address' => fake()->address(),
            ]);
        }
        return $departments;
    }

    private function createUsers(array $departments): array
    {
        $users = [];

        foreach ($departments as $dept) {
            $isSistemas = $dept->name === 'Informática';

            $admin = User::create([
                'name' => fake()->firstName(),
                'last_name' => fake()->lastName(),
                'email' => "admin." . Str::slug($dept->name) . '@alcaldia.gob.ve',
                'phone_number' => fake()->phoneNumber(),
                'department_id' => $dept->id,
                'password' => Hash::make('password'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
            $admin->assignRole('admin_departamento');
            $dept->update(['head_of_area_id' => $admin->id]);
            $users[] = $admin;

            if ($isSistemas) {
                for ($i = 0; $i < 4; $i++) {
                    $tecnico = User::create([
                        'name' => fake()->firstName(),
                        'last_name' => fake()->lastName(),
                        'email' => 'tecnico' . ($i + 1) . '.informatica@alcaldia.gob.ve',
                        'phone_number' => fake()->phoneNumber(),
                        'department_id' => $dept->id,
                        'password' => Hash::make('password'),
                        'is_active' => true,
                        'email_verified_at' => now(),
                    ]);
                    $tecnico->assignRole('tecnico');
                    $users[] = $tecnico;
                }
            } else {
                for ($i = 0; $i < 4; $i++) {
                    $solicitante = User::create([
                        'name' => fake()->firstName(),
                        'last_name' => fake()->lastName(),
                        'email' => 'solicitante' . ($i + 1) . '.' . Str::slug($dept->name) . '@alcaldia.gob.ve',
                        'phone_number' => fake()->phoneNumber(),
                        'department_id' => $dept->id,
                        'password' => Hash::make('password'),
                        'is_active' => true,
                        'email_verified_at' => now(),
                    ]);
                    $solicitante->assignRole('solicitante');
                    $users[] = $solicitante;
                }
            }
        }

        for ($i = 0; $i < 5; $i++) {
            $adminLibre = User::create([
                'name' => fake()->firstName(),
                'last_name' => fake()->lastName(),
                'email' => 'admin.disponible' . ($i + 1) . '@alcaldia.gob.ve',
                'phone_number' => fake()->phoneNumber(),
                'department_id' => null,
                'password' => Hash::make('password'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
            $adminLibre->assignRole('admin_departamento');
            $users[] = $adminLibre;
        }

        return $users;
    }

    private function createTickets(array $users, array $categories, array $departments): array
    {
        $solicitantes = collect($users)->filter(fn($u) => $u->hasRole('solicitante'))->values();
        $tecnicos = collect($users)->filter(fn($u) => $u->hasRole('tecnico'))->values();
        $admins = collect($users)->filter(fn($u) => $u->hasRole('admin_departamento') && $u->department_id !== null)->keyBy('department_id');

        $ticketSpecs = [
            ['priority' => 'critica', 'count' => 10],
            ['priority' => 'alta', 'count' => 20],
            ['priority' => 'media', 'count' => 35],
            ['priority' => 'baja', 'count' => 40],
        ];

        $statusDistribution = [
            'abierto' => 0.25,
            'en_proceso' => 0.25,
            'pendiente_informacion' => 0.10,
            'resuelto' => 0.25,
            'cerrado' => 0.15,
        ];

        $allTickets = [];

        foreach ($ticketSpecs as $spec) {
            $priority = TicketPriority::from($spec['priority']);
            $slaHours = $priority->slaHours();

            for ($i = 0; $i < $spec['count']; $i++) {
                $solicitante = $solicitantes->random();
                $daysAgo = fake()->numberBetween(0, 30);
                $hour = fake()->numberBetween(8, 14);
                $minute = fake()->numberBetween(0, 59);
                $entryDate = now()->subDays($daysAgo)->setTime($hour, $minute, 0);

                if ($entryDate->isWeekend()) {
                    $entryDate = $entryDate->previousWeekday()->setTime($hour, $minute, 0);
                }

                $rand = fake()->randomFloat(2, 0, 1);
                $cumulative = 0;
                $statusValue = 'abierto';
                foreach ($statusDistribution as $st => $prob) {
                    $cumulative += $prob;
                    if ($rand <= $cumulative) {
                        $statusValue = $st;
                        break;
                    }
                }

                $status = TicketStatus::from($statusValue);

                $data = [
                    'code' => Ticket::generateCode(),
                    'title' => fake()->sentence(4),
                    'description' => fake()->paragraph(3),
                    'priority' => $priority->value,
                    'status' => $statusValue,
                    'creator_id' => $solicitante->id,
                    'category_id' => $categories[array_rand($categories)]->id,
                    'entry_date' => $entryDate,
                ];

                if (in_array($statusValue, ['en_proceso', 'pendiente_informacion'])) {
                    $tecnico = $tecnicos->random();
                    $data['assigned_id'] = $tecnico->id;
                } elseif (in_array($statusValue, ['resuelto', 'cerrado'])) {
                    $tecnico = $tecnicos->random();
                    $data['assigned_id'] = $tecnico->id;
                    $exitHour = min($hour + fake()->numberBetween(1, 5), 14);
                    if ($exitHour >= 15) $exitHour = 14;
                    $exitDate = (clone $entryDate)->setTime($exitHour, fake()->numberBetween(0, 59), 0);
                    if ($exitDate->isWeekend()) {
                        $exitDate = $exitDate->nextWeekday();
                    }
                    $data['exit_date'] = $exitDate;
                }

                $ticket = new Ticket();
                $ticket->code = $data['code'];
                $ticket->title = $data['title'];
                $ticket->description = $data['description'];
                $ticket->priority = $priority;
                $ticket->status = $status;
                $ticket->creator_id = $data['creator_id'];
                $ticket->category_id = $data['category_id'];
                $ticket->entry_date = $data['entry_date'];
                if (isset($data['assigned_id'])) {
                    $ticket->assigned_id = $data['assigned_id'];
                }
                if (isset($data['exit_date'])) {
                    $ticket->exit_date = $data['exit_date'];
                }

                $ticket->sla_response_deadline = $this->slaCalculator->calculateResponseDeadline($ticket);
                $ticket->sla_resolution_deadline = $this->slaCalculator->calculateResolutionDeadline($ticket);
                $ticket->save();

                $allTickets[] = $ticket;
            }
        }

        return $allTickets;
    }

    private function createComments(array $tickets, array $users): void
    {
        $tecnicos = collect($users)->filter(fn($u) => $u->hasRole('tecnico'))->values();
        $solicitantes = collect($users)->filter(fn($u) => $u->hasRole('solicitante'))->values();

        foreach ($tickets as $ticket) {
            $commentsCount = fake()->numberBetween(0, 4);

            for ($i = 0; $i < $commentsCount; $i++) {
                if ($i % 2 === 0 && $ticket->assigned_id) {
                    $tec = $tecnicos->where('id', $ticket->assigned_id)->first() ?? $tecnicos->random();
                    Comment::create([
                        'ticket_id' => $ticket->id,
                        'user_id' => $tec->id,
                        'body' => fake()->sentence(6),
                        'is_internal' => $i > 0,
                        'created_at' => (clone $ticket->entry_date)->addHours(fake()->numberBetween(1, 48)),
                    ]);
                } elseif ($solicitantes->count() > 0) {
                    $sol = $solicitantes->random();
                    Comment::create([
                        'ticket_id' => $ticket->id,
                        'user_id' => $sol->id,
                        'body' => fake()->sentence(5),
                        'is_internal' => false,
                        'created_at' => (clone $ticket->entry_date)->addHours(fake()->numberBetween(1, 48)),
                    ]);
                }
            }
        }
    }

    private function createNotifications(array $tickets, array $users): void
    {
        $adminsByDept = collect($users)->filter(fn($u) => $u->hasRole('admin_departamento') && $u->department_id !== null)->keyBy('department_id');
        $tecnicos = collect($users)->filter(fn($u) => $u->hasRole('tecnico'))->values();

        $tickets = Ticket::whereIn('id', collect($tickets)->pluck('id'))->with('creator.department')->get();

        $created = 0;
        foreach ($tickets as $ticket) {
            if ($created >= 60) break;

            $admin = $adminsByDept->get($ticket->creator->department_id ?? 0);
            if ($admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'ticket_id' => $ticket->id,
                    'type' => 'ticket_created',
                    'title' => 'Nuevo ticket creado',
                    'message' => "Se ha creado el ticket {$ticket->code}: {$ticket->title}",
                    'created_at' => (clone $ticket->entry_date)->addMinutes(1),
                    'read_at' => fake()->boolean(40) ? now() : null,
                ]);
                $created++;
            }

            if ($ticket->assigned_id && $created < 60) {
                Notification::create([
                    'user_id' => $ticket->assigned_id,
                    'ticket_id' => $ticket->id,
                    'type' => 'ticket_assigned',
                    'title' => 'Ticket asignado',
                    'message' => "Se te ha asignado el ticket {$ticket->code}: {$ticket->title}",
                    'created_at' => (clone $ticket->entry_date)->addHours(fake()->numberBetween(1, 4)),
                    'read_at' => fake()->boolean(50) ? now() : null,
                ]);
                $created++;
            }
        }
    }

    private function createPhotos(array $tickets): void
    {
        if (! function_exists('imagecreatetruecolor')) {
            $this->command?->warn('GD no disponible, saltando generacion de fotos.');
            return;
        }

        $photoTickets = collect($tickets)->random(min(12, count($tickets)));

        foreach ($photoTickets as $ticket) {
            $filename = 'tickets/photos/demo_' . $ticket->id . '.jpg';

            try {
                $img = \imagecreatetruecolor(800, 600);
                $bgColor = \imagecolorallocate($img, fake()->numberBetween(100, 200), fake()->numberBetween(100, 200), fake()->numberBetween(100, 200));
                \imagefill($img, 0, 0, $bgColor);
                $textColor = \imagecolorallocate($img, 255, 255, 255);
                $text = "Ticket #{$ticket->code}";
                $fontSize = 5;
                $x = 50;
                $y = 300;
                \imagestring($img, $fontSize, $x, $y, $text, $textColor);

                ob_start();
                \imagejpeg($img, null, 80);
                $imageData = ob_get_clean();
                \imagedestroy($img);

                Storage::disk('public')->put($filename, $imageData);
                $ticket->update(['photo_path' => $filename]);
            } catch (\Exception $e) {
                $this->command?->warn("Error al crear foto para ticket {$ticket->code}: {$e->getMessage()}");
            }
        }
    }
}
