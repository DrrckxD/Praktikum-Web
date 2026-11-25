<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddToCollectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'media_id' => ['required', 'integer', 'exists:media,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'media_id.required' => 'media_id wajib diisi.',
            'media_id.integer' => 'media_id harus berupa angka.',
            'media_id.exists' => 'Media tidak ditemukan.',
        ];
    }
}
