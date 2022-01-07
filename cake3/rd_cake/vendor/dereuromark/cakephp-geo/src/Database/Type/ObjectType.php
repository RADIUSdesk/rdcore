<?php

namespace Geo\Database\Type;

use Cake\Database\Driver;
use Cake\Database\Type;
use PDO;

/**
 * This can serialize and unserialize objects.
 */
class ObjectType extends Type {

	/**
	 * @param string|null $value
	 * @param \Cake\Database\Driver $driver
	 *
	 * @return object|null
	 */
	public function toPHP($value, Driver $driver) {
		if ($value === null) {
			return $value;
		}
		return unserialize($value);
	}

	/**
	 * @param object|string|null $value
	 *
	 * @return object|null
	 */
	public function marshal($value) {
		if ($value === null) {
			return $value;
		}
		if (is_object($value)) {
			return $value;
		}
		return unserialize($value);
	}

	/**
	 * @param object|null $value
	 * @param \Cake\Database\Driver $driver
	 *
	 * @return string|null
	 */
	public function toDatabase($value, Driver $driver) {
		if ($value === null) {
			return $value;
		}
		return serialize($value);
	}

	/**
	 * @param mixed|null $value
	 * @param \Cake\Database\Driver $driver
	 *
	 * @return int
	 */
	public function toStatement($value, Driver $driver) {
		if ($value === null) {
			return PDO::PARAM_NULL;
		}
		return PDO::PARAM_STR;
	}

}
