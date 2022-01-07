<?php

namespace Geo\View\Helper;

use Cake\Core\Configure;
use Cake\Core\Exception\Exception;
use Cake\Routing\Router;
use Cake\Utility\Hash;
use Cake\View\Helper;
use Cake\View\View;
use Geo\View\Helper\JsBaseEngineTrait;

/**
 * This is a CakePHP helper that helps users to integrate GoogleMap v3
 * into their application by only writing PHP code. This helper depends on jQuery.
 *
 * Capable of resetting itself (full or partly) for multiple maps on a single view.
 *
 * CodeAPI: http://code.google.com/intl/de-DE/apis/maps/documentation/javascript/basics.html
 * Icons/Images: http://gmapicons.googlepages.com/home
 *
 * @author Rajib Ahmed
 * @author Mark Scherer
 * @link https://www.dereuromark.de/2010/12/21/googlemapsv3-cakephp-helper/
 * @license MIT License (http://www.opensource.org/licenses/mit-license.php)
 * @property \Cake\View\Helper\HtmlHelper $Html
 */
class GoogleMapHelper extends Helper {

	use JsBaseEngineTrait;

	const API = 'maps.google.com/maps/api/js';

	const STATIC_API = 'maps.google.com/maps/api/staticmap';

	/**
	 * @var int
	 */
	public static $mapCount = 0;

	/**
	 * @var int
	 */
	public static $markerCount = 0;

	/**
	 * @var int
	 */
	public static $iconCount = 0;

	/**
	 * @var int
	 */
	public static $infoWindowCount = 0;

	/**
	 * @var int
	 */
	public static $infoContentCount = 0;

	const TYPE_ROADMAP = 'R';

	const TYPE_HYBRID = 'H';

	const TYPE_SATELLITE = 'S';

	const TYPE_TERRAIN = 'T';

	/**
	 * @var string[]
	 */
	public $types = [
		self::TYPE_ROADMAP => 'ROADMAP',
		self::TYPE_HYBRID => 'HYBRID',
		self::TYPE_SATELLITE => 'SATELLITE',
		self::TYPE_TERRAIN => 'TERRAIN',
	];

	const TRAVEL_MODE_DRIVING = 'D';

	const TRAVEL_MODE_BICYCLING = 'B';

	const TRAVEL_MODE_TRANSIT = 'T';

	const TRAVEL_MODE_WALKING = 'W';

	/**
	 * @var string[]
	 */
	public $travelModes = [
		self::TRAVEL_MODE_DRIVING => 'DRIVING',
		self::TRAVEL_MODE_BICYCLING => 'BICYCLING',
		self::TRAVEL_MODE_TRANSIT => 'TRANSIT',
		self::TRAVEL_MODE_WALKING => 'WALKING',
	];

	/**
	 * Needed helpers
	 *
	 * @var array
	 */
	public $helpers = ['Html'];

	/**
	 * Google maker config instance variable
	 *
	 * @var array
	 */
	public $markers = [];

	/**
	 * @var array
	 */
	public $infoWindows = [];

	/**
	 * @var array
	 */
	public $infoContents = [];

	/**
	 * @var array
	 */
	public $icons = [];

	/**
	 * @var array
	 */
	public $matching = [];

	/**
	 * @var string
	 */
	public $map = '';

	/**
	 * @var string[]
	 */
	protected $_mapIds = []; // Remember already used ones (valid xhtml contains ids not more than once)

	/**
	 * Default settings
	 *
	 * @var array
	 */
	protected $_defaultConfig = [
		'zoom' => null, // global, both map and staticMap
		'lat' => null, // global, both map and staticMap
		'lng' => null, // global, both map and staticMap
		'api' => '3',
		'type' => self::TYPE_ROADMAP,
		'map' => [
			'api' => null,
			'zoom' => null,
			'lat' => null,
			'lng' => null,
			'type' => null,
			'streetViewControl' => false,
			'navigationControl' => true,
			'mapTypeControl' => true,
			'scaleControl' => true,
			'scrollwheel' => false,
			'keyboardShortcuts' => true,
			'typeOptions' => [],
			'navOptions' => [],
			'scaleOptions' => [],
			'defaultLat' => 51, // only last fallback, use Configure::write('Google.lat', ...); to define own one
			'defaultLng' => 11, // only last fallback, use Configure::write('Google.lng', ...); to define own one
			'defaultZoom' => 5,
		],
		'staticMap' => [
			'size' => '300x300',
			'format' => 'png',
			'mobile' => false,
			//'shadow' => true // for icons
		],
		'geolocate' => false,
		'language' => null,
		'region' => null,
		'showMarker' => true,
		//'showInfoWindow' => true,
		'infoWindow' => [
			'content' => '',
			'useMultiple' => false, // Using single infowindow object for all
			'maxWidth' => 300,
			'lat' => null,
			'lng' => null,
			'pixelOffset' => 0,
			'zIndex' => 200,
			'disableAutoPan' => false,
		],
		'marker' => [
			//'autoCenter' => true,
			'animation' => null, // BOUNCE or DROP  https://developers.google.com/maps/documentation/javascript/3.exp/reference#Animation
			'icon' => null, // => default (red marker) //http://google-maps-icons.googlecode.com/files/home.png
			'title' => null,
			'shadow' => null,
			'shape' => null,
			'zIndex' => null,
			'draggable' => false,
			'cursor' => null,
			'directions' => false, // add form with directions
			'open' => false, // New in 1.5
		],
		'div' => [
			'id' => 'map_canvas',
			'width' => '100%',
			'height' => '400px',
			'class' => 'map',
			'escape' => true,
		],
		'event' => [
		],
		'animation' => [
			//TODO
		],
		'polyline' => [
			'color' => '#FF0000',
			'opacity' => 1.0,
			'weight' => 2,
		],
		'directions' => [
			'travelMode' => self::TRAVEL_MODE_DRIVING,
			'unitSystem' => 'METRIC',
			'directionsDiv' => null,
		],
		'callbacks' => [
			'geolocate' => null, //TODO
		],
		'plugins' => [
			'keydragzoom' => false, // http://google-maps-utility-library-v3.googlecode.com/svn/tags/keydragzoom/
			'markermanager' => false, // http://google-maps-utility-library-v3.googlecode.com/svn/tags/markermanager/
			'markercluster' => false, // http://google-maps-utility-library-v3.googlecode.com/svn/tags/markerclusterer/
		],
		'autoCenter' => false, // try to fit all markers in (careful, all zooms values are omitted)
		'autoScript' => false, // let the helper include the necessary js script links
		'block' => true, // for scripts
		'localImages' => false,
		'https' => null, // auto detect
		'key' => null,
	];

	/**
	 * @var array
	 */
	protected $_runtimeConfig = [];

	/**
	 * @var bool
	 */
	protected $_apiIncluded = false;

	/**
	 * @var bool
	 */
	protected $_gearsIncluded = false;

	/**
	 * @var bool
	 */
	protected $_located = false;

