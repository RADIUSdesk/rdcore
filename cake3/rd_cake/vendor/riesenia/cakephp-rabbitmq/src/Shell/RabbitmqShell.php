<?php
namespace RabbitMQ\Shell;

use Cake\Console\Shell;
use RabbitMQ\CakephpRabbitMQ;

class RabbitmqShell extends Shell
{
    /**
     * Listen to queues.
     */
    public function main()
    {
        $this->out('<info>[*] Starting to listen messages. Press CTRL+C to exit</info>');
        $this->out();
        CakephpRabbitMQ::listen($this->args);
    }

    /**
     * Displays a header for the shell.
     */
    protected function _welcome()
    {
        $this->out();
        $this->out('<info>Welcome to Cakephp-RabbitMQ Server Shell</info>');
        $this->hr();
    }
}
