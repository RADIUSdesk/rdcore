<?php
namespace Aura\Intl;

use Yoast\PHPUnitPolyfills\TestCases\TestCase;

class TranslatorLocatorFactoryTest extends TestCase
{
    public function test__newInstance()
    {
        $factory = new TranslatorLocatorFactory();
        $this->assertInstanceOf('Aura\Intl\TranslatorLocator', $factory->newInstance());
    }
}
