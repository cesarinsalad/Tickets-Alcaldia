<?php

namespace App\Services;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\User;

class TicketStateManager
{
    public function canTransition(Ticket $ticket, TicketStatus $newStatus, User $user): bool
    {
        $allowedTransitions = TicketStatus::allowedTransitions();
        $currentStatus = $ticket->status->value;

        if (! isset($allowedTransitions[$currentStatus])) {
            return false;
        }

        if (! in_array($newStatus->value, $allowedTransitions[$currentStatus])) {
            return false;
        }

        return $this->userCanPerformTransition($ticket, $newStatus, $user);
    }

    public function transition(Ticket $ticket, TicketStatus $newStatus, User $user): void
    {
        if (! $this->canTransition($ticket, $newStatus, $user)) {
            throw new \InvalidArgumentException(
                "No se puede cambiar de {$ticket->status->label()} a {$newStatus->label()}"
            );
        }

        $now = now();

        if ($newStatus === TicketStatus::EnProceso && is_null($ticket->assigned_id)) {
            throw new \InvalidArgumentException('El ticket debe estar asignado a un técnico antes de ponerlo En Proceso.');
        }

        if (in_array($newStatus, [TicketStatus::Resuelto, TicketStatus::Cerrado])) {
            $ticket->exit_date = $now;
        } elseif ($newStatus === TicketStatus::Abierto && $ticket->status === TicketStatus::Cerrado) {
            $ticket->exit_date = null;
            $ticket->entry_date = $now;
        }

        $ticket->status = $newStatus;
        $ticket->save();
    }

    private function userCanPerformTransition(Ticket $ticket, TicketStatus $newStatus, User $user): bool
    {
        if ($user->hasRole('super_admin')) {
            return true;
        }

        if ($user->hasRole('tecnico')) {
            if ($ticket->assigned_id !== $user->id) {
                return false;
            }
            $tecnicoAllowed = [
                TicketStatus::EnProceso->value,
                TicketStatus::PendienteInformacion->value,
                TicketStatus::Resuelto->value,
            ];
            return in_array($newStatus->value, $tecnicoAllowed);
        }

        // Reopening: Cerrado -> Abierto (Solicitante o Admin de Dirección)
        if ($newStatus === TicketStatus::Abierto && $ticket->status === TicketStatus::Cerrado) {
            if ($user->hasRole('admin_departamento') && $user->department_id === $ticket->creator->department_id) {
                return true;
            }
            if ($user->id === $ticket->creator_id) {
                return true;
            }
            return false;
        }

        if ($user->hasRole('admin_departamento')) {
            if ($user->department_id !== $ticket->creator->department_id) {
                return false;
            }
            return true;
        }

        if ($user->hasRole('solicitante') && $user->id === $ticket->creator_id) {
            if ($newStatus === TicketStatus::Cerrado && $ticket->status === TicketStatus::Resuelto) {
                return true;
            }
        }

        return false;
    }
}
