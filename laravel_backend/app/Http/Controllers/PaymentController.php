
<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use App\Models\Payment;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PaymentController extends Controller
{
    /**
     * Process card payment
     */
    public function processPayment(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'delivery_id' => 'required|exists:deliveries,id',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:card,crypto',
            'card_info' => 'required_if:payment_method,card|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        
        // Get the delivery
        $delivery = Delivery::find($request->delivery_id);
        
        // Check if the user is authorized to pay for this delivery
        if ($delivery->client_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized payment attempt'], 403);
        }
        
        // Check if payment is already made
        if ($delivery->payment_status === 'paid') {
            return response()->json(['message' => 'Payment already completed'], 400);
        }
        
        // In a real application, this would integrate with Stripe or another payment gateway
        // For demo purposes, we'll simulate a successful payment
        
        // Generate a transaction ID
        $transactionId = 'TRANS_' . Str::random(16);
        
        // Update delivery payment status
        $delivery->payment_status = 'paid';
        $delivery->payment_method = $request->payment_method;
        $delivery->payment_transaction_id = $transactionId;
        $delivery->save();
        
        // Create payment record
        $payment = Payment::create([
            'delivery_id' => $delivery->id,
            'user_id' => $user->id,
            'amount' => $request->amount,
            'payment_method' => $request->payment_method,
            'transaction_id' => $transactionId,
            'status' => 'completed',
            'payment_details' => [
                'card_last_four' => isset($request->card_info['number']) 
                    ? substr($request->card_info['number'], -4) 
                    : null,
                'card_type' => isset($request->card_info['number'])
                    ? $this->getCardType($request->card_info['number'])
                    : null,
            ],
        ]);
        
        // Notify driver if assigned
        if ($delivery->driver_id) {
            Notification::create([
                'user_id' => $delivery->driver_id,
                'title' => 'Payment Received',
                'message' => "Payment for delivery {$delivery->tracking_number} has been completed",
                'type' => 'payment_completed',
                'reference_id' => (string)$delivery->id,
            ]);
        }
        
        return response()->json([
            'message' => 'Payment processed successfully',
            'transaction_id' => $transactionId,
        ]);
    }

    /**
     * Verify crypto payment
     */
    public function verifyCryptoPayment(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'delivery_id' => 'required|exists:deliveries,id',
            'amount' => 'required|numeric|min:0',
            'wallet_type' => 'required|string',
            'wallet_address' => 'nullable|string',
            'transaction_id' => 'required|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        
        // Get the delivery
        $delivery = Delivery::find($request->delivery_id);
        
        // Check if the user is authorized to pay for this delivery
        if ($delivery->client_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized payment attempt'], 403);
        }
        
        // Check if payment is already made
        if ($delivery->payment_status === 'paid') {
            return response()->json(['message' => 'Payment already completed'], 400);
        }
        
        // In a real application, this would verify the transaction on the blockchain
        // For demo purposes, we'll simulate a successful verification
        
        // Update delivery payment status
        $delivery->payment_status = 'paid';
        $delivery->payment_method = 'crypto_' . $request->wallet_type;
        $delivery->payment_transaction_id = $request->transaction_id;
        $delivery->save();
        
        // Create payment record
        $payment = Payment::create([
            'delivery_id' => $delivery->id,
            'user_id' => $user->id,
            'amount' => $request->amount,
            'payment_method' => 'crypto_' . $request->wallet_type,
            'transaction_id' => $request->transaction_id,
            'status' => 'completed',
            'payment_details' => [
                'wallet_type' => $request->wallet_type,
                'wallet_address' => $request->wallet_address,
            ],
        ]);
        
        // Notify driver if assigned
        if ($delivery->driver_id) {
            Notification::create([
                'user_id' => $delivery->driver_id,
                'title' => 'Payment Received',
                'message' => "Payment for delivery {$delivery->tracking_number} has been completed with cryptocurrency",
                'type' => 'payment_completed',
                'reference_id' => (string)$delivery->id,
            ]);
        }
        
        return response()->json([
            'message' => 'Crypto payment verified successfully',
            'transaction_id' => $request->transaction_id,
        ]);
    }

    /**
     * Helper method to identify card type
     */
    private function getCardType($cardNumber)
    {
        $cardNumber = preg_replace('/\s+/', '', $cardNumber);
        
        if (preg_match('/^4/', $cardNumber)) {
            return 'visa';
        } elseif (preg_match('/^5[1-5]/', $cardNumber)) {
            return 'mastercard';
        } elseif (preg_match('/^3[47]/', $cardNumber)) {
            return 'amex';
        } elseif (preg_match('/^6(?:011|5)/', $cardNumber)) {
            return 'discover';
        } else {
            return 'unknown';
        }
    }
}
