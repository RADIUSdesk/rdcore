<?php
declare(strict_types=1);

/**
 * SendGrid Plugin for CakePHP
 * Copyright (c) SprintCube (https://www.sprintcube.com)
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the LICENSE.md
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright Copyright (c) SprintCube (https://www.sprintcube.com)
 * @license   https://opensource.org/licenses/mit-license.php MIT License
 * @link      https://github.com/sprintcube/cakephp-sprintcube-email
 * @since     1.0.0
 */

namespace SendGrid\Mailer\Exception;

use Cake\Core\Exception\Exception;

/**
 * SendGrid Api exception
 *
 * - used when an api key cannot be found.
 */
class SendGridApiException extends Exception
{
    /**
     * @inheritDoc
     */
    protected $_messageTemplate = '%s';
}
