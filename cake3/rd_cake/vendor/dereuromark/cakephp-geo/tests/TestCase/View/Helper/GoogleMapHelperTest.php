<?php

namespace Geo\Test\View\Helper;

use Cake\Core\Configure;
use Cake\Core\Plugin;
use Cake\TestSuite\TestCase;
use Cake\View\View;
use Geo\View\Helper\GoogleMapHelper;

class GoogleMapHelperTest extends TestCase {

	/**
	 * @var \Geo\View\Helper\GoogleMapHelper
	 */
	protected $GoogleMap;

	/**
	 * @var \Cake\View\View
	 */
	protected $View;

	/**
	 * @return void
	 */
	public function setUp() {
		parent::setUp();

		Configure::delete('GoogleMap');

		$this->View = new View(null);
		$this->GoogleMap = new GoogleMapHelper($this->View);

		GoogleMapHelper::$mapCount = 0;
		GoogleMapHelper::$iconCount = 0;
		GoogleMapHelper::$infoContentCount = 0;
	}

	/**
	 * @return void
	 */
	public function testConfigMergeDefaults() {
		$config = [
			'zoom' => 0,
			'type' => 'foo',
		];
		$this->GoogleMap = new GoogleMapHelper($this->View, $config);

		$result = $this->GoogleMap->getConfig();
		$this->assertSame('foo', $result['map']['type']);
		$this->assertSame(0, $result['map']['zoom']);
	}

	/**
	 * @return void
	 */
	public function testConfigMergeDeep() {
		$config = [
			'map' => [
				'type' => 'foo',
			],
		];
		Configure::write('GoogleMap.key', 'abc');
		Configure::write('GoogleMap.zoom', 0);
		$this->GoogleMap = new GoogleMapHelper($this->View, $config);

		$result = $this->GoogleMap->getConfig();
		$this->assertSame('abc', $result['key']);
		$this->assertSame('foo', $result['map']['type']);
		$this->assertSame(0, $result['map']['zoom']);
	}

	/**
	 * @return void
	 */
	public function testApiUrl() {
		$result = $this->GoogleMap->apiUrl();
		$this->assertSame('//maps.google.com/maps/api/js?v=3', $result);

		$result = $this->GoogleMap->apiUrl(['foo' => '<b>Bar</b>']);
		$this->assertSame('//maps.google.com/maps/api/js?foo=%3Cb%3EBar%3C%2Fb%3E&v=3', $result);
	}

	/**
	 * @return void
	 */
	public function testIcon() {
		$result = $this->GoogleMap->icon('img/icon.png', ['size' => ['width' => 12, 'height' => 12]]);

		$this->assertSame(0, $result);

		$result = $this->GoogleMap->icon('//my-domain/img/icon.png', ['size' => ['width' => 12, 'height' => 12]]);

		$this->assertSame(1, $result);
	}

	/**
	 * @return void
	 */
	public function testMapUrl() {
		$url = $this->GoogleMap->mapUrl(['to' => 'Munich, Germany']);
		$this->assertEquals('//maps.google.com/maps?daddr=Munich%2C+Germany', $url);

		$url = $this->GoogleMap->mapUrl(['to' => '<München>, Germany', 'zoom' => 1]);
		$this->assertEquals('//maps.google.com/maps?daddr=%3CM%C3%BCnchen%3E%2C+Germany&amp;z=1', $url);
	}

	/**
	 * @return void
	 */
	public function testMapLink() {
		$result = $this->GoogleMap->mapLink('<To Munich>!', ['to' => '<Munich>, Germany', 'zoom' => 10]);
		$expected = '<a href="//maps.google.com/maps?daddr=%3CMunich%3E%2C+Germany&amp;z=10">&lt;To Munich&gt;!</a>';
		$this->assertEquals($expected, $result);
	}

	/**
	 * @return void
	 */
	public function testLinkWithMapUrl() {
		$url = $this->GoogleMap->mapUrl(['to' => '<München>, Germany', 'zoom' => 10, 'escape' => false]);
		$result = $this->GoogleMap->Html->link('Some title', $url);
		$expected = '<a href="//maps.google.com/maps?daddr=%3CM%C3%BCnchen%3E%2C+Germany&amp;z=10">Some title</a>';
		$this->assertEquals($expected, $result);
	}

