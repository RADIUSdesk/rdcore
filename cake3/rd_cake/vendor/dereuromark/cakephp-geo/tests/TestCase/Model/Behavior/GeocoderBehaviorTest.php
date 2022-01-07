<?php

namespace Geo\Test\Model\Behavior;

use Cake\Core\Configure;
use Cake\Database\Driver\Mysql;
use Cake\Database\Driver\Postgres;
use Cake\Database\Expression\QueryExpression;
use Cake\Database\ValueBinder;
use Cake\Datasource\ConnectionManager;
use Cake\ORM\Entity;
use Cake\ORM\TableRegistry;
use Cake\TestSuite\TestCase;
use Geo\Geocoder\Calculator;
use Geo\Geocoder\Geocoder;
use TestApp\Controller\TestController;

class GeocoderBehaviorTest extends TestCase {

	/**
	 * @var array
	 */
	public $fixtures = [
		'plugin.Geo.Addresses',
	];

	/**
	 * @var \Cake\ORM\Table|\Geo\Model\Behavior\GeocoderBehavior;
	 */
	protected $Addresses;

	/**
	 * @var \Cake\Database\Connection
	 */
	protected $db;

	/**
	 * setUp
	 *
	 * @return void
	 */
	public function setUp() {
		parent::setUp();

		Configure::write('Geocoder', [
			'locale' => 'DE',
		]);

		$this->Addresses = TableRegistry::get('Geo.Addresses');
		$this->Addresses->addBehavior('Geocoder');

		$this->db = ConnectionManager::get('test');
	}

	/**
	 * teardown
	 *
	 * @return void
	 */
	public function tearDown() {
		parent::tearDown();

		unset($this->Addresses, $this->Addresses);
		TableRegistry::clear();
	}

	/**
	 * @return void
	 */
	public function testDistance() {
		$expr = $this->Addresses->distanceExpr(12, 14);
		$expected = '(6371.04 * ACOS(((COS(((PI() / 2) - RADIANS((90 - Addresses.lat)))) * COS(PI()/2 - RADIANS(90 - 12)) * COS((RADIANS(Addresses.lng) - RADIANS(:param0)))) + (SIN(((PI() / 2) - RADIANS((90 - Addresses.lat)))) * SIN(((PI() / 2) - RADIANS(90 - 12)))))))';

		$binder = new ValueBinder();
		$result = $expr->sql($binder);
		$this->assertEquals($expected, $result);

		$this->Addresses->removeBehavior('Geocoder');
		$this->Addresses->addBehavior('Geocoder', ['lat' => 'x', 'lng' => 'y']);
		$expr = $this->Addresses->distanceExpr(12.1, 14.2);
		//$expected = '6371.04 * ACOS(COS(PI()/2 - RADIANS(90 - Addresses.x)) * COS(PI()/2 - RADIANS(90 - 12.1)) * COS(RADIANS(Addresses.y) - RADIANS(14.2)) + SIN(PI()/2 - RADIANS(90 - Addresses.x)) * SIN(PI()/2 - RADIANS(90 - 12.1)))';
		$this->assertInstanceOf('\Cake\Database\Expression\QueryExpression', $expr);

		$this->Addresses->removeBehavior('Geocoder');
		$this->Addresses->addBehavior('Geocoder', ['lat' => 'x', 'lng' => 'y']);
		$expr = $this->Addresses->distanceExpr('User.lat', 'User.lng');
		//$expected = '6371.04 * ACOS(COS(PI()/2 - RADIANS(90 - Addresses.x)) * COS(PI()/2 - RADIANS(90 - User.lat)) * COS(RADIANS(Addresses.y) - RADIANS(User.lng)) + SIN(PI()/2 - RADIANS(90 - Addresses.x)) * SIN(PI()/2 - RADIANS(90 - User.lat)))';
		$this->assertInstanceOf('\Cake\Database\Expression\QueryExpression', $expr);
	}

	/**
	 * @return void
	 */
	public function testDistanceField() {
		$condition = $this->Addresses->distanceField(12, 14);
		//$expected = '6371.04 * ACOS(COS(PI()/2 - RADIANS(90 - Addresses.lat)) * COS(PI()/2 - RADIANS(90 - 12)) * COS(RADIANS(Addresses.lng) - RADIANS(14)) + SIN(PI()/2 - RADIANS(90 - Addresses.lat)) * SIN(PI()/2 - RADIANS(90 - 12))) AS Addresses.distance';

		$this->assertInstanceOf(QueryExpression::class, $condition['Addresses.distance']);
	}

