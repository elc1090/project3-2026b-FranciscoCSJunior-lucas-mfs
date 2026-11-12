<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],

            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->where('auth_provider', $this->user()->auth_provider)->ignore($this->user()->id),
                ...($this->user()->auth_provider === 'google' ? [Rule::in([$this->user()->email])] : []),
            ],
            'course' => ['sometimes', 'required', 'string', 'max:120'],
            'city' => ['sometimes', 'required', 'string', 'max:120'],
            'interests' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'presentation' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ];
    }
}
