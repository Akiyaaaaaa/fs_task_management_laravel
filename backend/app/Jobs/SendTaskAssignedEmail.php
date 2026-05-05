<?php

namespace App\Jobs;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendTaskAssignedEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    /**
     * The task model is automatically serialized and re-fetched by the queue worker.
     */
    public function __construct(public Task $task)
    {
        //
    }

    public function handle(): void
    {
        $this->task->loadMissing('assignee', 'creator');

        $assignee = $this->task->assignee;
        if (! $assignee) {
            Log::warning("SendTaskAssignedEmail: Task #{$this->task->id} has no assignee. Skipping.");
            return;
        }

        Log::info("SendTaskAssignedEmail: Sending email to {$assignee->email} for Task #{$this->task->id} '{$this->task->title}'.");

        Mail::to($assignee->email)->send(new \App\Mail\TaskAssignedMailable($this->task));

    }

    public function failed(\Throwable $exception): void
    {
        Log::error("SendTaskAssignedEmail failed for Task #{$this->task->id}: {$exception->getMessage()}");
    }
}
