<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;

class UserController extends Controller
{
    /** GET /api/users */
    public function index()
    {
        return UserResource::collection(User::orderBy('id')->paginate(10));
    }

    /** POST /api/users */
    public function store(StoreUserRequest $request)
    {
        $user = User::create($request->validated());

        return (new UserResource($user))->response()->setStatusCode(201);
    }

    /** GET /api/users/{user} */
    public function show(User $user)
    {
        return new UserResource($user->load('media'));
    }
}
