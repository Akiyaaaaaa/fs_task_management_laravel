<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::factory()->admin()->create([
            'name'  => 'Admin User',
            'email' => 'admin@taskmanager.com',
        ]);
        $regularUsers = User::factory(4)->create();
        $allUsers = $regularUsers->prepend($admin);
        $tasks = collect();

        for ($i = 0; $i < 15; $i++) {
            $task = Task::factory()->create([
                'created_by'       => $allUsers->random()->id,
                'assigned_user_id' => $allUsers->random()->id,
            ]);
            $tasks->push($task);
        }
        for ($i = 0; $i < 10; $i++) {
            TaskComment::factory()->create([
                'task_id' => $tasks->random()->id,
                'user_id' => $allUsers->random()->id,
            ]);
        }
    }
}
