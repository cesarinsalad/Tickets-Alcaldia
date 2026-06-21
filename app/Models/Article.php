<?php

namespace App\Models;

use App\Enums\ArticleStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Article extends Model
{
    use HasFactory;

    protected $table = 'knowledge_articles';

    protected $fillable = [
        'title', 'slug', 'content', 'status', 'author_id',
    ];

    protected function casts(): array
    {
        return [
            'status' => ArticleStatus::class,
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Article $article) {
            if (empty($article->slug)) {
                $article->slug = static::generateUniqueSlug($article->title);
            }
            if (empty($article->status)) {
                $article->status = ArticleStatus::Draft;
            }
        });
    }

    public static function generateUniqueSlug(string $title): string
    {
        $slug = Str::slug($title);
        $original = $slug;
        $count = 1;

        while (static::where('slug', $slug)->exists()) {
            $slug = $original . '-' . $count;
            $count++;
        }

        return $slug;
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'article_category');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(ArticleAttachment::class);
    }

    public function scopePublished($query): void
    {
        $query->where('status', ArticleStatus::Published);
    }

    public function scopeSearch($query, string $term): void
    {
        $query->whereRaw(
            "fts_vector @@ plainto_tsquery('spanish', ?)",
            [$term]
        )->orderByRaw("ts_rank(fts_vector, plainto_tsquery('spanish', ?)) DESC", [$term]);
    }

    public function scopeByCategory($query, int $categoryId): void
    {
        $query->whereHas('categories', function ($q) use ($categoryId) {
            $q->where('category_id', $categoryId);
        });
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function getCategoryNamesAttribute(): string
    {
        return $this->categories->pluck('name')->implode(', ');
    }
}