	/**
	 * @return void
	 */
	public function testSetDistanceAsVirtualField() {
		$driver = $this->db->getDriver();
		$this->skipIf(!($driver instanceof Mysql || $driver instanceof Postgres), 'The virtualFields test is only compatible with Mysql/Postgres.');

		$options = ['lat' => 13.3, 'lng' => 19.2]; //array('order' => array('Address.distance' => 'ASC'));
		$query = $this->Addresses->find()->find('distance', $options);

		$result = $query->toArray();

		$this->assertTrue($result[0]['distance'] < $result[1]['distance']);
		$this->assertTrue($result[1]['distance'] < $result[2]['distance']);
		$this->assertTrue($result[0]['distance'] > 620 && $result[0]['distance'] < 650);
	}

	/**
	 * @return void
	 */
	public function testSetDistanceAsVirtualFieldInMiles() {
		$driver = $this->db->getDriver();
		$this->skipIf(!($driver instanceof Mysql || $driver instanceof Postgres), 'The virtualFields test is only compatible with Mysql/Postgres.');

		$this->Addresses->removeBehavior('Geocoder'); //FIXME: Shouldnt be necessary ideally
		$this->Addresses->addBehavior('Geocoder', ['unit' => Calculator::UNIT_MILES]);

		$options = ['lat' => 13.3, 'lng' => 19.2]; //$options = array('order' => array('Address.distance' => 'ASC'));
		$res = $this->Addresses->find()->find('distance', $options)->toArray();

		$this->assertTrue($res[0]['distance'] < $res[1]['distance']);
		$this->assertTrue($res[1]['distance'] < $res[2]['distance']);
		$this->assertTrue($res[0]['distance'] > 390 && $res[0]['distance'] < 410);
	}

	/**
	 * @return void
	 */
	public function testPagination() {
		$driver = $this->db->getDriver();
		$this->skipIf(!($driver instanceof Mysql || $driver instanceof Postgres), 'The virtualFields test is only compatible with Mysql/Postgres.');

		$controller = new TestController();
		$controller->Addresses->addBehavior('Geocoder');
		$options = ['lat' => 13.3, 'lng' => 19.2, 'distance' => 3000];

		/** @var \Cake\ORM\Query $query */
		$query = $controller->Addresses->find('distance', $options);
		$query->order(['distance' => 'ASC']);

		$res = $controller->paginate($query)->toArray();

		$this->assertEquals(2, count($res));
		$this->assertTrue($res[0]['distance'] < $res[1]['distance']);
	}

	/**
	 * @return void
	 */
	public function testValidate() {
		$is = $this->Addresses->validateLatitude(44);
		$this->assertTrue($is);

		$is = $this->Addresses->validateLatitude(110);
		$this->assertFalse($is);

		$is = $this->Addresses->validateLongitude(150);
		$this->assertTrue($is);

		$is = $this->Addresses->validateLongitude(-190);
		$this->assertFalse($is);

		$this->Addresses->getValidator()->add('lat', 'validateLatitude', ['provider' => 'table', 'rule' => 'validateLatitude', 'message' => 'validateLatitudeError']);
		$this->Addresses->getValidator()->add('lng', 'validateLongitude', ['provider' => 'table', 'rule' => 'validateLongitude', 'message' => 'validateLongitudeError']);
		$data = [
			'lat' => 44,
			'lng' => 190,
		];
		$entity = $this->Addresses->newEntity($data);

		$expectedErrors = [
			'lng' => [
				'validateLongitude' => __('validateLongitudeError'),
			],
		];
		$this->assertEquals($expectedErrors, $entity->getErrors());
	}

	/**
	 * @return void
	 */
	public function testBasic() {
		$this->Addresses->removeBehavior('Geocoder');
		$this->Addresses->addBehavior('Geocoder', ['address' => ['street', 'zip', 'city']]);
		$data = [
			'street' => 'Krebenweg 22',
			'zip' => '74523',
			'city' => 'Bibersfeld',
		];
		$entity = $this->_getEntity($data);
		$res = $this->Addresses->save($entity);

		$this->assertTrue(!empty($res['lat']) && !empty($res['lng']));
		$this->assertTrue(round($res['lat']) === 49.0 && round($res['lng']) === 10.0);

		// inconclusive
		$data = [
			//'street' => 'Leopoldstraße',
			'city' => 'München',
		];
		$entity = $this->_getEntity($data);
		$res = $this->Addresses->save($entity);

		$this->assertTrue(!empty($res['lat']) && !empty($res['lng']));
		//FIXME
		$this->assertContains('München', $res['formatted_address']);
		//$this->assertEquals('München, Deutschland', $res['formatted_address']);

		$data = [
			'city' => 'Bibersfeld',
		];
		$entity = $this->_getEntity($data);
		$res = $this->Addresses->save($entity);

		$this->assertTrue(!empty($res));
	}

