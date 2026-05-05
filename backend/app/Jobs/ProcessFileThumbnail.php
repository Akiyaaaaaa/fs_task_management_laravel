<?php

namespace App\Jobs;

use App\Models\TaskAttachment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ProcessFileThumbnail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private const THUMB_WIDTH = 300;
    public int $tries = 3;

    public function __construct(public TaskAttachment $attachment)
    {
    }

    public function handle(): void
    {
        $absolutePath = Storage::disk('public')->path($this->attachment->file_path);
        if (! file_exists($absolutePath)) {
            Log::warning("ProcessFileThumbnail: Source file not found for Attachment #{$this->attachment->id}.");
            return;
        }

        $originalFilename = basename($this->attachment->file_path);
        $thumbRelativePath = 'attachments/thumbnails/thumb_' . $originalFilename;
        $thumbAbsolutePath = Storage::disk('public')->path($thumbRelativePath);
        $thumbDir = dirname($thumbAbsolutePath);
        if (! is_dir($thumbDir)) {
            mkdir($thumbDir, 0755, true);
        }

        $manager = new ImageManager(new Driver());
        $image = $manager->decode($absolutePath);
        $image->scaleDown(width: self::THUMB_WIDTH);
        $image->save($thumbAbsolutePath);
        $this->attachment->update(['thumbnail_path' => $thumbRelativePath]);
        Log::info("ProcessFileThumbnail: Thumbnail created for Attachment #{$this->attachment->id} at '{$thumbRelativePath}'.");
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("ProcessFileThumbnail failed for Attachment #{$this->attachment->id}: {$exception->getMessage()}");
    }
}
