<?php

namespace Tests\Feature;

use App\Models\Media;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FlipPlayApiTest extends TestCase
{
    use RefreshDatabase;

    private function manga(string $title = 'Berserk'): Media
    {
        return Media::create([
            'title' => $title, 'type' => 'manga', 'genre' => 'Dark Fantasy', 'rating' => 9.4, 'chapters' => 380,
        ]);
    }

    public function test_media_crud(): void
    {
        $id = $this->postJson('/api/media', [
            'title' => 'Frieren', 'type' => 'anime', 'genre' => 'Fantasy', 'rating' => 9.3, 'episodes' => 28,
        ])->assertCreated()->assertJsonPath('data.title', 'Frieren')->json('data.id');

        $this->getJson('/api/media?search=frie')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson("/api/media/$id")->assertOk()->assertJsonPath('data.users', []);
        $this->patchJson("/api/media/$id", ['rating' => 9.5])->assertOk()->assertJsonPath('data.rating', 9.5);
        $this->deleteJson("/api/media/$id")->assertOk();
        $this->getJson("/api/media/$id")->assertNotFound();
    }

    public function test_media_validation(): void
    {
        $this->manga();

        // Tanpa header Accept pun harus 422 JSON
        $this->post('/api/media', ['title' => ''])->assertStatus(422)->assertJsonValidationErrors(['title', 'type']);

        $this->postJson('/api/media', [
            'title' => 'Berserk', 'type' => 'manga', 'genre' => 'x', 'rating' => 1, 'chapters' => 1,
        ])->assertJsonValidationErrors('title');

        $this->postJson('/api/media', [
            'title' => 'Lain', 'type' => 'drama', 'genre' => 'x', 'rating' => 11,
        ])->assertJsonValidationErrors(['rating', 'episodes', 'runtime']);
    }

    public function test_update_keeps_own_title_and_requires_fields_when_type_changes(): void
    {
        $media = $this->manga();

        $this->patchJson("/api/media/$media->id", ['title' => 'Berserk'])->assertOk();
        $this->patchJson("/api/media/$media->id", ['chapters' => null])->assertJsonValidationErrors('chapters');
        $this->patchJson("/api/media/$media->id", ['type' => 'anime'])->assertJsonValidationErrors('episodes');
        $this->patchJson("/api/media/$media->id", ['type' => 'anime', 'episodes' => 25])->assertOk();

        $this->assertNull($media->fresh()->chapters);
    }

    public function test_user_collection(): void
    {
        $user = User::factory()->create();
        $media = $this->manga();
        $url = "/api/users/$user->id/collection";

        $this->postJson($url, ['media_id' => $media->id])->assertCreated();
        $this->postJson($url, ['media_id' => $media->id])->assertStatus(409);
        $this->postJson($url, ['media_id' => 999])->assertJsonValidationErrors('media_id');
        $this->getJson($url)->assertOk()->assertJsonCount(1, 'data');
        $this->getJson("/api/users/$user->id")->assertJsonPath('data.collection.0.title', 'Berserk');
        $this->getJson("/api/media/$media->id")->assertJsonPath('data.users.0.id', $user->id);
        $this->deleteJson("$url/$media->id")->assertOk();
        $this->deleteJson("$url/$media->id")->assertNotFound();
    }

    public function test_create_user(): void
    {
        $payload = ['name' => 'Budi', 'email' => 'budi@example.com', 'password' => 'rahasia123'];

        $this->postJson('/api/users', $payload)->assertCreated()->assertJsonMissingPath('data.password');
        $this->postJson('/api/users', $payload)->assertJsonValidationErrors('email');
    }
}
