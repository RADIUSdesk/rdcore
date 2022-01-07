<?php

namespace Geo\Model\Behavior;

use ArrayObject;
use Cake\Core\Configure;
use Cake\Database\Expression\FunctionExpression;
use Cake\Database\Expression\IdentifierExpression;
use Cake\Database\Expression\QueryExpression;
use Cake\Event\Event;
use Cake\ORM\Behavior;
use Cake\ORM\Entity;
use Cake\ORM\Query;
use Cake\ORM\Table;
use Cake\ORM\TableRegistry;
use Geocoder\Formatter\StringFormatter;
use Geo\Exception\InconclusiveException;
use Geo\Exception\NotAccurateEnoughException;
use Geo\Geocoder\Calculator;
use Geo\Geocoder\Geocoder;
use RuntimeException;

/**
 * A geocoding behavior for CakePHP to easily geocode addresses.
 * Uses the GeocodeLib for actual geocoding.
 * Also provides some useful geocoding tools like validation and distance conditions.
 *
 * Note that your lat/lng fields should be of type "float(10,6) DEFAULT NULL".
 * NULL as default is important as invalid or not found addresses should result in NULL
 * instead of 0.0 (which is a truthy value!).
 * If you need 0.0, cast it in your beforeSave() callback.
 *
 * @author Mark Scherer
 * @license MIT
 * @link https://www.dereuromark.de/2012/06/12/geocoding-with-cakephp/
 */
class GeocoderBehavior extends Behavior {

	/**
	 * @var array
	 */
	protected $_defaultConfig = [
		'address' => null,
		'allowEmpty' => true,
		'expect' => [],
		'lat' => 'lat', // Field name in your entity
		'lng' => 'lng', // Field name in your entity
		'formattedAddress' => 'formatted_address', // Field name in your entity
		'addressFormat' => '%S %n, %z %L', // For class StringFormatter
		'locale' => null, // For GoogleMaps provider
		'region' => null, // For GoogleMaps provider
		'ssl' => true, // For GoogleMaps provider
		//'bounds' => '',
		'overwrite' => false, // Overwrite existing
		'update' => [],
		'on' => 'beforeSave', // Use beforeMarshal if you need it for validation
		'minAccuracy' => Geocoder::TYPE_COUNTRY,
		'allowInconclusive' => true,
		'unit' => Calculator::UNIT_KM,
		'implementedFinders' => [
			'distance' => 'findDistance',
		],
		'validationError' => null,
		'cache' => false, // Enable only if you got a GeocodedAddresses table running
	];

	/**
	 * @var \Geo\Geocoder\Geocoder
	 */
	protected $_Geocoder;

	/**
	 * @var \Geo\Geocoder\Calculator
	 */
	protected $_Calculator;

	/**
	 * Initiate behavior for the model using specified settings. Available settings:
	 *
	 * - address: (array|string, optional) set to the field name that contains the
	 *             string from where to generate the slug, or a set of field names to
	 *             concatenate for generating the slug.
	 *
	 * - expect: (array)postal_code, locality, sublocality, ...
	 *
	 * - accuracy: see above
	 *
	 * - overwrite: lat/lng overwrite on changes?
	 *
	 * - update: what fields to update (key=>value array pairs)
	 *
	 * - before: validate/save (defaults to save)
	 *             set to false if you only want to use the validation rules etc
	 *
	 * Merges config with the default and store in the config property
	 *
	 * Does not retain a reference to the Table object. If you need this
	 * you should override the constructor.
	 *
	 * @param \Cake\ORM\Table $table The table this behavior is attached to.
	 * @param array $config The config for this behavior.
	 */
	public function __construct(Table $table, array $config = []) {
		$defaults = (array)Configure::read('Geocoder');
		parent::__construct($table, $config + $defaults);

		// BC shim, will be removed in next major
		if (!empty($this->_config['formatted_address'])) {
			$this->_config['formattedAddress'] = $this->_config['formatted_address'];
		}

		// Bug in core about merging keys of array values
		if ($this->_config['address'] === null) {
			$this->_config['address'] = ['street', 'postal_code', 'city', 'country'];
		}
		$this->_table = $table;

		$this->_Geocoder = new Geocoder($this->_config);
	}

