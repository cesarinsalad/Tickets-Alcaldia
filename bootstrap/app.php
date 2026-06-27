<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->wantsJson() || $request->ajax(),
        );

        $exceptions->respond(function (\Symfony\Component\HttpFoundation\Response $response, Throwable $e) {
            if ($response->getStatusCode() === 422 && request()->inertia()) {
                $data = json_decode($response->getContent(), true);
                return back()->withErrors($data['errors'] ?? []);
            }

            if ($response->getStatusCode() === 419) {
                if (request()->inertia()) {
                    return back()->with('error', 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                }
            }

            if ($response->getStatusCode() === 403) {
                if (request()->inertia()) {
                    return back()->with('error', 'No tienes permiso para realizar esta acción.');
                }
            }

            if ($response->getStatusCode() === 500 && !config('app.debug')) {
                if (request()->inertia()) {
                    return back()->with('error', 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.');
                }
            }

            return $response;
        });
    })->create();
