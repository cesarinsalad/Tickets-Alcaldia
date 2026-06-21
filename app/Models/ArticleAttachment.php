<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ArticleAttachment extends Model
{
    protected $fillable = ['article_id', 'filename', 'path', 'mime_type', 'size'];

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }
}
