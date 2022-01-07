<?php

namespace Geo\Test\TestCase\Controller\Admin;

use Cake\TestSuite\IntegrationTestTrait;
use Cake\TestSuite\TestCase;

/**
 * @uses \Geo\Controller\Admin\GeocodedAddressesController
 */
class GeocodedAddressesControllerTest extends TestCase {

	use IntegrationTestTrait;

	/**
	 * Fixtures
	 *
	 * @var array
	 */
	public $fixtures = [
		'plugin.Geo.GeocodedAddresses',
	];

	/**
	 * Test index method
	 *
	 * @return void
	 */
	public function testIndex() {
		$this->disableErrorHandlerMiddleware();

		$this->get(['prefix' => 'admin', 'plugin' => 'Geo', 'controller' => 'GeocodedAddresses', 'action' => 'index']);

		$this->assertResponseCode(200);
	}

}
