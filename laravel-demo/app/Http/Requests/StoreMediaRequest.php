<?php

namespace App\Http\Requests;

use App\Models\Media;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Dipakai untuk POST (tambah) dan PATCH (ubah sebagian). */
class StoreMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var Media|null $media terisi hanya saat update */
        $media = $this->route('media');

        // POST: wajib diisi. PATCH: hanya divalidasi jika dikirim.
        $base = $this->isMethod('post') ? ['required'] : ['sometimes', 'required'];

        $type = $this->input('type', $media?->type);
        $typeChanged = $media === null || $type !== $media->type;
        $typeFields = is_string($type) ? (Media::TYPE_FIELDS[$type] ?? []) : [];

        $rules = [
            'title' => [...$base, 'string', 'max:255', Rule::unique('media', 'title')->ignore($media)],
            'type' => [...$base, Rule::in(Media::TYPES)],
            'genre' => [...$base, 'string', 'max:100'],
            'rating' => [...$base, 'numeric', 'between:0,10'],
        ];

        foreach (['episodes', 'chapters', 'runtime'] as $field) {
            if (in_array($field, $typeFields, true)) {
                // Wajib jika media baru atau jenisnya diganti
                $presence = $typeChanged ? ['required'] : ['sometimes', 'required'];
            } else {
                $presence = ['nullable'];
            }

            $rules[$field] = [...$presence, 'integer', 'min:1', 'max:100000'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Judul media wajib diisi.',
            'title.unique' => 'Judul media sudah terdaftar.',
            'type.required' => 'Jenis media wajib diisi.',
            'type.in' => 'Jenis media harus anime, manga, atau drama.',
            'genre.required' => 'Genre wajib diisi.',
            'rating.required' => 'Rating wajib diisi.',
            'rating.between' => 'Rating harus di antara 0 sampai 10.',
            'episodes.required' => 'Jumlah episode wajib diisi untuk anime/drama.',
            'chapters.required' => 'Jumlah chapter wajib diisi untuk manga.',
            'runtime.required' => 'Durasi per episode wajib diisi untuk drama.',
        ];
    }
}
