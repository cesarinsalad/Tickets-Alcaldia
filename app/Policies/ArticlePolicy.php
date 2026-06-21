<?php

namespace App\Policies;

use App\Models\Article;
use App\Models\User;

class ArticlePolicy
{
    public function view(User $user): bool
    {
        return $user->hasAnyRole(['tecnico', 'admin_tickets', 'super_admin']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['tecnico', 'admin_tickets', 'super_admin']);
    }

    public function update(User $user, Article $article): bool
    {
        if ($user->hasAnyRole(['super_admin', 'admin_tickets'])) {
            return true;
        }

        return $article->author_id === $user->id;
    }

    public function delete(User $user, Article $article): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin_tickets']);
    }

    public function publish(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin_tickets']);
    }
}
