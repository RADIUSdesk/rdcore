<?php

namespace App\Service;

use Cake\ORM\TableRegistry;
use Cake\Controller\ComponentRegistry;
use Cake\Datasource\ConnectionManager;
use Cake\I18n\FrozenTime;
use App\Controller\Component\IspPlumbingComponent; // ← REQUIRED

class TopUpService {

    protected $TopUps;
    protected $PermanentUsers;
    protected $Radchecks;
    protected $TopUpTransactions;
    protected $IspPlumbing;

    public function __construct(){
    
        $locator = TableRegistry::getTableLocator();
        $this->TopUps            = $locator->get('TopUps');
        $this->PermanentUsers    = $locator->get('PermanentUsers');
        $this->Radchecks         = $locator->get('Radchecks');
        $this->TopUpTransactions = $locator->get('TopUpTransactions');
        
        // Proper component loading
        $registry = new ComponentRegistry();
        $this->IspPlumbing = new IspPlumbingComponent($registry);        
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

        $expiredGapDays  = 0;
        $appliedDays     = $value;

        if (!$oldToDate || $oldToDate < $now) {

            // Account expired or never had expiry
            if ($oldToDate) {
                $expiredGapSeconds = $now->getTimestamp() - $oldToDate->getTimestamp();
                $expiredGapDays    = (int)floor($expiredGapSeconds / 86400);
            }

            $base = $now;

        } else {
            // Still active
            $base = $oldToDate;
        }

        $appliedDays = $value + $expiredGapDays;

        $newToDate = $base
            ->addDays($value)
            ->endOfDay();

        $user->to_date = $newToDate;
        $this->PermanentUsers->saveOrFail($user);
        
        //--- ISP Plumbing ---
        if($expiredGapDays > 0){ //Account was **in expiration** and this lifted it **out of expiration** - Disconnect it (if connected) to it can be in the correct network / speed again
            $this->IspPlumbing->disconnectIfActive($user);
        }
        //--------------------

        $newExpiry = $this->getRadcheckValue($user->username, 'Expiration');

        $this->addTransaction(
            $topUp,
            'create',
            'Expiration',
            $oldExpiry,
            $newExpiry,
            $appliedDays,
            $expiredGapDays
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
        $appliedDays = null,
        $expiredGapDays = null
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
            'applied_days'      => $appliedDays,
            'expired_gap_days'  => $expiredGapDays
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