	/**
	 * Using pre-patching to populate the entity with the lat/lng etc before
	 * the validation kicks in.
	 * This has the downside that it has to run every time. The other events trigger
	 * geocoding only if the address data has been modified (fields marked as dirty).
	 *
	 * @param \Cake\Event\Event $event
	 * @param \ArrayObject $data
	 * @param \ArrayObject $options
	 * @return void
	 */
	public function beforeMarshal(Event $event, ArrayObject $data, ArrayObject $options) {
		if ($this->_config['on'] === 'beforeMarshal') {
			$addressFields = (array)$this->_config['address'];

			$addressData = [];
			foreach ($addressFields as $field) {
				if (!empty($data[$field])) {
					$addressData[] = $data[$field];
				}
			}

			if (!$this->_geocode($data, $addressData)) {
				$event->stopPropagation();
			}
		}
	}

	/**
	 * @param \Cake\Event\Event $event The beforeSave event that was fired
	 * @param \Geo\Model\Entity\GeocodedAddress $entity The entity that is going to be saved
	 * @param \ArrayObject $options the options passed to the save method
	 * @return void
	 */
	public function beforeRules(Event $event, Entity $entity, ArrayObject $options) {
		if ($this->_config['on'] === 'beforeRules') {
			if (!$this->geocode($entity)) {
				$event->stopPropagation();
			}
		}
	}

	/**
	 * @param \Cake\Event\Event $event The beforeSave event that was fired
	 * @param \Geo\Model\Entity\GeocodedAddress $entity The entity that is going to be saved
	 * @param \ArrayObject $options the options passed to the save method
	 * @return void
	 */
	public function beforeSave(Event $event, Entity $entity, ArrayObject $options) {
		if ($this->_config['on'] === 'beforeSave') {
			if (!$this->geocode($entity)) {
				$event->stopPropagation();
			}
		}
	}

	/**
	 * Run before a model is saved, used to set up slug for model.
	 *
	 * @param \Geo\Model\Entity\GeocodedAddress $entity The entity that is going to be saved
	 * @return \Geo\Model\Entity\GeocodedAddress|null
	 * @throws \RuntimeException
	 */
	public function geocode(Entity $entity) {
		$addressFields = (array)$this->_config['address'];

		$addressData = [];
		$dirty = false;
		foreach ($addressFields as $field) {
			$fieldData = $entity->get($field);
			if ($fieldData) {
				$addressData[] = $fieldData;
			}
			if ($entity->isDirty($field)) {
				$dirty = true;
			}
		}
		if (!$dirty) {
			if ($this->_config['allowEmpty'] || ($entity->lat && $entity->lng)) {
				return $entity;
			}
			if ($entity instanceof Entity) {
				$this->invalidate($entity);
			}
			return null;
		}

		$result = $this->_geocode($entity, $addressData);
		if (is_array($result)) {
			throw new RuntimeException('Array type not expected');
		}

		return $result;
	}

	/**
	 * @param \Geo\Model\Entity\GeocodedAddress|\ArrayObject $entity
	 * @param array $addressData
	 *
	 * @return \Geo\Model\Entity\GeocodedAddress|array|null
	 */
	protected function _geocode($entity, array $addressData) {
		$entityData = [
			'geocoder_result' => [],
		];

		$search = implode(' ', $addressData);
		if ($search === '') {
			if (!$this->_config['allowEmpty']) {
				return null;
			}

			return $entity;
		}

		$address = $this->_execute($search);
		if (!$address) {
			if ($this->_config['allowEmpty']) {
				return $entity;
			}
			if ($entity instanceof Entity) {
				$this->invalidate($entity);
			}
			return null;
		}

		if (!$this->_Geocoder->isExpectedType($address)) {
			if ($this->_config['allowEmpty']) {
				return $entity;
			}
			if ($entity instanceof Entity) {
				$this->invalidate($entity);
			}
			return null;
		}

		// Valid lat/lng found
		$entityData[$this->_config['lat']] = $address->getLatitude();
		$entityData[$this->_config['lng']] = $address->getLongitude();

		if (!empty($this->_config['formattedAddress'])) {
			// Unfortunately, the formatted address of google is lost
			$formatter = new StringFormatter();
			$entityData[$this->_config['formattedAddress']] = $formatter->format($address, $this->_config['addressFormat']);
		}

		$entityData['geocoder_result'] = $address->toArray();
		$entityData['geocoder_result']['address_data'] = implode(' ', $addressData);

		if (!empty($this->_config['update'])) {
			foreach ($this->_config['update'] as $key => $field) {
				//FIXME, not so easy with the new library
				if (!empty($geocode[$key])) {
					$entityData[$field] = $geocode[$key];
				}
			}
		}

		foreach ($entityData as $key => $value) {
			$entity[$key] = $value;
		}
		return $entity;
	}

