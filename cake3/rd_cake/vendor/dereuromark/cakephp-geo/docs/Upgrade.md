# Upgrade Guide

## Coming from 2.x

We use a custom finder in 3.x, so any setDistanceAsVirtualField() call can now be simplified to
```php
$this->findDistance($query, $options);
```

You can manually geocode an entity with
```php
$addresses = $this->behaviors()->Geocoder->geocode($entity);
// or simply
$addresses = $this->geocode($entity);
```

The sql snippet has changed from `distance()` to `distanceExpr()` to be DB agnostic.

The calculation has been moved to Calculation class.

### Changed behavior config

- `'before' => 'save'` is now `'on' => 'beforeSave'`.
- `allow_inconclusive` is now `allowInconclusive`
- `minAccurary` is not used anymore, instead use `expect` whitelist
- `host` is not used anymore, instead use `locale`

You can use `provider` and `adapter` config to change the used provider, defaults to GoogleMap.

### Changed helper

The helper now is called GoogleMap.
The Configure key for GoogleMap helper changed to `GoogleMap`.

### Removed functionality.

- paginateDistanceCount()

### Deprecated and removed config

- real, bounds, invalidate
