<?php

namespace Geo\Test\Geocoder;

use Cake\TestSuite\TestCase;
use Geo\Geocoder\Calculator;

class CalculatorTest extends TestCase {

	/**
	 * @var \Geo\Geocoder\Calculator;
	 */
	protected $Calculator;

	/**
	 * @return void
	 */
	public function setUp() {
		parent::setUp();

		$this->Calculator = new Calculator();
	}

	/**
	 * @return void
	 */
	public function tearDown() {
		parent::tearDown();

		unset($this->Calculator);
	}

	/**
	 * @return void
	 */
	public function testDistance() {
		$coords = [
			['name' => 'MUC/Pforzheim (269km road, 2:33h)', 'x' => ['lat' => 48.1391, 'lng' => 11.5802], 'y' => ['lat' => 48.8934, 'lng' => 8.70492], 'd' => 228],
			['name' => 'MUC/London (1142km road, 11:20h)', 'x' => ['lat' => 48.1391, 'lng' => 11.5802], 'y' => ['lat' => 51.508, 'lng' => -0.124688], 'd' => 919],
			['name' => 'MUC/NewYork (--- road, ---h)', 'x' => ['lat' => 48.1391, 'lng' => 11.5802], 'y' => ['lat' => 40.700943, 'lng' => -73.853531], 'd' => 6479],
		];

		foreach ($coords as $coord) {
			$is = $this->Calculator->distance($coord['x'], $coord['y']);
			$this->assertEquals($coord['d'], $is);
		}

		$is = $this->Calculator->distance($coords[0]['x'], $coords[0]['y'], Calculator::UNIT_MILES);
		$this->assertEquals(142, $is);

		// String directly
		$is = $this->Calculator->distance($coords[0]['x'], $coords[0]['y'], 'F');
		$this->assertEquals(747236, $is);
	}

	/**
	 * GeocodeTest::testBlur()
	 *
	 * @return void
	 */
	public function testBlur() {
		$coords = [
			[48.1391, 1, 0.003],
			[11.5802, 1, 0.003],
			[48.1391, 5, 0.08],
			[11.5802, 5, 0.08],
			[48.1391, 10, 0.5],
			[11.5802, 10, 0.5],
		];
		for ($i = 0; $i < 100; $i++) {
			foreach ($coords as $coord) {
				$is = $this->Calculator->blur($coord[0], $coord[1]);
				$this->assertWithinRange($coord[0], $is, $coord[2], $is . ' instead of ' . $coord[0] . ' (' . $coord[2] . ')');
				$this->assertNotWithinRange($coord[0], $is, $coord[2] / 1000, $is . ' NOT instead of ' . $coord[0] . ' (' . $coord[2] . ')');
			}
		}
	}

	/**
	 * GeocodeTest::testConvert()
	 *
	 * @return void
	 */
	public function testConvert() {
		$values = [
			[3, 'M', 'K', 4.828032],
			[3, 'K', 'M', 1.86411358],
			[100000, 'I', 'K', 2.54],
		];
		foreach ($values as $value) {
			$is = $this->Calculator->convert($value[0], $value[1], $value[2]);
			$this->assertEquals($value[3], round($is, 8));
		}
	}

}
