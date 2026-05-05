<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('tasks.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('tasks.{taskId}.comments', function ($user, $taskId) {
    return true; 
});

Broadcast::channel('presence.workspace', function ($user) {
    return ['id' => $user->id, 'name' => $user->name];
});