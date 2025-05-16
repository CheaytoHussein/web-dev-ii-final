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
    }// in DriverController.php
public function show($id)
{
    $delivery = Delivery::find($id);

    if (!$delivery) {
        abort(404, 'Delivery not found.');
    }

    // Make sure you pass all necessary fields in the response
    return response()->json($delivery);
}




    public function getAvailableDrivers(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'radius' => 'nullable|numeric|min:1|max:50',
                'vehicle_type' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => $validator->errors()->first()
                ], 422);
            }

            // Get available and verified drivers
            $query = User::where('user_type', 'driver')
                ->whereHas('driverProfile', function($q) use ($request) {
                    $q->where('is_available', true)
                        ->where('is_verified', true);

                    if ($request->vehicle_type) {
                        $q->where('vehicle_type', $request->vehicle_type);
                    }
                })
                ->with(['driverProfile']);

            $drivers = $query->get();

            // Transform the data to match frontend expectations
            $transformedDrivers = $drivers->map(function($driver) use ($request) {
                // Calculate distance (simplified for demo)
                $distance = $driver->driverProfile->latitude && $driver->driverProfile->longitude
                    ? $this->calculateDistance(
                        $request->latitude ?? 0,
                        $request->longitude ?? 0,
                        $driver->driverProfile->latitude,
                        $driver->driverProfile->longitude
                    )
                    : rand(1, 10); // Random distance for demo

                return [
                    'id' => (string)$driver->id,
                    'name' => $driver->name,
                    'email' => $driver->email,
                    'phone' => $driver->driverProfile->phone,
                    'rating' => (float)$driver->driverProfile->rating,
                    'profile_picture' => $driver->driverProfile->profile_picture,
                    'vehicle_type' => $driver->driverProfile->vehicle_type,
                    'vehicle_model' => $driver->driverProfile->vehicle_model,
                    'is_available' => (bool)$driver->driverProfile->is_available,
                    'distance' => (float)round($distance, 1),
                    'latitude' => (float)$driver->driverProfile->latitude,
                    'longitude' => (float)$driver->driverProfile->longitude,
                    'completed_deliveries' => (int)$driver->driverDeliveries()->where('status', 'delivered')->count(),
                ];
            });

            // Filter by radius if provided
            if ($request->radius) {
                $transformedDrivers = $transformedDrivers->filter(function($driver) use ($request) {
                    return $driver['distance'] <= $request->radius;
                });
            }

            // Sort by distance
            $transformedDrivers = $transformedDrivers->sortBy('distance')->values();

            return response()->json([
                'success' => true,
                'drivers' => $transformedDrivers
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch drivers: ' . $e->getMessage()
            ], 500);
        }
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

    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        // Simple distance calculation for demo purposes
        // In production, use Haversine formula for accurate distance
        $latDiff = abs($lat1 - $lat2);
        $lonDiff = abs($lon1 - $lon2);

        // Very simplified calculation - just for demo
        $distance = sqrt(($latDiff * $latDiff) + ($lonDiff * $lonDiff)) * 111.2; // rough miles conversion

        return $distance;
    }
}
