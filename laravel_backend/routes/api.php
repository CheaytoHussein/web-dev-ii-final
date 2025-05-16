<?php

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

// =======================
// Public Auth Routes
// =======================
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
    Route::post('/register/driver', [AuthController::class, 'registerDriver']);
    Route::post('/verify-email', [AuthController::class, 'verifyEmail'])->name('auth.verifyEmail');
    Route::post('/resend-verification', [AuthController::class, 'resendVerification'])->name('auth.resendVerification');
    Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->name('auth.forgotPassword');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('auth.resetPassword');
});

// =======================
// Public Delivery Tracking
// =======================
Route::post('/track-delivery', [DeliveryController::class, 'trackDelivery'])->name('delivery.track');

// =======================
// Admin Public Auth Route
// =======================
Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminController::class, 'login'])->name('admin.login');
});

// =======================
// Protected Routes (auth:sanctum)
// =======================
Route::middleware('auth:sanctum')->group(function () {

    // ========== Authenticated User ==========
    Route::prefix('auth')->group(function () {
        Route::get('/user', [AuthController::class, 'getUser'])->name('auth.user');
        Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
    });

    // ========== Deliveries ==========
    Route::prefix('deliveries')->group(function () {
        Route::post('/estimate-price', [DeliveryController::class, 'estimatePrice'])->name('deliveries.estimate');
    });

    // ========== Available Drivers ==========
    Route::get('/drivers/available', [DeliveryController::class, 'getAvailableDrivers'])->name('drivers.available');

    // ========== Payments ==========
    Route::prefix('payments')->group(function () {
        Route::post('/process', [PaymentController::class, 'processPayment'])->name('payments.process');
        Route::post('/verify-crypto', [PaymentController::class, 'verifyCryptoPayment'])->name('payments.verifyCrypto');
    });

    // ========== Client Routes ==========
    Route::prefix('client')->group(function () {
        Route::get('/dashboard', [ClientController::class, 'getDashboard'])->name('client.dashboard');
        Route::get('/deliveries', [ClientController::class, 'getDeliveries'])->name('client.deliveries.index');
        Route::get('/deliveries/{id}', [ClientController::class, 'getDelivery'])->name('client.deliveries.show');
        Route::post('/deliveries', [ClientController::class, 'createDelivery'])->name('client.deliveries.create');
        Route::post('/deliveries/{id}/cancel', [ClientController::class, 'cancelDelivery'])->name('client.deliveries.cancel');
        Route::get('/notifications', [ClientController::class, 'getNotifications'])->name('client.notifications');
    });

    // ========== Driver Routes ==========
    Route::prefix('driver')->group(function () {
        Route::get('/dashboard', [DriverController::class, 'getDashboard'])->name('driver.dashboard');
        Route::get('/deliveries', [DriverController::class, 'getDeliveries'])->name('driver.deliveries.index');
        Route::get('/deliveries/{id}', [DriverController::class, 'getDelivery'])->name('driver.deliveries.show');
        Route::post('/deliveries/{id}/accept', [DriverController::class, 'acceptDelivery'])->name('driver.deliveries.accept');
        Route::post('/deliveries/{id}/status', [DriverController::class, 'updateDeliveryStatus'])->name('driver.deliveries.updateStatus');
        Route::post('/availability', [DriverController::class, 'updateAvailability'])->name('driver.availability.update');
        Route::post('/location', [DriverController::class, 'updateLocation'])->name('driver.location.update');
        Route::get('/earnings', [DriverController::class, 'getEarnings'])->name('driver.earnings');
        Route::get('/notifications', [DriverController::class, 'getNotifications'])->name('driver.notifications');
    });

    // ========== Admin Routes ==========
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'getDashboard'])->name('admin.dashboard');
        Route::get('/clients', [AdminController::class, 'getClients'])->name('admin.clients');
        Route::get('/drivers', [AdminController::class, 'getDrivers'])->name('admin.drivers');
        Route::post('/drivers/{id}/verify', [AdminController::class, 'toggleDriverVerification'])->name('admin.drivers.verify');
        Route::get('/deliveries', [AdminController::class, 'getDeliveries'])->name('admin.deliveries');
        Route::get('/deliveries/{id}', [AdminController::class, 'getDelivery'])->name('admin.deliveries.show');
        Route::get('/reports', [AdminController::class, 'getReports'])->name('admin.reports');
        Route::get('/notifications', [AdminController::class, 'getNotifications'])->name('admin.notifications');
        Route::post('/drivers/{id}/verify', [AdminController::class, 'verifyDriver']);
        Route::post('/drivers/{id}/unverify', [AdminController::class, 'unverifyDriver']);
        // In App.tsx or routes.tsx




    });



});
