<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class TaskCommentApiTest extends TestCase
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

    public function test_can_list_comments_for_a_task(): void
    {
        $auth = $this->authenticate();
        $task = Task::factory()->create();

        TaskComment::factory()->count(3)->create([
            'task_id' => $task->id,
            'user_id' => $auth['user']->id,
        ]);

        $response = $this->withHeaders($auth['headers'])
                         ->getJson("/api/tasks/{$task->id}/comments");

        $response->assertStatus(200)
                 ->assertJsonCount(3, 'data');
    }

    public function test_can_post_comment_to_a_task(): void
    {
        $auth = $this->authenticate();
        $task = Task::factory()->create();

        $response = $this->withHeaders($auth['headers'])
                         ->postJson("/api/tasks/{$task->id}/comments", [
                             'comment' => 'This is a test comment.',
                         ]);

        $response->assertStatus(201)
                 ->assertJsonPath('data.comment', 'This is a test comment.');

        $this->assertDatabaseHas('task_comments', [
            'task_id' => $task->id,
            'user_id' => $auth['user']->id,
            'comment' => 'This is a test comment.',
        ]);
    }

    public function test_can_delete_own_comment(): void
    {
        $auth = $this->authenticate();
        $task = Task::factory()->create();
        $comment = TaskComment::factory()->create([
            'task_id' => $task->id,
            'user_id' => $auth['user']->id,
        ]);

        $response = $this->withHeaders($auth['headers'])
                         ->deleteJson("/api/tasks/{$task->id}/comments/{$comment->id}");

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Comment deleted.']);

        $this->assertDatabaseMissing('task_comments', [
            'id' => $comment->id,
        ]);
    }

    public function test_cannot_delete_others_comment(): void
    {
        $auth = $this->authenticate();
        $otherUser = User::factory()->create();
        $task = Task::factory()->create();
        $comment = TaskComment::factory()->create([
            'task_id' => $task->id,
            'user_id' => $otherUser->id,
        ]);

        $response = $this->withHeaders($auth['headers'])
                         ->deleteJson("/api/tasks/{$task->id}/comments/{$comment->id}");

        $response->assertStatus(403)
                 ->assertJson(['message' => 'Forbidden.']);

        $this->assertDatabaseHas('task_comments', [
            'id' => $comment->id,
        ]);
    }
}
