<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->string('title')->unique();
            $table->enum('type', ['anime', 'manga', 'drama']);
            $table->string('genre', 100);
            $table->decimal('rating', 3, 1);
            $table->unsignedInteger('episodes')->nullable(); // anime & drama
            $table->unsignedInteger('chapters')->nullable(); // manga
            $table->unsignedInteger('runtime')->nullable();  // drama (menit per episode)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