	/**
	 * @param \Cake\View\View $View
	 * @param array $config
	 */
	public function __construct(View $View, array $config = []) {
		parent::__construct($View, $config);
	}

	/**
	 * @param array $config
	 * @return void
	 */
	public function initialize(array $config) {
		parent::initialize($config);

		$defaultConfig = Hash::merge($this->_defaultConfig, (array)Configure::read('GoogleMap'));
		$config = Hash::merge($defaultConfig, $config);

		if (isset($config['api']) && !isset($config['map']['api'])) {
			$config['map']['api'] = $config['api'];
		}
		if (isset($config['zoom']) && !isset($config['map']['zoom'])) {
			$config['map']['zoom'] = $config['zoom'];
		}
		if (isset($config['lat']) && !isset($config['map']['lat'])) {
			$config['map']['lat'] = $config['lat'];
		}
		if (isset($config['lng']) && !isset($config['map']['lng'])) {
			$config['map']['lng'] = $config['lng'];
		}
		if (isset($config['type']) && !isset($config['map']['type'])) {
			$config['map']['type'] = $config['type'];
		}
		if (isset($config['size'])) {
			$config['div']['width'] = $config['size']['width'];
			$config['div']['height'] = $config['size']['height'];
		}
		if (isset($config['staticSize'])) {
			$config['staticMap']['size'] = $config['staticSize'];
		}
		// the following are convenience defaults - if not available the map lat/lng/zoom defaults will be used
		if (isset($config['staticZoom'])) {
			$config['staticMap']['zoom'] = $config['staticZoom'];
		}
		if (isset($config['staticLat'])) {
			$config['staticMap']['lat'] = $config['staticLat'];
		}
		if (isset($config['staticLng'])) {
			$config['staticMap']['lng'] = $config['staticLng'];
		}
		if (isset($config['localImages'])) {
			if ($config['localImages'] === true) {
				$config['localImages'] = Router::url('/img/google_map/', true);
			}
		}

		// BC
		if (!empty($config['inline'])) {
			trigger_error('Deprecated inline option, use block instead.', E_USER_DEPRECATED);
			$config['block'] = null;
		}

		$this->_config = $config;
		$this->_runtimeConfig = $this->_config;
	}

	/**
	 * JS maps.google API url.
	 *
	 * Options read via configs
	 * - key
	 * - api
	 * - language (iso2: en, de, ja, ...)
	 *
	 * You can adds more after the URL like "&key=value&..." via
	 * - query string array: additional query strings (e.g. callback for deferred execution - not supported yet by this helper)
	 *
	 * @param array $query
	 * @return string Full URL
	 */
	public function apiUrl(array $query = []) {
		$url = $this->_protocol() . static::API;

		if ($this->_runtimeConfig['map']['api']) {
			 $query['v'] = $this->_runtimeConfig['map']['api'];
		}
		if ($this->_runtimeConfig['key']) {
			$query['key'] = $this->_runtimeConfig['key'];
		}

		if ($this->_runtimeConfig['language']) {
			$query['language'] = $this->_runtimeConfig['language'];
		}

		if ($query) {
			$query = http_build_query($query);

			$url .= '?' . $query;
		}

		return $url;
	}

	/**
	 * @deprecated
	 * @return string
	 */
	public function gearsUrl() {
		$this->_gearsIncluded = true;
		$url = $this->_protocol() . 'code.google.com/apis/gears/gears_init.js';
		return $url;
	}

	/**
	 * @return string currentMapObject
	 */
	public function name() {
		return 'map' . static::$mapCount;
	}

	/**
	 * @return string currentContainerId
	 */
	public function id() {
		return $this->_runtimeConfig['div']['id'];
	}

	/**
	 * Make it possible to include multiple maps per page
	 * resets markers, infoWindows etc
	 *
	 * @param bool $full true=optionsAsWell
	 * @return void
	 */
	public function reset($full = true) {
		static::$markerCount = static::$infoWindowCount = 0;
		$this->markers = $this->infoWindows = [];
		if ($full) {
			$this->_runtimeConfig = $this->_config;
		}
	}

	/**
	 * Set the controls of current map
	 *
	 * Control options
	 * - zoom, scale, overview: TRUE/FALSE
	 *
	 * - map: FALSE, small, large
	 * - type: FALSE, normal, menu, hierarchical
	 * TIP: faster/shorter by using only the first character (e.g. "H" for "hierarchical")
	 *
	 * @param array $options
	 * @return void
	 */
	public function setControls(array $options = []) {
		if (isset($options['streetView'])) {
			$this->_runtimeConfig['map']['streetViewControl'] = $options['streetView'];
		}
		if (isset($options['zoom'])) {
			$this->_runtimeConfig['map']['scaleControl'] = $options['zoom'];
		}
		if (isset($options['scrollwheel'])) {
			$this->_runtimeConfig['map']['scrollwheel'] = $options['scrollwheel'];
		}
		if (isset($options['keyboardShortcuts'])) {
			$this->_runtimeConfig['map']['keyboardShortcuts'] = $options['keyboardShortcuts'];
		}
		if (isset($options['type'])) {
			$this->_runtimeConfig['map']['type'] = $options['type'];
		}
	}

