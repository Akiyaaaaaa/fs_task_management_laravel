<?php

namespace Tests\Unit;

use App\Jobs\SendTaskAssignedEmail;
use App\Mail\TaskAssignedMailable;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class SendTaskAssignedEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_sends_email_to_assignee_when_job_is_dispatched(): void
    {
        Mail::fake();

        $assignee = User::factory()->create([
            'email' => 'assignee@example.com',
        ]);

        $task = Task::factory()->create([
            'assigned_user_id' => $assignee->id,
        ]);

        $job = new SendTaskAssignedEmail($task);
        $job->handle();

        Mail::assertSent(TaskAssignedMailable::class, function ($mail) use ($assignee, $task) {
            return $mail->hasTo($assignee->email) &&
                   $mail->task->id === $task->id;
        });
    }

    public function test_does_not_send_email_if_no_assignee(): void
    {
        Mail::fake();

        $task = Task::factory()->create([
            'assigned_user_id' => null,
        ]);

        $job = new SendTaskAssignedEmail($task);
        $job->handle();

        Mail::assertNothingSent();
    }
}