	/**
	 * @return void
	 */
	public function testStaticPaths() {
		$m = [
			[
				'path' => ['Berlin', 'Stuttgart'],
				'color' => 'green',
			],
			[
				'path' => ['44.2,11.1', '43.1,12.2', '44.3,11.3', '43.3,12.3'],
			],
			[
				'path' => [['lat' => '48.1', 'lng' => '11.1'], ['lat' => '48.4', 'lng' => '11.2']], //'Frankfurt'
				'color' => 'red',
				'weight' => 10,
			],
		];

		$is = $this->GoogleMap->staticPaths($m);

		$options = [
			'paths' => $is,
		];
		$is = $this->GoogleMap->staticMapLink('My Title', $options);
		$expected = 'path=color:green|weight:5|Berlin|Stuttgart&amp;path=color:blue|weight:5|44.2,11.1|43.1,12.2|44.3,11.3|43.3,12.3&amp;path=color:red|weight:10|48.1,11.1|48.4,11.2';
		$this->assertTextContains($expected, $is);

		$is = $this->GoogleMap->staticMap($options);
		$this->assertTextContains($expected, $is);
	}

	/**
	 * Examples:
	 * http://maps.google.com/staticmap?size=500x500&maptype=hybrid&markers=color:red|label:S|48.3,11.2&sensor=false
	 * http://maps.google.com/maps/api/staticmap?size=512x512&maptype=roadmap&markers=color:blue|label:S|40.702147,-74.015794&markers=color:green|label:G|40.711614,-74.012318&markers=color:red|color:red|label:C|40.718217,-73.998284&sensor=false
	 *
	 * @return void
	 */
	public function testStaticMarkers() {
		$m = $this->markerElements = [
			[
				'address' => '44.3,11.2',
			],
			[
				'address' => '44.2,11.1',
			],
		];
		$is = $this->GoogleMap->staticMarkers($m, ['color' => 'red', 'char' => 'C', 'shadow' => 'false']);
		$expected = [
			'color:red|shadow:false|44.3%2C11.2',
			'color:red|shadow:false|44.2%2C11.1',
		];
		$this->assertSame($expected, $is);

		$options = [
			'markers' => $is,
		];
		$is = $this->GoogleMap->staticMap($options);
		$expected = 'markers=color:red|shadow:false|44.3%2C11.2&amp;markers=color:red|shadow:false|44.2%2C11.1';
		$this->assertTextContains($expected, $is);
	}

	/**
	 * @return void
	 */
	public function testStatic() {
		//echo '<h2>StaticMap</h2>';
		$m = [
			[
				'address' => 'Berlin',
				'color' => 'yellow',
				'char' => 'Z',
				'shadow' => 'true',
			],
			[
				'lat' => '44.2',
				'lng' => '11.1',
				'color' => '#0000FF',
				'char' => '1',
				'shadow' => 'false',
			],
		];

		$options = [
			'markers' => $this->GoogleMap->staticMarkers($m),
		];

		$is = $this->GoogleMap->staticMapUrl($options);
		$expected = '//maps.google.com/maps/api/staticmap?size=300x300&amp;format=png&amp;mobile=false&amp;maptype=roadmap&amp;markers=color:yellow|shadow:true|Berlin&amp;markers=color:0x0000FF|shadow:false|44.2%2C11.1';
		$this->assertSame($expected, $is);

		$is = $this->GoogleMap->staticMapLink('MyLink', $options);
		$expected = '<a href="//maps.google.com/maps/api/staticmap?size=300x300&amp;format=png&amp;mobile=false&amp;maptype=roadmap&amp;markers=color:yellow|shadow:true|Berlin&amp;markers=color:0x0000FF|shadow:false|44.2%2C11.1">MyLink</a>';
		$this->assertSame($expected, $is);

		$is = $this->GoogleMap->staticMap($options);
		$expected = 'size=300x300&amp;format=png&amp;';
		$this->assertTextContains($expected, $is);

		$options = [
			'size' => '200x100',
			'center' => true,
		];
		$is = $this->GoogleMap->staticMapLink('MyTitle', $options);
		$this->assertNotEmpty($is);

		$attr = [
			'title' => '<b>Yeah!</b>',
		];
		$is = $this->GoogleMap->staticMap($options, $attr);
		$expected = '<img src="//maps.google.com/maps/api/staticmap?size=200x100&amp;format=png&amp;mobile=false&amp;center=1&amp;maptype=roadmap" title="&lt;b&gt;Yeah!&lt;/b&gt;" alt="Map"/>';
		$this->assertSame($expected, $is);

		$pos = [
			['lat' => 48.1, 'lng' => '11.1'],
			['lat' => 48.2, 'lng' => '11.2'],
		];
		$options = [
			'markers' => $this->GoogleMap->staticMarkers($pos),
		];

		$attr = [
			'url' => $this->GoogleMap->mapUrl(['to' => 'Munich, Germany', 'zoom' => 10, 'escape' => false]),
		];
		$is = $this->GoogleMap->staticMap($options, $attr);
		$this->assertTextContains('href="//maps.google.com/maps?daddr=Munich%2C+Germany&amp;z=10"', $is);

		$url = $this->GoogleMap->mapUrl(['to' => 'Munich, Germany', 'zoom' => 10, 'escape' => false]);
		$attr = [
			'title' => 'Yeah',
		];
		$image = $this->GoogleMap->staticMap($options, $attr);
		$link = $this->GoogleMap->Html->link($image, $url, ['escapeTitle' => false, 'target' => '_blank']);
		$this->assertTextContains('href="//maps.google.com/maps?daddr=Munich%2C+Germany&amp;z=10" target="_blank"', $link);
		$this->assertTextContains('src="//maps.google.com/maps/api/staticmap?size=300x300&amp;format=png', $link);
	}

