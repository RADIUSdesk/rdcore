<?php

namespace Geo\View\Helper;

use Cake\Routing\Router;

/**
 * Basic Js Base Engine Trait derived from 2.x JsBaseEngineClass.
 *
 * Provides generic methods.
 */
trait JsBaseEngineTrait {

	/**
	 * The js snippet for the current selection.
	 *
	 * @var string
	 */
	public $selection;

	/**
	 * Collection of option maps. Option maps allow other helpers to use generic names for engine
	 * callbacks and options. Allowing uniform code access for all engine types. Their use is optional
	 * for end user use though.
	 *
	 * @var array
	 */
	protected $_optionMap = [];

	/**
	 * An array of lowercase method names in the Engine that are buffered unless otherwise disabled.
	 * This allows specific 'end point' methods to be automatically buffered by the JsHelper.
	 *
	 * @var array
	 */
	public $bufferedMethods = ['event', 'sortable', 'drag', 'drop', 'slider'];

	/**
	 * Contains a list of callback names -> default arguments.
	 *
	 * @var array
	 */
	protected $_callbackArguments = [];

	/**
	 * Create an `alert()` message in JavaScript
	 *
	 * @param string $message Message you want to alter.
	 * @return string completed alert()
	 */
	public function alert($message) {
		return 'alert("' . $this->escape($message) . '");';
	}

	/**
	 * Redirects to a URL. Creates a window.location modification snippet
	 * that can be used to trigger 'redirects' from JavaScript.
	 *
	 * @param string|array|null $url URL
	 * @return string completed redirect in javascript
	 */
	public function redirect($url = null) {
		return 'window.location = "' . Router::url($url) . '";';
	}

	/**
	 * Create a `confirm()` message
	 *
	 * @param string $message Message you want confirmed.
	 * @return string completed confirm()
	 */
	public function confirm($message) {
		return 'confirm("' . $this->escape($message) . '");';
	}

	/**
	 * Generate a confirm snippet that returns false from the current
	 * function scope.
	 *
	 * @param string $message Message to use in the confirm dialog.
	 * @return string completed confirm with return script
	 */
	public function confirmReturn($message) {
		$out = 'var _confirm = ' . $this->confirm($message);
		$out .= "if (!_confirm) {\n\treturn false;\n}";
		return $out;
	}

	/**
	 * Create a `prompt()` JavaScript function
	 *
	 * @param string $message Message you want to prompt.
	 * @param string $default Default message
	 * @return string completed prompt()
	 */
	public function prompt($message, $default = '') {
		return 'prompt("' . $this->escape($message) . '", "' . $this->escape($default) . '");';
	}

	/**
	 * Generates a JavaScript object in JavaScript Object Notation (JSON)
	 * from an array. Will use native JSON encode method if available, and $useNative == true
	 *
	 * ### Options:
	 *
	 * - `prefix` - String prepended to the returned data.
	 * - `postfix` - String appended to the returned data.
	 *
	 * @param array $data Data to be converted.
	 * @param array $options Set of options, see above.
	 * @return string A JSON code block
	 */
	public function object($data = [], $options = []) {
		$defaultOptions = [
			'prefix' => '', 'postfix' => '',
		];
		$options += $defaultOptions;

		return $options['prefix'] . json_encode($data) . $options['postfix'];
	}

	/**
	 * Converts a PHP-native variable of any type to a JSON-equivalent representation
	 *
	 * @param mixed $val A PHP variable to be converted to JSON
	 * @param bool|null $quoteString If false, leaves string values unquoted
	 * @param string $key Key name.
	 * @return string a JavaScript-safe/JSON representation of $val
	 */
	public function value($val = [], $quoteString = null, $key = 'value') {
		if ($quoteString === null) {
			$quoteString = true;
		}
		switch (true) {
			case (is_array($val) || is_object($val)):
				$val = $this->object($val);
				break;
			case ($val === null):
				$val = 'null';
				break;
			case (is_bool($val)):
				$val = ($val === true) ? 'true' : 'false';
				break;
			case (is_int($val)):
				break;
			case (is_float($val)):
				$val = sprintf('%.11f', $val);
				break;
			default:
				$val = $this->escape($val);
				if ($quoteString) {
					$val = '"' . $val . '"';
				}
		}
		return $val;
	}

