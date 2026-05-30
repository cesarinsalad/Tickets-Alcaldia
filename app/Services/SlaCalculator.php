<?php

namespace App\Services;

use App\Enums\TicketPriority;
use App\Models\Ticket;
use Carbon\Carbon;

class SlaCalculator
{
    private int $workStart;
    private int $workEnd;

    public function __construct()
    {
        $this->workStart = 8;
        $this->workEnd = 15;
    }

    public function calculateResponseDeadline(Ticket $ticket): Carbon
    {
        $minutes = $ticket->priority->responseMinutes();
        return $this->calculateFromMinutes($ticket->entry_date, $minutes);
    }

    public function calculateResolutionDeadline(Ticket $ticket): Carbon
    {
        return $this->calculateFrom($ticket->entry_date, $ticket->priority->slaHours());
    }

    public function recalculateResolutionDeadline(Ticket $ticket, TicketPriority $newPriority): Carbon
    {
        return $this->calculateFrom($ticket->entry_date, $newPriority->slaHours());
    }

    private function calculateFrom(Carbon $entryDate, int $hours): Carbon
    {
        return $this->addWorkingTime(clone $entryDate, $hours * 60);
    }

    private function calculateFromMinutes(Carbon $entryDate, int $minutes): Carbon
    {
        return $this->addWorkingTime(clone $entryDate, $minutes);
    }

    public function isOverdue(Ticket $ticket): bool
    {
        $deadline = $ticket->sla_resolution_deadline;
        if (! $deadline) {
            return false;
        }

        if (in_array($ticket->status->value, ['resuelto', 'cerrado'])) {
            return false;
        }

        return now() > $deadline;
    }

    public function isResponseOverdue(Ticket $ticket): bool
    {
        $deadline = $ticket->sla_response_deadline;
        if (! $deadline) {
            return false;
        }

        return now() > $deadline;
    }

    public function remainingTime(Ticket $ticket): int
    {
        $deadline = $ticket->sla_resolution_deadline;
        if (! $deadline) {
            return 0;
        }

        if (now() > $deadline) {
            return 0;
        }

        return $this->workingHoursBetween(now(), $deadline);
    }

    public function progressPercentage(Ticket $ticket): int
    {
        $deadline = $ticket->sla_resolution_deadline;
        if (! $deadline) {
            return 0;
        }

        $total = $ticket->priority->slaHours();
        if ($total <= 0) {
            return 100;
        }

        $remaining = $this->remainingTime($ticket);
        $elapsed = $total - $remaining;
        return (int) min(100, max(0, ($elapsed / $total) * 100));
    }

    private function addWorkingTime(Carbon $datetime, int $minutes): Carbon
    {
        $remaining = $minutes;

        while ($remaining > 0) {
            if (! $this->isWorkingDay($datetime)) {
                $datetime->addDay()->setTime($this->workStart, 0);
                continue;
            }

            if ($datetime->hour < $this->workStart) {
                $datetime->setTime($this->workStart, 0);
            }

            if ($datetime->hour >= $this->workEnd) {
                $datetime->addDay()->setTime($this->workStart, 0);
                continue;
            }

            $endOfDay = (clone $datetime)->setTime($this->workEnd, 0);
            $minutesToEndOfDay = $datetime->diffInMinutes($endOfDay);

            if ($remaining <= $minutesToEndOfDay) {
                $datetime->addMinutes($remaining);
                $remaining = 0;
            } else {
                $remaining -= $minutesToEndOfDay;
                $datetime->addDay()->setTime($this->workStart, 0);
            }
        }

        return $datetime;
    }

    private function workingHoursBetween(Carbon $start, Carbon $end): int
    {
        $hours = 0;
        $current = clone $start;

        while ($current < $end) {
            if ($this->isWorkingDay($current)) {
                $dayStart = (clone $current)->setTime($this->workStart, 0);
                $dayEnd = (clone $current)->setTime($this->workEnd, 0);

                if ($current < $dayEnd) {
                    $effectiveStart = $current < $dayStart ? $dayStart : $current;
                    $effectiveEnd = $end < $dayEnd ? $end : $dayEnd;

                    if ($effectiveStart < $effectiveEnd) {
                        $hours += $effectiveStart->diffInMinutes($effectiveEnd) / 60;
                    }

                    $current = $dayEnd;
                }
            }

            $current = (clone $current)->addDay()->setTime($this->workStart, 0);
        }

        return (int) floor($hours);
    }

    private function isWorkingDay(Carbon $date): bool
    {
        return $date->isWeekday();
    }
}
