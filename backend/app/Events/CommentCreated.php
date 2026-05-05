<?php

namespace App\Events;

use App\Models\TaskComment;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommentCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $comment;

    public function __construct(TaskComment $comment)
    {
        $this->comment = $comment;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("tasks.{$this->comment->task_id}.comments"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'CommentPosted';
    }

    /**
     * Payload yang dikirim ke client.
     * Harus eksplisit karena SerializesModels re-fetch model tanpa relasi.
     */
    public function broadcastWith(): array
    {
        $this->comment->loadMissing('user:id,name');

        return [
            'comment' => [
                'id'         => $this->comment->id,
                'task_id'    => $this->comment->task_id,
                'user_id'    => $this->comment->user_id,
                'comment'    => $this->comment->comment,
                'created_at' => $this->comment->created_at?->toISOString(),
                'updated_at' => $this->comment->updated_at?->toISOString(),
                'user'       => $this->comment->user
                    ? ['id' => $this->comment->user->id, 'name' => $this->comment->user->name]
                    : null,
            ],
        ];
    }
}