	/**
	 * Custom finder for distance.
	 *
	 * Options:
	 * - lat (required)
	 * - lng (required)
	 * - tableName
	 * - distance
	 * - sort
	 *
	 * @param \Cake\ORM\Query $query Query.
	 * @param array $options Array of options as described above
	 * @return \Cake\ORM\Query
	 */
	public function findDistance(Query $query, array $options) {
		$options += ['tableName' => null, 'sort' => true];
		$sql = $this->distanceExpr($options['lat'], $options['lng'], null, null, $options['tableName']);

		if ($query->isAutoFieldsEnabled() === null) {
			$query->enableAutoFields(true);
		}

		$query->select(['distance' => $query->newExpr($sql)]);
		if (isset($options['distance'])) {
			// Some SQL versions cannot reuse the select() distance field, so we better reuse the $sql snippet
			$query->where(function ($exp) use ($sql, $options) {
				return $exp->lt($sql, $options['distance']);
			});
		}

		if ($options['sort']) {
			$sort = $options['sort'] === true ? 'ASC' : $options['sort'];
			$query->order(['distance' => $sort]);
		}

		return $query;
	}

	/**
	 * Forms a sql snippet for distance calculation on db level using two lat/lng points.
	 *
	 * @param string|float $lat Latitude field (Model.lat) or float value
	 * @param string|float $lng Longitude field (Model.lng) or float value
	 * @param string|null $fieldLat Comparison field
	 * @param string|null $fieldLng Comparison field
	 * @param string|null $tableName
	 * @return \Cake\Database\ExpressionInterface
	 */
	public function distanceExpr($lat, $lng, $fieldLat = null, $fieldLng = null, $tableName = null) {
		if ($fieldLat === null) {
			$fieldLat = $this->_config['lat'];
		}
		if ($fieldLng === null) {
			$fieldLng = $this->_config['lng'];
		}
		if ($tableName === null) {
			$tableName = $this->_table->getAlias();
		}

		$value = $this->_calculationValue($this->_config['unit']);

		$op = function ($type, $params) {
			return new QueryExpression($params, [], $type);
		};
		$func = function ($name, $arg = null) {
			return new FunctionExpression($name, $arg === null ? [] : [$arg]);
		};

		$fieldLat = new IdentifierExpression("$tableName.$fieldLat");
		$fieldLng = new IdentifierExpression("$tableName.$fieldLng");

		$fieldLatRadians = $func('RADIANS', $op('-', ['90', $fieldLat]));
		$fieldLngRadians = $func('RADIANS', $fieldLng);
		$radius = $op('/', [$func('PI'), '2']);

		$mult = $op('*', [
			$func('COS', $op('-', [$radius, $fieldLatRadians])),
			'COS(PI()/2 - RADIANS(90 - ' . $lat . '))',
			$func('COS', $op('-', [$fieldLngRadians, $func('RADIANS', $lng)])),
		]);

		$mult2 = $op('*', [
			$func('SIN', $op('-', [$radius, $fieldLatRadians])),
			$func('SIN', $op('-', [$radius, 'RADIANS(90 - ' . $lat . ')'])),
		]);

		return $op('*', [
			(string)$value,
			$func('ACOS', $op('+', [$mult, $mult2])),
		]);
	}

	/**
	 * Snippet for custom pagination
	 *
	 * @param int|null $distance
	 * @param string|null $fieldName
	 * @param string|null $fieldLat
	 * @param string|null $fieldLng
	 * @param string|null $tableName
	 * @return array
	 */
	public function distanceConditions($distance = null, $fieldName = null, $fieldLat = null, $fieldLng = null, $tableName = null) {
		if ($fieldLat === null) {
			$fieldLat = $this->_config['lat'];
		}
		if ($fieldLng === null) {
			$fieldLng = $this->_config['lng'];
		}
		if ($tableName === null) {
			$tableName = $this->_table->getAlias();
		}
		$conditions = [
			$tableName . '.' . $fieldLat . ' <> 0',
			$tableName . '.' . $fieldLng . ' <> 0',
		];
		$fieldName = !empty($fieldName) ? $fieldName : 'distance';
		if ($distance !== null) {
			$conditions[] = '1=1 HAVING ' . $tableName . '.' . $fieldName . ' < ' . (int)$distance;
		}
		return $conditions;
	}

