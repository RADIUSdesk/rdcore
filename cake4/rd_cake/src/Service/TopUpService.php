<?php

namespace App\Service;

use Cake\ORM\TableRegistry;
use Cake\Datasource\ConnectionManager;
use Cake\I18n\FrozenTime;

class TopUpService {

    protected $TopUps;
    protected $PermanentUsers;
    protected $Radchecks;
    protected $TopUpTransactions;

    public function __construct(){
    
        $locator = TableRegistry::getTableLocator();
        $this->TopUps            = $locator->get('TopUps');
        $this->PermanentUsers    = $locator->get('PermanentUsers');
        $this->Radchecks         = $locator->get('Radchecks');
        $this->TopUpTransactions = $locator->get('TopUpTransactions');
    }

    public function apply($topUpId){

        $connection = ConnectionManager::get('default');

        return $connection->transactional(function () use ($topUpId) {

            $topUp = $this->TopUps->get($topUpId);
            $user  = $this->PermanentUsers->get($topUp->permanent_user_id);
            $topUp->permanent_user = $user->username;

            switch ($topUp->type) {
                case 'data':
                    return $this->applyData($topUp, $user);

                case 'time':
                    return $this->applyTime($topUp, $user);

                case 'days_to_use':
                    return $this->applyDaysToUse($topUp, $user);
            }
        });
    }
  
    protected function applyDaysToUse($topUp, $user){
    
        $value = (int)$topUp->days_to_use;
        $now   = FrozenTime::now();

        $oldToDate = $user->to_date;
        $oldExpiry = $this->getRadcheckValue($user->username, 'Expiration');

        $recoveryDays  = 0;
        $effectiveDays = $value;

        if (!$oldToDate || $oldToDate < $now) {

            // Account expired or never had expiry
            if ($oldToDate) {
                $recoverySeconds = $now->getTimestamp() - $oldToDate->getTimestamp();
                $recoveryDays    = (int)floor($recoverySeconds / 86400);
            }

            $base = $now;

        } else {
            // Still active
            $base = $oldToDate;
        }

        $effectiveDays = $value + $recoveryDays;

        $newToDate = $base
            ->addDays($value)
            ->endOfDay();

        $user->to_date = $newToDate;
        $this->PermanentUsers->saveOrFail($user);

        $newExpiry = $this->getRadcheckValue($user->username, 'Expiration');

        $this->addTransaction(
            $topUp,
            'create',
            'Expiration',
            $oldExpiry,
            $newExpiry,
            $effectiveDays,
            $recoveryDays
        );
    }
 
    protected function applyData($topUp, $user){
        return $this->updateRadcheck($topUp, 'Rd-Total-Data', $topUp->data);
    }

    protected function applyTime($topUp, $user){
    
        return $this->updateRadcheck($topUp, 'Rd-Total-Time', $topUp->time);
    }

    protected function updateRadcheck($topUp, $attribute, $value){
       
        $record = $this->Radchecks
            ->find()
            ->where(['username' => $topUp->permanent_user, 'attribute' => $attribute])
            ->first();

        $old = null;

        if ($record) {
            $old = $record->value;
            $record->value += $value;
            $this->Radchecks->saveOrFail($record);
            $new = $record->value;
        } else {
            $entity = $this->Radchecks->newEntity([
                'username'  => $topUp->permanent_user,
                'attribute' => $attribute,
                'op'        => ':=',
                'value'     => $value
            ]);
            $this->Radchecks->saveOrFail($entity);
            $new = $value;
        }

        $this->addTransaction($topUp, 'create', $attribute, $old, $new);
    }
    
    protected function addTransaction(
        $topUp,
        $action,
        $attribute,
        $old,
        $new,
        $effectiveDays = null,
        $recoveryDays = null
    ) {

        $entity = $this->TopUpTransactions->newEntity([
            'user_id'           => $topUp->user_id,
            'permanent_user_id' => $topUp->permanent_user_id,
            'permanent_user'    => $topUp->permanent_user,
            'top_up_id'         => $topUp->id,
            'type'              => $topUp->type,
            'action'            => $action,
            'radius_attribute'  => $attribute,
            'old_value'         => $old,
            'new_value'         => $new,
            'effective_days'    => $effectiveDays,
            'recovery_days'     => $recoveryDays
        ]);

        $this->TopUpTransactions->saveOrFail($entity);
    }
    
    protected function getRadcheckValue($username, $attribute){
    
        $record = $this->Radchecks
            ->find()
            ->where(['username' => $username, 'attribute' => $attribute])
            ->first();

        return $record ? $record->value : null;
    }
}

