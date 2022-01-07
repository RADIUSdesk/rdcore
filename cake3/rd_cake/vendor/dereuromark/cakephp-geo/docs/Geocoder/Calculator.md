# Calculator Class


## Distance calculation

```php
$distance = this->Calculator->distance($lat, $lng);
```

Distance in miles instead:
```php
$distance = this->Calculator->distance($lat, $lng, Calculator::UNIT_MILES);
```

## Blur coordinates
The idea is to secure the user's exact coordinates and hide them by blurring them to a certain degree.

```php
$distance = this->Calculator->blur($lat, $lng, 2);
```

## Convert distances

```php
$newDistance = this->Calculator->convert($oldDistance, $from, $to);
```
