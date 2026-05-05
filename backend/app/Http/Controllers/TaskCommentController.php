<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskCommentController extends Controller
{
    public function index(Task $task): JsonResponse
    {
        $comments = $task->comments()
            ->with('user:id,name')
            ->latest()
            ->get();

        return response()->json(['data' => $comments]);
    }

    public function store(Request $request, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'comment' => ['required', 'string', 'max:1000'],
        ]);

        $comment = $task->comments()->create([
            'user_id' => Auth::id(),
            'comment' => $validated['comment'],
        ]);

        $comment->load('user:id,name');

        \Illuminate\Support\Facades\Log::info("Dispatching CommentCreated for Task #{$task->id}, Comment #{$comment->id}, by User #{$comment->user_id}");
        \App\Events\CommentCreated::dispatch($comment);

        return response()->json([
            'message' => 'Comment posted successfully.',
            'data'    => $comment,
        ], 201);
    }

    public function destroy(Task $task, TaskComment $comment): JsonResponse
    {
        if ($comment->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted.']);
    }
}
