<?php

/**
 * @license    MIT License
 */

namespace Geo\Geocoder\Provider;

use Cake\Utility\Xml;
use Geocoder\Exception\NoResult;
use Geocoder\Exception\UnsupportedOperation;
use Geocoder\Provider\AbstractHttpProvider;
use Geocoder\Provider\Provider;

/**
 * @author Mark Scherer
 */
class GeoIpLookup extends AbstractHttpProvider implements Provider {

	/**
	 * @var string
	 */
	const ENDPOINT_URL = 'http://api.geoiplookup.net/?query=%s';

	/**
	 * @inheritDoc
	 */
	public function geocode($address) {
		if (!filter_var($address, FILTER_VALIDATE_IP)) {
			throw new UnsupportedOperation('The geoiplookup.net provider does not support street addresses.');
		}

		if (in_array($address, ['127.0.0.1', '::1'])) {
			return $this->returnResults([$this->getLocalhostDefaults()]);
		}

		$query = sprintf(static::ENDPOINT_URL, $address);

		return $this->executeQuery($query);
	}

	/**
	 * @inheritDoc
	 */
	public function reverse($latitude, $longitude) {
		throw new UnsupportedOperation('The geoiplookup.net provider is not able to do reverse geocoding.');
	}

	/**
	 * @inheritDoc
	 */
	public function getName() {
		return 'geo_ip_lookup';
	}

	/**
	 * @param string $query
	 *
	 * @return \Geocoder\Model\AddressCollection
	 */
	private function executeQuery($query) {
		$content = (string)$this->getAdapter()->get($query)->getBody();
		if (empty($content)) {
			throw new NoResult(sprintf('Could not execute query %s', $query));
		}

		$data = Xml::build($content);
		if (empty($data) || empty($data->result)) {
			throw new NoResult(sprintf('Could not execute query %s', $query));
		}

		$data = (array)$data->result;

		$adminLevels = [];

		if (!empty($data['isp']) || !empty($data['isp'])) {
			$adminLevels[] = [
				'name' => isset($data['isp']) ? $data['isp'] : null,
				'code' => null,
				'level' => 1,
			];
		}

		return $this->returnResults([
			array_merge($this->getDefaults(), [
				'latitude' => isset($data['latitude']) ? $data['latitude'] : null,
				'longitude' => isset($data['longitude']) ? $data['longitude'] : null,
				'locality' => isset($data['city']) ? $data['city'] : null,
				'adminLevels' => $adminLevels,
				'country' => isset($data['countryname']) ? $data['countryname'] : null,
				'countryCode' => isset($data['countrycode']) ? $data['countrycode'] : null,
			]),
		]);
	}

}
