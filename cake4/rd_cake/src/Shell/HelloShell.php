<?php

namespace App\Shell;

use Cake\Console\Shell;
use Cake\Console\ConsoleOptionParser;

class HelloShell extends Shell
{
    public function main()
    {
        $this->out('Hello world.');
    }

    public function heyThere($name = 'Anonymous')
    {
        $this->out('Hey there ' . $name);
    }
    
	public function getOptionParser():ConsoleOptionParser{
		// Get an empty parser from the framework.
		$parser = parent::getOptionParser();
		$parser->setDescription(__('RADIUSdesk console for various tasks'));

		// Define your options and arguments.

		// Return the completed parser
		return $parser;
	}   
}

?>
