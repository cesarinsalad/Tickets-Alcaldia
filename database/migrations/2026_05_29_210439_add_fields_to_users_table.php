<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('last_name')->after('name')->nullable();
            $table->string('phone_number')->after('email')->nullable();
            $table->foreignId('department_id')->nullable()->after('phone_number')->constrained()->nullOnDelete();
            $table->boolean('is_active')->default(true)->after('department_id');
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('department_id');
            $table->dropColumn(['last_name', 'phone_number', 'is_active']);
            $table->dropSoftDeletes();
        });
    }
};
