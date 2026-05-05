<?php

namespace Tests\Unit;

use App\Jobs\BulkUpdateTaskStatus;
use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BulkUpdateTaskStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_bulk_updates_status_of_multiple_tasks(): void
    {
        $tasks = Task::factory()->count(3)->create([
            'status' => 'pending',
        ]);

        $taskIds = $tasks->pluck('id')->toArray();

        $job = new BulkUpdateTaskStatus($taskIds, 'completed');
        $job->handle();

        foreach ($taskIds as $id) {
            $this->assertDatabaseHas('tasks', [
                'id' => $id,
                'status' => 'completed',
            ]);
        }
    }
}
