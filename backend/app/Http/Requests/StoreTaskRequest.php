<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Validation rules for creating a new task.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title'            => ['required', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
            'status'           => ['nullable', 'in:pending,in_progress,completed,cancelled'],
            'priority'         => ['nullable', 'in:low,medium,high'],
            'assigned_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'due_date'         => ['nullable', 'date', 'after_or_equal:today'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'            => 'A task title is required.',
            'assigned_user_id.exists'   => 'The selected user does not exist.',
            'due_date.after_or_equal'   => 'The due date cannot be in the past.',
        ];
    }
}
