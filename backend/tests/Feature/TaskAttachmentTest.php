<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class TaskAttachmentTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticate(): array
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);

        return [
            'user' => $user,
            'token' => $token,
            'headers' => ['Authorization' => 'Bearer ' . $token],
        ];
    }

    public function test_can_upload_valid_attachment(): void
    {
        Storage::fake('public');

        $auth = $this->authenticate();

        $task = Task::factory()->create([
            'created_by' => $auth['user']->id,
        ]);

        $file = UploadedFile::fake()->image('document.jpg');

        $response = $this->withHeaders($auth['headers'])
                         ->postJson("/api/tasks/{$task->id}/attachments", [
                             'file' => $file,
                         ]);

        $response->assertStatus(201)
                 ->assertJsonPath('data.file_name', 'document.jpg');

        $this->assertDatabaseHas('task_attachments', [
            'task_id' => $task->id,
            'file_name' => 'document.jpg',
        ]);

        // Assert file exists on the fake storage disk
        $attachment = $response->json('data');
        Storage::disk('public')->assertExists($attachment['file_path']);
    }

    public function test_cannot_upload_invalid_file_type(): void
    {
        Storage::fake('public');

        $auth = $this->authenticate();

        $task = Task::factory()->create([
            'created_by' => $auth['user']->id,
        ]);

        // Create a fake executable file
        $file = UploadedFile::fake()->create('malicious.exe', 100, 'application/x-msdownload');

        $response = $this->withHeaders($auth['headers'])
                         ->postJson("/api/tasks/{$task->id}/attachments", [
                             'file' => $file,
                         ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['file']);
    }

    public function test_cannot_upload_file_exceeding_size_limit(): void
    {
        Storage::fake('public');

        $auth = $this->authenticate();

        $task = Task::factory()->create([
            'created_by' => $auth['user']->id,
        ]);

        // Create a file > 10MB (e.g., 11MB = 11264 KB)
        $file = UploadedFile::fake()->create('large_video.mp4', 11264, 'video/mp4');

        $response = $this->withHeaders($auth['headers'])
                         ->postJson("/api/tasks/{$task->id}/attachments", [
                             'file' => $file,
                         ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['file']);
    }
}
