<?php
//Default settings for accel-ppp

$config['AccelPresets']['Default'] 		= [

    'modules'   => [
        'log_file',
        'pppoe',
        'auth_pap',
        'radius',
        'ippool',
        'shaper',   
    ],  
    'core'      => [
        'log-error' => '/var/log/accel-ppp/core.log',
        'thread-count'  => 4,
    ],
    'ppp'       => [
        'verbose'   => 1,
        'min-mtu'   => 1280,
        'mtu'       => 1400,
        'mru'       => 1400,
        'ipv4'      => 'require',
        'ipv6'      => 'deny',
        'ipv6-intf-id' => '0:0:0:1',
        'ipv6-peer-intf-id' => '0:0:0:2',
        'ipv6-accept-peer-intf-id' => 1,
        'lcp-echo-interval' => 20,
        'lcp-echo-timeout'  => 120,
        'unit-cache' => 1,
    ],
    'pppoe'     => [
        'verbose'       => 1,
        'called-sid'    => 'mac',
        'interface'     => 'enp0s8',
    ],    
    'dns'       => [
        'dns1'  => '1.1.1.1',
        'dns2'  => '8.8.8.8',
    ],     
    'radius'    => [
        'dictionary'    => '/usr/share/accel-ppp/radius/dictionary',
        'nas-identifier'=> 'accel-ppp',
      //  'nas-ip-address'=> '192.168.8.118',
      //  'nas-ip-address'=> '127.0.0.1',
      //  'gw-ip-address' => '192.168.8.1',
        'server'        => [
            '164.160.89.129,testing123,auth-port=1812,acct-port=1813,req-limit=50,fail-timeout=0,max-fail=10,weight=1',
            '164.160.89.130,testing123,auth-port=1812,acct-port=1813,req-limit=50,fail-timeout=0,max-fail=10,weight=2'
        ],
        'dae-server'    => '127.0.0.1:3799,testing123',
        'verbose'       => 1,
        'acct-interim-interval' =>120,
    ],
    'client-ip-range'   => [
        '10.0.0.0/8'
    ],    
    'ip-pool'   => [
        'gw-ip-address' => '192.168.0.1',
        'attr'          => 'Framed-Pool',
        'pools'         => [
            '192.168.0.2-255',
            '192.168.1.1-255,name=pool1',
            '192.168.2.1-255,name=pool2',
            '192.168.3.1-255,name=pool3',
            '192.168.4.1-255,name=pool4,next=pool1',
            '192.168.4.0/24',
        ]
    ],   
    'log'       => [
        'log-file'  => '/var/log/accel-ppp/accel-ppp.log',
        'log-emerg' => '/var/log/accel-ppp/emerg.log',
        'log-fail-file' => '/var/log/accel-ppp/auth-fail.log',
        'copy'      => 1,
        'level'     => 3,
    ],
    'shaper'    => [
        'vendor'    => 'Mikrotik',
        'attr'      => 'Mikrotik-Rate-Limit',
        'up-limiter'=> 'police',
        'down-limiter' => 'tbf',
        'verbose'   => 1,
    ], 
    'cli'       => [
        'verbose'   => 1,
        'telnet'    => '127.0.0.1:2000',
        'tcp'       => '127.0.0.1:2001',
        'password'  => 'testing123'
    ]
];

return $config;

?>
