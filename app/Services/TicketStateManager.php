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
        if ($user->hasAnyRole(['super_admin', 'admin_tickets'])) {
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

        // Reopening: Cerrado -> Abierto (creator)
        if ($newStatus === TicketStatus::Abierto && $ticket->status === TicketStatus::Cerrado) {
            if ($user->id === $ticket->creator_id) {
                return true;
            }
            return false;
        }

        // Solicitante or admin_departamento: close own resolved ticket
        if ($user->hasAnyRole(['solicitante', 'admin_departamento']) && $user->id === $ticket->creator_id) {
            if ($newStatus === TicketStatus::Cerrado && $ticket->status === TicketStatus::Resuelto) {
                return true;
            }
        }

        return false;
    }
}
