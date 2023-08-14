<?php

/*

    option iw_enabled '1'
    option iw_interworking '1'
    option iw_access_network_type '3'
    option iw_internet '1'
    option iw_disable_dgaf '1'
    option iw_asra '0'
    option iw_esr '0'
    option iw_uesa '0'
    option iw_venue_group '2'
    option iw_venue_type '8'
    option iw_hessid '00:00:00:01:02:03'
    list iw_roaming_consortium 'xxyyzz0000'
    list iw_nai_realm '0,example.com,13[5:6],21[2:4][5:7]'
    list iw_nai_realm '0,example.org,13[5:6],21[2:4][5:7]'
    list iw_venue_name 'eng:somePublicSpace'
    list iw_venue_url '1:http://www.example.com/info-eng'
    option iw_network_auth_type '00'
    option iw_ipaddr_type_availability '0c'
    list iw_domain_name 'example.com'
    option hs20 '1'
    option hs20_oper_friendly_name 'eng:YourFriendPasspoint'
    option hs20_operating_class '517C'

*/

/*
    option iw_enabled '1'
    option iw_interworking '1'
    option iw_access_network_type '3'
    option iw_internet '1'
    option iw_disable_dgaf '1'
    option iw_asra '0'
    option iw_esr '0'
    option iw_uesa '0'
    option iw_venue_group '2'
    option iw_venue_type '8'
    option iw_hessid '00:00:00:01:02:03'
    list iw_roaming_consortium 'AA146B0000'
    list iw_roaming_consortium 'BAA2D00000'
    list iw_roaming_consortium '5A03BA0000'
    list iw_nai_realm '0,ironwifi,13[5:6],21[2:4][5:7]'
    list iw_venue_name 'eng:somePublicSpace'
    list iw_venue_url '1:http://www.example.com/info-eng'
    option iw_network_auth_type '00'
    option iw_ipaddr_type_availability '0c'
    list iw_domain_name 'ironwifi.net'
    list iw_domain_name 'openroaming.org'
    list iw_domain_name 'apple.openroaming.net'
    list iw_domain_name 'google.openroaming.net'
    list iw_domain_name 'ciscooneid.openroaming.net'
    option hs20 '1'
    option hs20_oper_friendly_name 'eng:IronWiFiPasspoint'
    option hs20_operating_class '517C'
*/


$config = [];

$config['Hotspot2']['options']	= [
    'iw_interworking' => 1,
  	'iw_access_network_type' => 3,
    'iw_internet' => 1,
    'iw_disable_dgaf' => 1,
    'iw_asra' => 0,
    'iw_esr' => 0,
    'iw_uesa' => 0,
    'iw_venue_group' => 2,
    'iw_venue_type' => 8,
    'iw_hessid' => '00:00:00:01:02:03',
    'iw_network_auth_type' => '00',
    'iw_ipaddr_type_availability' => '0c',
    'hs20' => 1,
    'hs20_oper_friendly_name' => 'eng:YourFriendPasspoint',
    'hs20_operating_class' => '517C',
];
      	
$config['Hotspot2']['lists']	= [
    [ 'name' =>  'iw_roaming_consortium', 'value' => 'AA146B0000'],
    [ 'name' =>  'iw_roaming_consortium', 'value' => 'BAA2D00000'],
    [ 'name' =>  'iw_roaming_consortium', 'value' => '5A03BA0000'],
    [ 'name' =>  'iw_nai_realm',        'value' => '0,ironwifi,13[5:6],21[2:4][5:7]'],
    [ 'name' =>  'iw_nai_realm',        'value' => '0,example.org,13[5:6],21[2:4][5:7]'],
    [ 'name' =>  'iw_venue_name',       'value' => 'eng:somePublicSpace'],
    [ 'name' =>  'iw_venue_url',        'value' => '1:http://www.example.com/info-eng'],
    [ 'name' =>  'iw_domain_name',      'value' => 'ironwifi.net'],
    [ 'name' =>  'iw_domain_name',      'value' => 'openroaming.org'],
    [ 'name' =>  'iw_domain_name',      'value' => 'apple.openroaming.net'],
    [ 'name' =>  'iw_domain_name',      'value' => 'google.openroaming.net'],
    [ 'name' =>  'iw_domain_name',      'value' => 'ciscooneid.openroaming.net'],  
];

return $config;

?>