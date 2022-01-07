# RabbitMQ for CakePHP

[![Build Status](https://img.shields.io/travis/riesenia/cakephp-rabbitmq/master.svg?style=flat-square)](https://travis-ci.org/riesenia/cakephp-rabbitmq)
[![Latest Version](https://img.shields.io/packagist/v/riesenia/cakephp-rabbitmq.svg?style=flat-square)](https://packagist.org/packages/riesenia/cakephp-rabbitmq)
[![Total Downloads](https://img.shields.io/packagist/dt/riesenia/cakephp-rabbitmq.svg?style=flat-square)](https://packagist.org/packages/riesenia/cakephp-rabbitmq)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)

This plugin is for CakePHP 3.x and simplifies using [RabbitMQ](https://www.rabbitmq.com/) in CakePHP application.

## Installation

Using composer

```bash
composer require riesenia/cakephp-rabbitmq
```

Load plugin in *config/bootstrap.php*

```php
Plugin::load('RabbitMQ');
```

## Usage

RabbitMQ comes with a built-in shell that listens to defined queues and forwards messages to the callback specified in the configuration.

To start the server run:

```bash
bin/cake rabbitmq
```

To listen to specified queues only, pass their aliases as arguments:

```bash
bin/cake rabbitmq server email sms
```

### Send

To send a message to a queue simply use `send` method:

```php
use RabbitMQ\CakephpRabbitMQ as MQ;

MQ::send('email', 'this is a message');
```

### Listen

If you want to run the server inside your own shell, use `listen` method:

```php
use RabbitMQ\CakephpRabbitMQ as MQ;

// this will listen to all queues defined in the configuration file
MQ::listen();

// this will listen only to passed queues
MQ::listen(['email']);
```

## Configuration

Example configuration (i.e. in your *config/app.php*):

```php
    'Riesenia.CakephpRabbitMQ' => [
        'server' => [
            'host' => '127.0.0.1',
            'port' => 5672,
            'user' => 'guest',
            'password' => 'guest'
        ],
        'email' => [
            'cake_command' => 'email send',
            'retry_time' => 15 * 60 * 1000,
            'retry_max' => 3
        ]
    ]
```

Every key in the configuration is an alias for a specific queue. Key `server` is reserved for definition of the RabbitMQ connection.

### Basic Configuration keys

Below are just basic configuration keys. For complete configuration see a section below.

- `retry` *(bool)* - retry if operation failed
- `retry_time` *(int)* - retry period (in ms)
- `retry_max` *(int)* - maximum retry times

### Callback

There are three types of callback available: `callback`, `command` and `cake_command`. **Please specify only one type of callback!** If retry is enabled, the **callback must return a status code** to indicate whether the process was successful or not. **Return 0 if successful**, any other number means fail. **For cake shell methods return true for success** and false otherwise.

#### command
*(string)*

This will execute a defined command. For example a configuration

```php
        'command' => 'rm'
```

will execute `rm <message>` command.

#### cake_command
*(string)*

This is a shortage for a *bin/cake* command. For example a configuration

```php
        'cake_command' => 'email send'
```

will execute `bin/cake email send <message>` command.

#### callback
*(callable)*

This will call the callback function. For example a configuration

```php
        'callback' => [new MyMailer() ,'sendEmail']
```

will call the `sendEmail($message)` on `MyMailer` object. Please notice that **callback function will recevie the raw AMQPMessage**. The message you sent can be accessed using `$message->body`. For more details on PHP callable, see [PHP documentation](http://php.net/manual/en/language.types.callable.php).

### Complete Configuration keys

Below are the default values for all configuration keys. Please see the RabbitMQ documentation for more details on each configuration key.

#### server

```php
'server' => [
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
```

#### queue

```php
'<alias>' => [
    // Main queue
    'exchange' => [
        'name' => '<alias>_exchange',
        'type' => 'direct',
        'passive' => false,
        'durable' => false,
        'auto-delete' => false,
        'internal' => false,
        'no-wait' => false,
        'arguments' => []
    ],
    'queue' => [
        'name' => '<alias>_queue',
        'passive' => false,
        'durable' => true,
        'exclusive' => false,
        'auto-delete' => false,
        'no-wait' => false,
        'arguments' => []
    ],
    'routing_key' => '<alias>_routing_key',

    // Retry setting
    'retry' => true,
    'retry_time' => 5 * 60 * 1000, // 5 mins
    'retry_max' => 5,

    // Retry queue
    'retry_exchange' => [
        'name' => '<alias>_retry_exchange',
        'type' => 'direct',
        'passive' => false,
        'durable' => false,
        'auto-delete' => false,
        'internal' => false,
        'no-wait' => false,
        'arguments' => []
    ],
    'retry_queue' => [
        'name' => '<alias>_retry_queue',
        'passive' => false,
        'durable' => true,
        'exclusive' => false,
        'auto-delete' => false,
        'no-wait' => false,
        'arguments' => []
    ],
    'retry_routing_key' => '<alias>_retry_routing_key',

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
]
```

**Notice:** Configuration except `retry_max` cannot be changed after the first run without reseting the queue.

Run the following command to reset the queue:

```bash
rabbitmqctl stop_app && rabbitmqctl reset && rabbitmqctl start_app
```

**Warning: This will delete all the messages in the rabbitmq**
