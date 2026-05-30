<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Ticket;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function store(Ticket $ticket, Request $request)
    {
        $ticket->load('creator');

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
            'is_internal' => ['boolean'],
        ]);

        $comment = $ticket->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $validated['body'],
            'is_internal' => $validated['is_internal'] ?? false,
        ]);

        if (! ($validated['is_internal'] ?? false)) {
            if ($ticket->creator_id !== $request->user()->id) {
                $ticket->creator->notifications()->create([
                    'ticket_id' => $ticket->id,
                    'type' => 'new_comment',
                    'title' => 'Nuevo comentario en ticket',
                    'message' => "Se ha agregado un comentario en el ticket {$ticket->code}",
                ]);
            }
        }

        if ($ticket->assigned_id && $ticket->assigned_id !== $request->user()->id) {
            $ticket->assigned->notifications()->create([
                'ticket_id' => $ticket->id,
                'type' => 'new_comment',
                'title' => 'Nuevo comentario en ticket asignado',
                'message' => "Se ha agregado un comentario en el ticket {$ticket->code}",
            ]);
        }

        return back()->with('success', 'Comentario agregado exitosamente.');
    }
}
