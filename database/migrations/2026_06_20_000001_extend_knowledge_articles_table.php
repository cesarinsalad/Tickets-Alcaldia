<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('knowledge_articles', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('title');
            $table->string('status')->default('draft')->after('content');
            $table->renameColumn('user_id', 'author_id');
        });

        DB::statement("ALTER TABLE knowledge_articles ADD COLUMN fts_vector tsvector GENERATED ALWAYS AS (to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(content, ''))) STORED");
        DB::statement('CREATE INDEX knowledge_articles_fts_idx ON knowledge_articles USING GIN (fts_vector)');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS knowledge_articles_fts_idx');
        DB::statement('ALTER TABLE knowledge_articles DROP COLUMN IF EXISTS fts_vector');

        Schema::table('knowledge_articles', function (Blueprint $table) {
            $table->renameColumn('author_id', 'user_id');
            $table->dropColumn(['status', 'slug']);
        });
    }
};
