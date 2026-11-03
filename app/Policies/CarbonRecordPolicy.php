<?php

namespace App\Policies;

use App\Models\CarbonRecord;
use App\Models\User;

class CarbonRecordPolicy
{
    public function view(User $user, CarbonRecord $record): bool
    {
        return $record->company->user_id === $user->id;
    }

    public function delete(User $user, CarbonRecord $record): bool
    {
        return $this->view($user, $record);
    }
}
