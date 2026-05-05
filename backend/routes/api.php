<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskAttachmentController;
use App\Http\Controllers\TaskCommentController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| API Routes — Task Management Platform
|--------------------------------------------------------------------------
|
| All routes use the 'api' prefix automatically (see bootstrap/app.php).
|
| Authentication: JWT via tymon/jwt-auth
| Guard: auth:api
|
*/

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login'])
         ->name('login');
    Route::middleware('auth:api')->group(function () {
        Route::post('logout',  [AuthController::class, 'logout'])->name('auth.logout');
        Route::get('me',       [AuthController::class, 'me'])->name('auth.me');
        Route::post('refresh', [AuthController::class, 'refresh'])->name('auth.refresh');
    });
});

Route::middleware('auth:api')->group(function () {
    Route::apiResource('tasks', TaskController::class);
    
    Route::post('tasks/bulk-update', [TaskController::class, 'bulkUpdate'])->name('tasks.bulk-update');
    Route::post('tasks/export',      [TaskController::class, 'export'])->name('tasks.export');
    Route::get('tasks/export/download/{filename}', [TaskController::class, 'downloadExport'])->name('tasks.export.download');

    Route::post('tasks/{task}/attachments', [TaskAttachmentController::class, 'store'])
         ->name('tasks.attachments.store');
    Route::get('attachments/{attachment}/download', [TaskAttachmentController::class, 'download'])
         ->name('attachments.download');
    Route::delete('attachments/{attachment}', [TaskAttachmentController::class, 'destroy'])
         ->name('attachments.destroy');

    Route::get('tasks/{task}/comments',         [TaskCommentController::class, 'index'])->name('tasks.comments.index');
    Route::post('tasks/{task}/comments',        [TaskCommentController::class, 'store'])->name('tasks.comments.store');
    Route::delete('tasks/{task}/comments/{comment}', [TaskCommentController::class, 'destroy'])->name('tasks.comments.destroy');
});

Broadcast::routes(['middleware' => ['auth:api']]);