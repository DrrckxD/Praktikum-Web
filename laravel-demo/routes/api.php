<?php

use App\Http\Controllers\CollectionController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// CRUD Media. parameters() dipakai karena Laravel menganggap "media" jamak dari "medium".
Route::apiResource('media', MediaController::class)->parameters(['media' => 'media']);

// Pengguna
Route::apiResource('users', UserController::class)->only(['index', 'store', 'show']);

// Custom action: koleksi media milik pengguna
Route::get('users/{user}/collection', [CollectionController::class, 'index']);
Route::post('users/{user}/collection', [CollectionController::class, 'store']);
Route::delete('users/{user}/collection/{media}', [CollectionController::class, 'destroy']);
