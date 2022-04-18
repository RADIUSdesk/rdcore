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
 * TranslatorInterface
 *
 * @package aura/intl
 *
 */
interface TranslatorInterface
{
    /**
     *
     * translate
     *
     * @param string $key
     *
     * @param array $tokens_values
     *
     */
    public function translate($key, array $tokens_values = []);
}
