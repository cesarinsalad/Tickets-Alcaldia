<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->timestamp('sla_response_deadline')->nullable()->after('exit_date');
            $table->timestamp('sla_resolution_deadline')->nullable()->after('sla_response_deadline');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn(['sla_response_deadline', 'sla_resolution_deadline']);
        });
    }
};
