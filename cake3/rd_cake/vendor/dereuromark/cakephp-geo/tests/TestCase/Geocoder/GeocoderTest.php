<?php

namespace Geo\Test\Geocoder;

use Cake\Core\Configure;
use Cake\I18n\I18n;
use Cake\TestSuite\TestCase;
use Geocoder\Provider\OpenStreetMap;
use Geo\Geocoder\Provider\GeoIpLookup;
use Ivory\HttpAdapter\CakeHttpAdapter;
use TestApp\Geocoder\Geocoder;

class GeocoderTest extends TestCase {

	/**
	 * @var \Geocoder\Provider\Provider;
	 */
	protected $Geocoder;

	/**
	 * @return void
	 */
	public function setUp() {
		parent::setUp();

		// google maps
		Configure::write('Geocoder', [
			'apiKey' => 'ABQIAAAAk-aSeht5vBRyVc9CjdBKLRRnhS8GMCOqu88EXp1O-QqtMSdzHhQM4y1gkHFQdUvwiZgZ6jaKlW40kw', // local
		]);
	}

	/**
	 * @return void
	 */
	public function tearDown() {
		parent::tearDown();
	}

	/**
	 * @return void
	 */
	public function testDefault() {
		$this->Geocoder = new Geocoder();
		$result = $this->Geocoder->geocode('Oranienburger Straße 87, 10178 Berlin, Deutschland');

		$this->assertSame(1, $result->count());

		$isConclusive = $this->Geocoder->isConclusive($result);
		$this->assertTrue($isConclusive);

		$address = $result->first();
		$this->assertSame('10178', $address->getPostalCode());

		$coordinates = $address->getCoordinates();
		$this->assertWithinRange(52.5, $coordinates->getLatitude(), 0.5);
		$this->assertWithinRange(13.4, $coordinates->getLongitude(), 0.5);

		$country = $address->getCountry();
		$this->assertSame('DE', $country->getCode());

		$this->Geocoder->setConfig('expect', [Geocoder::TYPE_ADDRESS]);
		$containsAccurateEnough = $this->Geocoder->containsAccurateEnough($result);
		$this->assertTrue($containsAccurateEnough);

		$isExpectedType = $this->Geocoder->isExpectedType($address);
		$this->assertTrue($isExpectedType);

		$isAccurateEnough = $this->Geocoder->isAccurateEnough($address);
		$this->assertTrue($isAccurateEnough);
	}

	/**
	 * @return void
	 */
	public function testLocaleAndRegion() {
		$locale = I18n::getLocale();

		I18n::setLocale('pt_BR');

		$geocoder = new Geocoder([
			'locale' => true,
			'region' => true,
		]);

		$this->assertEquals('pt', $geocoder->getConfig('locale'));
		$this->assertEquals('br', $geocoder->getConfig('region'));

		I18n::setLocale($locale);
	}

	/**
	 * @return void
	 */
	public function testClosure() {
		$config = [
			'provider' => function () {
				return new OpenStreetMap(new CakeHttpAdapter());
			},
		];

		$this->Geocoder = new Geocoder($config);
		$result = $this->Geocoder->geocode('Oranienburger Straße 85, 10178 Berlin, Deutschland');

		$this->assertTrue($result->count() > 1);

		$address = $result->first();
		$this->assertSame('10178', $address->getPostalCode());

		$coordinates = $address->getCoordinates();
		$this->assertWithinRange(52.5, $coordinates->getLatitude(), 0.5);
		$this->assertWithinRange(13.4, $coordinates->getLongitude(), 0.5);

		$country = $address->getCountry();
		$this->assertSame('DE', $country->getCode());
	}
	/**
	 * @return void
	 */
	public function testAlt() {
		$config = [
			'addressFormat' => '%n %S %L %z',
		];
		$this->Geocoder = new Geocoder($config);

		$result = $this->Geocoder->geocode('1 infinite loop cupertino ca');
		$this->assertSame(2, $result->count());

		$isConclusive = $this->Geocoder->isConclusive($result);
		$this->assertFalse($isConclusive);

		$address = $result->first();
		$state = $address->getAdminLevels()->first();
		$this->assertTextEquals($state->getName(), 'California');
		$this->assertTextEquals($state->getCode(), 'CA');
		$this->assertSame('95014', $address->getPostalCode());
		$this->assertSame('1', $address->getStreetNumber());
		$this->assertSame('Infinite Loop', $address->getStreetName());

		$coordinates = $address->getCoordinates();
		$this->assertWithinRange(37.331697, $coordinates->getLatitude(), 0.5);
		$this->assertWithinRange(-122.030226, $coordinates->getLongitude(), 0.5);

		$country = $address->getCountry();
		$this->assertSame('US', $country->getCode());

		$this->Geocoder->setConfig('expect', [Geocoder::TYPE_ADDRESS]);
		$containsAccurateEnough = $this->Geocoder->containsAccurateEnough($result);
		$this->assertTrue($containsAccurateEnough);

		$isExpectedType = $this->Geocoder->isExpectedType($address);
		$this->assertTrue($isExpectedType);

		$isAccurateEnough = $this->Geocoder->isAccurateEnough($address);
		$this->assertTrue($isAccurateEnough);
	}

	/**
	 * @return void
	 */
	public function testIp() {
		$config = [
			'provider' => function () {
				return new GeoIpLookup(new CakeHttpAdapter());
			},
		];

		$this->Geocoder = new Geocoder($config);
		$result = $this->Geocoder->geocode('129.94.102.121');

		$this->assertSame(1, $result->count());
		$address = $result->first();
		$this->assertNotEmpty($address->getLatitude());
		$this->assertNotEmpty($address->getLongitude());
		$this->assertNotEmpty($address->getCountryCode());
	}

}
