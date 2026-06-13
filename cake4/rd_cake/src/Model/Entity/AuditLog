<?php
// src/Model/Entity/AuditLog.php

namespace App\Model\Entity;

use Cake\ORM\Entity;

class AuditLog extends Entity
{
    protected $_virtual = [
        'summary',
        'changes_array'
    ];

    protected function _getChangesArray(): array
    {
        $result = [];

        $changes = $this->changes ?? [];

        foreach ($changes as $field => $values) {

            $result[] = [
                'field' => $field,
                'old'   => $values['old'] ?? null,
                'new'   => $values['new'] ?? null,
            ];
        }

        return $result;
    }
}