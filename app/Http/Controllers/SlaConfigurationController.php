<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\SlaConfiguration;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SlaConfigurationController extends Controller
{
    protected array $defaults = [
        'critica' => ['response_minutes' => 30, 'resolution_hours' => 1],
        'alta' => ['response_minutes' => 60, 'resolution_hours' => 4],
        'media' => ['response_minutes' => 240, 'resolution_hours' => 24],
        'baja' => ['response_minutes' => 480, 'resolution_hours' => 72],
    ];

    public function index()
    {
        if (! request()->user()->hasPermissionTo('gestionar sla')) {
            abort(403);
        }

        $configs = SlaConfiguration::all()->keyBy('priority')->map(fn ($c) => [
            'priority' => $c->priority,
            'response_minutes' => $c->response_minutes,
            'resolution_hours' => $c->resolution_hours,
        ]);

        $result = [];
        foreach (array_keys($this->defaults) as $priority) {
            $result[] = $configs->get($priority, [
                'priority' => $priority,
                'response_minutes' => $this->defaults[$priority]['response_minutes'],
                'resolution_hours' => $this->defaults[$priority]['resolution_hours'],
            ]);
        }

        return Inertia::render('Sla/Index', [
            'configs' => array_values($result),
            'workStart' => Setting::get('work_start', '08:00'),
            'workEnd' => Setting::get('work_end', '15:00'),
            'workDays' => Setting::get('work_days', 'monday,tuesday,wednesday,thursday,friday'),
            'dayOptions' => [
                ['value' => 'monday', 'label' => 'Lun'],
                ['value' => 'tuesday', 'label' => 'Mar'],
                ['value' => 'wednesday', 'label' => 'Mié'],
                ['value' => 'thursday', 'label' => 'Jue'],
                ['value' => 'friday', 'label' => 'Vie'],
                ['value' => 'saturday', 'label' => 'Sáb'],
                ['value' => 'sunday', 'label' => 'Dom'],
            ],
        ]);
    }

    public function update(Request $request)
    {
        if (! $request->user()->hasPermissionTo('gestionar sla')) {
            abort(403);
        }

        $validated = $request->validate([
            'configs' => ['required', 'array'],
            'configs.*.priority' => ['required', 'string', 'in:critica,alta,media,baja'],
            'configs.*.response_minutes' => ['required', 'integer', 'min:1'],
            'configs.*.resolution_hours' => ['required', 'integer', 'min:1'],
            'work_start' => ['required', 'date_format:H:i'],
            'work_end' => ['required', 'date_format:H:i'],
            'work_days' => ['required', 'array', 'min:1'],
            'work_days.*' => ['string', 'in:monday,tuesday,wednesday,thursday,friday,saturday,sunday'],
        ]);

        foreach ($validated['configs'] as $config) {
            SlaConfiguration::updateOrCreate(
                ['priority' => $config['priority']],
                [
                    'response_minutes' => $config['response_minutes'],
                    'resolution_hours' => $config['resolution_hours'],
                ]
            );
        }

        Setting::set('work_start', $validated['work_start']);
        Setting::set('work_end', $validated['work_end']);
        Setting::set('work_days', implode(',', $validated['work_days']));

        return back()->with('success', 'Configuración de tiempos guardada exitosamente.');
    }

    public function reset()
    {
        if (! request()->user()->hasPermissionTo('gestionar sla')) {
            abort(403);
        }

        SlaConfiguration::truncate();
        Setting::whereIn('key', ['work_start', 'work_end', 'work_days'])->delete();

        return back()->with('success', 'Configuración restablecida a valores predeterminados.');
    }
}
