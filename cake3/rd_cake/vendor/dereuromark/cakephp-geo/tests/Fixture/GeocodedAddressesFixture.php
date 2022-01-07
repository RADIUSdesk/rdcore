<?php

namespace Geo\Test\Fixture;

use Cake\TestSuite\Fixture\TestFixture;

/**
 * GeocodedAddressesFixture
 */
class GeocodedAddressesFixture extends TestFixture {

	/**
	 * Fields
	 *
	 * @var array
	 */
    // @codingStandardsIgnoreStart
    public $fields = [
        'id' => ['type' => 'integer', 'length' => 11, 'unsigned' => false, 'null' => false, 'default' => null, 'comment' => '', 'autoIncrement' => true, 'precision' => null],
        'address' => ['type' => 'string', 'length' => 255, 'null' => false, 'default' => null, 'comment' => '', 'precision' => null, 'fixed' => null],
        'formatted_address' => ['type' => 'string', 'length' => 255, 'null' => true, 'default' => null, 'comment' => '', 'precision' => null, 'fixed' => null],
        'country' => ['type' => 'string', 'length' => 3, 'null' => true, 'default' => null, 'comment' => '', 'precision' => null, 'fixed' => null],
        'lat' => ['type' => 'decimal', 'length' => 10, 'precision' => 7, 'unsigned' => false, 'null' => true, 'default' => null, 'comment' => ''],
        'lng' => ['type' => 'decimal', 'length' => 10, 'precision' => 7, 'unsigned' => false, 'null' => true, 'default' => null, 'comment' => ''],
        'data' => ['type' => 'text', 'length' => null, 'null' => true, 'default' => null, 'comment' => '', 'precision' => null],
		'created' => ['type' => 'datetime', 'null' => true, 'default' => null],
        '_constraints' => [
            'primary' => ['type' => 'primary', 'columns' => ['id'], 'length' => []],
            'address' => ['type' => 'unique', 'columns' => ['address'], 'length' => []],
        ],
        '_options' => [
            'engine' => 'InnoDB',
            'collation' => 'utf8_bin'
        ],
    ];

	/**
	 * Records
	 *
	 * @var array
	 */
	public $records = [
		[
			'id' => 1,
			'address' => 'Lorem ipsum dolor sit amet',
			'formatted_address' => 'Lorem ipsum dolor sit amet',
			'country' => 'L',
			'lat' => 1.5,
			'lng' => 1.5,
			'data' => null,
			'created' => null,
		],
	];

}
