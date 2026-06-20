<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->timestamp('responded_at')->nullable()->after('assigned_id');
            $table->timestamp('in_progress_at')->nullable()->after('responded_at');
            $table->timestamp('resolved_at')->nullable()->after('in_progress_at');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn(['responded_at', 'in_progress_at', 'resolved_at']);
        });
    }
};
