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
            'body' => ['required_without:photo', 'nullable', 'string', 'max:5000'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'is_internal' => ['boolean'],
        ]);

        if (! $validated['body'] && ! $request->hasFile('photo')) {
            return back()->withErrors(['body' => 'Debes escribir un comentario o adjuntar una imagen.']);
        }

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('comments/photos', 'public');
        }

        $comment = $ticket->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $validated['body'] ?? '',
            'photo_path' => $photoPath,
            'is_internal' => $request->user()->hasAnyRole(['solicitante', 'admin_departamento']) ? false : ($validated['is_internal'] ?? false),
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
