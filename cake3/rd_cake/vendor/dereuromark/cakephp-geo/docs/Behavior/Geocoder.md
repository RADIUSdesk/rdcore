# Geocoder Behavior
Geocode your entity data.

## Adding the behavior

Either in your Table class or at runtime:
```php
$this->addBehavior('Geo.Geocoder', $config);
```

Possible config options are:
- apiKey (mandatory for some providers)
- locale (for example DE)
- region (for some providers
- ssl (for some providers)
- address: (array|string, optional) set to the field name that contains the string from where to generate the slug, or a set of field names to concatenate for generating the slug.
- overwrite: lat/lng overwrite on changes, defaults to false
- update: what fields to update (key=>value array pairs)
- on: beforeMarshall/beforeSave (defaults to beforeSave) - Set to false if you only want to use the validation rules etc
- unit: defaults to km
- allowInconclusive: False to throw exception
- minAccuracy: `Geocoder::TYPE_*` constants
- expect: (array)postal_code, locality, sublocality, ...
- addressFormat: Defaults to `'%S %n, %z %L'`

Note that it is usually better to set global configs in your `app.php` using the `Geocoder` key.

## Configure your own geocoder
By default it will use the GoogleMaps provider.

Please see [willdurand/geocoder](https://github.com/geocoder-php/Geocoder) library on what other providers you can use out of the box.
You can chose from
- 12+ address-based Geocoder providers
- 10+ IP-based Geocoder providers

You could easily switch to an IP based provider like this:
```php
// in your app.php config
'Geocoder' => [
    'provider' => '\Geocoder\Provider\FreeGeoIp',
],
```

Let's say you want to switch to OpenStreetMap and also use a different HTTP adapter:
```php
// in your app.php config
'Geocoder' => [
    'provider' => function () {
        return new \Geocoder\Provider\OpenStreetMap(new \Ivory\HttpAdapter\BuzzHttpAdapter());
    }
],
```

Note: Don't forget that most providers need an apiKey to work.

## Saving geocodable data

Storing lat/lng on save() is automatically done when the `address` field is defined and found when saving.
```php
// $address contains address with value `Berlin`
$this->Addresses->save($address);

// These should be both set now
$lat = $address->lat;
$lng = $address->lng;
```

You can always manually call `geocode()` as well, of course:
```php
$address = $this->Addresses->get($id);
// $address contains address with value `Berlin`
$this->Addresses->geocode($address);

// These should be both set now
$lat = $address->lat;
$lng = $address->lng;
```

## Pagination and distance

We want to find all addresses within a distance of 200 km of the given lat/lng:
```php
// In a controller action
$options = ['lat' => 13.3, 'lng' => 19.2, 'distance' => 200];

$query = $this->Addresses->find('distance', $options);
$query->order(['distance' => 'ASC']);

$addresses = $this->paginate($query)
```
They will be ordered by `['distance' => 'ASC']`, so all records with the smallest distances first.

Note that you need to first geocode all your data. On the fly geocoding is not an option for pagination and larger data-sets.

## Batch geocoding

You can look into the [Tools.Reset behavior](https://github.com/dereuromark/cakephp-tools/blob/master/src/Model/Behavior/ResetBehavior.php) and wrap the following in a CakePHP Shell command:
```php
// Geocoder behavior must already be added to the Table class object
$addressTable->addBehavior('Tools.Reset', $config);
$addressTable->resetRecords();
```
This will loop over all records as a batch script and update all lat/lng values.
You should set a scope for performance reasons. Maybe update only every record older than x months, or those that have lat/lng values of `null` to avoid
re-geocoding. And of course you should timeout your batch runs, most providers only allow y requests per minute. Better don't over-request to avoid penalties.

## Validate lat/lng

The methods `validateLatitude()` and `validateLongitude()` can be used to validate the range of those input values in your validation rules.
Don't forget to set `'provider' => 'table'` in this case.

## Backend
If you include the routes, you have an admin backend for the geocoding as well as the stored geocoded addresses (cache):

    /admin/geo

You can test the geocoding and also remove cache data where needed.

[Tools](https://github.com/dereuromark/cakephp-tools) plugin is a recommended dependency here, but not necessary.
