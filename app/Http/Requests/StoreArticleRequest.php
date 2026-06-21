<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreArticleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['tecnico', 'admin_tickets', 'super_admin']);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:50000'],
            'categories' => ['nullable', 'array'],
            'categories.*' => ['exists:categories,id'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['file', 'mimes:jpg,jpeg,png,gif,pdf,webp', 'max:10240'],
        ];
    }
}
