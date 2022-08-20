<?php
declare(strict_types=1);

/**
 * CakePHP(tm) : Rapid Development Framework (https://cakephp.org)
 * Copyright (c) Cake Software Foundation, Inc. (https://cakefoundation.org)
 * Copyright (c) 2014 Cees-Jan Kiewiet
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice
 *
 * @copyright     Copyright (c) Cake Software Foundation, Inc. (https://cakefoundation.org)
 * @link          https://cakephp.org CakePHP(tm) Project
 * @since         1.0.0
 * @license       https://opensource.org/licenses/mit-license.php MIT License
 */

namespace Cake\TwigView\Twig\Extension;

use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

/**
 * Class BasicExtension.
 */
class BasicExtension extends AbstractExtension
{
    /**
     * Get declared filters.
     *
     * @return \Twig\TwigFilter[]
     */
    public function getFilters(): array
    {
        return [
            new TwigFilter('debug', function () {
                static $logged = false;
                if (!$logged) {
                    $logged = true;
                    deprecationWarning('`debug` filter is deprecated, use `dump()` instead.');
                }

                return debug(...func_get_args());
            }),
            new TwigFilter('pr', function () {
                static $logged = false;
                if (!$logged) {
                    $logged = true;
                    deprecationWarning('`pr` filter is deprecated, use `dump()` instead.');
                }

                return pr(...func_get_args());
            }),
            new TwigFilter('low', function () {
                static $logged = false;
                if (!$logged) {
                    $logged = true;
                    deprecationWarning('`low` filter is deprecated, use `lower` instead.');
                }

                return strtolower(...func_get_args());
            }),
            new TwigFilter('up', function () {
                static $logged = false;
                if (!$logged) {
                    $logged = true;
                    deprecationWarning('`up` filter is deprecated, use `upper` instead.');
                }

                return strtoupper(...func_get_args());
            }),
            new TwigFilter('env', 'env'),
            new TwigFilter('count', function () {
                static $logged = false;
                if (!$logged) {
                    $logged = true;
                    deprecationWarning('`count` filter is deprecated, use `length` instead.');
                }

                return count(...func_get_args());
            }),
            new TwigFilter('h', 'h'),
            new TwigFilter('null', function () {
                return '';
            }),
        ];
    }
}
