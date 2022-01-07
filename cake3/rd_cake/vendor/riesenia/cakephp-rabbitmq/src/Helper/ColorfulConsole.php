<?php
namespace RabbitMQ\Helper;

/**
 * Helper class for colorize the output message.
 */
class ColorfulConsole
{
    const COLORS = [
        'default' => '37',  // White
        'info' => '36',     // Cyan
        'success' => '32',  // Green
        'warning' => '33',  // Yellow
        'error' => '31'     // Red
    ];

    /**
     * Print a colored message according to the state provided.
     *
     * @param string $state
     * @param string $message
     */
    public function __invoke(string $state, string $message)
    {
        if (!isset(self::COLORS[$state])) {
            throw new \InvalidArgumentException('Unknow state provided: ' . $state);
        }
        echo sprintf("\033[%sm%s\033[%sm\n", self::COLORS[$state], $message, self::COLORS['default']);
    }
}
