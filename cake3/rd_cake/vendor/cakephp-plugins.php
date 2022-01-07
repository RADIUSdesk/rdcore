<?php
$baseDir = dirname(dirname(__FILE__));

return [
    'plugins' => [
        'Acl' => $baseDir . '/vendor/cakephp/acl/',
        'Bake' => $baseDir . '/vendor/cakephp/bake/',
        'CsvView' => $baseDir . '/vendor/friendsofcake/cakephp-csvview/',
        'DebugKit' => $baseDir . '/vendor/cakephp/debug_kit/',
        'Geo' => $baseDir . '/vendor/dereuromark/cakephp-geo/',
        'Migrations' => $baseDir . '/vendor/cakephp/migrations/',
        'RabbitMQ' => $baseDir . '/vendor/riesenia/cakephp-rabbitmq/',
        'WyriHaximus/TwigView' => $baseDir . '/vendor/wyrihaximus/twig-view/',
    ],
];
