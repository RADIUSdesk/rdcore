<?php
namespace Cake\Composer\Installer;

use Composer\Installer\LibraryInstaller;
use Composer\Script\Event;

/**
 * @deprecated No longer needed since v1.3.
 *   It has been kept only to show warning to users to remove
 *   PluginInstaller::postAutoloadDump from the "post-autoload-dump" hook.
 */
class PluginInstaller extends LibraryInstaller
{
    /**
     * Warn the developer of action they need to take
     *
     * @param string $title Warning title
     * @param string $text warning text
     * @param \Composer\IO\IOInterface $io IOInterface object
     * @return void
     */
    public static function warnUser($title, $text, $io)
    {
        $wrap = function ($text, $width = 75) {
            return '<error>     ' . str_pad($text, $width) . '</error>';
        };

        $messages = [
            '',
            '',
            $wrap(''),
            $wrap($title),
            $wrap(''),
        ];

        $lines = explode("\n", wordwrap($text, 68));
        foreach ($lines as $line) {
            $messages[] = $wrap($line);
        }

        $messages = array_merge($messages, [$wrap(''), '', '']);

        $io->write($messages);
    }

    /**
     * Called whenever composer (re)generates the autoloader
     *
     * Recreates CakePHP's plugin path map, based on composer information
     * and available app-plugins.
     *
     * @param \Composer\Script\Event $event the composer event object
     * @return void
     */
    public static function postAutoloadDump(Event $event)
    {
        $scripts = $event->getComposer()->getPackage()->getScripts();
        if (!isset($scripts['post-autoload-dump'])) {
            return;
        }

        $postAutoloadDump = 'Cake\Composer\Installer\PluginInstaller::postAutoloadDump';
        if (
            $scripts['post-autoload-dump'] === $postAutoloadDump
            || (is_array($scripts['post-autoload-dump'])
                && in_array($postAutoloadDump, $scripts['post-autoload-dump'])
            )
        ) {
            static::warnUser(
                'Action required!',
                'The CakePHP plugin installer v1.3+ no longer requires the "post-autoload-dump" hook.' .
                ' Please update your app\'s composer.json file and remove usage of ' . $postAutoloadDump,
                $event->getIO()
            );
        }
    }
}
