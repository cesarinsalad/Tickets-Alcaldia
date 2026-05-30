<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class DepartmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->company(),
            'physical_address' => fake()->address(),
            'head_of_area' => fake()->name(),
        ];
    }
}
