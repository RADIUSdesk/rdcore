<?php
/**
 * Default configuration for a queue.
 */
return [
    // Main queue
    'exchange' => [
        'name' => '__GENERATE__',
        'type' => 'direct',
        'passive' => false,
        'durable' => false,
        'auto-delete' => false,
        'internal' => false,
        'no-wait' => false,
        'arguments' => []
    ],
    'queue' => [
        'name' => '__GENERATE__',
        'passive' => false,
        'durable' => true,
        'exclusive' => false,
        'auto-delete' => false,
        'no-wait' => false,
        'arguments' => []
    ],
    'routing_key' => '__GENERATE__',

    // Retry setting
    'retry' => true,
    'retry_time' => 5 * 60 * 1000, // 5 mins
    'retry_max' => 5,

    // Retry queue
    'retry_exchange' => [
        'name' => '__GENERATE__',
        'type' => 'direct',
        'passive' => false,
        'durable' => false,
        'auto-delete' => false,
        'internal' => false,
        'no-wait' => false,
        'arguments' => []
    ],
    'retry_queue' => [
        'name' => '__GENERATE__',
        'passive' => false,
        'durable' => true,
        'exclusive' => false,
        'auto-delete' => false,
        'no-wait' => false,
        'arguments' => []
    ],
    'retry_routing_key' => '__GENERATE__',

    // Callback types
    'callback' => null,
    'cake_command' => null,
    'command' => null,

    // Basic qos
    'basic_qos' => [
        'prefetch-size' => null,
        'prefetch-count' => 1,
        'global' => null
    ],

    // Basic consume
    'basic_consume' => [
        'consumer-tag' => '',
        'no-local' => false,
        'no-ack' => false,
        'exclusive' => false,
        'no-wait' => false
    ]
];
