
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Delivery extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'tracking_number',
        'client_id',
        'driver_id',
        'pickup_address',
        'pickup_contact',
        'pickup_phone',
        'pickup_latitude',
        'pickup_longitude',
        'delivery_address',
        'recipient_name',
        'recipient_phone',
        'delivery_latitude',
        'delivery_longitude',
        'package_size',
        'package_weight',
        'package_description',
        'is_fragile',
        'delivery_type',
        'delivery_date',
        'delivery_time',
        'delivery_instructions',
        'status',
        'price',
        'payment_status',
        'payment_method',
        'payment_transaction_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'pickup_latitude' => 'decimal:7',
        'pickup_longitude' => 'decimal:7',
        'delivery_latitude' => 'decimal:7',
        'delivery_longitude' => 'decimal:7',
        'package_weight' => 'decimal:2',
        'price' => 'decimal:2',
        'delivery_date' => 'date',
        'is_fragile' => 'boolean',
    ];

    /**
     * Get the client that owns the delivery.
     */
    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    /**
     * Get the driver assigned to the delivery.
     */
    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    /**
     * Get the status history for the delivery.
     */
    public function statusHistory()
    {
        return $this->hasMany(DeliveryStatus::class);
    }

    /**
     * Get the payment for the delivery.
     */
    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    /**
     * Get the driver earning for the delivery.
     */
    public function driverEarning()
    {
        return $this->hasOne(DriverEarning::class);
    }

    /**
     * Generate tracking number for a new delivery.
     */
    public static function generateTrackingNumber(): string
    {
        $prefix = 'ST';
        $timestamp = now()->format('ymdHi');
        $randomDigits = str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        
        return $prefix . $timestamp . $randomDigits;
    }
}
