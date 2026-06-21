<?php

namespace App\Http\Controllers;

use App\Enums\ArticleStatus;
use App\Http\Requests\StoreArticleRequest;
use App\Http\Requests\UpdateArticleRequest;
use App\Models\Article;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ArticleController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('view', Article::class);

        $query = Article::query()
            ->with(['author', 'categories']);

        if ($request->input('status') === 'draft') {
            $query->where('status', ArticleStatus::Draft);

            if (! $request->user()->hasAnyRole(['super_admin', 'admin_tickets'])) {
                $query->where('author_id', $request->user()->id);
            }
        } else {
            $query->published();
        }

        if ($request->filled('search')) {
            $query->search($request->input('search'));
        }

        if ($request->filled('category')) {
            $query->byCategory((int) $request->input('category'));
        }

        $articles = $query->latest('updated_at')->paginate(12)->withQueryString();

        $categories = Category::has('articles')->get();

        return Inertia::render('Knowledge/Index', [
            'articles' => $articles,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'status']),
        ]);
    }

    public function search(Request $request)
    {
        Gate::authorize('view', Article::class);

        $term = $request->input('q', '');
        if (mb_strlen($term) < 2) {
            return response()->json([]);
        }

        $articles = Article::query()
            ->with('categories')
            ->published()
            ->search($term)
            ->limit(15)
            ->get()
            ->map(fn ($a) => [
                'slug' => $a->slug,
                'title' => $a->title,
                'excerpt' => mb_substr(strip_tags($a->content), 0, 120) . '...',
                'category_names' => $a->category_names,
                'updated_at' => $a->updated_at->format('d/m/Y'),
            ]);

        return response()->json($articles);
    }

    public function create()
    {
        Gate::authorize('create', Article::class);

        $categories = Category::orderBy('name')->get();

        return Inertia::render('Knowledge/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreArticleRequest $request)
    {
        Gate::authorize('create', Article::class);

        $article = Article::create([
            'title' => $request->input('title'),
            'content' => $request->input('content'),
            'author_id' => $request->user()->id,
            'status' => ArticleStatus::Draft,
        ]);

        if ($request->filled('categories')) {
            $article->categories()->sync($request->input('categories'));
        }

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('articles/attachments', 'public');
                $article->attachments()->create([
                    'filename' => $file->getClientOriginalName(),
                    'path' => $path,
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                ]);
            }
        }

        return redirect()->route('articles.show', $article->slug)
            ->with('success', 'Artículo guardado como borrador.');
    }

    public function show(Request $request, Article $article)
    {
        Gate::authorize('view', $article);

        $article->load(['author', 'categories', 'attachments']);

        $canEdit = Gate::allows('update', $article);
        $canPublish = Gate::allows('publish', $article) && $article->status === ArticleStatus::Draft;

        return Inertia::render('Knowledge/Show', [
            'article' => [
                'slug' => $article->slug,
                'title' => $article->title,
                'content' => $article->content,
                'status' => $article->status->value,
                'status_label' => $article->status->label(),
                'author' => $article->author?->full_name ?? $article->author?->name,
                'categories' => $article->categories->map(fn ($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                ]),
                'attachments' => $article->attachments->map(fn ($a) => [
                    'id' => $a->id,
                    'filename' => $a->filename,
                    'url' => Storage::url($a->path),
                    'mime_type' => $a->mime_type,
                    'size' => $a->size,
                ]),
                'created_at' => $article->created_at->format('d/m/Y H:i'),
                'updated_at' => $article->updated_at->format('d/m/Y H:i'),
            ],
            'canEdit' => $canEdit,
            'canPublish' => $canPublish,
        ]);
    }

    public function edit(Article $article)
    {
        Gate::authorize('update', $article);

        $article->load(['categories', 'attachments']);
        $categories = Category::orderBy('name')->get();

        return Inertia::render('Knowledge/Edit', [
            'article' => [
                'slug' => $article->slug,
                'title' => $article->title,
                'content' => $article->content,
                'status' => $article->status->value,
                'category_ids' => $article->categories->pluck('id'),
                'attachments' => $article->attachments->map(fn ($a) => [
                    'id' => $a->id,
                    'filename' => $a->filename,
                    'url' => Storage::url($a->path),
                    'mime_type' => $a->mime_type,
                    'size' => $a->size,
                ]),
            ],
            'categories' => $categories,
        ]);
    }

    public function update(UpdateArticleRequest $request, Article $article)
    {
        Gate::authorize('update', $article);

        $article->update([
            'title' => $request->input('title'),
            'content' => $request->input('content'),
        ]);

        if ($request->has('categories')) {
            $article->categories()->sync($request->input('categories', []));
        }

        if ($request->has('remove_attachments')) {
            $toRemove = $article->attachments()->whereIn('id', $request->input('remove_attachments'))->get();
            foreach ($toRemove as $att) {
                Storage::disk('public')->delete($att->path);
                $att->delete();
            }
        }

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('articles/attachments', 'public');
                $article->attachments()->create([
                    'filename' => $file->getClientOriginalName(),
                    'path' => $path,
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                ]);
            }
        }

        return redirect()->route('articles.show', $article->slug)
            ->with('success', 'Artículo actualizado.');
    }

    public function destroy(Article $article)
    {
        Gate::authorize('delete', $article);

        foreach ($article->attachments as $att) {
            Storage::disk('public')->delete($att->path);
        }

        $article->delete();

        return redirect()->route('articles.index')
            ->with('success', 'Artículo eliminado.');
    }

    public function publish(Article $article)
    {
        Gate::authorize('publish', $article);

        $article->update(['status' => ArticleStatus::Published]);

        return back()->with('success', 'Artículo publicado.');
    }
}
