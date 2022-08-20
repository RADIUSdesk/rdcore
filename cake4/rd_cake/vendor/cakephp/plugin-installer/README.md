# CakePHP Plugin Installer

[![Build Status](https://img.shields.io/travis/com/cakephp/plugin-installer?style=flat-square)](https://travis-ci.com/cakephp/plugin-installer)
[![Latest Stable Version](https://img.shields.io/github/v/release/cakephp/plugin-installer?sort=semver&style=flat-square)](https://packagist.org/packages/cakephp/plugin-installer)
[![Total Downloads](https://img.shields.io/packagist/dt/cakephp/plugin-installer?style=flat-square)](https://packagist.org/packages/cakephp/plugin-installer/stats)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)

A composer installer for installing CakePHP 3.0+ plugins.

This installer ensures your application is aware of CakePHP plugins installed
by composer in `vendor/`.

## Usage

Your CakePHP application should already depend on `cakephp/plugin-installer`, if
not in your CakePHP application run:

```
composer require cakephp/plugin-installer:*
```

Your plugins themselves do **not** need to require `cakephp/plugin-installer`. They
only need to specify the `type` in their composer config:

```json
"type": "cakephp-plugin"
```

## Multiple Plugin Paths

If your application uses multiple plugin paths. In addition to configuring your
application settings you will also need to update your `composer.json` to ensure
the generated `cakephp-plugins.php` file is correct:

```
// Define the list of plugin-paths your application uses.
"extra": {
    "plugin-paths": ["plugins", "extra_plugins"]
}
```

## Plugin Setup

For the installer to work properly ensure that your plugin's composer config
file has a proper autoload section. Assuming your plugin's namespace is "MyPlugin"
the autoload section would be like:

```json
"autoload": {
    "psr-4": {
        "MyPlugin\\": "src"
    }
}
```

Not strictly necessary for the working of the installer but ideally you would
also have an "autoload-dev" section for loading test files:

```json
"autoload": {
    "psr-4": {
        "MyPlugin\\": "src"
    }
},
"autoload-dev": {
    "psr-4": {
        "MyPlugin\\Test\\": "tests",
        "Cake\\Test\\" : "vendor/cakephp/cakephp/test"
    }
}
```

If your top level namespace is a vendor name then your namespace to path mapping
would be like:

```json
"autoload": {
    "psr-4": {
        "MyVendor\\MyPlugin\\": "src"
    }
},
"autoload-dev": {
    "psr-4": {
        "MyVendor\\MyPlugin\\Test\\": "tests",
        "Cake\\Test\\" : "vendor/cakephp/cakephp/test"
    }
}
```
