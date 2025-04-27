<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Delivery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DeliveryController extends Controller
{
    /**
     * Estimate delivery price
     */
    public function estimatePrice(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pickup_address' => 'required|string',
            'delivery_address' => 'required|string',
            'package_size' => 'required|in:small,medium,large,extra_large',
            'package_weight' => 'required|numeric',
            'delivery_type' => 'required|in:standard,express,economy',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        
        // In a real application, this would call a third-party API like Google Distance Matrix
        // to calculate the distance and then apply pricing logic
        
        // For demo purposes, we'll use a simple pricing model
        $basePrices = [
            'small' => 10.00,
            'medium' => 15.00,
            'large' => 20.00,
            'extra_large' => 30.00,
        ];
        
        $typeMultipliers = [
            'economy' => 0.8,
            'standard' => 1.0,
            'express' => 1.5,
        ];
        
        // Get base price for package size
        $basePrice = $basePrices[$request->package_size];
        
        // Add weight charge ($1 per kg after 1kg)
        $weightCharge = max(0, $request->package_weight - 1) * 1.00;
        
        // Apply delivery type multiplier
        $typeMultiplier = $typeMultipliers[$request->delivery_type];
        
        // Calculate simulated distance-based charge
        // In production, this would be replaced with actual distance calculation
        $distanceCharge = 5.00;
        
        // Calculate total price
        $totalPrice = ($basePrice + $weightCharge + $distanceCharge) * $typeMultiplier;
        
        // Round to 2 decimal places
        $totalPrice = round($totalPrice, 2);
        
        return response()->json([
            'price' => $totalPrice,
            'breakdown' => [
                'base_price' => $basePrice,
                'weight_charge' => $weightCharge,
                'distance_charge' => $distanceCharge,
                'type_multiplier' => $typeMultiplier,
            ]
        ]);
    }

    /**
     * Get available drivers
     */
    public function getAvailableDrivers(Request $request)
    {
        // In a real application, you might filter by proximity to pickup location
        $drivers = User::where('user_type', 'driver')
            ->whereHas('driverProfile', function($query) {
                $query->where('is_available', true)
                      ->where('is_verified', true);
            })
            ->with('driverProfile')
            ->get()
            ->map(function($driver) {
                return [
                    'id' => $driver->id,
                    'name' => $driver->name,
                    'rating' => $driver->driverProfile->rating,
                    'vehicle_type' => $driver->driverProfile->vehicle_type,
                ];
            });
        
        return response()->json([
            'drivers' => $drivers
        ]);
    }

    /**
     * Track delivery by tracking number (public API)
     */
    public function trackDelivery(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tracking_number' => 'required|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        
        $delivery = Delivery::where('tracking_number', $request->tracking_number)
            ->with(['statusHistory' => function($query) {
                $query->orderBy('created_at', 'desc');
            }])
            ->first();
        
        if (!$delivery) {
            return response()->json(['message' => 'Delivery not found'], 404);
        }
        
        // Return limited information for public tracking
        return response()->json([
            'tracking_number' => $delivery->tracking_number,
            'status' => $delivery->status,
            'created_at' => $delivery->created_at,
            'delivery_type' => $delivery->delivery_type,
            'status_history' => $delivery->statusHistory->map(function($status) {
                return [
                    'status' => $status->status,
                    'timestamp' => $status->created_at,
                    'location' => $status->location,
                ];
            }),
        ]);
    }
}
