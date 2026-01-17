<?php
namespace App\Model\Table;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class FreeradiusInstancesTable extends Table {

    public function initialize(array $config): void {
        $this->addBehavior('Timestamp');
    }

    public function validationDefault(Validator $validator): Validator {
        return $validator
            ->notEmptyString('server');
    }
}
