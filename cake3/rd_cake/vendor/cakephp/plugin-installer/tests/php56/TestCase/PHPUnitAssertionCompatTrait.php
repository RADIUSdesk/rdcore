<?php

namespace Cake\Test\TestCase\Composer\Php56;

trait PHPUnitAssertionCompatTrait
{
    public function assertStringContainsString($needle, $haystack, $message = '')
    {
        $this->assertContains($needle, $haystack, $message);
    }
}
