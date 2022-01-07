<?php

/**
 * This file is part of the Geocoder package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

namespace Geo\Provider;

use Exception;
use Geocoder\Exception\InvalidCredentials;
use Geocoder\Exception\NoResult;
use Geocoder\Exception\QuotaExceeded;
use Geocoder\Exception\UnsupportedOperation;
use Geocoder\Provider\GoogleMaps as GeocoderGoogleMaps;
use Geocoder\Provider\LocaleTrait;
use Ivory\HttpAdapter\HttpAdapterInterface;

/**
 * This file has been fixed to work with new GoogleMaps API requirement of POST vs GET.
 *
 * @author William Durand <william.durand1@gmail.com>
 */
class GoogleMaps extends GeocoderGoogleMaps {

	use LocaleTrait;

	/**
	 * @var string
	 */
	private $region;

	/**
	 * @var bool
	 */
	private $useSsl;

	/**
	 * @var string
	 */
	private $apiKey;

	/**
	 * @param \Ivory\HttpAdapter\HttpAdapterInterface $adapter An HTTP adapter
	 * @param string|null               $locale  A locale (optional)
	 * @param string|null               $region  Region biasing (optional)
	 * @param bool                 $useSsl  Whether to use an SSL connection (optional)
	 * @param string|null               $apiKey  Google Geocoding API key (optional)
	 */
	public function __construct(HttpAdapterInterface $adapter, $locale = null, $region = null, $useSsl = false, $apiKey = null) {
		parent::__construct($adapter);

		$this->locale = $locale;
		$this->region = $region;
		$this->useSsl = $useSsl;
		$this->apiKey = $apiKey;
	}

	/**
	 * @param string $address
	 *
	 * @throws \Exception
	 *
	 * @return \Geocoder\Model\AddressCollection
	 */
	public function geocode($address) {
		// Google API returns invalid data if IP address given
		// This API doesn't handle IPs
		if (filter_var($address, FILTER_VALIDATE_IP)) {
			throw new UnsupportedOperation('The GoogleMaps provider does not support IP addresses, only street addresses.');
		}

		$query = sprintf(
			$this->useSsl ? static::ENDPOINT_URL_SSL : static::ENDPOINT_URL,
			rawurlencode($address)
		);

		return $this->executeQuery($query);
	}

	/**
	 * @param float $latitude
	 * @param float $longitude
	 *
	 * @return \Geocoder\Model\AddressCollection
	 */
	public function reverse($latitude, $longitude) {
		return $this->geocode(sprintf('%F,%F', $latitude, $longitude));
	}

	/**
	 * @return string
	 */
	public function getName() {
		return 'google_maps';
	}

	/**
	 * @param string|null $region
	 *
	 * @return $this
	 */
	public function setRegion($region) {
		$this->region = $region;

		return $this;
	}

	/**
	 * @param string $query
	 *
	 * @return string query with extra params
	 */
	protected function buildQuery($query) {
		if ($this->getLocale() !== null) {
			$query = sprintf('%s&language=%s', $query, $this->getLocale());
		}

		if ($this->region !== null) {
			$query = sprintf('%s&region=%s', $query, $this->region);
		}

		if ($this->apiKey !== null) {
			$query = sprintf('%s&key=%s', $query, $this->apiKey);
		}

		return $query;
	}

	/**
	 * @param string $query
	 *
	 * @throws \Exception
	 *
	 * @return \Geocoder\Model\AddressCollection
	 */
	private function executeQuery($query) {
		$query = $this->buildQuery($query);
		$content = (string)$this->getAdapter()->post($query)->getBody();

		// Throw exception if invalid clientID and/or privateKey used with GoogleMapsBusinessProvider
		if (strpos($content, "Provided 'signature' is not valid for the provided client ID") !== false) {
			throw new InvalidCredentials(sprintf('Invalid client ID / API Key %s', $query));
		}

		if (empty($content)) {
			throw new NoResult(sprintf('Could not execute query "%s".', $query));
		}

		$json = json_decode($content);

		// API error
		if (!isset($json)) {
			throw new NoResult(sprintf('Could not execute query "%s".', $query));
		}

		if ($json->status === 'REQUEST_DENIED' && $json->error_message === 'The provided API key is invalid.') {
			throw new InvalidCredentials(sprintf('API key is invalid %s', $query));
		}

		if ($json->status === 'REQUEST_DENIED') {
			throw new Exception(sprintf('API access denied. Request: %s - Message: %s',
				$query, $json->error_message));
		}

		// you are over your quota
		if ($json->status === 'OVER_QUERY_LIMIT') {
			throw new QuotaExceeded(sprintf('Daily quota exceeded %s', $query));
		}

		// no result
		if (!isset($json->results) || !count($json->results) || $json->status !== 'OK') {
			throw new NoResult(sprintf('Could not execute query "%s".', $query));
		}

		$results = [];
		foreach ($json->results as $result) {
			$resultSet = $this->getDefaults();

			// update address components
			foreach ($result->address_components as $component) {
				foreach ($component->types as $type) {
					$this->updateAddressComponent($resultSet, $type, $component);
				}
			}

			// update coordinates
			$coordinates = $result->geometry->location;
			$resultSet['latitude'] = $coordinates->lat;
			$resultSet['longitude'] = $coordinates->lng;

			$resultSet['bounds'] = null;
			if (isset($result->geometry->bounds)) {
				$resultSet['bounds'] = [
					'south' => $result->geometry->bounds->southwest->lat,
					'west' => $result->geometry->bounds->southwest->lng,
					'north' => $result->geometry->bounds->northeast->lat,
					'east' => $result->geometry->bounds->northeast->lng,
				];
			} elseif ($result->geometry->location_type === 'ROOFTOP') {
				// Fake bounds
				$resultSet['bounds'] = [
					'south' => $coordinates->lat,
					'west' => $coordinates->lng,
					'north' => $coordinates->lat,
					'east' => $coordinates->lng,
				];
			}

			$results[] = array_merge($this->getDefaults(), $resultSet);
		}

		return $this->returnResults($results);
	}

	/**
	 * Update current resultSet with given key/value.
	 *
	 * @param array  $resultSet resultSet to update
	 * @param string $type      Component type
	 * @param object $values    The component values
	 *
	 * @return array
	 */
	private function updateAddressComponent(&$resultSet, $type, $values) {
		switch ($type) {
			case 'postal_code':
				$resultSet['postalCode'] = $values->long_name;
				break;

			case 'locality':
				$resultSet['locality'] = $values->long_name;
				break;

			case 'administrative_area_level_1':
			case 'administrative_area_level_2':
			case 'administrative_area_level_3':
			case 'administrative_area_level_4':
			case 'administrative_area_level_5':
				$resultSet['adminLevels'][] = [
					'name' => $values->long_name,
					'code' => $values->short_name,
					'level' => (int)substr($type, -1),
				];
				break;

			case 'country':
				$resultSet['country'] = $values->long_name;
				$resultSet['countryCode'] = $values->short_name;
				break;

			case 'street_number':
				$resultSet['streetNumber'] = $values->long_name;
				break;

			case 'route':
				$resultSet['streetName'] = $values->long_name;
				break;

			case 'sublocality':
				$resultSet['subLocality'] = $values->long_name;
				break;

			default:
		}

		return $resultSet;
	}

}
