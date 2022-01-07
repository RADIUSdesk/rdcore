# CakePHP Geo Plugin

[![Build Status](https://api.travis-ci.com/dereuromark/cakephp-geo.svg?branch=cake3)](https://travis-ci.com/dereuromark/cakephp-geo)
[![Coverage Status](https://coveralls.io/repos/dereuromark/cakephp-geo/badge.svg)](https://coveralls.io/r/dereuromark/cakephp-geo)
[![Latest Stable Version](https://poser.pugx.org/dereuromark/cakephp-geo/v/stable.svg)](https://packagist.org/packages/dereuromark/cakephp-geo)
[![Minimum PHP Version](https://img.shields.io/badge/php-%3E%3D%205.6-8892BF.svg)](https://php.net/)
[![License](https://poser.pugx.org/dereuromark/cakephp-geo/license.svg)](https://packagist.org/packages/dereuromark/cakephp-geo)
[![Coding Standards](https://img.shields.io/badge/cs-PSR--2--R-yellow.svg)](https://github.com/php-fig-rectified/fig-rectified-standards)
[![Total Downloads](https://poser.pugx.org/dereuromark/cakephp-geo/d/total.svg)](https://packagist.org/packages/dereuromark/cakephp-geo)

A CakePHP plugin to
- geocode locations/ips and save the information (lat/lng) along with the records
- reverse geocode data
- querying geocoded data by distance (using custom finder)
- display (Google) maps (dynamic and static)

This branch is for **CakePHP 3.8+**. See [version map](https://github.com/dereuromark/cakephp-geo/wiki#cakephp-version-map) for details.

Note that since CakePHP 3.x upgrade it uses the [willdurand/geocoder](https://github.com/geocoder-php/Geocoder) library and therefore now supports
- 12+ address-based Geocoder providers
- 10+ IP-based Geocoder providers

Most of them also support reverse geocoding. And of course you can write your own providers on top.

Also new:
- MySQL support
- PostgreSQL support

And also:
- GeocodedAddresses Table class for caching of API requests to prevent rate limits and speed up lookups.


## Demo
See [Sandbox examples](https://sandbox.dereuromark.de/sandbox/geo-examples) for live demos of the GoogleMaps helper and the Geocoder behavior.

## Installation & Docs

- [Documentation](docs/README.md)


### Branching strategy
The master branch is the currently active and maintained one and works with the current 3.x stable version.
Please see the original [Tools plugin](https://github.com/dereuromark/cakephp-tools) if you need the Geo tools for CakePHP 2.x versions.

### TODOs

* Write own Geocoder provider to leverage all of MapsGoogle data that is being returned.
