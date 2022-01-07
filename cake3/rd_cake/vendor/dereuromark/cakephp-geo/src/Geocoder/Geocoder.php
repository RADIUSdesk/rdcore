<?php

namespace Geo\Geocoder;

use Cake\Core\Configure;
use Cake\Core\InstanceConfigTrait;
use Cake\I18n\I18n;
use Geocoder\Exception\NoResult;
use Geocoder\Model\Address;
use Geocoder\Model\AddressCollection;
use Geo\Exception\InconclusiveException;
use Geo\Exception\NotAccurateEnoughException;
use Locale;

/**
 * Geocode via google (UPDATE: api3)
 *
 * @see https://developers.google.com/maps/documentation/geocoding/
 *
 * Used by Geo.GeocoderBehavior
 *
 * @author Mark Scherer
 * @license MIT
 */
class Geocoder {

	use InstanceConfigTrait;

	const TYPE_COUNTRY = 'country';
	const TYPE_AAL1 = 'administrative_area_level_1';
	const TYPE_AAL2 = 'administrative_area_level_2';
	const TYPE_AAL3 = 'administrative_area_level_3';
	const TYPE_AAL4 = 'administrative_area_level_4';
	const TYPE_AAL5 = 'administrative_area_level_5';
	const TYPE_LOC = 'locality';
	const TYPE_SUBLOC = 'sublocality';
	const TYPE_POSTAL = 'postal_code';
	//const TYPE_ROUTE = 'route'; // not available with GoogleMapsAPI
	//const TYPE_INTERSEC = 'intersection';
	const TYPE_ADDRESS = 'street_address';
	const TYPE_NUMBER = 'street_number';

	/**
	 * @var array
	 */
	protected $_defaultConfig = [
		'locale' => null, // For GoogleMaps provider
		'region' => null, // For GoogleMaps provider
		'ssl' => true, // For GoogleMaps provider
		'apiKey' => '', // For GoogleMaps provider,
		'provider' => '\Geo\Provider\GoogleMaps', // Or use own callable
		'adapter' => '\Ivory\HttpAdapter\CakeHttpAdapter', // Only for default provider
		'allowInconclusive' => true,
		'minAccuracy' => self::TYPE_COUNTRY, // deprecated?
		'expect' => [], # see $_types for details, one hit is enough to be valid
	];

	/**
	 * This mainly does not work with the GoogleMap provider class as it loses information.
	 * Will need an own implementation
	 *
	 * @var array
	 */
	protected $_types = [
		self::TYPE_COUNTRY,
		self::TYPE_AAL1,
		self::TYPE_AAL3,
		self::TYPE_AAL4,
		self::TYPE_AAL5,
		self::TYPE_LOC,
		self::TYPE_SUBLOC,
		self::TYPE_POSTAL,
		self::TYPE_ADDRESS,
		self::TYPE_NUMBER,
	];

	/**
	 * @var \Geocoder\Provider\Provider
	 */
	protected $geocoder;

	/**
	 * @var \Ivory\HttpAdapter\HttpAdapterInterface
	 */
	protected $adapter;

	/**
	 * @param array $config
	 */
	public function __construct(array $config = []) {
		$defaults = (array)Configure::read('Geocoder');
		$this->setConfig($config + $defaults);

		if ($this->getConfig('locale') === true) {
			$this->setConfig('locale', strtolower(Locale::getPrimaryLanguage(I18n::getLocale())));
		}

		if ($this->getConfig('region') === true) {
			$this->setConfig('region', strtolower(Locale::getRegion(I18n::getLocale())));
		}
	}

	/**
	 * @return array
	 */
	public function accuracyTypes() {
		$array = [
			static::TYPE_COUNTRY => __('Country'),
			static::TYPE_AAL1 => __('Province'),
			static::TYPE_AAL3 => __('Sub Province'),
			static::TYPE_AAL4 => __('Region'),
			static::TYPE_AAL5 => __('Sub Region'),
			static::TYPE_LOC => __('Locality'),
			static::TYPE_SUBLOC => __('Sub Locality'),
			static::TYPE_POSTAL => __('Postal Code'),
			static::TYPE_ADDRESS => __('Street Address'),
			static::TYPE_NUMBER => __('Street Number'),
		];
		return $array;
	}

