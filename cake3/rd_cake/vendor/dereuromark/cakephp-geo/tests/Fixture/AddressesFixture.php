<?php

namespace Geo\Test\Fixture;

use Cake\TestSuite\Fixture\TestFixture;

/**
 * AddressFixture
 */
class AddressesFixture extends TestFixture {

	/**
	 * Fields
	 *
	 * @var array
	 */
	public $fields = [
		'id' => ['type' => 'integer'],
		'foreign_id' => ['type' => 'string', 'null' => true, 'default' => null, 'length' => 36],
		'model' => ['type' => 'string', 'null' => true, 'default' => null, 'length' => 30],
		'country_id' => ['type' => 'integer', 'null' => true, 'default' => null, 'length' => 10, 'comment' => 'redundance purposely'],
		'first_name' => ['type' => 'string', 'null' => false, 'default' => '', 'length' => 50],
		'last_name' => ['type' => 'string', 'null' => false, 'default' => '', 'length' => 50],
		'street' => ['type' => 'string', 'null' => false, 'default' => '', 'length' => 100, 'comment' => 'street address and street numbe'],
		'postal_code' => ['type' => 'string', 'null' => false, 'default' => '', 'length' => 10],
		'city' => ['type' => 'string', 'null' => false, 'default' => '', 'length' => 100],
		'lat' => ['type' => 'float', 'null' => false, 'default' => '0.000000', 'length' => '10,6', 'comment' => 'maps.google.de latitude'],
		'lng' => ['type' => 'float', 'null' => false, 'default' => '0.000000', 'length' => '10,6', 'comment' => 'maps.google.de longitude'],
		'last_used' => ['type' => 'datetime', 'null' => true, 'default' => null],
		'formatted_address' => ['type' => 'string', 'null' => false, 'default' => '', 'length' => 100],
		'created' => ['type' => 'datetime', 'null' => true, 'default' => null],
		'modified' => ['type' => 'datetime', 'null' => true, 'default' => null],
		'type_id' => ['type' => 'integer', 'null' => true, 'default' => null, 'length' => 4],
		'_constraints' => ['primary' => ['type' => 'primary', 'columns' => ['id']]],
	];

	/**
	 * Records
	 *
	 * @var array
	 */
	public $records = [
		[
			'foreign_id' => '6',
			'model' => 'Partner',
			'country_id' => null,
			'first_name' => 'Hans',
			'last_name' => 'Wurst',
			'street' => 'Langstrasse 10',
			'postal_code' => '101010',
			'city' => 'München',
			'lat' => '48.150589',
			'lng' => '11.472230',
			'last_used' => null,
			'formatted_address' => 'Josef-Lang-Straße 10, 81245 München, Deutschland',
			'created' => '2011-04-21 16:50:05',
			'modified' => '2011-10-07 17:42:27',
			'type_id' => null,
		],
		[
			'foreign_id' => '4',
			'model' => 'Restaurant',
			'country_id' => '1',
			'first_name' => 'Foo',
			'last_name' => 'Bar',
			'street' => 'Leckermannstrasse 10',
			'postal_code' => '101010',
			'city' => 'München',
			'lat' => '48.133942',
			'lng' => '11.490000',
			'last_used' => '2031-01-01 00:00:00',
			'formatted_address' => 'Eckermannstraße 10, 80689 München, Deutschland',
			'created' => '2011-04-21 16:51:01',
			'modified' => '2011-10-07 17:44:02',
			'type_id' => null,
		],
		[
			'foreign_id' => '7',
			'model' => 'Partner',
			'country_id' => null,
			'first_name' => 'Tim',
			'last_name' => 'Schoror',
			'street' => 'Krebenweg 11',
			'postal_code' => '12523',
			'city' => 'Schwäbisch Boll',
			'lat' => '19.081490',
			'lng' => '19.690800',
			'last_used' => null,
			'formatted_address' => 'Krebenweg 11, 12523 Schwäbisch Boll, Deutschland',
			'created' => '2011-11-17 13:47:36',
			'modified' => '2011-11-17 13:47:36',
			'type_id' => null,
		],
		[
			'foreign_id' => '5',
			'model' => 'Restaurant',
			'country_id' => '1',
			'first_name' => 'Hello',
			'last_name' => 'Kitty',
			'street' => 'hjsf',
			'postal_code' => 'hsjsdf',
			'city' => 'sdhfhj',
			'lat' => '0.000000',
			'lng' => '0.000000',
			'last_used' => null,
			'formatted_address' => '',
			'created' => '2011-11-17 14:34:14',
			'modified' => '2011-11-17 14:49:21',
			'type_id' => null,
		],
	];

}
