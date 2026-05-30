<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('title');
            $table->text('description');
            $table->string('priority');
            $table->string('status')->default('abierto');
            $table->foreignId('creator_id')->constrained('users');
            $table->foreignId('assigned_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('category_id')->constrained('categories');
            $table->string('photo_path')->nullable();
            $table->timestamp('entry_date')->useCurrent();
            $table->timestamp('exit_date')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('ticket_sequences', function (Blueprint $table) {
            $table->id();
            $table->integer('year')->unique();
            $table->integer('last_sequence')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
        Schema::dropIfExists('ticket_sequences');
    }
};
