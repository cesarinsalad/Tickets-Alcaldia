<?php

namespace App\Http\Controllers;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $kpis = [];

        if ($user->hasRole('solicitante')) {
            $baseQuery = Ticket::query()->visibleTo($user);

            $kpis = [
                'abiertos' => (clone $baseQuery)->where('status', TicketStatus::Abierto)->count(),
                'en_proceso' => (clone $baseQuery)->where('status', TicketStatus::EnProceso)->count(),
                'resueltos' => (clone $baseQuery)->where('status', TicketStatus::Resuelto)->count(),
            ];
        } elseif ($user->hasRole('tecnico')) {
            $baseQuery = Ticket::query()->visibleTo($user);

            $kpis = [
                'abiertos_asignados' => (clone $baseQuery)->where('status', TicketStatus::Abierto)->count(),
                'en_proceso' => (clone $baseQuery)->where('status', TicketStatus::EnProceso)->count(),
                'pendiente_informacion' => (clone $baseQuery)->where('status', TicketStatus::PendienteInformacion)->count(),
                'resueltos_hoy' => (clone $baseQuery)
                    ->where('status', TicketStatus::Resuelto)
                    ->whereDate('exit_date', today())
                    ->count(),
            ];
        } elseif ($user->hasRole('admin_departamento')) {
            $baseQuery = Ticket::query()->visibleTo($user);

            $kpis = [
                'abiertos' => (clone $baseQuery)->where('status', TicketStatus::Abierto)->count(),
                'en_proceso' => (clone $baseQuery)->where('status', TicketStatus::EnProceso)->count(),
                'pendiente_informacion' => (clone $baseQuery)->where('status', TicketStatus::PendienteInformacion)->count(),
                'resueltos' => (clone $baseQuery)->where('status', TicketStatus::Resuelto)->count(),
                'cerrados' => (clone $baseQuery)->where('status', TicketStatus::Cerrado)->count(),
            ];
        } elseif ($user->hasAnyRole(['super_admin', 'admin_tickets'])) {
            $kpis = [
                'abiertos' => Ticket::where('status', TicketStatus::Abierto)->count(),
                'en_proceso' => Ticket::where('status', TicketStatus::EnProceso)->count(),
                'pendiente_informacion' => Ticket::where('status', TicketStatus::PendienteInformacion)->count(),
                'resueltos' => Ticket::where('status', TicketStatus::Resuelto)->count(),
                'cerrados' => Ticket::where('status', TicketStatus::Cerrado)->count(),
                'resueltos_hoy' => Ticket::where('status', TicketStatus::Resuelto)
                    ->whereDate('exit_date', today())
                    ->count(),
            ];
        }

        $unreadNotifications = $user->notifications()->unread()->count();

        $role = $user->roles->first()?->name ?? 'solicitante';
        $roleLabels = [
            'solicitante' => 'Solicitante',
            'tecnico' => 'Técnico',
            'admin_departamento' => 'Administrador de Departamento',
            'admin_tickets' => 'Administrador de Tickets',
            'super_admin' => 'Super Administrador',
        ];

        // Normalize keys for frontend
        $normalizedKpis = [
            'open' => $kpis['abiertos'] ?? $kpis['abiertos_asignados'] ?? 0,
            'in_process' => $kpis['en_proceso'] ?? 0,
            'pending_info' => $kpis['pendiente_informacion'] ?? null,
            'resolved' => $kpis['resueltos'] ?? null,
            'closed' => $kpis['cerrados'] ?? null,
            'resolved_today' => $kpis['resueltos_hoy'] ?? null,
            'total' => array_sum($kpis),
        ];

        return Inertia::render('Dashboard', [
            'stats' => [
                'kpis' => $normalizedKpis,
                'role' => $roleLabels[$role] ?? $role,
            ],
            'unreadNotifications' => $unreadNotifications,
        ]);
    }
}
