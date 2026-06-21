<?php

namespace Database\Factories;

use App\Enums\ArticleStatus;
use App\Models\Article;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ArticleFactory extends Factory
{
    protected $model = Article::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'slug' => fn (array $attrs) => \Illuminate\Support\Str::slug($attrs['title']),
            'content' => '<h2>' . fake()->sentence(3) . '</h2><p>' . fake()->paragraph(4) . '</p><p>' . fake()->paragraph(3) . '</p><h3>' . fake()->sentence(2) . '</h3><p>' . fake()->paragraph(3) . '</p>',
            'status' => fake()->randomElement([ArticleStatus::Draft, ArticleStatus::Published]),
            'author_id' => User::factory(),
        ];
    }

    public function published(): static
    {
        return $this->state(fn () => ['status' => ArticleStatus::Published]);
    }

    public function draft(): static
    {
        return $this->state(fn () => ['status' => ArticleStatus::Draft]);
    }
}
