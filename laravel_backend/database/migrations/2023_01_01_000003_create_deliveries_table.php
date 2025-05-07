
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
        Schema::create('deliveries', function (Blueprint $table) {
            $table->id();
            $table->string('tracking_number')->unique();
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('driver_id')->nullable()->constrained('users')->onDelete('set null');
            
            // Pickup information
            $table->text('pickup_address');
            $table->string('pickup_contact');
            $table->string('pickup_phone');
            $table->decimal('pickup_latitude', 10, 7)->nullable();
            $table->decimal('pickup_longitude', 10, 7)->nullable();
            
            // Delivery information
            $table->text('delivery_address');
            $table->string('recipient_name');
            $table->string('recipient_phone');
            $table->decimal('delivery_latitude', 10, 7)->nullable();
            $table->decimal('delivery_longitude', 10, 7)->nullable();
            
            // Package details
            $table->enum('package_size', ['small', 'medium', 'large', 'extra_large'])->default('small');
            $table->decimal('package_weight', 8, 2)->nullable(); // in kg
            $table->text('package_description')->nullable();
            $table->boolean('is_fragile')->default(false);
            
            // Delivery information
            $table->enum('delivery_type', ['standard', 'express', 'economy'])->default('standard');
            $table->date('delivery_date')->nullable();
            $table->time('delivery_time')->nullable();
            $table->text('delivery_instructions')->nullable();
            
            // Status and payment
            $table->enum('status', ['pending', 'accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled'])->default('pending');
            $table->decimal('price', 10, 2);
            $table->enum('payment_status', ['pending', 'paid', 'refunded', 'failed'])->default('pending');
            $table->string('payment_method')->nullable();
            $table->string('payment_transaction_id')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deliveries');
    }
};
