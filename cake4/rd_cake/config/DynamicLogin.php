<?php

$config = array();

//The "Custom" theme will still redirect to the browser detection page but will redirect based on the page settings defined in the DB

$config['DynamicLogin']['theme']['Custom'] = array();

$config['DynamicLogin']['theme']['Default'] = [
	'coova_desktop'		=> '/login/bootstrap5/index.html',
	'coova_mobile'		=> '/login/bootstrap5/index.html',
	'mikrotik_desktop'	=> '/login/bootstrap5/index.html',
	'mikrotik_mobile'	=> '/login/bootstrap5/index.html',
	'ruckus_desktop'    => '/rd_login/ru/d/index.html',
	'ruckus_mobile'     => '/rd_login/ru/m/index.html',
];



$config['DynamicLogin']['theme']['Webix'] = [
	'coova_desktop'		=> '/login/cp/index.html',
	'coova_mobile'		=> '/login/cp/index.html',
	'mikrotik_desktop'	=> '/login/cp/index.html',
	'mikrotik_mobile'	=> '/login/cp/index.html',
	'ruckus_desktop'    => '/rd_login/ru/d/index.html',
	'ruckus_mobile'     => '/rd_login/ru/m/index.html',
];




$config['DynamicLogin']['ruckus']['northbound']['password'] = 'stayoutnow123!';

$config['DynamicLogin']['i18n'][0]     = ['name' => 'English',     'id' => 'en_GB',   'active' => true];
$config['DynamicLogin']['i18n'][1]     = ['name' => 'French',      'id' => 'fr_FR',   'active' => true];
$config['DynamicLogin']['i18n'][2]     = ['name' => 'Italian',     'id' => 'it_IT',   'active' => true];
$config['DynamicLogin']['i18n'][3]     = ['name' => 'Spanish',     'id' => 'es_ES',   'active' => true];
$config['DynamicLogin']['i18n'][4]     = ['name' => 'Afrikaans',   'id' => 'af_ZA',   'active' => true];
$config['DynamicLogin']['i18n'][5]     = ['name' => 'Arabic',      'id' => 'ar_AR',   'active' => true];
$config['DynamicLogin']['i18n'][6]     = ['name' => 'Dutch (Netherland)',      'id' => 'nl_NL',   'active' => true];
$config['DynamicLogin']['i18n'][7]     = ['name' => 'Dutch (Belgium)',      'id' => 'nl_BE',   'active' => true];
$config['DynamicLogin']['i18n'][8]     = ['name' => 'German',      'id' => 'de_DE',   'active' => true];


return $config;

?>
