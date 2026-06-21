<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        $auth = ['user' => null, 'unread_notifications' => 0];

        if ($user) {
            $user->load(['roles.permissions', 'department']);
            $user->append('full_name');

            $roleName = $user->roles->first()?->name;
            $roleLabels = [
                'solicitante' => 'Solicitante',
                'tecnico' => 'Técnico',
                'admin_departamento' => 'Administrador de Departamento',
                'admin_tickets' => 'Administrador de Tickets',
                'super_admin' => 'Super Administrador',
            ];

            $auth = [
                'user' => $user,
                'unread_notifications' => $user->notifications()->unread()->count(),
                'latest_notifications' => $user->notifications()
                    ->with('ticket')
                    ->latest()
                    ->take(3)
                    ->get(),
                'role_label' => $roleLabels[$roleName] ?? $roleName,
                'department_name' => $user->department?->name,
                'all_permissions' => $user->roles->flatMap(fn ($r) => $r->permissions->pluck('name'))->unique()->values(),
            ];
        }

        return [
            ...parent::share($request),
            'auth' => $auth,
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'new_password' => $request->session()->get('new_password'),
            ],
        ];
    }
}
