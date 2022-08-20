<?php
namespace Cake\Test\TestCase\Composer\Php56\Installer;

use Cake\Composer\Installer\PluginInstaller;
use Composer\Composer;
use Composer\IO\IOInterface;
use Composer\Package\RootPackage;
use Composer\Script\Event;
use PHPUnit\Framework\TestCase;

class PluginInstallerTest extends TestCase
{
    /**
     * setUp
     *
     * @return void
     */
    public function setUp()
    {
        parent::setUp();

        $this->composer = new Composer();
        $this->io = $this->getMockBuilder(IOInterface::class)->getMock();
    }

    public function testPostAutoloadDump()
    {
        $rootPackage = new RootPackage('cakephp/app', '1.0', '1.0');
        $rootPackage->setType('project');
        $rootPackage->setScripts([
            'post-autoload-dump' => 'Cake\Composer\Installer\PluginInstaller::postAutoloadDump',
        ]);

        $this->composer->setPackage($rootPackage);
        $this->io->expects($this->once())
                ->method('write');

        $event = new Event('post-autoload-dump', $this->composer, $this->io);

        PluginInstaller::postAutoloadDump($event);
    }
}
