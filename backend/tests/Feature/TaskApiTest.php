<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class TaskApiTest extends TestCase
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

    public function test_can_create_task(): void
    {
        $auth = $this->authenticate();

        $payload = [
            'title' => 'New Test Task',
            'description' => 'This is a test task.',
            'status' => 'pending',
            'priority' => 'high',
        ];

        $response = $this->withHeaders($auth['headers'])
                         ->postJson('/api/tasks', $payload);

        $response->assertStatus(201)
                 ->assertJsonPath('data.title', 'New Test Task');

        $this->assertDatabaseHas('tasks', [
            'title' => 'New Test Task',
            'created_by' => $auth['user']->id,
        ]);
    }

    public function test_can_fetch_tasks_with_pagination(): void
    {
        $auth = $this->authenticate();

        // Create 15 tasks
        Task::factory()->count(15)->create([
            'created_by' => $auth['user']->id,
        ]);

        $response = $this->withHeaders($auth['headers'])
                         ->getJson('/api/tasks?per_page=5');

        $response->assertStatus(200)
                 ->assertJsonCount(5, 'data')
                 ->assertJsonPath('total', 15)
                 ->assertJsonPath('per_page', 5);
    }

    public function test_can_filter_tasks_by_status(): void
    {
        $auth = $this->authenticate();

        Task::factory()->count(2)->create(['status' => 'completed', 'created_by' => $auth['user']->id]);
        Task::factory()->count(3)->create(['status' => 'pending', 'created_by' => $auth['user']->id]);

        $response = $this->withHeaders($auth['headers'])
                         ->getJson('/api/tasks?status=completed');

        $response->assertStatus(200)
                 ->assertJsonCount(2, 'data');
    }

    public function test_can_update_task(): void
    {
        $auth = $this->authenticate();

        $task = Task::factory()->create([
            'title' => 'Old Title',
            'created_by' => $auth['user']->id,
        ]);

        $response = $this->withHeaders($auth['headers'])
                         ->putJson("/api/tasks/{$task->id}", [
                             'title' => 'Updated Title',
                         ]);

        $response->assertStatus(200)
                 ->assertJsonPath('data.title', 'Updated Title');

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'title' => 'Updated Title',
        ]);
    }

    public function test_can_delete_task(): void
    {
        $auth = $this->authenticate();

        $task = Task::factory()->create([
            'created_by' => $auth['user']->id,
        ]);

        $response = $this->withHeaders($auth['headers'])
                         ->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Task deleted successfully.']);

        $this->assertDatabaseMissing('tasks', [
            'id' => $task->id,
        ]);
    }
}
