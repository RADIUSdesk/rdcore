<?php

use Phinx\Migration\AbstractMigration;

class MigrationsGeoCreated extends AbstractMigration {

	/**
	 * @inheritDoc
	 */
    public function change()
    {
        $this->table('geocoded_addresses')
          ->addColumn('created', 'datetime', [
              'default' => null,
              'null' => true,
          ])
          ->update();
    }

}
