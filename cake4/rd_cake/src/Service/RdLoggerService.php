<?php

namespace App\Service;

use Cake\ORM\TableRegistry;

class RdLoggerService
{
    protected $SmsHistories;
    protected $EmailHistories;

    public function __construct(){

        $locator = TableRegistry::getTableLocator();

        $this->SmsHistories   = $locator->get('SmsHistories');
        $this->EmailHistories = $locator->get('EmailHistories');
    }

    public function addSmsHistory(
        int $cloudId,
        string $to,
        string $reason,
        string $message,
        string $reply,
        string $provider
    ): bool {

        $entity = $this->SmsHistories->newEntity([
            'cloud_id'    => $cloudId,
            'recipient'   => $to,
            'reason'      => $reason,
            'message'     => $message,
            'reply'       => $reply,
            'sms_provider'=> $provider
        ]);

        return (bool)$this->SmsHistories->save($entity);
    }

    public function addEmailHistory(
        int $cloudId,
        string $to,
        string $reason,
        string $message
    ): bool {

        $entity = $this->EmailHistories->newEntity([
            'cloud_id'  => $cloudId,
            'recipient' => $to,
            'reason'    => $reason,
            'message'   => $message
        ]);

        return (bool)$this->EmailHistories->save($entity);
    }
}
