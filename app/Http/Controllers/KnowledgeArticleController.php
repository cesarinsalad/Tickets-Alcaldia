<?php

namespace App\Http\Controllers;

use App\Models\KnowledgeArticle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KnowledgeArticleController extends Controller
{
    public function index()
    {
        $articles = KnowledgeArticle::with('user')
            ->latest()
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'title' => $a->title,
                'content' => $a->content,
                'author' => $a->user->full_name,
                'user_id' => $a->user_id,
                'created_at' => $a->created_at->format('d/m/Y H:i'),
            ]);

        return Inertia::render('Knowledge/Index', [
            'articles' => $articles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:10000'],
        ]);

        KnowledgeArticle::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'user_id' => $request->user()->id,
        ]);

        return back()->with('success', 'Artículo creado exitosamente.');
    }

    public function update(Request $request, KnowledgeArticle $article)
    {
        $user = $request->user();

        if (! $user->hasAnyRole(['super_admin', 'admin_tickets']) && $article->user_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:10000'],
        ]);

        $article->update($validated);

        return back()->with('success', 'Artículo actualizado exitosamente.');
    }

    public function destroy(KnowledgeArticle $article)
    {
        $user = request()->user();

        if (! $user->hasAnyRole(['super_admin', 'admin_tickets']) && $article->user_id !== $user->id) {
            abort(403);
        }

        $article->delete();

        return back()->with('success', 'Artículo eliminado exitosamente.');
    }
}
