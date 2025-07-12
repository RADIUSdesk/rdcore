<?php

$config = [];

$config['TestRadius']['defaults']	= [
  		'radius_ip' => '127.0.0.1',
  		'port'		=> '1812',
  		'secret'	=> 'testing123',
  		'auth_method' => 'pap',
  		'username'	=> 'guest@owifi',
  		'password'	=> 'guest',
  		'called_station_id' => '00-25-82-00-92-30:AC',
  		'nas_identifier' => 'oWiFi',
  		'nas_ip_address'   	=> '10.8.0.1'
  	];
      	
$config['TestRadius']['auth_test']	= [
  		'radius_ip' => '127.0.0.1',
  		'port'		=> '1812',
  		'secret'	=> 'testing123',
  		'auth_method' => 'eap_ttls_mschap',
  		//'auth_method' => 'pap',
  		'called_station_id' => '00-25-82-00-92-30:AC',
  		'nas_identifier' => 'oWiFi',
  		'nas_ip_address'   	=> '10.8.0.20'
  	];

return $config;

?>
