<?php

namespace App\Jobs;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Events\ExportCompleted;

class ExportTaskReport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;
    public int $timeout = 120; // second

    /**
     *
     * @param int $requestingUserId  The user who triggered the export (for notification)
     */
    public function __construct(public int $requestingUserId)
    {
        //
    }

    public function handle(): void
    {
        Log::info("ExportTaskReport: Starting report generation for User #{$this->requestingUserId}.");

        $directory = 'reports/' . $this->requestingUserId;
        if (!Storage::disk('local')->exists($directory)) {
            Storage::disk('local')->makeDirectory($directory);
        }

        // Garbage collection: Hapus file lama (lebih dari 24 jam)
        $files = Storage::disk('local')->files($directory);
        $now = now()->timestamp;
        foreach ($files as $file) {
            $lastModified = Storage::disk('local')->lastModified($file);
            if ($now - $lastModified > 24 * 3600) {
                Storage::disk('local')->delete($file);
                Log::info("ExportTaskReport: Deleted old report '{$file}'.");
            }
        }

        $baseFilename = 'task_report_' . now()->format('Ymd_His') . '.csv';
        $filename = $directory . '/' . $baseFilename;

        $csvLines = ["ID,Title,Status,Priority,Assigned To,Created By,Due Date,Created At"];

        Task::with(['assignee:id,name', 'creator:id,name'])
            ->cursor()
            ->each(function (Task $task) use (&$csvLines) {
                $csvLines[] = implode(',', [
                    $task->id,
                    '"' . str_replace('"', '""', $task->title) . '"',
                    $task->status,
                    $task->priority,
                    '"' . ($task->assignee?->name ?? 'Unassigned') . '"',
                    '"' . ($task->creator?->name  ?? 'Unknown')    . '"',
                    $task->due_date?->format('Y-m-d') ?? '',
                    $task->created_at->format('Y-m-d H:i:s'),
                ]);
            });

        Storage::disk('local')->put($filename, implode(PHP_EOL, $csvLines));

        Log::info("ExportTaskReport: Report saved to '{$filename}' for User #{$this->requestingUserId}.");

        $downloadUrl = route('tasks.export.download', ['filename' => $baseFilename]);
        ExportCompleted::dispatch($this->requestingUserId, $downloadUrl, $baseFilename);
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("ExportTaskReport failed for User #{$this->requestingUserId}: {$exception->getMessage()}");
    }
}
