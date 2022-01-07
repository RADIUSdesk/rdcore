<?php

use Phinx\Migration\AbstractMigration;

class InitGeo extends AbstractMigration {

	/**
	 * @inheritDoc
	 */
    public function up()
    {
        if (!$this->hasTable('geocoded_addresses')) {
            $this->table('geocoded_addresses')
          ->addColumn('address', 'string', [
              'default' => null,
              'limit' => 255,
              'null' => false,
          ])
          ->addColumn('formatted_address', 'string', [
              'default' => null,
              'limit' => 255,
              'null' => true,
          ])
          ->addColumn('country', 'string', [
              'default' => null,
              'limit' => 3,
              'null' => true,
          ])
          ->addColumn('lat', 'decimal', [
              'default' => null,
              'null' => true,
              'precision' => 10,
              'scale' => 7,
          ])
          ->addColumn('lng', 'decimal', [
              'default' => null,
              'null' => true,
              'precision' => 10,
              'scale' => 7,
          ])
          ->addColumn('data', 'text', [
              'default' => null,
              'limit' => null,
              'null' => true,
          ])
          ->addIndex(
              [
                  'address',
              ],
              ['unique' => true]
          )
          ->create();
        }
    }

  /**
	 * @inheritDoc
	 */
    public function down()
    {
        $this->table('geocoded_addresses')->drop()->save();
    }

}