	/**
	 * @return void
	 */
	public function testMinAccLow() {
		$this->Addresses->removeBehavior('Geocoder');
		$this->Addresses->addBehavior('Geocoder', ['minAccuracy' => Geocoder::TYPE_COUNTRY]);
		$data = [
			'city' => 'Deutschland',
		];
		$entity = $this->_getEntity($data);
		$res = $this->Addresses->save($entity);

		$this->assertEquals('Deutschland', $res['city']);
		$this->assertTrue((int)$res['lat'] && (int)$res['lng']);
	}

	/**
	 * @return void
	 */
	public function testMinAccHigh() {
		$this->Addresses->removeBehavior('Geocoder');
		$this->Addresses->addBehavior('Geocoder', ['minAccuracy' => Geocoder::TYPE_POSTAL]);
		$data = [
			'city' => 'Deutschland',
		];
		$entity = $this->_getEntity($data);

		$res = $this->Addresses->save($entity);
		$this->assertEquals('Deutschland', $res['city']);
		//FIXME
		//$this->assertTrue(!isset($res['lat']) && !isset($res['lng']));
	}

	/**
	 * @return void
	 */
	public function testMinInc() {
		$this->Addresses->removeBehavior('Geocoder');
		$this->Addresses->addBehavior('Geocoder', ['minAccuracy' => Geocoder::TYPE_SUBLOC]);

		$this->assertEquals(Geocoder::TYPE_SUBLOC, $this->Addresses->behaviors()->Geocoder->getConfig('minAccuracy'));

		$data = [
			//'street' => 'Leopoldstraße',
			'city' => 'Neustadt',
		];
		$entity = $this->_getEntity($data);
		$res = $this->Addresses->save($entity);

		$this->assertEquals('Neustadt', $res['city']);
		//FIXME
		//$this->assertTrue(!isset($res['lat']) && !isset($res['lng']));
	}

	/**
	 * @return void
	 */
	public function testMinIncAllowed() {
		$this->Addresses->removeBehavior('Geocoder');
		$this->Addresses->addBehavior('Geocoder', ['allow_inconclusive' => true]);

		$data = [
			'city' => 'Neustadt',
		];
		$entity = $this->_getEntity($data);
		$res = $this->Addresses->save($entity);

		$this->assertEquals('Neustadt', $res['city']);
		$this->assertTrue(!empty($res['lat']) && !empty($res['lng']));
	}

	/**
	 * @return void
	 */
	public function testExpect() {
		$this->Addresses->removeBehavior('Geocoder');
		$this->Addresses->addBehavior('Geocoder', ['expect' => [Geocoder::TYPE_POSTAL]]);

		$data = [
			'city' => 'Berlin, Deutschland',
		];
		$entity = $this->_getEntity($data);
		$res = $this->Addresses->save($entity);
		$this->assertTrue(empty($res['lat']) && empty($res['lng']));

		$data = [
			'city' => '74523, Deutschland',
		];
		$entity = $this->_getEntity($data);
		$res = $this->Addresses->save($entity);
		$this->assertContains('74523 Schwäbisch Hall', $res['formatted_address']);
		//$this->assertEquals('74523 Schwäbisch Hall, Deutschland', $res['formatted_address']);
		$this->assertTrue(!empty($res['lat']) && !empty($res['lng']));
	}

	/**
	 * @return void
	 */
	public function testAllowEmpty() {
		$this->Addresses->removeBehavior('Geocoder');
		$this->Addresses->addBehavior('Geocoder', ['expect' => [Geocoder::TYPE_POSTAL]]);

		$data = [
			'city' => '',
		];
		$entity = $this->_getEntity($data);
		$res = $this->Addresses->save($entity);
		$this->assertTrue((bool)$res);
	}

	/**
	 * @return void
	 */
	public function testAllowEmptyFalse() {
		$this->Addresses->removeBehavior('Geocoder');
		$this->Addresses->addBehavior('Geocoder', ['allowEmpty' => false, 'expect' => [Geocoder::TYPE_POSTAL]]);

		$data = [
			'city' => '',
		];
		$entity = $this->_getEntity($data);
		$res = $this->Addresses->save($entity);
		$this->assertNull($res);
	}

	/**
	 * Gets a new Entity
	 *
	 * @param array $data
	 * @return \Cake\ORM\Entity
	 */
	protected function _getEntity($data) {
		return new Entity($data);
	}

}
