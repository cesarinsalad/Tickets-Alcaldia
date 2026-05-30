<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('departments', 'head_of_area')) {
            Schema::table('departments', function (Blueprint $table) {
                $table->dropColumn('head_of_area');
                $table->foreignId('head_of_area_id')->nullable()->after('name')->constrained('users')->nullOnDelete();
                $table->unique('head_of_area_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('departments', 'head_of_area_id')) {
            Schema::table('departments', function (Blueprint $table) {
                $table->dropForeign(['head_of_area_id']);
                $table->dropUnique(['head_of_area_id']);
                $table->dropColumn('head_of_area_id');
                $table->string('head_of_area')->nullable()->after('name');
            });
        }
    }
};
