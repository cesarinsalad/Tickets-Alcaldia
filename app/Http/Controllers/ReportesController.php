<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class ReportesController extends Controller
{
    public function index()
    {
        return Inertia::render('Reportes/Index');
    }
}
