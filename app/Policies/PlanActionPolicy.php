<?php

namespace App\Policies;

use App\Models\PlanAction;
use App\Models\User;

class PlanActionPolicy
{
    public function view(User $user, PlanAction $action): bool
    {
        return $action->company->user_id === $user->id;
    }

    public function update(User $user, PlanAction $action): bool
    {
        return $this->view($user, $action);
    }

    public function delete(User $user, PlanAction $action): bool
    {
        return $this->view($user, $action);
    }
}