	/**
	 * @return void
	 */
	public function testStaticMapWithStaticMapUrl() {
		$markers = [];
		$markers[] = ['lat' => 48.2, 'lng' => 11.1, 'color' => 'red'];
		$mapMarkers = $this->GoogleMap->staticMarkers($markers);

		$staticMapUrl = $this->GoogleMap->staticMapUrl(['center' => 48 . ',' . 11, 'markers' => $mapMarkers, 'size' => '640x510', 'zoom' => 6]);
		$expected = '?size=640x510&amp;format=png&amp;mobile=false&amp;center=48%2C11&amp;zoom=6&amp;maptype=roadmap&amp;markers=color:red|shadow:true|48.2%2C11.1';
		$this->assertTextContains($expected, $staticMapUrl);
	}

	/**
	 * @return void
	 */
	public function testMarkerIcons() {
		$tests = [
			['green', null],
			['black', null],
			['purple', 'E'],
			['', 'Z'],
		];
		foreach ($tests as $test) {
			$is = $this->GoogleMap->iconSet($test[0], $test[1]);
			//echo $this->GoogleMap->Html->image($is['url']).BR;
		}
	}

	/**
	 * Test some basic map options
	 *
	 * @return void
	 */
	public function testMap() {
		$options = [
			'autoScript' => true,
			'zoom' => 0,
		];

		$result = $this->GoogleMap->map($options);

		$result .= $this->GoogleMap->script();

		$expected = '<div id="map_canvas" class="map"';
		$this->assertTextContains($expected, $result);

		$expected = '<script src="//maps.google.com/maps/api/js';
		$this->assertTextNotContains($expected, $result);

		$expected = 'var map0 = new google.maps.Map(document.getElementById("map_canvas"), myOptions);';
		$this->assertTextContains($expected, $result);

		$expected = 'zoom: 0,';
		$this->assertTextContains($expected, $result);

		$scripts = $this->View->fetch('script');
		$expected = '<script src="//maps.google.com/maps/api/js';
		$this->assertTextContains($expected, $scripts);
	}

	/**
	 * Test some basic map options
	 *
	 * @return void
	 */
	public function testMapInlineScript() {
		$options = [
			'autoScript' => true,
			//'inline' => true,
			'block' => false,
		];

		$result = $this->GoogleMap->map($options);

		$result .= $this->GoogleMap->script();

		$expected = '<div id="map_canvas" class="map"';
		$this->assertTextContains($expected, $result);

		$expected = '<script src="//maps.google.com/maps/api/js';
		$this->assertTextContains($expected, $result);
	}

	/**
	 * Test some basic map options
	 *
	 * @return void
	 */
	public function testMapStyles() {
		$styles = json_decode(file_get_contents(Plugin::path('Geo') . 'tests/test_files/Helper/shades_of_grey_style.json'), true);
		$options = [
			'map' => [
				'styles' => $styles,
			],
		];

		$this->GoogleMap->map($options);

		$result = $this->GoogleMap->script();
		$this->assertTextContains('{"featureType":"road.arterial","elementType":"geometry"', $result);
	}

