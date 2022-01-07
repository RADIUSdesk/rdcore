<?php
namespace RabbitMQ;

use RabbitMQ\Configure\Config;
use RabbitMQ\Connection\RabbitMQ;
use RabbitMQ\Helper\ColorfulConsole;
use RabbitMQ\Helper\MeaningfulTime;

/**
 * External API.
 */
class CakephpRabbitMQ
{
    /**
     * Read the configs and start listening to defined queues.
     *
     * @param array $keys
     */
    public static function listen(array $keys = [])
    {
        $server = Config::getServer();
        $configs = empty($keys) ? Config::getAllConfigs() : Config::getConfigs($keys);

        // generate callbacks
        foreach ($configs as $key => $config) {
            $configs[$key]['_callback'] = static::_generateInternalCallback($key, $config);
        }

        RabbitMQ::listen($server, $configs);
    }

    /**
     * Send message to queue specified by key.
     *
     * @param string $key
     * @param string $message
     */
    public static function send(string $key, string $message)
    {
        RabbitMQ::send(Config::getServer(), Config::get($key), $message);
    }

    /**
     * Generate internal callback function for queue.
     *
     * @param string $key
     * @param array  $config
     *
     * @return callable
     */
    protected static function _generateInternalCallback(string $key, array $config)
    {
        $callback = static::_generateUserCallback($key, $config);

        $retryMax = $config['retry_max'];
        $m = new MeaningfulTime();
        $retryTime = $m($config['retry_time'], 'ms');

        // callback function
        return function ($message) use ($key, $callback, $retryMax, $retryTime) {
            $c = new ColorfulConsole();
            $c('default', sprintf("[*] Queue '%s' received message : '%s'", $key, $message->body));
            $result = call_user_func($callback, $message);

            try {
                $headers = $message->get('application_headers');
                $xDeath = $headers->getNativeData()['x-death'];
                $retryCount = $xDeath[1]['count'];
            } catch (\OutOfBoundsException $e) {
                // the message would not have the header at first time
                $retryCount = 0;
            }

            // failed
            if ($result !== 0) {
                // retry
                if ($retryCount < $retryMax) {
                    $c('warning', sprintf('[!] Failed to process the message, retry after %s (retried %d times)', $retryTime, $retryCount));
                } else {
                    $c('error', sprintf('[X] Failed to process the message and exceeded maximum retry count of %d, dropping the message', $retryMax));
                    // drop the message by sending ack
                    $result = 0;
                }
            } else {
                $c('success', sprintf('[√] Successfully processed the message'));
            }

            echo "\n";

            if ($result !== 0) {
                // redirect to the retry queue if non-zero value returned
                $message->delivery_info['channel']->basic_reject($message->delivery_info['delivery_tag'], false);
            } else {
                $message->delivery_info['channel']->basic_ack($message->delivery_info['delivery_tag']);
            }
        };
    }

    /**
     * Generate callback according according to the callback type provided.
     *
     * @param string $key
     * @param array  $config
     *
     * @return callable
     */
    protected static function _generateUserCallback(string $key, array $config)
    {
        // callable
        if (isset($config['callback'])) {
            $callback = $config['callback'];
            if (!is_callable($callback)) {
                throw new \InvalidArgumentException('The callback provided in queue "' . $key . '" is not a valid callable!');
            }

            return $callback;
        }

        // command
        if (isset($config['command'])) {
            $command = $config['command'];
            $callback = function ($message) use ($command) {
                exec($command . ' ' . $message->body, $output, $result);

                return $result;
            };

            return $callback;
        }

        // cakephp command
        if (isset($config['cake_command'])) {
            $cakeCommand = $config['cake_command'];
            $callback = function ($message) use ($cakeCommand) {
                exec('bin' . DS . 'cake ' . $cakeCommand . ' ' ."'". $message->body."'", $output, $result);

                return $result;
            };

            return $callback;
        }

        throw new \InvalidArgumentException('Queue "' . $key . '" has no valid callback provided');
    }
}
