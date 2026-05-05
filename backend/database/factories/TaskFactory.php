<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Task>
 */
class TaskFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // A realistic task title
            'title'            => fake()->sentence(4),
            'description'      => fake()->paragraph(2),
            'status'           => fake()->randomElement(['pending', 'in_progress', 'completed', 'cancelled']),
            'priority'         => fake()->randomElement(['low', 'medium', 'high']),
            // assigned_user_id and created_by are set in the seeder to use real user IDs
            'assigned_user_id' => null,
            'created_by'       => User::factory(),
            // Due date is between today and 30 days from now
            'due_date'         => fake()->optional()->dateTimeBetween('now', '+30 days'),
        ];
    }
}
