<?php
/**
 * Default configuration for the RabbitMQ server.
 */
 return [
    'host' => 'localhost',
    'port' => 5672,
    'user' => 'guest',
    'password' => 'guest',
    'vhost' => '/',
    'insist' => false,
    'login_method' => 'AMQPLAIN',
    'login_response' => null,
    'locale' => 'en_US',
    'connection_timeout' => 3.0,
    'read_write_timeout' => 3.0,
    'context' => null,
    'keepalive' => false,
    'heartbeat' => 0
 ];