	/**
	 * Escape a string to be JSON friendly.
	 *
	 * List of escaped elements:
	 *
	 * - "\r" => '\n'
	 * - "\n" => '\n'
	 * - '"' => '\"'
	 *
	 * @param string $string String that needs to get escaped.
	 * @return string Escaped string.
	 */
	public function escape($string) {
		return $this->_utf8ToHex($string);
	}

	/**
	 * Encode a string into JSON. Converts and escapes necessary characters.
	 *
	 * @param string $string The string that needs to be utf8->hex encoded
	 * @return string
	 */
	protected function _utf8ToHex($string) {
		$length = strlen($string);
		$return = '';
		for ($i = 0; $i < $length; ++$i) {
			$ord = ord($string[$i]);
			switch (true) {
				case $ord == 0x08:
					$return .= '\b';
					break;
				case $ord == 0x09:
					$return .= '\t';
					break;
				case $ord == 0x0A:
					$return .= '\n';
					break;
				case $ord == 0x0C:
					$return .= '\f';
					break;
				case $ord == 0x0D:
					$return .= '\r';
					break;
				case $ord == 0x22:
				case $ord == 0x2F:
				case $ord == 0x5C:
					$return .= '\\' . $string[$i];
					break;
				case (($ord >= 0x20) && ($ord <= 0x7F)):
					$return .= $string[$i];
					break;
				case (($ord & 0xE0) == 0xC0):
					if ($i + 1 >= $length) {
						$i += 1;
						$return .= '?';
						break;
					}
					$charbits = $string[$i] . $string[$i + 1];
					$char = static::utf8($charbits);
					$return .= sprintf('\u%04s', dechex($char[0]));
					$i += 1;
					break;
				case (($ord & 0xF0) == 0xE0):
					if ($i + 2 >= $length) {
						$i += 2;
						$return .= '?';
						break;
					}
					$charbits = $string[$i] . $string[$i + 1] . $string[$i + 2];
					$char = static::utf8($charbits);
					$return .= sprintf('\u%04s', dechex($char[0]));
					$i += 2;
					break;
				case (($ord & 0xF8) == 0xF0):
					if ($i + 3 >= $length) {
						$i += 3;
						$return .= '?';
						break;
					}
					$charbits = $string[$i] . $string[$i + 1] . $string[$i + 2] . $string[$i + 3];
					$char = static::utf8($charbits);
					$return .= sprintf('\u%04s', dechex($char[0]));
					$i += 3;
					break;
				case (($ord & 0xFC) == 0xF8):
					if ($i + 4 >= $length) {
						$i += 4;
						$return .= '?';
						break;
					}
					$charbits = $string[$i] . $string[$i + 1] . $string[$i + 2] . $string[$i + 3] . $string[$i + 4];
					$char = static::utf8($charbits);
					$return .= sprintf('\u%04s', dechex($char[0]));
					$i += 4;
					break;
				case (($ord & 0xFE) == 0xFC):
					if ($i + 5 >= $length) {
						$i += 5;
						$return .= '?';
						break;
					}
					$charbits = $string[$i] . $string[$i + 1] . $string[$i + 2] . $string[$i + 3] . $string[$i + 4] . $string[$i + 5];
					$char = static::utf8($charbits);
					$return .= sprintf('\u%04s', dechex($char[0]));
					$i += 5;
					break;
			}
		}
		return $return;
	}

