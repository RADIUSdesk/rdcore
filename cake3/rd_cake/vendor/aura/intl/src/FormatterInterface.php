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
 * Formatter Interface
 *
 * @package aura/intl
 *
 */
interface FormatterInterface
{
    /**
     *
     * Format message
     *
     * @param string $locale
     *
     * @param string $string
     *
     * @param array $tokens_values
     *
     */
    public function format($locale, $string, array $tokens_values);
}
