<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Jobs\SendTaskAssignedEmail;
use App\Jobs\BulkUpdateTaskStatus;
use App\Jobs\ExportTaskReport;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use App\Events\TaskStatusUpdated;

class TaskController extends Controller
{
    /**
     * params:
     *   - status    (string)  Filter by task status
     *   - priority  (string)  Filter by priority level
     *   - sort_by   (string)  Column to sort by (default: created_at)
     *   - sort_dir  (string)  Sort direction: asc|desc (default: desc)
     *   - per_page  (int)     Items per page (default: 10)
     *   - search    (string)  Search in title/description
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::guard('api')->user();
        $userId = $user->id;
        $isAdmin = $user->role === 'admin';

        $query = Task::with(['assignee:id,name,email', 'creator:id,name,email']);

        if ($request->filled('status')) {
            $query->byStatus($request->status);
        }

        if ($request->filled('priority')) {
            $query->byPriority($request->priority);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Visibility logic: Admins see all, others see assigned OR created tasks
        if (!$isAdmin) {
            $query->where(function ($q) use ($userId) {
                $q->where('assigned_user_id', $userId)
                  ->orWhere('created_by', $userId);
            });
        } elseif ($request->filled('assigned_user_id')) {
            $query->where('assigned_user_id', $request->assigned_user_id);
        }

        $allowedSortColumns = ['created_at', 'updated_at', 'due_date', 'priority', 'status', 'title'];
        $sortBy  = in_array($request->get('sort_by'), $allowedSortColumns) ? $request->get('sort_by') : 'created_at';
        $sortDir = strtolower($request->get('sort_dir', 'desc')) === 'asc' ? 'asc' : 'desc';

        $query->orderBy($sortBy, $sortDir);

        $perPage = min((int) $request->get('per_page', 10), 100);
        $tasks = $query->paginate($perPage);

        return response()->json($tasks);
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = Task::create(array_merge($request->validated(), [
            'created_by' => Auth::guard('api')->id(),
        ]));
        $task->load(['assignee:id,name,email', 'creator:id,name,email']);

        if ($task->assigned_user_id) {
            SendTaskAssignedEmail::dispatch($task);
            TaskStatusUpdated::dispatch($task);
        }

        return response()->json([
            'message' => 'Task created successfully.',
            'data'    => $task,
        ], 201);
    }

    public function show(Task $task): JsonResponse
    {
        $task->load(['assignee:id,name,email', 'creator:id,name,email', 'attachments', 'comments.user:id,name']);

        return response()->json(['data' => $task]);
    }

    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $oldAssigneeId = $task->assigned_user_id;
        $oldStatus = $task->status;

        $task->update($request->validated());

        $newAssigneeId = $task->assigned_user_id;
        if ($newAssigneeId && $newAssigneeId !== $oldAssigneeId) {
            SendTaskAssignedEmail::dispatch($task->fresh());
        }

        if ($oldStatus !== $task->status) {
            TaskStatusUpdated::dispatch($task->fresh());
        }

        $task->load(['assignee:id,name,email', 'creator:id,name,email']);

        return response()->json([
            'message' => 'Task updated successfully.',
            'data'    => $task,
        ]);
    }

    public function destroy(Task $task): JsonResponse
    {
        foreach ($task->attachments as $attachment) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($attachment->file_path);
            if ($attachment->thumbnail_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($attachment->thumbnail_path);
            }
        }

        $task->delete();

        return response()->json(['message' => 'Task deleted successfully.'], 200);
    }

    public function bulkUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'task_ids' => ['required', 'array', 'min:1'],
            'task_ids.*' => ['integer', 'exists:tasks,id'],
            'status' => ['required', 'in:pending,in_progress,completed,cancelled'],
        ]);

        BulkUpdateTaskStatus::dispatch($validated['task_ids'], $validated['status']);

        return response()->json([
            'message' => 'Bulk status update has been queued and will be processed shortly.',
        ]);
    }

    public function export(Request $request): JsonResponse
    {
        ExportTaskReport::dispatch(Auth::guard('api')->id());

        return response()->json([
            'message' => 'Report generation has been queued. You will be notified when it is ready.',
        ]);
    }

    public function downloadExport($filename)
    {
        $userId = Auth::guard('api')->id();
        $path = 'reports/' . $userId . '/' . $filename;

        if (!Storage::disk('local')->exists($path)) {
            return response()->json(['error' => 'File tidak ditemukan atau Anda tidak memiliki akses.'], 403);
        }
        return Storage::disk('local')->download($path);
    }
}
