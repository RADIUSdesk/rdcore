<?php

use Cake\Routing\RouteBuilder;
use Cake\Routing\Router;

Router::scope('/', function(RouteBuilder $routes) {
	$routes->fallbacks();
});

Router::prefix('admin', function (RouteBuilder $routes) {
	$routes->plugin('Geo', function (RouteBuilder $routes) {
		$routes->connect('/', ['controller' => 'Geo', 'action' => 'index']);

		$routes->fallbacks();
	});
});
