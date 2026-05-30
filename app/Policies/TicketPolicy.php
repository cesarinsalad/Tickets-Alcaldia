<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Ticket $ticket): bool
    {
        return Ticket::query()
            ->where('id', $ticket->id)
            ->visibleTo($user)
            ->exists();
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function assign(User $user, Ticket $ticket): bool
    {
        if ($user->hasAnyRole(['admin_tickets', 'super_admin'])) {
            return true;
        }

        return false;
    }

    public function update(User $user, Ticket $ticket): bool
    {
        if ($user->hasAnyRole(['admin_tickets', 'super_admin'])) {
            return true;
        }

        if ($user->hasRole('admin_departamento') && $user->id === $ticket->creator_id) {
            return Ticket::query()
                ->where('id', $ticket->id)
                ->visibleTo($user)
                ->exists();
        }

        return $user->hasPermissionTo('gestionar ticket')
            && Ticket::query()
                ->where('id', $ticket->id)
                ->visibleTo($user)
                ->exists();
    }

    public function delete(User $user, Ticket $ticket): bool
    {
        return $user->hasRole('super_admin');
    }

    public function restore(User $user, Ticket $ticket): bool
    {
        return $user->hasRole('super_admin');
    }

    public function forceDelete(User $user, Ticket $ticket): bool
    {
        return $user->hasRole('super_admin');
    }
}
