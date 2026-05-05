<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title'            => ['sometimes', 'required', 'string', 'max:255'],
            'description'      => ['sometimes', 'nullable', 'string'],
            'status'           => ['sometimes', 'in:pending,in_progress,completed,cancelled'],
            'priority'         => ['sometimes', 'in:low,medium,high'],
            'assigned_user_id' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
            'due_date'         => ['sometimes', 'nullable', 'date', 'after_or_equal:today'],
        ];
    }
}
