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
 * @link      https://github.com/sprintcube/cakephp-sendgrid
 * @since     4.0.0
 */

namespace SendGrid\Mailer;

use Cake\Mailer\Mailer;

/**
 * Mailer base class for SendGrid
 *
 * This allows to send the email using the SendGrid.
 */
class SendGridMailer extends Mailer
{
    use SendGridTrait;

    /**
     * Constructor
     *
     * @param array<string, mixed>|string|null $config Array of configs, or string to load configs from app.php
     */
    public function __construct($config = [])
    {
        parent::__construct($config);
        $this->setTransport('sendgrid');
    }
}
