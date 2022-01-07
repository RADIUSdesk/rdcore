<?php

/**
 * @see       https://github.com/laminas/laminas-diactoros for the canonical source repository
 * @copyright https://github.com/laminas/laminas-diactoros/blob/master/COPYRIGHT.md
 * @license   https://github.com/laminas/laminas-diactoros/blob/master/LICENSE.md New BSD License
 */

namespace Laminas\Diactoros;

/**
 * Retrieve the request method from the SAPI parameters.
 *
 * @param array $server
 * @return string
 */
function marshalMethodFromSapi(array $server)
{
    return isset($server['REQUEST_METHOD']) ? $server['REQUEST_METHOD'] : 'GET';
}
