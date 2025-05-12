<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateChatsTable extends Migration
{
    public function up()
    {
        Schema::create('chats', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('send_by');
            $table->unsignedBigInteger('send_to');
            $table->string('message_type')->default('text');
            $table->text('message');
            $table->timestamp('date_time');
            $table->boolean('is_received')->default(false);
            $table->timestamps();

            // Foreign keys
            $table->foreign('send_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('send_to')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('chats');
    }
}