	/**
	 * This the initialization point of the script
	 * Returns the div container you can echo on the website
	 *
	 * @param array $options associative array of settings are passed
	 * @return string divContainer
	 */
	public function map(array $options = []) {
		$this->reset();
		$this->_runtimeConfig = Hash::merge($this->_runtimeConfig, $options);
		$this->_runtimeConfig['map'] = $options + $this->_runtimeConfig['map'];

		if (!isset($this->_runtimeConfig['map']['lat']) || !isset($this->_runtimeConfig['map']['lng'])) {
			$this->_runtimeConfig['map']['lat'] = $this->_runtimeConfig['map']['defaultLat'];
			$this->_runtimeConfig['map']['lng'] = $this->_runtimeConfig['map']['defaultLng'];
		}
		if (!isset($this->_runtimeConfig['map']['zoom'])) {
			$this->_runtimeConfig['map']['zoom'] = $this->_runtimeConfig['map']['defaultZoom'];
		}

		$result = '';

		// autoinclude js?
		if ($this->_runtimeConfig['autoScript'] && !$this->_apiIncluded) {
			$res = $this->Html->script($this->apiUrl(), ['block' => $this->_runtimeConfig['block']]);
			$this->_apiIncluded = true;

			if (!$this->_runtimeConfig['block']) {
				$result .= $res . PHP_EOL;
			}
			// usually already included
			//http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js
		}
		// still not very common: http://code.google.com/intl/de-DE/apis/maps/documentation/javascript/basics.html
		/*
		if (false && !empty($this->_runtimeConfig['autoScript']) && !$this->_gearsIncluded) {
			$res = $this->Html->script($this->gearsUrl(), ['block' => $this->_runtimeConfig['block']]);
			if (!$this->_runtimeConfig['block']) {
				$result .= $res . PHP_EOL;
			}
		}
		*/

		$map = "
			var initialLocation = " . $this->_initialLocation() . ";
			var browserSupportFlag = new Boolean();
			var myOptions = " . $this->_mapOptions() . ";

			// deprecated
			gMarkers" . static::$mapCount . " = new Array();
			gInfoWindows" . static::$mapCount . " = new Array();
			gWindowContents" . static::$mapCount . " = new Array();
		";

		#rename "map_canvas" to "map_canvas1", ... if multiple maps on one page
		while (in_array($this->_runtimeConfig['div']['id'], $this->_mapIds, true)) {
			$this->_runtimeConfig['div']['id'] .= '-1'; //TODO: improve
		}
		$this->_mapIds[] = $this->_runtimeConfig['div']['id'];

		$map .= "
			var " . $this->name() . ' = new google.maps.Map(document.getElementById("' . $this->_runtimeConfig['div']['id'] . "\"), myOptions);
			";
		$this->map = $map;

		$this->_runtimeConfig['div']['style'] = '';
		if (is_numeric($this->_runtimeConfig['div']['width'])) {
			$this->_runtimeConfig['div']['width'] .= 'px';
		}
		if (is_numeric($this->_runtimeConfig['div']['height'])) {
			$this->_runtimeConfig['div']['height'] .= 'px';
		}

		$this->_runtimeConfig['div']['style'] .= 'width: ' . $this->_runtimeConfig['div']['width'] . ';';
		$this->_runtimeConfig['div']['style'] .= 'height: ' . $this->_runtimeConfig['div']['height'] . ';';
		unset($this->_runtimeConfig['div']['width']);
		unset($this->_runtimeConfig['div']['height']);

		$defaultText = isset($this->_runtimeConfig['content']) ? $this->_runtimeConfig['content'] : __('Map cannot be displayed!');
		$result .= $this->Html->tag('div', $defaultText, $this->_runtimeConfig['div']);

		return $result;
	}

	/**
	 * Generate a new LatLng object with the current lat and lng.
	 *
	 * @return string
	 */
	protected function _initialLocation() {
		if ($this->_runtimeConfig['map']['lat'] && $this->_runtimeConfig['map']['lng']) {
			return 'new google.maps.LatLng(' . $this->_runtimeConfig['map']['lat'] . ', ' . $this->_runtimeConfig['map']['lng'] . ')';
		}
		$this->_runtimeConfig['autoCenter'] = true;
		return 'false';
	}

	/**
	 * Add a marker to the map.
	 *
	 * Options:
	 * - lat and lng or address (to geocode on demand, not recommended, though)
	 * - title, content, icon, directions, maxWidth, open (optional)
	 *
	 * Note, that you can only set one marker to "open" for single window mode.
	 * If you declare multiple ones, the last one will be the one shown as open.
	 *
	 * @param array $options
	 * @return mixed Integer marker count or boolean false on failure
	 * @throws \Cake\Core\Exception\Exception
	 */
	public function addMarker($options) {
		$defaults = $this->_runtimeConfig['marker'];
		if (isset($options['icon']) && is_array($options['icon'])) {
			$defaults = $options['icon'] + $defaults;
			unset($options['icon']);
		}
		$options += $defaults;

		$params = [];
		$params['map'] = $this->name();

		if (isset($options['title'])) {
			$params['title'] = json_encode($options['title']);
		}
		if (isset($options['icon'])) {
			$params['icon'] = $options['icon'];
			if (is_int($params['icon'])) {
				$params['icon'] = 'gIcons' . static::$mapCount . '[' . $params['icon'] . ']';
			} else {
				$params['icon'] = json_encode($params['icon']);
			}
		}
		if (isset($options['shadow'])) {
			$params['shadow'] = $options['shadow'];
			if (is_int($params['shadow'])) {
				$params['shadow'] = 'gIcons' . static::$mapCount . '[' . $params['shadow'] . ']';
			} else {
				$params['shadow'] = json_encode($params['shadow']);
			}
		}
		if (isset($options['shape'])) {
			$params['shape'] = $options['shape'];
		}
		if (isset($options['zIndex'])) {
			$params['zIndex'] = $options['zIndex'];
		}
		if (isset($options['animation'])) {
			$params['animation'] = 'google.maps.Animation.' . strtoupper($options['animation']);
		}

		// geocode if necessary
		if (!isset($options['lat']) || !isset($options['lng'])) {
			$this->map .= "
var geocoder = new google.maps.Geocoder();

function geocodeAddress(address) {
	geocoder.geocode({'address': address}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {

			x" . static::$markerCount . " = new google.maps.Marker({
				position: results[0].geometry.location,
				" . $this->_toObjectParams($params, false, false) . "
			});
			gMarkers" . static::$mapCount . " .push(
				x" . static::$markerCount . "
			);
			return results[0].geometry.location;
		} else {
			//alert('Geocoding was not successful for the following reason: ' + status);
			return null;
		}
	});
}";
			if (!isset($options['address'])) {
				throw new Exception('Either use lat/lng or address to add a marker');
			}
			$position = 'geocodeAddress("' . h($options['address']) . '")';
		} else {
			$position = 'new google.maps.LatLng(' . $options['lat'] . ',' . $options['lng'] . ')';
		}

		$marker = "
			var x" . static::$markerCount . " = new google.maps.Marker({
				position: " . $position . ",
				" . $this->_toObjectParams($params, false, false) . "
			});
			gMarkers" . static::$mapCount . " .push(
				x" . static::$markerCount . "
			);
		";
		$this->map .= $marker;

		if (!empty($options['directions'])) {
			$options['content'] .= $this->_directions($options['directions'], $options);
		}

