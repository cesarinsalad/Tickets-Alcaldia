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
            $user->load('roles');
            $user->append('full_name');

            $auth = [
                'user' => $user,
                'unread_notifications' => $user->notifications()->unread()->count(),
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
