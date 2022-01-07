<?php
namespace RabbitMQ\Configure;

use Cake\Core\Configure;

/**
 * Class for loading the configuration and check any error.
 */
class Config
{
    // Configuration key prefix
    const CONFIGURE_KEY = 'Riesenia.CakephpRabbitMQ';
    const CONFIGURE_KEY_PREFIX = self::CONFIGURE_KEY . '.';
    const SERVER_CONFIGURE_KEY = self::CONFIGURE_KEY_PREFIX . 'server';

    // Default configuration file
    const DEFAULT_CONFIG = __DIR__ . '/../../config/default_config.php';
    const SERVER_DEFAULT = __DIR__ . '/../../config/default_server.php';

    // Supported callback type
    const CALLBACK_TYPE = ['callback', 'command', 'cake_command'];

    // Configuration Cache
    protected static $_configs = [];
    protected static $_server = [];

    /**
     * Get all queue configurations (except server config).
     *
     * @return array all queue configurations
     */
    public static function getAllConfigs()
    {
        $userConfigs = Configure::read(self::CONFIGURE_KEY);
        unset($userConfigs['server']);

        return static::getConfigs(array_keys($userConfigs));
    }

    /**
     * Get queue configurations according to the keys provided.
     *
     * @param array $keys
     *
     * @return array queue configurations
     */
    public static function getConfigs(array $keys)
    {
        $configs = [];
        foreach ($keys as $key) {
            $configs[$key] = static::get($key);
        }

        return $configs;
    }

    /**
     * Get a queue configuration according to the key.
     *
     * @param string $key
     *
     * @throws InvalidArgumentException if config specified by key not found
     * @throws InvalidArgumentException if key is 'server'
     * @throws InvalidArgumentException if non or more than one callback type is provided
     *
     * @return array queue configuration
     */
    public static function get(string $key)
    {
        if (isset(static::$_configs[$key])) {
            return static::$_configs[$key];
        }

        // Check if the config required exist
        if (!Configure::check(self::CONFIGURE_KEY_PREFIX . $key)) {
            throw new \InvalidArgumentException('Queue "' . $key . '" is not configured');
        }

        // Check if the key is not server
        if ($key == 'server') {
            throw new \InvalidArgumentException('Server configuration should not get by ' . __FUNCTION__ . ' function');
        }

        // Merge user config and default config
        $defaultConfig = static::_getDefaultConfig($key);
        $userConfig = Configure::read(self::CONFIGURE_KEY_PREFIX . $key);

        $config = array_replace_recursive($defaultConfig, $userConfig);

        // Add retry redirect arguments if retry is true
        if ($config['retry']) {
            $config['queue']['arguments'] = array_merge(
                $config['queue']['arguments'],
                [
                    'x-dead-letter-exchange' => ['S', $config['retry_exchange']['name']],
                    'x-dead-letter-routing-key' => ['S', $config['retry_routing_key']]
                ]
            );
            $config['retry_queue']['arguments'] = array_merge(
                $config['retry_queue']['arguments'],
                [
                    'x-message-ttl' => ['I', $config['retry_time']],
                    'x-dead-letter-exchange' => ['S', $config['exchange']['name']],
                    'x-dead-letter-routing-key' => ['S', $config['routing_key']]
                ]
            );
        } else {
            unset($config['retry']['retry_time']);
            unset($config['retry']['retry_exchange']);
            unset($config['retry']['retry_queue']);
            unset($config['retry']['retry_routing_key']);
        }

        static::$_configs[$key] = $config;

        return $config;
    }

    /**
     * Get server configuration.
     *
     * @return array server configuration
     */
    public static function getServer()
    {
        if (!empty(static::$_server)) {
            return static::$_server;
        }

        $userServerConfigs = Configure::read(self::SERVER_CONFIGURE_KEY) ?: [];
        $defaultServerConfig = include self::SERVER_DEFAULT;
        static::$_server = array_merge($defaultServerConfig, $userServerConfigs);

        return static::$_server;
    }

    /**
     * Get and generate default configuration according to the key.
     *
     * @param string $key
     *
     * @return array default queue configuration
     */
    protected static function _getDefaultConfig(string $key)
    {
        $defaultConfig = include self::DEFAULT_CONFIG;

        // Generate dynamic default configs
        $defaultConfig['exchange']['name'] = $key . '_exchange';
        $defaultConfig['queue']['name'] = $key . '_queue';
        $defaultConfig['routing_key'] = $key . '_routing_key';
        $defaultConfig['retry_exchange']['name'] = $key . '_retry_exchange';
        $defaultConfig['retry_queue']['name'] = $key . '_retry_queue';
        $defaultConfig['retry_routing_key'] = $key . '_retry_routing_key';

        return $defaultConfig;
    }
}
