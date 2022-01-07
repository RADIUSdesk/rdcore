# GoogleMap Helper
Using Google Maps [API V3](https://developers.google.com/maps/documentation/javascript/reference/3.exp/).

## Adding the helper

Either in your View class or at runtime:
```php
$config = [
    'autoScript' => true,
];
$this->loadHelper('Geo.GoogleMap', $config);
```

Required (global) configs (as of 2016) are:
- key

You can easily configure this globally using Configure (e.g. config/app_local.php):
```
    'GoogleMap' => [
        'key' => 'your-api-key-here',
    ],
```
I recommend using a non-commited config file here (thus the `_local` suffix) as keys/passwords should not be version controlled.

Possible config options are:
- api: Uses v3 currently
- zoom: Uses the defaultZoom of 5 otherwise
- type: Defaults to roadmap
- block: Display defaults to true to append the generated JS to the "scripts" block
- https: Leave empty for auto detect
- map: Multiple map options
- staticMap: Multiple static map options
- div: Multiple div options
- marker: Multiple marker options
- infoWindow: Multiple info window options
- directions: Multiple directions options
- language
- geolocate

## Display a basic link to a map
```php
$link = $this->GoogleMap->mapLink('<To Munich>!', ['to' => '<Munich>, Germany']);
// Generates: <a href="http://maps.google.com/maps?daddr=%3CMunich%3E%2C+Germany">&lt;To Munich&gt;!</a>
```

## Display a static map
```php
$paths = [
    [
        'path' => ['Berlin', 'Stuttgart'], // Names
        'color' => 'green',
    ],
    [
        'path' => ['44.2,11.1', '43.1,12.2', '44.3,11.3', '43.3,12.3'], // Flat array of coordinates
    ],
    [
        'path' => [['lat' => '48.1', 'lng' => '11.1'], ['lat' => '48.4', 'lng' => '11.2']], // = 'Frankfurt'
        'color' => 'red',
        'weight' => 10
    ]
];

$options = [
    'paths' => $this->GoogleMap->staticPaths($paths)
];
$map = $this->GoogleMap->staticMap($options);
```

### Adding markers:
```php
$addresses = [
    [
        'address' => '44.3,11.2',
    ],
    [
        'address' => '44.2,11.1',
    ]
];
$options = ['color' => 'red', 'char' => 'C', 'shadow' => 'false'];

$markers = $this->GoogleMap->staticMarkers($addresses, $options);

$options = [
    'markers' => $markers
];
$map = $this->GoogleMap->staticMap($options);
```

### Display a static map link
In case you want to use JS to pop-up the image, you can use:
```php
$config = [
    'markers' => $mapMarkers, 
    'escape' => false,
];
$url = $this->GoogleMap->staticMapUrl($config);
echo $this->Html->link(__('Map'), ['title' => __('Map')]), $url);
```
Note that in this case you want to set `'escape' => false` to avoid double-encoding it, as the HtmlHelper already does this.


## Display a basic dynamic map
Make sure you either loaded your helper with autoScript enabled, or you manually add the apiUrl() to your scripts.

```php
$options = [
    'zoom' => 6,
    'type' => 'R',
    'geolocate' => true,
    'div' => ['id' => 'someothers'],
    'map' => ['navOptions' => ['style' => 'SMALL'], 'typeOptions' => ['style' => 'HORIZONTAL_BAR', 'pos' => 'RIGHT_CENTER']]
];
$map = $this->GoogleMap->map($options);

// You can echo it now anywhere, it does not matter if you add markers afterwards
echo $map;

// Let's add some markers
$this->GoogleMap->addMarker(['lat' => 48.69847, 'lng' => 10.9514, 'title' => 'Marker', 'content' => 'Some Html-<b>Content</b>', 'icon' => $this->GoogleMap->iconSet('green', 'E')]);

$this->GoogleMap->addMarker(['lat' => 47.69847, 'lng' => 11.9514, 'title' => 'Marker2', 'content' => 'Some more Html-<b>Content</b>']);

$this->GoogleMap->addMarker(['lat' => 47.19847, 'lng' => 11.1514, 'title' => 'Marker3']);

// Store the final JS in a HtmlHelper script block
$this->GoogleMap->finalize();
```
Don't forget to output the buffered JS at the end of your page, where also the other files are included (after all JS files are included!):
```html
echo $this->fetch('script');
```
This code snippet is usually already in your `layout.ctp` at the end of the body tag.

### Inline JS
Maybe you need inline JS instead, then you can call script() instead of finalize() directly:
```php
// Initialize
$map = $this->GoogleMap->map();

// Add markers and stuff
$this->GoogleMap->...

// Finalize
$map .= $this->GoogleMap->script();

// Output both together
echo $map;
```

In general it is advised to defer JS execution by putting it to the end of the HTML (body tag), though.

### Custom JS
With `->addCustom($js)` you can inject any custom JS to work alongside the google map helper code.
