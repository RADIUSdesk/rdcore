<?php
/**
 *
 * This file is part of the Aura Project for PHP.
 *
 * @package aura/intl
 *
 * @license http://opensource.org/licenses/MIT MIT
 *
 */
namespace Aura\Intl;

/**
 *
 * Package locator interface.
 *
 * @package aura/intl
 *
 */
interface PackageLocatorInterface
{
    /**
     *
     * Sets a Package object.
     *
     * @param string $name The package name.
     *
     * @param string $locale The locale for the package.
     *
     * @param callable $spec A callable that returns a Package object.
     *
     * @return void
     *
     */
    public function set($name, $locale, callable $spec);

    /**
     *
     * Gets a Package object.
     *
     * @param string $name The package name.
     *
     * @param string $locale The locale for the package.
     *
     * @return Package
     *
     */
    public function get($name, $locale);
}
