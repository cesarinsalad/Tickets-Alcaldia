<?php

namespace Database\Factories;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Category;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TicketFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => Ticket::generateCode(),
            'title' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'priority' => fake()->randomElement(TicketPriority::cases()),
            'status' => fake()->randomElement(TicketStatus::cases()),
            'creator_id' => User::factory(),
            'category_id' => Category::factory(),
            'entry_date' => now(),
        ];
    }
}
