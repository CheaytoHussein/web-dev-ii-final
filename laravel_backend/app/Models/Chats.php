<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chats extends Model
{
    use HasFactory;

    protected $table = 'chats';

    protected $fillable = [
        'date_time',
        'send_by',
        'send_to',
        'message_type',
        'message',
        'is_received',
    ];

    // Add sender relationship to fetch sender info (name, id, etc.)
    public function sender()
    {
        return $this->belongsTo(User::class, 'send_by');
    }
}
