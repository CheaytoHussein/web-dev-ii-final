<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Chats;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;




class ChatController extends Controller
{

    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    // Get list of users the current user can chat with
    public function index()
    {
        $authUserRole = Auth::user()->role;

        if ($authUserRole === 'buyer') {
            $users = User::where('role', 'seller')->select('id', 'name')->get();
        } elseif ($authUserRole === 'seller') {
            $users = User::where('role', 'buyer')->select('id', 'name')->get();
        } else {
            $users = User::whereIn('role', ['buyer', 'seller'])->select('id', 'name')->get();
        }

        return response()->json([
            'users' => $users
        ]);
    }

    // Send a chat message
    public function sendMessage(Request $request)
    {
        $request->validate([
            'user' => 'required|exists:users,id',
            'message' => 'required|string|max:1000',
        ]);

        $chat = new Chats();
        $chat->date_time = now();
        $chat->send_by = auth()->id();
        $chat->send_to = $request->user;
        $chat->message_type = 'text';
        $chat->message = e($request->message);
        $chat->save();

        return response()->json([
            'message' => 'Message sent successfully',
            'data' => $chat,
        ]);
    }

    // Get full chat history with a specific user
    public function getChatHistory(Request $request)
    {
        $request->validate([
            'userID' => 'required|exists:users,id',
        ]);

        $messages = Chats::with('sender')
            ->where(function ($query) use ($request) {
                $query->where('send_by', auth()->id())
                    ->where('send_to', $request->userID);
            })
            ->orWhere(function ($query) use ($request) {
                $query->where('send_by', $request->userID)
                    ->where('send_to', auth()->id());
            })
            ->orderBy('date_time', 'asc')
            ->get();

        // Mark unread messages as received
        foreach ($messages->where('send_to', auth()->id()) as $message) {
            if (!$message->is_received) {
                $message->is_received = 1;
                $message->save();
            }
        }

        return response()->json([
            'messages' => $messages,
        ]);
    }

    // Get new (unreceived) message from a specific user via SSE
    public function getNewMessages($user_id)
    {
        $message = Chats::where('send_to', auth()->id())
            ->where('send_by', $user_id)
            ->where('is_received', 0)
            ->with('sender')
            ->first();

        // Set headers for Server-Sent Events (SSE)
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');
        header('Access-Control-Allow-Origin: *');

        if ($message) {
            echo "data: " . json_encode(['item' => $message]) . "\n\n";
            $message->is_received = 1;
            $message->save();
        } else {
            echo ": ping\n\n"; // Comment/ping for keeping connection alive
        }

        ob_end_flush();
        flush();
    }
}

