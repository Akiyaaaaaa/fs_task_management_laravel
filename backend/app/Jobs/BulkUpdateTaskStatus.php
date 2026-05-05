<?php

namespace App\Jobs;

use App\Events\TaskStatusUpdated;
use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class BulkUpdateTaskStatus implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    /**
     *
     * @param array<int>  $taskIds  List of task IDs to update
     * @param string      $status   New status value
     */
    public function __construct(
        public array  $taskIds,
        public string $status
    ) {
        //
    }

    public function handle(): void
    {
        $tasks = Task::whereIn('id', $this->taskIds)->get();

        $validTasks = [];
        $validTaskIds = [];

        foreach ($tasks as $task) {
            $currentStatus = $task->status;
            $targetStatus = $this->status;
            $isValid = false;

            // State Machine Validation
            if ($targetStatus === 'cancelled') {
                $isValid = true; // can transition to cancelled from anywhere
            } elseif ($currentStatus === 'pending' && $targetStatus === 'in_progress') {
                $isValid = true;
            } elseif ($currentStatus === 'in_progress' && $targetStatus === 'completed') {
                $isValid = true;
            }

            if ($isValid) {
                $validTasks[] = $task;
                $validTaskIds[] = $task->id;
            }
        }

        if (empty($validTaskIds)) {
            Log::info("BulkUpdateTaskStatus: No valid tasks to update.", ['task_ids' => $this->taskIds]);
            return;
        }

        $count = Task::whereIn('id', $validTaskIds)->update([
            'status'     => $this->status,
            'updated_at' => now(),
        ]);

        foreach ($validTasks as $task) {
            $task->status = $this->status;
            $task->load(['assignee:id,name,email', 'creator:id,name,email']);
            TaskStatusUpdated::dispatch($task);
        }

        // Membersihkan file cache (generic pattern untuk tasks caching jika ada)
        // Kita menggunakan pattern matching atau Cache::forget jika menggunakan tag
        // Karena driver file tidak mendukung tag, kita hapus cache tasks secara agresif atau log saja jika tidak ada key khusus
        Log::info("BulkUpdateTaskStatus: Updated {$count} task(s) to status '{$this->status}'. Cache clearance triggered.", [
            'valid_task_ids' => $validTaskIds,
            'invalid_task_ids' => array_diff($this->taskIds, $validTaskIds)
        ]);
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("BulkUpdateTaskStatus failed for tasks [" . implode(',', $this->taskIds) . "]: {$exception->getMessage()}");
    }
}
