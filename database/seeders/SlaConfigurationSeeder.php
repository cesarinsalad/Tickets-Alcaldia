<?php

namespace Database\Seeders;

use App\Models\Setting;
use App\Models\SlaConfiguration;
use Illuminate\Database\Seeder;

class SlaConfigurationSeeder extends Seeder
{
    public function run(): void
    {
        SlaConfiguration::updateOrCreate(
            ['priority' => 'critica'],
            ['response_minutes' => 30, 'resolution_hours' => 1]
        );
        SlaConfiguration::updateOrCreate(
            ['priority' => 'alta'],
            ['response_minutes' => 60, 'resolution_hours' => 4]
        );
        SlaConfiguration::updateOrCreate(
            ['priority' => 'media'],
            ['response_minutes' => 240, 'resolution_hours' => 24]
        );
        SlaConfiguration::updateOrCreate(
            ['priority' => 'baja'],
            ['response_minutes' => 480, 'resolution_hours' => 72]
        );

        Setting::set('work_start', '08:00');
        Setting::set('work_end', '15:00');
        Setting::set('work_days', 'monday,tuesday,wednesday,thursday,friday');
    }
}
