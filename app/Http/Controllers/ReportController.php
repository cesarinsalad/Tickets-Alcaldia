<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Gate;

class ReportController extends Controller
{
    public function show(Ticket $ticket)
    {
        Gate::authorize('view', $ticket);

        $ticket->load([
            'creator.department',
            'assigned',
            'category',
            'comments' => function ($query) {
                $query->with('user')->orderBy('created_at');
            },
        ]);

        $publicComments = $ticket->comments->where('is_internal', false);
        $internalComments = $ticket->comments->where('is_internal', true);

        $pdf = Pdf::loadView('pdf.ticket-report', [
            'ticket' => $ticket,
            'publicComments' => $publicComments,
            'internalComments' => $internalComments,
        ]);

        return $pdf->download("reporte-{$ticket->code}.pdf");
    }

    public function receipt(Ticket $ticket)
    {
        Gate::authorize('view', $ticket);

        $ticket->load([
            'creator.department',
            'assigned',
            'category',
        ]);

        $pdf = Pdf::loadView('pdf.satisfaction-receipt', [
            'ticket' => $ticket,
        ]);

        return $pdf->download("constancia-{$ticket->code}.pdf");
    }
}
