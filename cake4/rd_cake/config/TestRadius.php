<?php

$config = [];

$config['TestRadius']['defaults']	= [
  		'radius_ip' => '164.160.89.129',
  		'port'		=> '1812',
  		'secret'	=> 'testing123',
  		'auth_method' => 'pap',
  		'username'	=> 'dirkvanderwalt',
  		'password'	=> 'qwerty',
  		'called_station_id' => '00-25-82-00-92-30:AC-Devices',
  		'nas_identifier' => 'ac-de_apeap_55',
  		'nas_ip_address'   	=> '192.168.8.100'
  	];
      	
$config['TestRadius']['auth_test']	= [
  		'radius_ip' => '164.160.89.129',
  		'port'		=> '1812',
  		'secret'	=> 'testing123',
  		'auth_method' => 'eap_ttls_mschap',
  		//'auth_method' => 'pap',
  		'called_station_id' => '00-25-82-00-92-30:AC-Devices',
  		'nas_identifier' => 'ac-de_apeap_55',
  		'nas_ip_address'   	=> '192.168.8.100'
  	];

return $config;

?>