	/**
	 * Actual querying.
	 * The query will be flatted, and if multiple results are fetched, they will be found
	 * in $result['all'].
	 *
	 * @param string $address
	 * @param array $params
	 * @return \Geocoder\Model\AddressCollection Result
	 */
	public function geocode($address, array $params = []) {
		$this->_buildGeocoder();

		try {
			$result = $this->geocoder->geocode($address);
		} catch (NoResult $e) {
			throw new InconclusiveException(sprintf('Inconclusive result (total of %s)', 0), 0, $e);
		}

		if (!$this->_config['allowInconclusive'] && !$this->isConclusive($result)) {
			throw new InconclusiveException(sprintf('Inconclusive result (total of %s)', $result->count()));
		}
		if ($this->_config['minAccuracy'] && !$this->containsAccurateEnough($result)) {
			throw new NotAccurateEnoughException('Result is not accurate enough');
		}

		return $result;
	}

	/**
	 * Results usually from most accurate to least accurate result (street_address, ..., country)
	 *
	 * @param float $lat
	 * @param float $lng
	 * @param array $params
	 * @return \Geocoder\Model\AddressCollection Result
	 */
	public function reverse($lat, $lng, array $params = []) {
		$this->_buildGeocoder();

		$result = $this->geocoder->reverse($lat, $lng);
		if (!$this->_config['allowInconclusive'] && !$this->isConclusive($result)) {
			throw new InconclusiveException(sprintf('Inconclusive result (total of %s)', $result->count()));
		}
		if ($this->_config['minAccuracy'] && !$this->containsAccurateEnough($result)) {
			throw new NotAccurateEnoughException('Result is not accurate enough');
		}
		return $result;
	}

	/**
	 * Seems like there are no details info anymore, or the provider does not forward it
	 *
	 * @param \Geocoder\Model\AddressCollection $addresses
	 * @return bool True if inconclusive
	 */
	public function isConclusive(AddressCollection $addresses) {
		return $addresses->count() === 1;
	}

	/**
	 * Expects certain address types to be present in the given address.
	 *
	 * @param \Geocoder\Model\Address $address
	 * @return bool
	 */
	public function isExpectedType(Address $address) {
		$expected = $this->_config['expect'];
		if (!$expected) {
			return true;
		}

		$adminLevels = $address->getAdminLevels();
		$map = [
			static::TYPE_AAL1 => 1,
			static::TYPE_AAL2 => 2,
			static::TYPE_AAL3 => 3,
			static::TYPE_AAL4 => 4,
			static::TYPE_AAL5 => 5,
		];

		foreach ($expected as $expect) {
			switch ($expect) {
				case static::TYPE_COUNTRY:
					if ($address->getCountry() !== null) {
						return true;
					}
					break;
				case static::TYPE_AAL1:
				case static::TYPE_AAL2:
				case static::TYPE_AAL3:
				case static::TYPE_AAL4:
				case static::TYPE_AAL5:
					if ($adminLevels->has($map[$expect])) {
						return true;
					}
					break;
				case static::TYPE_LOC:
					if ($address->getLocality() !== null) {
						return true;
					}
					break;
				case static::TYPE_SUBLOC:
					if ($address->getSubLocality() !== null) {
						return true;
					}
					break;
				case static::TYPE_POSTAL:
					if ($address->getPostalCode() !== null) {
						return true;
					}
					break;
				case static::TYPE_ADDRESS:
					if ($address->getStreetName() !== null) {
						return true;
					}
					break;
				case static::TYPE_NUMBER:
					if ($address->getStreetNumber() !== null) {
						return true;
					}
					break;
			}
		}
		return false;
	}

	/**
	 * @param \Geocoder\Model\AddressCollection $addresses
	 * @return bool
	 */
	public function containsAccurateEnough(AddressCollection $addresses) {
		foreach ($addresses as $address) {
			if ($this->isAccurateEnough($address)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * @param \Geocoder\Model\Address $address
	 * @return bool
	 */
	public function isAccurateEnough(Address $address) {
		$levels = array_keys($this->_types);
		$values = array_values($this->_types);
		$map = array_combine($levels, $values);

		$expected = $this->_config['minAccuracy'];

		//TODO
		return true;
	}

	/**
	 * @return void
	 */
	protected function _buildGeocoder() {
		if (isset($this->geocoder)) {
			return;
		}

		$geocoderClass = $this->getConfig('provider');
		if (is_callable($geocoderClass)) {
			$this->geocoder = $geocoderClass();
			return;
		}

		$adapterClass = $this->getConfig('adapter');
		$this->adapter = new $adapterClass();
		$this->geocoder = new $geocoderClass($this->adapter, $this->getConfig('locale'), $this->getConfig('region'), $this->getConfig('ssl'), $this->getConfig('apiKey'));
	}

}
