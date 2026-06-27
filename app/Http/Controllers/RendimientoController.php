<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class RendimientoController extends Controller
{
    public function index()
    {
        return Inertia::render('Rendimiento/Index');
    }
}
