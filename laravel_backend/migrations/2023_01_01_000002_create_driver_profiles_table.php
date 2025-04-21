
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('driver_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('address')->nullable();
            $table->string('vehicle_type')->nullable();
            $table->string('vehicle_model')->nullable();
            $table->string('vehicle_color')->nullable();
            $table->string('vehicle_plate_number')->nullable();
            $table->string('driver_license')->nullable();
            $table->string('profile_picture')->nullable();
            $table->decimal('rating', 3, 2)->default(5.00);
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_available')->default(false);
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->timestamp('last_location_update')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('driver_profiles');
    }
};
