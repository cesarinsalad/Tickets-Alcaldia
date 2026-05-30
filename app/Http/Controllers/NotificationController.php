<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->with('ticket')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    public function markAsRead(Notification $notification)
    {
        if ($notification->user_id !== request()->user()->id) {
            abort(403, 'No autorizado.');
        }

        $notification->markAsRead();

        return back()->with('success', 'Notificación marcada como leída.');
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()
            ->notifications()
            ->unread()
            ->update(['read_at' => now()]);

        return back()->with('success', 'Todas las notificaciones han sido marcadas como leídas.');
    }
}
