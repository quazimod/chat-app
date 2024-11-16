<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $chats = $user->chats()->orderBy('created_at', 'desc')->get();

        foreach ($chats as $chat) {
            $chat->users = $chat->users()->get();
            $chat->messages = $chat->messages()->get();
        }

        return Inertia::render('Messages', ['chats' => $chats, 'user_id' => $user->id]);
    }

    public function getChatMessages(Chat $chat): Collection
    {
        return $chat->messages()->get();
    }

    public function storeMessage(Request $request, Chat $chat): Message
    {
        $user = auth()->user();
        $messageText = $request->input('message');
        $message = new Message(['message' => $messageText]);
        $message->user()->associate($user);
        $message->chat()->associate($chat);
        $message->save();

        return $message;
    }
}
