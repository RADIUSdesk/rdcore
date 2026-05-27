<?php
declare(strict_types=1);

namespace App\Service;

use Cake\ORM\Locator\LocatorAwareTrait;
use Cake\Http\ServerRequest;

class AuditLogService {

    use LocatorAwareTrait;

    protected $AuditLogs;

    public function __construct(){

        $this->AuditLogs = $this->fetchTable('AuditLogs');
    }

    public function log(
        string $action,
        ServerRequest $request,
        array $options = []
    ): void {

        $identity = $request->getAttribute('identity');

        $entity = $this->AuditLogs->newEntity([
            'user_id'    => $identity?->id,
            'action'     => $action,
            'entity'     => $options['entity'] ?? null,
            'entity_id'  => $options['entity_id'] ?? null,
            'changes'    => $options['changes'] ?? null,
            'metadata'   => $options['metadata'] ?? null,
            'ip_address' => $request->clientIp(),
            'user_agent' => $request->getHeaderLine('User-Agent'),
        ]);

        $this->AuditLogs->save($entity);
    }
}