	/**
	 * With default options
	 *
	 * @return void
	 */
	public function testDynamic() {
		//echo '<h2>Map 1</h2>';
		//echo '<script src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>';
		//echo $this->GoogleMap->map($defaul, array('style'=>'width:100%; height: 800px'));
		//echo '<script src="'.$this->GoogleMap->apiUrl().'"></script>';
		//echo '<script src="'.$this->GoogleMap->gearsUrl().'"></script>';

		$options = [
			'zoom' => 6,
			'type' => 'R',
			'geolocate' => true,
			'div' => ['id' => 'someothers'],
			'map' => ['navOptions' => ['style' => 'SMALL'], 'typeOptions' => ['style' => 'HORIZONTAL_BAR', 'pos' => 'RIGHT_CENTER']],
		];
		$result = $this->GoogleMap->map($options);
		$this->GoogleMap->addMarker(['lat' => 48.69847, 'lng' => 10.9514, 'title' => 'Marker', 'content' => 'Some Html-<b>Content</b>', 'icon' => $this->GoogleMap->iconSet('green', 'E')]);

		$this->GoogleMap->addMarker(['lat' => 47.69847, 'lng' => 11.9514, 'title' => 'Marker2', 'content' => 'Some more Html-<b>Content</b>']);

		$this->GoogleMap->addMarker(['lat' => 47.19847, 'lng' => 11.1514, 'title' => 'Marker3']);

		/*
		$options = array(
		'lat'=>48.15144,
		'lng'=>10.198,
		'content'=>'Thanks for using this'
	);
		$this->GoogleMap->addInfoWindow($options);
		//$this->GoogleMap->addEvent();
		*/

		$result .= $this->GoogleMap->script();

		$this->assertTextContains('new google.maps.MarkerImage("https://www.google.com/mapfiles/marker_greenE.png"', $result);
		$this->assertTextContains('gWindowContents0.push("Some Html-<b>Content<\/b>");', $result);
	}

	/**
	 * More than 100 markers and it gets reaaally slow...
	 *
	 * @return void
	 */
	public function testDynamic2() {
		//echo '<h2>Map 2</h2>';
		$options = [
			'zoom' => 6, 'type' => 'H',
			'autoCenter' => true,
			'div' => ['id' => 'someother'], //'height'=>'111',
			'map' => ['typeOptions' => ['style' => 'DROPDOWN_MENU']],
		];
		//echo $this->GoogleMap->map($options);
		$this->GoogleMap->addMarker(['lat' => 47.69847, 'lng' => 11.9514, 'title' => 'MarkerMUC', 'content' => 'Some more Html-<b>Content</b>']);

		for ($i = 0; $i < 100; $i++) {
			$lat = mt_rand(46000, 54000) / 1000;
			$lng = mt_rand(2000, 20000) / 1000;
			$this->GoogleMap->addMarker(['id' => 'm' . ($i + 1), 'lat' => $lat, 'lng' => $lng, 'title' => 'Marker' . ($i + 1), 'content' => 'Lat: <b>' . $lat . '</b><br>Lng: <b>' . $lng . '</b>', 'icon' => 'http://google-maps-icons.googlecode.com/files/home.png']);
		}

		$js = "$('.mapAnchor').live('click', function() {
		var id = $(this).attr('rel');

		var match = matching[id];

		/*
		map.panTo(mapPoints[match]);
		mapMarkers[match].openInfoWindowHtml(mapWindows[match]);
		*/

		gInfoWindows1[0].setContent(gWindowContents1[match]);
		gInfoWindows1[0].open(map1, gMarkers1[match]);
	});";

		$this->GoogleMap->addCustom($js);

		//echo $this->GoogleMap->script();

		//echo '<a href="javascript:void(0)" class="mapAnchor" rel="m2">Marker2</a> ';
		//echo '<a href="javascript:void(0)" class="mapAnchor" rel="m3">Marker3</a>';
	}

	/**
	 * @return void
	 */
	public function testDynamic3() {
		//echo '<h2>Map with Directions</h2>';
		$options = [
			'zoom' => 5,
			'type' => 'H',
			'map' => [],
		];
		//echo $this->GoogleMap->map($options);

		$this->GoogleMap->addMarker(['lat' => 48.69847, 'lng' => 10.9514, 'content' => '<b>Bla</b>', 'title' => 'NoDirections']);

		$this->GoogleMap->addMarker(['lat' => 47.69847, 'lng' => 11.9514, 'title' => 'AutoToDirections', 'content' => '<b>Bla</b>', 'directions' => true]);

		$this->GoogleMap->addMarker(['lat' => 46.69847, 'lng' => 11.9514, 'title' => 'ManuelToDirections', 'content' => '<b>Bla</b>', 'directions' => ['to' => 'Munich, Germany']]);

		$this->GoogleMap->addMarker(['lat' => 45.69847, 'lng' => 11.9514, 'title' => 'ManuelFromDirections', 'content' => '<b>Bla</b>', 'directions' => ['from' => 'Munich, Germany']]);

		//echo $this->GoogleMap->script();
	}

}
