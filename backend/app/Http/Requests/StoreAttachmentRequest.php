<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAttachmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * allowed types:
     *  - Images:    jpg, jpeg, png, gif, webp
     *  - Documents: pdf, doc, docx, xls, xlsx, txt, csv
     *  - Video:     mp4, mov, avi
     *
     * Max size: 10MB (10240 KB)
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx,xls,xlsx,txt,csv,mp4,mov,avi',
                'max:10240',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Please select a file to upload.',
            'file.mimes'    => 'Only images (jpg, png, gif, webp), documents (pdf, doc, docx, xls, xlsx, txt, csv), and videos (mp4, mov, avi) are allowed.',
            'file.max'      => 'File size must not exceed 10MB.',
        ];
    }
}