		// Fill popup windows
		if (!empty($options['content']) && $this->_runtimeConfig['infoWindow']['useMultiple']) {
			$x = $this->addInfoWindow(['content' => $options['content']]);
			$this->addEvent(static::$markerCount, $x, $options['open']);

		} elseif (!empty($options['content'])) {
			if (!isset($this->_runtimeConfig['marker']['infoWindow'])) {
				$this->_runtimeConfig['marker']['infoWindow'] = $this->addInfoWindow();
			}

			$x = $this->addInfoContent($options['content']);
			$event = "
			gInfoWindows" . static::$mapCount . '[' . $this->_runtimeConfig['marker']['infoWindow'] . ']. setContent(gWindowContents' . static::$mapCount . '[' . $x . "]);
			gInfoWindows" . static::$mapCount . '[' . $this->_runtimeConfig['marker']['infoWindow'] . '].open(' . $this->name() . ', gMarkers' . static::$mapCount . '[' . $x . "]);
			";
			$this->addCustomEvent(static::$markerCount, $event);

			if (!empty($options['open'])) {
				$this->addCustom($event);
			}
		}

		// Custom matching event?
		if (isset($options['id'])) {
			$this->matching[$options['id']] = static::$markerCount;
		}

		return static::$markerCount++;
	}

	/**
	 * Build directions form (type get) for directions inside infoWindows
	 *
	 * Options for directions (if array)
	 * - label
	 * - submit
	 * - escape: defaults to true
	 *
	 * @param mixed $directions
	 * - bool TRUE for autoDirections (using lat/lng)
	 * @param array $markerOptions
	 * - options array of marker for autoDirections etc (optional)
	 * @return string HTML
	 */
	protected function _directions($directions, array $markerOptions = []) {
		$options = [
			'from' => null,
			'to' => null,
			'label' => __('Enter your address'),
			'submit' => __('Get directions'),
			'escape' => true,
			'zoom' => null, // auto
		];
		if ($directions === true) {
			$options['to'] = $markerOptions['lat'] . ',' . $markerOptions['lng'];
		} elseif (is_array($directions)) {
			$options = $directions + $options;
		}
		if (empty($options['to']) && empty($options['from'])) {
			return '';
		}
		$form = '<form action="https://maps.google.com/maps" method="get" target="_blank">';
		$form .= $options['escape'] ? h($options['label']) : $options['label'];
		if (!empty($options['from'])) {
			$form .= '<input type="hidden" name="saddr" value="' . $options['from'] . '" />';
		} else {
			$form .= '<input type="text" name="saddr" />';
		}
		if (!empty($options['to'])) {
			$form .= '<input type="hidden" name="daddr" value="' . $options['to'] . '" />';
		} else {
			$form .= '<input type="text" name="daddr" />';
		}
		if (isset($options['zoom'])) {
			$form .= '<input type="hidden" name="z" value="' . $options['zoom'] . '" />';
		}
		$form .= '<input type="submit" value="' . $options['submit'] . '" />';
		$form .= '</form>';

		return '<div class="directions">' . $form . '</div>';
	}

	/**
	 * @param string $content
	 * @return int Current marker counter
	 */
	public function addInfoContent($content) {
		$this->infoContents[static::$markerCount] = $this->escapeString($content);
		$event = "
			gWindowContents" . static::$mapCount . '.push(' . $this->escapeString($content) . ");
			";
		$this->addCustom($event);

		//TODO: own count?
		return static::$markerCount;
	}

	/**
	 * @var array
	 */
	public $setIcons = [
		'color' => 'https://www.google.com/mapfiles/marker%s.png',
		'alpha' => 'https://www.google.com/mapfiles/marker%s%s.png',
		'numeric' => 'https://google-maps-icons.googlecode.com/files/%s%s.png',
		'special' => 'https://google-maps-icons.googlecode.com/files/%s.png',
	];

	/**
	 * Get a custom icon set
	 *
	 * @param string $color Color: green, red, purple, ... or some special ones like "home", ...
	 * @param string|null $char Char: A...Z or 0...20/100 (defaults to none)
	 * @param string $size Size: s, m, l (defaults to medium)
	 * NOTE: for special ones only first parameter counts!
	 * @return array Array(icon, shadow, shape, ...)
	 */
	public function iconSet($color, $char = null, $size = 'm') {
		$colors = ['red', 'green', 'yellow', 'blue', 'purple', 'white', 'black'];
		if (!in_array($color, $colors)) {
			$color = 'red';
		}

		if (!empty($this->_runtimeConfig['localImages'])) {
			$this->setIcons['color'] = $this->_runtimeConfig['localImages'] . 'marker%s.png';
			$this->setIcons['alpha'] = $this->_runtimeConfig['localImages'] . 'marker%s%s.png';
			$this->setIcons['numeric'] = $this->_runtimeConfig['localImages'] . '%s%s.png';
			$this->setIcons['special'] = $this->_runtimeConfig['localImages'] . '%s.png';
		}

		if (!empty($char)) {
			if ($color === 'red') {
				$color = '';
			} else {
				$color = '_' . $color;
			}
			$url = sprintf($this->setIcons['alpha'], $color, $char);
		} else {
			if ($color === 'red') {
				$color = '';
			} else {
				$color = '_' . $color;
			}
			$url = sprintf($this->setIcons['color'], $color);
		}

		/*
        var iconImage = new google.maps.MarkerImage('images/' + images[0] + ' .png',
            new google.maps.Size(iconData[images[0]].width, iconData[images[0]].height),
            new google.maps.Point(0,0),
            new google.maps.Point(0, 32)
        );

        var iconShadow = new google.maps.MarkerImage('images/' + images[1] + ' .png',
            new google.maps.Size(iconData[images[1]].width, iconData[images[1]].height),
            new google.maps.Point(0,0),
            new google.maps.Point(0, 32)
        );

        var iconShape = {
            coord: [1, 1, 1, 32, 32, 32, 32, 1],
            type: 'poly'
        };
        */

		$shadow = 'https://www.google.com/mapfiles/shadow50.png';
		$res = [
			'url' => $url,
			'icon' => $this->icon($url, ['size' => ['width' => 20, 'height' => 34]]),
			'shadow' => $this->icon($shadow, ['size' => ['width' => 37, 'height' => 34], 'shadow' => ['width' => 10, 'height' => 34]]),
		];
		return $res;
	}

	/**
	 * Generate icon array.
	 *
	 * custom icon: http://thydzik.com/thydzikGoogleMap/markerlink.php?text=?&color=FFFFFF
	 * custom icons: http://code.google.com/p/google-maps-icons/wiki/NumericIcons#Lettered_Balloons_from_A_to_Z,_in_10_Colors
	 * custom shadows: http://www.cycloloco.com/shadowmaker/shadowmaker.htm
	 *
	 * @param string $image Image Url (http://...)
	 * @param string|null $shadow ShadowImage Url (http://...)
	 * @param array $imageOptions Image options
	 * @param array $shadowOptions Shadow image options
	 * @return array Resulting array
	 */
	public function addIcon($image, $shadow = null, array $imageOptions = [], array $shadowOptions = []) {
		$res = ['url' => $image];
		$res['icon'] = $this->icon($image, $imageOptions);
		if ($shadow) {
			$last = $this->_iconRemember[$res['icon']];
			if (!isset($shadowOptions['anchor'])) {
				$shadowOptions['anchor'] = [];
			}
			$shadowOptions['anchor'] = $last['options']['anchor'] + $shadowOptions['anchor'];

			$res['shadow'] = $this->icon($shadow, $shadowOptions);
		}
		return $res;
	}

	/**
	 * @var array
	 */
	protected $_iconRemember = [];

	/**
	 * Generate icon object
	 *
	 * @param string $url (required)
	 * @param array $options (optional):
	 * - size: array(width=>x, height=>y)
	 * - origin: array(width=>x, height=>y)
	 * - anchor: array(width=>x, height=>y)
	 * @return int Icon count
	 */
	public function icon($url, array $options = []) {
		// The shadow image is larger in the horizontal dimension
		// while the position and offset are the same as for the main image.
		if (empty($options['size'])) {
			// We will deprecate this in the future maybe as this is super slow!
			//trigger_error('Please specify size manually [width => ..., height => ...] for performance reasons.', E_USER_DEPRECATED);
			if (!empty($options['imagePath'])) {
				$path = realpath($options['imagePath']);
			} else {
				$path = $url;
				if (!preg_match('#^((https?://)|//)#i', $path)) {
					// This should also be avoided but is still way faster than the URL lookup.
					$path = WWW_ROOT . ltrim($url, '/');
				}
			}
			$data = [];
			if ($path) {
				$data = getimagesize($path);
			}
			if ($data) {
				$options['size']['width'] = $data[0];
				$options['size']['height'] = $data[1];
			} else {
				$options['size']['width'] = $options['size']['height'] = 0;
			}
		}
		if (empty($options['anchor'])) {
			$options['anchor']['width'] = (int)($options['size']['width'] / 2);
			$options['anchor']['height'] = $options['size']['height'];
		}
		if (empty($options['origin'])) {
			$options['origin']['width'] = $options['origin']['height'] = 0;
		}
		if (isset($options['shadow'])) {
			$options['anchor'] = $options['shadow'];
		}

		$icon = 'new google.maps.MarkerImage("' . $url . '",
	new google.maps.Size(' . $options['size']['width'] . ', ' . $options['size']['height'] . '),
	new google.maps.Point(' . $options['origin']['width'] . ', ' . $options['origin']['height'] . '),
	new google.maps.Point(' . $options['anchor']['width'] . ', ' . $options['anchor']['height'] . ')
)';
		$this->icons[static::$iconCount] = $icon;
		$this->_iconRemember[static::$iconCount] = ['url' => $url, 'options' => $options, 'id' => static::$iconCount];
		return static::$iconCount++;
	}

	/**
	 * Creates a new InfoWindow.
	 *
	 * @param array $options
	 * - lat, lng, content, maxWidth, pixelOffset, zIndex
	 * @return int windowCount
	 */
	public function addInfoWindow(array $options = []) {
		$defaults = $this->_runtimeConfig['infoWindow'];
		$options += $defaults;

		if (!empty($options['lat']) && !empty($options['lng'])) {
			$position = 'new google.maps.LatLng(' . $options['lat'] . ', ' . $options['lng'] . ')';
		} else {
			$position = ' ' . $this->name() . ' .getCenter()';
		}

		$windows = "
			gInfoWindows" . static::$mapCount . ".push(new google.maps.InfoWindow({
					position: {$position},
					content: " . $this->escapeString($options['content']) . ",
					maxWidth: {$options['maxWidth']},
					pixelOffset: {$options['pixelOffset']}
					/*zIndex: {$options['zIndex']},*/
			}));
			";
		$this->map .= $windows;
		return static::$infoWindowCount++;
	}

	/**
	 * Add event to open marker on click.
	 *
	 * @param int $marker
	 * @param int $infoWindow
	 * @param bool $open Also open it right away.
	 * @return void
	 */
	public function addEvent($marker, $infoWindow, $open = false) {
		$this->map .= "
			google.maps.event.addListener(gMarkers" . static::$mapCount . "[{$marker}], 'click', function() {
				gInfoWindows" . static::$mapCount . "[$infoWindow].open(" . $this->name() . ", this);
			});
		";
		if ($open) {
			$event = 'gInfoWindows' . static::$mapCount . "[$infoWindow].open(" . $this->name() .
				', gMarkers' . static::$mapCount . '[' . $marker . ']);';
			$this->addCustom($event);
		}
	}

	/**
	 * Add a custom event for a marker on click.
	 *
	 * @param int $marker
	 * @param string $event (js)
	 * @return void
	 */
	public function addCustomEvent($marker, $event) {
		$this->map .= "
			google.maps.event.addListener(gMarkers" . static::$mapCount . "[{$marker}], 'click', function() {
				$event
			});
		";
	}

	/**
	 * Add custom JS.
	 *
	 * @param string $js Custom JS
	 * @return void
	 */
	public function addCustom($js) {
		$this->map .= $js;
	}

	/**
	 * Add directions to the map.
	 *
	 * @param array|string $from Location as array(fixed lat/lng pair) or string (to be geocoded at runtime)
	 * @param array|string $to Location as array(fixed lat/lng pair) or string (to be geocoded at runtime)
	 * @param array $options
	 * - directionsDiv: Div to place directions in text form
	 * - travelMode: TravelMode,
	 * - transitOptions: TransitOptions,
	 * - unitSystem: UnitSystem (IMPERIAL, METRIC, AUTO),
	 * - waypoints[]: DirectionsWaypoint,
	 * - optimizeWaypoints: Boolean,
	 * - provideRouteAlternatives: Boolean,
	 * - avoidHighways: Boolean,
	 * - avoidTolls: Boolean
	 * - region: String
	 * @see https://developers.google.com/maps/documentation/javascript/3.exp/reference#DirectionsRequest
	 * @return void
	 */
	public function addDirections($from, $to, array $options = []) {
		$id = 'd' . static::$markerCount++;
		$defaults = $this->_runtimeConfig['directions'];
		$options += $defaults;
		$travelMode = $this->travelModes[$options['travelMode']];

		$directions = "
			var {$id}Service = new google.maps.DirectionsService();
			var {$id}Display;
			{$id}Display = new google.maps.DirectionsRenderer();
			{$id}Display. setMap(" . $this->name() . ");
			";

		if (!empty($options['directionsDiv'])) {
			$directions .= "{$id}Display. setPanel(document.getElementById('" . $options['directionsDiv'] . "'));";
		}

		if (is_array($from)) {
			$from = 'new google.maps.LatLng(' . (float)$from['lat'] . ', ' . (float)$from['lng'] . ')';
		} else {
			$from = '"' . h($from) . '"';
		}
		if (is_array($to)) {
			$to = 'new google.maps.LatLng(' . (float)$to['lat'] . ', ' . (float)$to['lng'] . ')';
		} else {
			$to = '"' . h($to) . '"';
		}

		$directions .= "
			var request = {
				origin: $from,
				destination: $to,
				unitSystem: google.maps.UnitSystem." . $options['unitSystem'] . ",
				travelMode: google.maps.TravelMode. $travelMode
			};
			{$id}Service.route(request, function(result, status) {
				if (status == google.maps.DirectionsStatus.OK) {
					{$id}Display. setDirections(result);
				}
			});
		";
		$this->map .= $directions;
	}

	/**
	 * Add a polyline
	 *
	 * This method adds a line between 2 points
	 *
	 * @param array|string $from Location as array(fixed lat/lng pair) or string (to be geocoded at runtime)
	 * @param array|string $to Location as array(fixed lat/lng pair) or string (to be geocoded at runtime)
	 * @param array $options
	 * - color (#FFFFFF ... #000000)
	 * - opacity (0.1 ... 1, defaults to 1)
	 * - weight in pixels (defaults to 2)
	 * @see https://developers.google.com/maps/documentation/javascript/3.exp/reference#Polyline
	 * @return void
	 */
	public function addPolyline($from, $to, array $options = []) {
		if (is_array($from)) {
			$from = 'new google.maps.LatLng(' . (float)$from['lat'] . ', ' . (float)$from['lng'] . ')';
		} else {
			throw new Exception('not implemented yet, use array of lat/lng');
			//$from = '\'' . h($from) . '\'';
		}
		if (is_array($to)) {
			$to = 'new google.maps.LatLng(' . (float)$to['lat'] . ', ' . (float)$to['lng'] . ')';
		} else {
			throw new Exception('not implemented yet, use array of lat/lng');
			//$to = '\'' . h($to) . '\'';
		}

		$defaults = $this->_runtimeConfig['polyline'];
		$options += $defaults;

		$id = 'p' . static::$markerCount++;

		$polyline = "var start = $from;";
		$polyline .= "var end = $to;";
		$polyline .= "
				var poly = [
					start,
					end
				];
				var {$id}Polyline = new google.maps.Polyline({
					path: poly,
					strokeColor: '" . $options['color'] . "',
					strokeOpacity: " . $options['opacity'] . ",
					strokeWeight: " . $options['weight'] . "
				});
				{$id}Polyline.setMap(" . $this->name() . ");
			";
		$this->map .= $polyline;
	}

	/**
	 * @param string $content (html/text)
	 * @param int $index infoWindowCount
	 * @return void
	 */
	public function setContentInfoWindow($content, $index) {
		$this->map .= "
			gInfoWindows" . static::$mapCount . "[$index]. setContent(" . $this->escapeString($content) . ');';
	}

	/**
	 * Json encode string
	 *
	 * @param mixed $content
	 * @return string JSON
	 */
	public function escapeString($content) {
		return json_encode($content);
	}

	/**
	 * This method returns the javascript for the current map container.
	 * Including script tags.
	 * Just echo it below the map container. New: Alternativly, use finalize() directly.
	 *
	 * @return string
	 */
	public function script() {
		$script = '<script>
		' . $this->finalize(true) . '
</script>';
		return $script;
	}

	/**
	 * Finalize the map and write the javascript to the buffer.
	 * Make sure that your view does also output the buffer at some place!
	 *
	 * @param bool $return If the output should be returned instead
	 * @return string|null Javascript if $return is true
	 */
	public function finalize($return = false) {
		$script = $this->_arrayToObject('matching', $this->matching, false, true) . PHP_EOL;
		$script .= $this->_arrayToObject('gIcons' . static::$mapCount, $this->icons, false, false) . '

	jQuery(document).ready(function() {
		';

		$script .= $this->map;
		if ($this->_runtimeConfig['geolocate']) {
			$script .= $this->_geolocate();
		}

		if ($this->_runtimeConfig['showMarker'] && !empty($this->markers) && is_array($this->markers)) {
			$script .= implode($this->markers, ' ');
		}

		if ($this->_runtimeConfig['autoCenter']) {
			$script .= $this->_autoCenter();
		}
		$script .= '

	});';
		static::$mapCount++;
		if (!$return) {
			$this->Html->scriptBlock($script, ['block' => true]);

			return null;
		}

		return $script;
	}

	/**
	 * Set a custom geolocate callback
	 *
	 * @param string|bool $js Custom JS
	 * false: no callback at all
	 * @return void
	 */
	public function geolocateCallback($js) {
		if ($js === false) {
			$this->_runtimeConfig['callbacks']['geolocate'] = false;
			return;
		}
		$this->_runtimeConfig['callbacks']['geolocate'] = $js;
	}

	/**
	 * Experimental - works in cutting edge browsers like chrome10
	 *
	 * @return string
	 */
	protected function _geolocate() {
		return '
	// Try W3C Geolocation (Preferred)
	if (navigator.geolocation) {
		browserSupportFlag = true;
		navigator.geolocation.getCurrentPosition(function(position) {
			geolocationCallback(position.coords.latitude, position.coords.longitude);
		}, function() {
			handleNoGeolocation(browserSupportFlag);
		});
		// Try Google Gears Geolocation
	} else if (google.gears) {
		browserSupportFlag = true;
		var geo = google.gears.factory.create("beta.geolocation");
		geo.getCurrentPosition(function(position) {
			geolocationCallback(position.latitude, position.longitude);
		}, function() {
			handleNoGeoLocation(browserSupportFlag);
		});
		// Browser doesn\'t support Geolocation
	} else {
		browserSupportFlag = false;
		handleNoGeolocation(browserSupportFlag);
	}

	function geolocationCallback(lat, lng) {
		' . $this->_geolocationCallback() . '
	}

	function handleNoGeolocation(errorFlag) {
	if (errorFlag == true) {
		//alert("Geolocation service failed.");
	} else {
		//alert("Your browser doesn\'t support geolocation. We\'ve placed you in Siberia.");
	}
	//' . $this->name() . ' . setCenter(initialLocation);
	}
	';
	}

	/**
	 * @return string
	 */
	protected function _geolocationCallback() {
		if (($js = $this->_runtimeConfig['callbacks']['geolocate']) === false) {
			return '';
		}
		if ($js === null) {
			$js = 'initialLocation = new google.maps.LatLng(lat, lng);
		' . $this->name() . ' . setCenter(initialLocation);
';
		}
		return $js;
	}

	/**
	 * Auto center map
	 * careful: with only one marker this can result in too high zoom values!
	 *
	 * @return string autoCenterCommands
	 */
	protected function _autoCenter() {
		return '
		var bounds = new google.maps.LatLngBounds();
		$.each(gMarkers' . static::$mapCount . ',function (index, marker) { bounds.extend(marker.position);});
		' . $this->name() . ' .fitBounds(bounds);
		';
	}

	/**
	 * @return string JSON like js string
	 */
	protected function _mapOptions() {
		$options = $this->_runtimeConfig['map'] + $this->_runtimeConfig;

		$mapOptions = array_intersect_key($options, [
			'streetViewControl' => null,
			'navigationControl' => null,
			'mapTypeControl' => null,
			'scaleControl' => null,
			'scrollwheel' => null,
			'zoom' => null,
			'keyboardShortcuts' => null,
			'styles' => null,
		]);
		$res = [];
		foreach ($mapOptions as $key => $mapOption) {
			$res[] = $key . ': ' . $this->value($mapOption);
		}
		if (empty($options['autoCenter'])) {
			$res[] = 'center: initialLocation';
		}
		if (!empty($options['navOptions'])) {
			$res[] = 'navigationControlOptions: ' . $this->_controlOptions('nav', $options['navOptions']);
		}
		if (!empty($options['typeOptions'])) {
			$res[] = 'mapTypeControlOptions: ' . $this->_controlOptions('type', $options['typeOptions']);
		}
		if (!empty($options['scaleOptions'])) {
			$res[] = 'scaleControlOptions: ' . $this->_controlOptions('scale', $options['scaleOptions']);
		}

		if (array_key_exists($options['type'], $this->types)) {
			$type = $this->types[$options['type']];
		} else {
			$type = $options['type'];
		}
		$res[] = 'mapTypeId: google.maps.MapTypeId.' . $type;

		return '{' . implode(', ', $res) . '}';
	}

	/**
	 * @param string $type
	 * @param array $options
	 * @return string JSON like js string
	 */
	protected function _controlOptions($type, $options) {
		$mapping = [
			'nav' => 'NavigationControlStyle',
			'type' => 'MapTypeControlStyle',
			'scale' => '',
		];
		$res = [];
		if (!empty($options['style']) && ($m = $mapping[$type])) {
			$res[] = 'style: google.maps.' . $m . '.' . $options['style'];
		}
		if (!empty($options['pos'])) {
			$res[] = 'position: google.maps.ControlPosition.' . $options['pos'];
		}

		return '{' . implode(', ', $res) . '}';
	}

	/**
	 * Returns a maps.google link
	 *
	 * @param string $title  Link title
	 * @param array $mapOptions
	 * @param array $linkOptions
	 * @return string HTML link
	 */
	public function mapLink($title, $mapOptions = [], $linkOptions = []) {
		return $this->Html->link($title, $this->mapUrl($mapOptions + ['escape' => false]), $linkOptions);
	}

	/**
	 * Returns a maps.google url
	 *
	 * Options:
	 * - from: necessary (address or lat,lng)
	 * - to: 1x necessary (address or lat,lng - can be an array of multiple destinations: array('dest1', 'dest2'))
	 * - zoom: optional (defaults to none)
	 * - query: Additional query strings as array
	 * - escape: defaults to true
	 *
	 * @param array $options Options
	 * @return string link: http://...
	 */
	public function mapUrl(array $options = []) {
		$url = $this->_protocol() . 'maps.google.com/maps?';

		$urlArray = !empty($options['query']) ? $options['query'] : [];
		if (!empty($options['from'])) {
			$urlArray['saddr'] = $options['from'];
		}

		if (!empty($options['to']) && is_array($options['to'])) {
			$to = array_shift($options['to']);
			foreach ($options['to'] as $key => $value) {
				$to .= '+to:' . $value;
			}
			$urlArray['daddr'] = $to;
		} elseif (!empty($options['to'])) {
			$urlArray['daddr'] = $options['to'];
		}

		if (isset($options['zoom']) && $options['zoom'] !== false) {
			$urlArray['z'] = (int)$options['zoom'];
		}
		//$urlArray[] = 'f=d';
		//$urlArray[] = 'hl=de';
		//$urlArray[] = 'ie=UTF8';

		$options += [
			'escape' => true,
		];

		$query = http_build_query($urlArray);
		if ($options['escape']) {
			$query = h($query);
		}

		return $url . $query;
	}

	/**
	 * Creates a plain image map.
	 *
	 * @link http://code.google.com/intl/de-DE/apis/maps/documentation/staticmaps
	 * @param array $options Options
	 * - string $size [necessary: VALxVAL, e.g. 500x400 - max 640x640]
	 * - string $center: x,y or address [necessary, if no markers are given; else tries to take defaults if available] or TRUE/FALSE
	 * - int $zoom [optional; if no markers are given, default value is used; if set to "auto" and ]*
	 * - array $markers [optional, @see staticPaths() method]
	 * - string $type [optional: roadmap/hybrid, ...; default:roadmap]
	 * - string $mobile TRUE/FALSE
	 * - string $visible: $area (x|y|...)
	 * - array $paths [optional, @see staticPaths() method]
	 * - string $language [optional]
	 * @param array $attributes HTML attributes for the image
	 * - title
	 * - alt (defaults to 'Map')
	 * - url (tip: you can pass $this->link(...) and it will create a link to maps.google.com)
	 * @return string imageTag
	 */
	public function staticMap(array $options = [], array $attributes = []) {
		$defaultAttributes = ['alt' => __d('tools', 'Map')];
		$attributes += $defaultAttributes;

		// This was fixed in 3.5.1 to auto-escape URL query strings for security reasons
		$escape = version_compare(Configure::version(), '3.5.1') < 0 ? true : false;
		return $this->Html->image($this->staticMapUrl($options + ['escape' => $escape]), $attributes);
	}

	/**
	 * Create a link to a plain image map
	 *
	 * @param string $title Link title
	 * @param array $mapOptions
	 * @param array $linkOptions
	 * @return string HTML link
	 */
	public function staticMapLink($title, array $mapOptions = [], array $linkOptions = []) {
		return $this->Html->link($title, $this->staticMapUrl($mapOptions + ['escape' => false]), $linkOptions);
	}

	/**
	 * Creates a URL to a plain image map.
	 *
	 * Options:
	 * - escape: defaults to true (Deprecated as of CakePHP 3.5.1 and now has to be always false)
	 *
	 * @param array $options
	 * - see staticMap() for details
	 * @return string urlOfImage: http://...
	 */
	public function staticMapUrl(array $options = []) {
		$mapUrl = $this->_protocol() . static::STATIC_API;
		/*
		$params = array(
			'mobile' => 'false',
			'format' => 'png',
			//'center' => false
		);

		if (!empty($options['mobile'])) {
			$params['mobile'] = 'true';
		}
		*/

		$defaults = $this->_config['staticMap'] + $this->_config;

		$mapOptions = $options + $defaults;

		$params = array_intersect_key($mapOptions, [
			'mobile' => null,
			'format' => null,
			'size' => null,
			//'zoom' => null,
			//'lat' => null,
			//'lng' => null,
			//'visible' => null,
			//'type' => null,
		]);

		// add API key to parameters.
		if ($this->_runtimeConfig['key']) {
			$params['key'] = $this->_runtimeConfig['key'];
		}

		// do we want zoom to auto-correct itself?
		if (!isset($options['zoom']) && !empty($mapOptions['markers']) || !empty($mapOptions['paths']) || !empty($mapOptions['visible'])) {
			$options['zoom'] = 'auto';
		}

		// a position on the map that is supposed to stay visible at all cost
		if (!empty($mapOptions['visible'])) {
			$params['visible'] = urlencode($mapOptions['visible']);
		}

		// center and zoom are not necessary if path, visible or markers are given
		if (!isset($options['center']) || $options['center'] === false) {
			// dont use it
		} elseif ($options['center'] === true && $mapOptions['lat'] !== null && $mapOptions['lng'] !== null) {
			$params['center'] = urlencode((string)$mapOptions['lat'] . ',' . (string)$mapOptions['lng']);
		} elseif (!empty($options['center'])) {
			$params['center'] = urlencode($options['center']);
		} /*else {
			// try to read from markers array???
			if (isset($options['markers']) && count($options['markers']) == 1) {
				//pr ($options['markers']);
			}
		}*/

		if (!isset($options['zoom']) || $options['zoom'] === false) {
			// dont use it
		} else {
			if ($options['zoom'] === 'auto') {
				if (!empty($options['markers']) && strpos($options['zoom'], '|') !== false) {
					// let google find the best zoom value itself
				} else {
					// do something here?
				}
			} else {
				$params['zoom'] = $options['zoom'];
			}
		}

		if (array_key_exists($mapOptions['type'], $this->types)) {
			$params['maptype'] = $this->types[$mapOptions['type']];
		} else {
			$params['maptype'] = $mapOptions['type'];
		}
		$params['maptype'] = strtolower($params['maptype']);

		// old: {latitude},{longitude},{color}{alpha-character}
		// new: @see staticMarkers()
		if (!empty($options['markers'])) {
			$params['markers'] = $options['markers'];
		}

		if (!empty($options['paths'])) {
			$params['path'] = $options['paths'];
		}

		// valXval
		if (!empty($options['size'])) {
			$params['size'] = $options['size'];
		}

		$pieces = [];
		foreach ($params as $key => $value) {
			if (is_array($value)) {
				$value = implode('&' . $key . '=', $value);
			} elseif ($value === true) {
				$value = 'true';
			} elseif ($value === false) {
				$value = 'false';
			} elseif ($value === null) {
				continue;
			}
			$pieces[] = $key . '=' . $value;
		}

		$options += [
			'escape' => true,
		];
		$query = implode('&', $pieces);
		if ($options['escape']) {
			$query = h($query);
		}

		return $mapUrl . '?' . $query;
	}

	/**
	 * Prepare paths for staticMap
	 *
	 * @param array $pos PathElementArrays
	 * - elements: [required] (multiple array(lat=>x, lng=>y) or just a address strings)
	 * - color: red/blue/green (optional, default blue)
	 * - weight: numeric (optional, default: 5)
	 * @return array Array of paths: e.g: color:0x0000FF80|weight:5|37.40303,-122.08334|37.39471,-122.07201|37.40589,-122.06171{|...}
	 */
	public function staticPaths(array $pos = []) {
		$defaults = [
			'color' => 'blue',
			'weight' => 5, // pixel
		];

		// not a 2-level array? make it one
		if (!isset($pos[0])) {
			$pos = [$pos];
		}

		$res = [];
		foreach ($pos as $p) {
			$options = $p + $defaults;

			$markers = $options['path'];
			unset($options['path']);

			// prepare color
			if (!empty($options['color'])) {
				$options['color'] = $this->_prepColor($options['color']);
			}

			$path = [];
			foreach ($options as $key => $value) {
				$path[] = $key . ':' . urlencode($value);
			}
			foreach ($markers as $key => $pos) {
				if (is_array($pos)) {
					// lat/lng?
					$pos = $pos['lat'] . ',' . $pos['lng'];
				}
				$path[] = $pos;
			}
			$res[] = implode('|', $path);
		}
		return $res;
	}

	/**
	 * Prepare markers for staticMap
	 *
	 * @param array $pos markerArrays
	 * - lat: xx.xxxxxx (necessary)
	 * - lng: xx.xxxxxx (necessary)
	 * - address: (instead of lat/lng)
	 * - color: red/blue/green (optional, default blue)
	 * - label: a-z or numbers (optional, default: s)
	 * - icon: custom icon (png, gif, jpg - max 64x64 - max 5 different icons per image)
	 * - shadow: TRUE/FALSE
	 * @param array $style (global) (overridden by custom marker styles)
	 * - color
	 * - label
	 * - icon
	 * - shadow
	 * @return array markers: color:green|label:Z|48,11|Berlin
	 *
	 * NEW: size:mid|color:red|label:E|37.400465,-122.073003|37.437328,-122.159928&markers=size:small|color:blue|37.369110,-122.096034
	 * OLD: 40.702147,-74.015794,blueS|40.711614,-74.012318,greenG{|...}
	 */
	public function staticMarkers(array $pos = [], array $style = []) {
		$markers = [];
		$verbose = false;

		$defaults = [
			'shadow' => 'true',
			'color' => 'blue',
			'label' => '',
			'address' => '',
			'size' => '',
		];

		// not a 2-level array? make it one
		if (!isset($pos[0])) {
			$pos = [$pos];
		}

		// new in staticV2: separate styles! right now just merged
		foreach ($pos as $p) {
			$p += $style + $defaults;

			// adress or lat/lng?
			if (!empty($p['lat']) && !empty($p['lng'])) {
				$p['address'] = $p['lat'] . ',' . $p['lng'];
			}
			$p['address'] = urlencode($p['address']);

			$values = [];

			// prepare color
			if (!empty($p['color'])) {
				$p['color'] = $this->_prepColor($p['color']);
				$values[] = 'color:' . $p['color'];
			}
			// label? A-Z0-9
			if (!empty($p['label'])) {
				$values[] = 'label:' . strtoupper($p['label']);
			}
			if (!empty($p['size'])) {
				$values[] = 'size:' . $p['size'];
			}
			if (!empty($p['shadow'])) {
				$values[] = 'shadow:' . $p['shadow'];
			}
			if (!empty($p['icon'])) {
				$values[] = 'icon:' . urlencode($p['icon']);
			}
			$values[] = $p['address'];

			//TODO: icons
			$markers[] = implode('|', $values);
		}

		//TODO: shortcut? only possible if no custom params!
		/*
		if ($verbose) {

		}
		*/
		// long: markers=styles1|address1&markers=styles2|address2&...
		// short: markers=styles,address1|address2|address3|...

		return $markers;
	}

	/**
	 * Ensure that we stay on the appropriate protocol
	 *
	 * @return string protocol base (including ://)
	 */
	protected function _protocol() {
		$https = $this->_runtimeConfig['https'];
		if ($https === null) {
			$https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on';
		}
		return $https ? 'https://' : '//';
	}

	/**
	 * // to 0x
	 * or // added
	 *
	 * @param string $color Color: FFFFFF, #FFFFFF, 0xFFFFFF or blue
	 * @return string Color
	 */
	protected function _prepColor($color) {
		if (strpos($color, '#') !== false) {
			return str_replace('#', '0x', $color);
		}
		if (is_numeric($color)) {
			return '0x' . $color;
		}
		return $color;
	}

	/**
	 * @param string $name
	 * @param array $array
	 * @param bool $asString
	 * @param bool $keyAsString
	 * @return string
	 */
	protected function _arrayToObject($name, $array, $asString = true, $keyAsString = false) {
		$res = 'var ' . $name . ' = {' . PHP_EOL;
		$res .= $this->_toObjectParams($array, $asString, $keyAsString);
		$res .= '};';
		return $res;
	}

	/**
	 * @param array $array
	 * @param bool $asString
	 * @param bool $keyAsString
	 * @return string
	 */
	protected function _toObjectParams($array, $asString = true, $keyAsString = false) {
		$pieces = [];
		foreach ($array as $key => $value) {
			$e = ($asString && strpos($value, 'new ') !== 0 ? '"' : '');
			$ke = ($keyAsString ? '"' : '');
			$pieces[] = $ke . $key . $ke . ': ' . $e . $value . $e;
		}
		return implode(',' . PHP_EOL, $pieces);
	}

}
