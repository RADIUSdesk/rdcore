<?php
namespace RabbitMQ\Connection;

use PhpAmqpLib\Channel\AMQPChannel;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

/**
 * Class for connecting to the RabbitMQ server.
 **/
class RabbitMQ
{
    /**
     * Listen all queue provided in configs.
     *
     * @param array $server
     * @param array $configs
     */
    public static function listen(array $server, array $configs)
    {
        $connection = static::_newAMQPConnection($server);
        $channel = $connection->channel();

        foreach ($configs as $config) {
            static::_declare($channel, $config);
        }

        while (count($channel->callbacks)) {
            $channel->wait();
        }

        $channel->close();
        $connection->close();
    }

    /**
     * Send message to queue that provided.
     *
     * @param array  $server
     * @param array  $config
     * @param string $messsage
     */
    public static function send(array $server, array $config, string $messsage)
    {
        $connection = static::_newAMQPConnection($server);
        $channel = $connection->channel();

        //9-4-18 Dirk Change this to avoid an error on send / should not include consume detail
        static::_declare_send($channel, $config);

        $amqpMessage = new AMQPMessage($messsage, ['delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT]);

        $channel->basic_publish($amqpMessage, $config['exchange']['name'], $config['routing_key']);

        $channel->close();
        $connection->close();
    }

    /**
     * Create the connection according to the config provided.
     *
     * @param array $server
     *
     * @return AMQPStreamConnection
     */
    protected static function _newAMQPConnection(array $server)
    {
        return new AMQPStreamConnection(
            $server['host'],
            $server['port'],
            $server['user'],
            $server['password'],
            $server['vhost'],
            $server['insist'],
            $server['login_method'],
            $server['login_response'],
            $server['locale'],
            $server['connection_timeout'],
            $server['read_write_timeout'],
            $server['context'],
            $server['keepalive'],
            $server['heartbeat']
        );
    }

    /**
     * Declare queue according to the config provided.
     *
     * @param AMQPChannel $channel
     * @param array       $config
     */
    protected static function _declare(AMQPChannel $channel, array $config)
    {
        static::_declareExchange($channel, $config['exchange']);
        static::_declareQueue($channel, $config['queue']);

        $channel->queue_bind(
            $config['queue']['name'],
            $config['exchange']['name'],
            $config['routing_key']
        );

        if ($config['retry']) {
            static::_declareExchange($channel, $config['retry_exchange']);
            static::_declareQueue($channel, $config['retry_queue']);

            $channel->queue_bind(
                $config['retry_queue']['name'],
                $config['retry_exchange']['name'],
                $config['retry_routing_key']
            );
        }

        $channel->basic_qos(
            $config['basic_qos']['prefetch-size'],
            $config['basic_qos']['prefetch-count'],
            $config['basic_qos']['global']
        );

        $channel->basic_consume(
            $config['queue']['name'],
            $config['basic_consume']['consumer-tag'],
            $config['basic_consume']['no-local'],
            $config['basic_consume']['no-ack'],
            $config['basic_consume']['exclusive'],
            $config['basic_consume']['no-wait'],
            $config['_callback']
        );  
    }
    
    //Dirk 9-4-18 Add this to avoid an error on basic consume
    protected static function _declare_send(AMQPChannel $channel, array $config)
    {
        static::_declareExchange($channel, $config['exchange']);
        static::_declareQueue($channel, $config['queue']);

        $channel->queue_bind(
            $config['queue']['name'],
            $config['exchange']['name'],
            $config['routing_key']
        );

        if ($config['retry']) {
            static::_declareExchange($channel, $config['retry_exchange']);
            static::_declareQueue($channel, $config['retry_queue']);

            $channel->queue_bind(
                $config['retry_queue']['name'],
                $config['retry_exchange']['name'],
                $config['retry_routing_key']
            );
        }

        $channel->basic_qos(
            $config['basic_qos']['prefetch-size'],
            $config['basic_qos']['prefetch-count'],
            $config['basic_qos']['global']
        );
 
    }

    /**
     * Decalre a exchange according to the config provided.
     *
     * @param AMQPChannel $channel
     * @param array       $config
     */
    protected static function _declareExchange(AMQPChannel $channel, array $config)
    {
        $channel->exchange_declare(
            $config['name'],
            $config['type'],
            $config['passive'],
            $config['durable'],
            $config['auto-delete'],
            $config['internal'],
            $config['no-wait'],
            $config['arguments']
        );
    }

    /**
     * Decalre a queue according to the config provided.
     *
     * @param AMQPChannel $channel
     * @param array       $config
     */
    protected static function _declareQueue(AMQPChannel $channel, array $config)
    {
        $channel->queue_declare(
            $config['name'],
            $config['passive'],
            $config['durable'],
            $config['exclusive'],
            $config['auto-delete'],
            $config['no-wait'],
            $config['arguments']
        );
    }
}
