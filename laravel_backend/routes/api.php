<?php

use App\Http\Controllers\ChatController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\AdminController;



/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/verify-email', [AuthController::class, 'verifyEmail']);
Route::post('/auth/resend-verification', [AuthController::class, 'resendVerification']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// Public tracking
Route::post('/track-delivery', [DeliveryController::class, 'trackDelivery']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::get('/auth/user', [AuthController::class, 'getUser']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);


    // Delivery routes
    Route::post('/deliveries/estimate-price', [DeliveryController::class, 'estimatePrice']);
    Route::get('/drivers/available', [DeliveryController::class, 'getAvailableDrivers']);

    // Payment routes
    Route::post('/payments/process', [PaymentController::class, 'processPayment']);
    Route::post('/payments/verify-crypto', [PaymentController::class, 'verifyCryptoPayment']);

    // Client routes
    Route::prefix('client')->group(function () {
        Route::get('/dashboard', [ClientController::class, 'getDashboard']);
        Route::get('/deliveries', [ClientController::class, 'getDeliveries']);
        Route::get('/deliveries/{id}', [ClientController::class, 'getDelivery']);
        Route::post('/deliveries', [ClientController::class, 'createDelivery']);
        Route::post('/deliveries/{id}/cancel', [ClientController::class, 'cancelDelivery']);
        Route::get('/notifications', [ClientController::class, 'getNotifications']);
    });

    // Driver routes
    Route::prefix('driver')->group(function () {
        Route::get('/dashboard', [DriverController::class, 'getDashboard']);
        Route::get('/deliveries', [DriverController::class, 'getDeliveries']);
        Route::get('/deliveries/{id}', [DriverController::class, 'getDelivery']);
        Route::post('/deliveries/{id}/accept', [DriverController::class, 'acceptDelivery']);
        Route::post('/deliveries/{id}/status', [DriverController::class, 'updateDeliveryStatus']);
        Route::post('/availability', [DriverController::class, 'updateAvailability']);
        Route::post('/location', [DriverController::class, 'updateLocation']);
        Route::get('/earnings', [DriverController::class, 'getEarnings']);
        Route::get('/notifications', [DriverController::class, 'getNotifications']);
    });

    // Admin routes
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'getDashboard']);
        Route::get('/users', [AdminController::class, 'getClients']);
        Route::get('/drivers', [AdminController::class, 'getDrivers']);
        Route::post('/drivers/{id}/verify', [AdminController::class, 'toggleDriverVerification']);
        Route::get('/deliveries', [AdminController::class, 'getDeliveries']);
        Route::get('/deliveries/{id}', [AdminController::class, 'getDelivery']);
        Route::get('/reports', [AdminController::class, 'getReports']);
        Route::get('/notifications', [AdminController::class, 'getNotifications']);
    });

    Route::prefix('chat')->group(function () {
        Route::get('/users', [ChatController::class, 'getChatUsers']);
        Route::post('/send', [ChatController::class, 'sendMessage']);
        Route::post('/history', [ChatController::class, 'getChatHistory']);
        Route::get('/new/{user_id}', [ChatController::class, 'getNewMessages']);
    });
});

// Admin auth routes
Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminController::class, 'login']);
});


Route::get('/chat/history/{user_id}', [ChatController::class, 'getChatHistory']);
Route::post('/chat/send', [ChatController::class, 'sendMessage']);
Route::get('/chat/stream/{user_id}', [ChatController::class, 'getNewMessages']);
