<?php

namespace Geo\Test\TestCase\Controller\Admin;

use Cake\Routing\Router;
use Cake\TestSuite\IntegrationTestTrait;
use Cake\TestSuite\TestCase;

/**
 * @uses \Geo\Controller\Admin\GeoController
 */
class GeoControllerTest extends TestCase {

	use IntegrationTestTrait;

	/**
	 * @var array
	 */
	public $fixtures = [
		'plugin.Geo.GeocodedAddresses',
	];

	/**
	 * @return void
	 */
	public function setUp() {
		parent::setUp();

		Router::reload();
	}

	/**
	 * @return void
	 */
	public function testIndex() {
		$this->disableErrorHandlerMiddleware();

		$this->get(['prefix' => 'admin', 'plugin' => 'Geo', 'controller' => 'Geo', 'action' => 'index']);

		$this->assertResponseCode(200);
	}

}