	/**
	 * Snippet for custom pagination
	 *
	 * @param float|string $lat
	 * @param float|string $lng
	 * @param string|null $fieldName
	 * @param string|null $tableName
	 * @return array
	 */
	public function distanceField($lat, $lng, $fieldName = null, $tableName = null) {
		if ($tableName === null) {
			$tableName = $this->_table->getAlias();
		}
		$fieldName = (!empty($fieldName) ? $fieldName : 'distance');
		return [$tableName . '.' . $fieldName => $this->distanceExpr($lat, $lng, null, null, $tableName)];
	}

	/**
	 * Returns if a latitude is valid or not.
	 * validation rule for models
	 *
	 * @param float|float[] $latitude
	 * @return bool
	 */
	public function validateLatitude($latitude) {
		if (is_array($latitude)) {
			$latitude = array_shift($latitude);
		}
		return $latitude <= 90 && $latitude >= -90;
	}

	/**
	 * Returns if a longitude is valid or not.
	 * validation rule for models
	 *
	 * @param float|float[] $longitude
	 * @return bool
	 */
	public function validateLongitude($longitude) {
		if (is_array($longitude)) {
			$longitude = array_shift($longitude);
		}
		return $longitude <= 180 && $longitude >= -180;
	}

	/**
	 * Uses the Geocode class to query
	 *
	 * @param string $address
	 * @return \Geocoder\Model\Address|null
	 * @throws \RuntimeException
	 */
	protected function _execute($address) {
		/** @var \Geo\Model\Table\GeocodedAddressesTable|null $GeocodedAddresses */
		$GeocodedAddresses = null;
		if ($this->getConfig('cache')) {
			$GeocodedAddresses = TableRegistry::get('Geo.GeocodedAddresses');
			/** @var \Geo\Model\Entity\GeocodedAddress|null $result */
			$result = $GeocodedAddresses->find()->where(['address' => $address])->first();
			if ($result) {
				/** @var \Geocoder\Model\Address|null $data */
				$data = $result->data;
				return $data ?: null;
			}
		}

		try {
			$addresses = $this->_Geocoder->geocode($address);
		} catch (InconclusiveException $e) {
			$addresses = null;
		} catch (NotAccurateEnoughException $e) {
			$addresses = null;
		}
		$result = null;
		if ($addresses && $addresses->count() > 0) {
			$result = $addresses->first();
		}

		if ($this->getConfig('cache')) {
			/** @var \Geo\Model\Entity\GeocodedAddress $addressEntity */
			$addressEntity = $GeocodedAddresses->newEntity([
				'address' => $address,
			]);

			if ($result) {
				$formatter = new StringFormatter();
				$addressEntity->formatted_address = $formatter->format($result, $this->_config['addressFormat']);
				$addressEntity->lat = $result->getLatitude();
				$addressEntity->lng = $result->getLongitude();
				$addressEntity->country = $result->getCountry()->getCode();
				$addressEntity->data = $result;
			}

			if (!$GeocodedAddresses->save($addressEntity, ['atomic' => false])) {
				throw new RuntimeException('Could not store geocoding cache data');
			}
		}

		return $result;
	}

	/**
	 * Get the current unit factor
	 *
	 * @param string $unit Unit constant/string.
	 * @return float Value
	 */
	protected function _calculationValue($unit) {
		if (!isset($this->_Calculator)) {
			$this->_Calculator = new Calculator();
		}
		return $this->_Calculator->convert(6371.04, Calculator::UNIT_KM, $unit);
	}

	/**
	 * @param \Cake\ORM\Entity $entity
	 * @return void
	 */
	protected function invalidate($entity) {
		$errorMessage = $this->_config['validationError'] !== null ? $this->_config['validationError'] : __('Could not geocode this address. Please refine.');
		if ($errorMessage === false) {
			return;
		}

		$fields = (array)$this->_config['address'];
		foreach ($fields as $field) {
			if (!is_array($errorMessage)) {
				$entity->errors($field, $errorMessage);
			}

			$message = !empty($errorMessage[$field]) ? $errorMessage[$field] : null;
			if (!$message) {
				continue;
			}
			$entity->errors($field, $message);
		}
	}

}
