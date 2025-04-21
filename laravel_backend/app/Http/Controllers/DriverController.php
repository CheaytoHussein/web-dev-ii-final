
<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Delivery;
use App\Models\DeliveryStatus;
use App\Models\Notification;
use App\Models\DriverEarning;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class DriverController extends Controller
{
    /**
     * Get driver dashboard data
     */
    public function getDashboard(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isDriver()) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }
        
        // Get delivery statistics
        $activeDeliveries = $user->driverDeliveries()
            ->whereIn('status', ['accepted', 'picked_up', 'in_transit'])
            ->count();
        
        $completedDeliveries = $user->driverDeliveries()
            ->where('status', 'delivered')
            ->count();
        
        $totalDeliveries = $user->driverDeliveries()->count();
        
        // Get earnings statistics
        $totalEarnings = $user->driverEarnings()
            ->sum('net_amount');
        
        $todayEarnings = $user->driverEarnings()
            ->whereDate('created_at', Carbon::today())
            ->sum('net_amount');
        
        $weeklyEarnings = $user->driverEarnings()
            ->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
            ->sum('net_amount');
        
        // Get recent deliveries
        $recentDeliveries = $user->driverDeliveries()
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
        
        // Get pending deliveries nearby (if available)
        $pendingDeliveriesCount = Delivery::where('status', 'pending')
            ->whereNull('driver_id')
            ->count();

        return response()->json([
            'active_deliveries' => $activeDeliveries,
            'completed_deliveries' => $completedDeliveries,
            'total_deliveries' => $totalDeliveries,
            'total_earnings' => $totalEarnings,
            'today_earnings' => $todayEarnings,
            'weekly_earnings' => $weeklyEarnings,
            'recent_deliveries' => $recentDeliveries,
            'pending_deliveries' => $pendingDeliveriesCount,
        ]);
    }

    /**
     * Get all driver deliveries
     */
    public function getDeliveries(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isDriver()) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }
        
        // Get filter status if provided
        $status = $request->query('status');
        
        $query = $user->driverDeliveries()->with('client');
        
        if ($status) {
            $query->where('status', $status);
        }
        
        $deliveries = $query->orderBy('created_at', 'desc')->get();
        
        return response()->json(['deliveries' => $deliveries]);
    }

    /**
     * Get specific delivery details
     */
    public function getDelivery(Request $request, $id)
    {
        $user = $request->user();
        
        if (!$user->isDriver()) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }
        
        $delivery = $user->driverDeliveries()
            ->with(['client', 'statusHistory' => function($query) {
                $query->orderBy('created_at', 'desc');
            }])
            ->find($id);
        
        if (!$delivery) {
            return response()->json(['message' => 'Delivery not found'], 404);
        }
        
        return response()->json(['delivery' => $delivery]);
    }

    /**
     * Accept a pending delivery
     */
    public function acceptDelivery(Request $request, $id)
    {
        $user = $request->user();
        
        if (!$user->isDriver()) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }
        
        // Check if driver is verified
        if (!$user->driverProfile->is_verified) {
            return response()->json(['message' => 'Your account is not verified yet'], 403);
        }
        
        // Check if driver is available
        if (!$user->driverProfile->is_available) {
            return response()->json(['message' => 'You need to set your status as available first'], 400);
        }
        
        $delivery = Delivery::where('id', $id)
            ->where('status', 'pending')
            ->whereNull('driver_id')
            ->first();
        
        if (!$delivery) {
            return response()->json(['message' => 'Delivery not found or already assigned'], 404);
        }
        
        // Assign driver and update status
        $delivery->driver_id = $user->id;
        $delivery->status = 'accepted';
        $delivery->save();
        
        // Add status history
        DeliveryStatus::create([
            'delivery_id' => $delivery->id,
            'status' => 'accepted',
            'location' => 'N/A',
            'notes' => 'Accepted by driver',
        ]);
        
        // Notify client
        Notification::create([
            'user_id' => $delivery->client_id,
            'title' => 'Delivery Accepted',
            'message' => "Your delivery {$delivery->tracking_number} has been accepted by a driver",
            'type' => 'delivery_accepted',
            'reference_id' => (string)$delivery->id,
        ]);
        
        return response()->json([
            'message' => 'Delivery accepted successfully'
        ]);
    }

    /**
     * Update delivery status
     */
    public function updateDeliveryStatus(Request $request, $id)
    {
        $user = $request->user();
        
        if (!$user->isDriver()) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:picked_up,in_transit,delivered',
            'location' => 'nullable|string',
            'notes' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        
        $delivery = $user->driverDeliveries()->find($id);
        
        if (!$delivery) {
            return response()->json(['message' => 'Delivery not found'], 404);
        }
        
        // Validate status transition
        $validTransitions = [
            'accepted' => ['picked_up'],
            'picked_up' => ['in_transit'],
            'in_transit' => ['delivered'],
        ];
        
        if (!isset($validTransitions[$delivery->status]) || 
            !in_array($request->status, $validTransitions[$delivery->status])) {
            return response()->json([
                'message' => "Invalid status transition from {$delivery->status} to {$request->status}"
            ], 400);
        }
        
        // Update delivery status
        $delivery->status = $request->status;
        $delivery->save();
        
        // Add status history
        DeliveryStatus::create([
            'delivery_id' => $delivery->id,
            'status' => $request->status,
            'location' => $request->location ?? 'N/A',
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'notes' => $request->notes ?? null,
        ]);
        
        // Notify client
        $statusMessages = [
            'picked_up' => 'picked up',
            'in_transit' => 'in transit',
            'delivered' => 'delivered',
        ];
        
        Notification::create([
            'user_id' => $delivery->client_id,
            'title' => 'Delivery Update',
            'message' => "Your delivery {$delivery->tracking_number} is now {$statusMessages[$request->status]}",
            'type' => 'delivery_status_update',
            'reference_id' => (string)$delivery->id,
        ]);
        
        // If delivered, calculate and create driver earnings
        if ($request->status === 'delivered') {
            $this->processDeliveryCompletion($delivery, $user);
        }
        
        return response()->json([
            'message' => 'Delivery status updated successfully'
        ]);
    }

    /**
     * Update driver availability
     */
    public function updateAvailability(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isDriver()) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'is_available' => 'required|boolean',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        
        $user->driverProfile->is_available = $request->is_available;
        $user->driverProfile->save();
        
        return response()->json([
            'message' => 'Availability updated successfully',
            'is_available' => $user->driverProfile->is_available,
        ]);
    }

    /**
     * Update driver location
     */
    public function updateLocation(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isDriver()) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        
        $user->driverProfile->latitude = $request->latitude;
        $user->driverProfile->longitude = $request->longitude;
        $user->driverProfile->last_location_update = Carbon::now();
        $user->driverProfile->save();
        
        // If driver has an active delivery in transit, update its status location too
        $activeDelivery = $user->driverDeliveries()
            ->where('status', 'in_transit')
            ->first();
            
        if ($activeDelivery) {
            DeliveryStatus::create([
                'delivery_id' => $activeDelivery->id,
                'status' => 'in_transit',
                'location' => 'Location update',
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
            ]);
        }
        
        return response()->json([
            'message' => 'Location updated successfully'
        ]);
    }

    /**
     * Get driver earnings
     */
    public function getEarnings(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isDriver()) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }
        
        $period = $request->query('period', 'all');
        
        $query = $user->driverEarnings()->with('delivery');
        
        switch ($period) {
            case 'today':
                $query->whereDate('created_at', Carbon::today());
                break;
            case 'week':
                $query->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
                break;
            case 'month':
                $query->whereYear('created_at', Carbon::now()->year)
                      ->whereMonth('created_at', Carbon::now()->month);
                break;
        }
        
        $earnings = $query->orderBy('created_at', 'desc')->get();
        
        $totalEarned = $earnings->sum('net_amount');
        $totalCommission = $earnings->sum('commission');
        
        return response()->json([
            'earnings' => $earnings,
            'total_earned' => $totalEarned,
            'total_commission' => $totalCommission,
        ]);
    }

    /**
     * Get driver notifications
     */
    public function getNotifications(Request $request)
    {
        $user = $request->user();
        
        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'notifications' => $notifications
        ]);
    }

    /**
     * Process delivery completion and calculate earnings
     */
    private function processDeliveryCompletion(Delivery $delivery, User $driver)
    {
        // Calculate commission (20% of delivery price)
        $commission = $delivery->price * 0.20;
        $netAmount = $delivery->price - $commission;
        
        // Create driver earning record
        DriverEarning::create([
            'driver_id' => $driver->id,
            'delivery_id' => $delivery->id,
            'amount' => $delivery->price,
            'commission' => $commission,
            'net_amount' => $netAmount,
            'status' => 'pending',
        ]);
    }
}
