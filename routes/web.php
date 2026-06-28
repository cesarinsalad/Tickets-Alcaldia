<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\InterventionReportController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\SlaConfigurationController;
use App\Http\Controllers\MetricasController;
use App\Http\Controllers\RendimientoController;
use App\Http\Controllers\ReportesController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::middleware(['permission:generar reportes'])->group(function () {
        Route::get('/tickets/report', [ReportController::class, 'index'])->name('tickets.report.index');
        Route::get('/tickets/{ticket}/report', [ReportController::class, 'show'])->name('tickets.report');
        Route::get('/tickets/{ticket}/receipt', [ReportController::class, 'receipt'])->name('tickets.receipt');
    });

    Route::resource('tickets', TicketController::class)->except(['edit', 'update']);
    Route::post('/tickets/{ticket}/comments', [CommentController::class, 'store'])->name('tickets.comments.store');
    Route::post('/tickets/{ticket}/assign', [TicketController::class, 'assign'])->name('tickets.assign');
    Route::post('/tickets/{ticket}/transition', [TicketController::class, 'transition'])->name('tickets.transition');
    Route::post('/tickets/{ticket}/change-priority', [TicketController::class, 'changePriority'])->name('tickets.change-priority');
    Route::post('/tickets/{ticket}/change-category', [TicketController::class, 'changeCategory'])->name('tickets.change-category');

    Route::middleware(['permission:gestionar usuarios'])->group(function () {
        Route::resource('users', UserManagementController::class)->except(['show']);
        Route::post('/users/{user}/toggle', [UserManagementController::class, 'toggle'])->name('users.toggle');
    });

    Route::middleware(['permission:gestionar categorias'])->group(function () {
        Route::resource('categories', CategoryController::class)->except(['show']);
    });

    Route::middleware(['permission:gestionar departamentos'])->group(function () {
        Route::resource('departments', DepartmentController::class)->except(['show']);
    });

    Route::middleware(['permission:gestionar sla'])->group(function () {
        Route::get('/sla', [SlaConfigurationController::class, 'index'])->name('sla.index');
        Route::put('/sla', [SlaConfigurationController::class, 'update'])->name('sla.update');
        Route::post('/sla/reset', [SlaConfigurationController::class, 'reset'])->name('sla.reset');
    });

    Route::middleware(['permission:ver metricas'])->group(function () {
        Route::get('/metricas', [MetricasController::class, 'index'])->name('metricas.index');
    });

    Route::middleware(['permission:ver rendimiento'])->group(function () {
        Route::get('/rendimiento', [RendimientoController::class, 'index'])->name('rendimiento.index');
    });

    Route::middleware(['permission:ver reportes administrativos'])->group(function () {
        Route::get('/reportes', [ReportesController::class, 'index'])->name('reportes.index');
    });

    Route::middleware(['permission:gestionar roles'])->group(function () {
        Route::get('/roles', [RolePermissionController::class, 'index'])->name('roles.index');
        Route::post('/roles', [RolePermissionController::class, 'store'])->name('roles.store');
        Route::put('/roles/{role}', [RolePermissionController::class, 'update'])->name('roles.update');
        Route::delete('/roles/{role}', [RolePermissionController::class, 'destroy'])->name('roles.destroy');
        Route::post('/permissions', [RolePermissionController::class, 'storePermission'])->name('permissions.store');
        Route::delete('/permissions/{permission}', [RolePermissionController::class, 'destroyPermission'])->name('permissions.destroy');
        Route::put('/roles/permissions', [RolePermissionController::class, 'batchSync'])->name('roles.permissions.sync');
    });


    Route::middleware(['permission:ver equipos|gestionar equipos'])->group(function () {
        Route::get('/equipments', [InterventionReportController::class, 'index'])->name('equipments.index');
        Route::get('/equipments/{equipment}/detail', [InterventionReportController::class, 'show'])->name('equipments.show');
        Route::get('/equipments/{sku}', [InterventionReportController::class, 'lookup'])->name('equipments.lookup');
        Route::post('/tickets/{ticket}/intervention-report', [InterventionReportController::class, 'generate'])->name('tickets.intervention-report.generate');
        Route::get('/intervention-reports/{report}/pdf', [InterventionReportController::class, 'showPdf'])->name('intervention-reports.pdf');
    });

    Route::middleware(['permission:ver articulos|crear articulos|publicar articulos|eliminar articulos'])->group(function () {
        Route::get('/kb', [ArticleController::class, 'index'])->name('articles.index');
        Route::get('/kb/search', [ArticleController::class, 'search'])->name('articles.search');
        Route::get('/kb/create', [ArticleController::class, 'create'])->name('articles.create');
        Route::post('/kb', [ArticleController::class, 'store'])->name('articles.store');
        Route::get('/kb/{article:slug}', [ArticleController::class, 'show'])->name('articles.show');
        Route::get('/kb/{article:slug}/edit', [ArticleController::class, 'edit'])->name('articles.edit');
        Route::put('/kb/{article:slug}', [ArticleController::class, 'update'])->name('articles.update');
        Route::delete('/kb/{article:slug}', [ArticleController::class, 'destroy'])->name('articles.destroy');
        Route::put('/kb/{article:slug}/publish', [ArticleController::class, 'publish'])->name('articles.publish');
    });

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
});

require __DIR__ . '/auth.php';
