<?php

namespace App\Policies;

use App\Models\Article;
use App\Models\User;

class ArticlePolicy
{
    public function view(User $user, ?Article $article = null): bool
    {
        return $user->hasPermissionTo('ver articulos');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('crear articulos');
    }

    public function update(User $user, Article $article): bool
    {
        if ($user->hasPermissionTo('publicar articulos')) {
            return true;
        }

        if ($user->hasPermissionTo('crear articulos') && $article->author_id === $user->id) {
            return true;
        }

        return false;
    }

    public function delete(User $user, Article $article): bool
    {
        return $user->hasPermissionTo('publicar articulos');
    }

    public function publish(User $user, ?Article $article = null): bool
    {
        return $user->hasPermissionTo('publicar articulos');
    }
}