	/**
	 * Parse an options assoc array into a JavaScript object literal.
	 * Similar to object() but treats any non-integer value as a string,
	 * does not include `{ }`
	 *
	 * @param array $options Options to be converted
	 * @param array $safeKeys Keys that should not be escaped.
	 * @return string Parsed JSON options without enclosing { }.
	 */
	protected function _parseOptions($options, $safeKeys = []) {
		$out = [];
		$safeKeys = array_flip($safeKeys);
		foreach ($options as $key => $value) {
			if (!is_int($value) && !isset($safeKeys[$key])) {
				$value = $this->value($value);
			}
			$out[] = $key . ':' . $value;
		}
		sort($out);
		return implode(', ', $out);
	}

	/**
	 * Prepare callbacks and wrap them with function ([args]) { } as defined in
	 * _callbackArgs array.
	 *
	 * @param string $method Name of the method you are preparing callbacks for.
	 * @param array $options Array of options being parsed
	 * @param array $callbacks Additional Keys that contain callbacks
	 * @return array Array of options with callbacks added.
	 */
	protected function _prepareCallbacks($method, $options, $callbacks = []) {
		$wrapCallbacks = true;
		if (isset($options['wrapCallbacks'])) {
			$wrapCallbacks = $options['wrapCallbacks'];
		}
		unset($options['wrapCallbacks']);
		if (!$wrapCallbacks) {
			return $options;
		}
		$callbackOptions = [];
		if (isset($this->_callbackArguments[$method])) {
			$callbackOptions = $this->_callbackArguments[$method];
		}
		$callbacks = array_unique(array_merge(array_keys($callbackOptions), (array)$callbacks));

		foreach ($callbacks as $callback) {
			if (empty($options[$callback])) {
				continue;
			}
			$args = null;
			if (!empty($callbackOptions[$callback])) {
				$args = $callbackOptions[$callback];
			}
			$options[$callback] = 'function (' . $args . ') {' . $options[$callback] . '}';
		}
		return $options;
	}

	/**
	 * Convenience wrapper method for all common option processing steps.
	 * Runs _mapOptions, _prepareCallbacks, and _parseOptions in order.
	 *
	 * @param string $method Name of method processing options for.
	 * @param array $options Array of options to process.
	 * @return string Parsed options string.
	 */
	protected function _processOptions($method, $options) {
		//$mapOptions = $this->_mapOptions();
		$options = $this->_prepareCallbacks($method, $options);
		$options = $this->_parseOptions($options, array_keys($this->_callbackArguments[$method]));
		return $options;
	}

	/**
	 * Convert an array of data into a query string
	 *
	 * @param array $parameters Array of parameters to convert to a query string
	 * @return string Querystring fragment
	 */
	protected function _toQuerystring($parameters) {
		$out = '';
		$keys = array_keys($parameters);
		$count = count($parameters);
		for ($i = 0; $i < $count; $i++) {
			$out .= $keys[$i] . '=' . $parameters[$keys[$i]];
			if ($i < $count - 1) {
				$out .= '&';
			}
		}
		return $out;
	}

	/**
	 * Converts a multibyte character string
	 * to the decimal value of the character
	 *
	 * @param string $string String to convert.
	 * @return array
	 */
	protected static function utf8($string) {
		$map = [];
		$values = [];
		$find = 1;
		$length = strlen($string);
		for ($i = 0; $i < $length; $i++) {
			$value = ord($string[$i]);
			if ($value < 128) {
				$map[] = $value;
			} else {
				if (empty($values)) {
					$find = ($value < 224) ? 2 : 3;
				}
				$values[] = $value;
				if (count($values) === $find) {
					if ($find == 3) {
						$map[] = (($values[0] % 16) * 4096) + (($values[1] % 64) * 64) + ($values[2] % 64);
					} else {
						$map[] = (($values[0] % 32) * 64) + ($values[1] % 64);
					}
					$values = [];
					$find = 1;
				}
			}
		}
		return $map;
	}

}
