<?php
namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\ORM\Query;
use Cake\Database\Expression\QueryExpression;
use Cake\I18n\FrozenTime;

class TopUpTransactionsTable extends Table
{
    public function initialize(array $config): void
    {
        $this->addBehavior('Timestamp');
        $this->belongsTo('TopUps');
        $this->belongsTo('PermanentUsers', ['propertyName' => 'real_permanent_user']);
    }
    
    public function getRenewalStatsByCloudZZ($days){
    
    
        if($days == 1){
            $startDate = FrozenTime::now('Africa/Lagos')->startOfDay();
        }
        if($days > 1){
            $days = $days -1;
            $startDate = FrozenTime::now('Africa/Lagos')->subDays($days)->startOfDay();
        }
              
        $query = $this->find();
        
        return $query
            ->select([
                'cloud_id' => 'PermanentUsers.cloud_id',
                'renewals_count' => $query->func()->count('*'),
                'total_expired_gap_days' => $query->func()->sum('TopUpTransactions.expired_gap_days'),
                'total_effective_days' => $query->func()->sum(
                    $query->newExpr('TopUpTransactions.applied_days - TopUpTransactions.expired_gap_days')
                ),
                'avg_expired_gap_days' => $query->func()->avg('TopUpTransactions.expired_gap_days'),
                'avg_effective_days' => $query->func()->avg(
                    $query->newExpr('TopUpTransactions.applied_days - TopUpTransactions.expired_gap_days')
                )
            ])
            ->contain(['PermanentUsers'])
            ->where([
                'TopUpTransactions.created >= ' => $startDate,
                'TopUpTransactions.type' => 'days_to_use',
                'TopUpTransactions.action' => 'create'
            ])
            ->group('PermanentUsers.cloud_id')
            ->order(['renewals_count' => 'DESC'])
            ->all();
    }
    
    public function getRenewalStatsByCloud($days){
    
        if($days == 1){
            $startDate = FrozenTime::now('Africa/Lagos')->startOfDay();
        }
        if($days > 1){
            $days = $days -1;
            $startDate = FrozenTime::now('Africa/Lagos')->subDays($days)->startOfDay();
        }
              
        $query = $this->find();
        
        return $query
            ->select([
                'cloud_id' => 'PermanentUsers.cloud_id',
                'renewals_count' => $query->func()->count('*'),
                'total_expired_gap_days' => $query->func()->sum('TopUpTransactions.expired_gap_days'),
                'total_effective_days' => $query->func()->sum(
                    $query->newExpr('TopUpTransactions.applied_days - TopUpTransactions.expired_gap_days')
                ),
                'avg_expired_gap_days' => $query->func()->avg('TopUpTransactions.expired_gap_days'),
                'avg_effective_days' => $query->func()->avg(
                    $query->newExpr('TopUpTransactions.applied_days - TopUpTransactions.expired_gap_days')
                ),
                // Using newExpr with raw SQL CASE statement - more reliable
                'on_time_count' => $query->func()->sum(
                    $query->newExpr('CASE WHEN TopUpTransactions.expired_gap_days = 0 THEN 1 ELSE 0 END')
                ),
                'late_15_days_count' => $query->func()->sum(
                    $query->newExpr('CASE WHEN TopUpTransactions.expired_gap_days > 15 THEN 1 ELSE 0 END')
                ),
                'late_60_days_count' => $query->func()->sum(
                    $query->newExpr('CASE WHEN TopUpTransactions.expired_gap_days > 60 THEN 1 ELSE 0 END')
                )
            ])
            ->contain(['PermanentUsers'])
            ->where([
                'TopUpTransactions.created >= ' => $startDate,
                'TopUpTransactions.type' => 'days_to_use',
                'TopUpTransactions.action' => 'create'
            ])
            ->group('PermanentUsers.cloud_id')
            ->order(['renewals_count' => 'DESC'])
            ->all();
    }
    
    
}
