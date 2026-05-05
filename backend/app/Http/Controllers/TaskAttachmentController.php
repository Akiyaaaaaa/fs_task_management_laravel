<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAttachmentRequest;
use App\Jobs\ProcessFileThumbnail;
use App\Models\Task;
use App\Models\TaskAttachment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class TaskAttachmentController extends Controller
{
    public function store(StoreAttachmentRequest $request, Task $task): JsonResponse
    {
        $file = $request->file('file');
        $storedPath = $file->store('attachments', 'public');

        $attachment = $task->attachments()->create([
            'file_name'     => $file->getClientOriginalName(),
            'file_path'     => $storedPath,
            'file_size'     => $file->getSize(),       // bytes
            'mime_type'     => $file->getMimeType(),
            'thumbnail_path'=> null,                   // will be set by the background job
            'uploaded_at'   => now(),
        ]);

        if ($attachment->isImage()) {
            ProcessFileThumbnail::dispatch($attachment);
        }

        return response()->json([
            'message' => 'File uploaded successfully.',
            'data'    => $attachment,
        ], 201);
    }

    public function download(TaskAttachment $attachment)
    {
        if (! Storage::disk('public')->exists($attachment->file_path)) {
            return response()->json(['message' => 'File not found on disk.'], 404);
        }
        return Storage::disk('public')->download(
            $attachment->file_path,
            $attachment->file_name,
            ['Content-Type' => $attachment->mime_type]
        );
    }

    public function destroy(TaskAttachment $attachment): JsonResponse
    {
        if (Storage::disk('public')->exists($attachment->file_path)) {
            Storage::disk('public')->delete($attachment->file_path);
        }
        if ($attachment->thumbnail_path && Storage::disk('public')->exists($attachment->thumbnail_path)) {
            Storage::disk('public')->delete($attachment->thumbnail_path);
        }

        $attachment->delete();

        return response()->json(['message' => 'Attachment deleted successfully.']);
    }
}
