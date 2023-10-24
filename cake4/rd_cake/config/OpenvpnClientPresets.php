<?php
$config['OpenvpnClientPresets']['default'] 		= [
    'enabled'           => '1',
    'dev'               =>'tap',
    'verb'              => '4',
    'client'            => '1',
    'remote_cert_tls'   =>'server',
    'allow_compression' => 'no',
    'resolv_retry'      => 'infinite',
    'nobind'            => '1',
    'persist_key'       => '1',
    'persist_tun'       => '1',
    'mute_replay_warnings'  => '1',
    'auth'              => 'none',
    'data_ciphers'      => 'none',
    'up_delay'          => '1',
    'ping'              => 10,
    'script_security'   => '2',
    'tls_client'        => '1',
    'verify_server_cert'=> 'none',
    'cipher'		=> 'none',
//    'comp_lzo'          => 'yes',
];

return $config;

?>
