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

/**
 * Trait SendGridTrait
 *
 * Provides the additional functions to set different
 * options for SendGrid like template, send at scheduled time, etc.
 *
 * TODO: Read more at https://docs.sendgrid.com/api-reference/mail-send/mail-send
 *  - Add support for categories [categories]
 *  - Add support for custom arguments [custom_args]
 *  - Add support for batch [batch_id]
 *  - Add support for unsubscribers [asm]
 *  - Add support for IP pool [ip_pool_name]
 *  - Add support for tracking [tracking_settings]
 */
trait SendGridTrait
{
    /**
     * Sets an email template ID
     *
     * This will set template to use in email. Template can be created
     * in SendGrid dashboard.
     *
     * Example
     * ```
     *  $email = new SendGridMailer();
     *  $email->setTo('foo@example.com.com')
     *      ->setTemplate('d-xxxxxx')
     *      ->deliver();
     * ```
     *
     * @param string $id ID of template
     * @return $this
     */
    public function setTemplate($id)
    {
        if (!empty($id) && is_string($id)) {
            $this->getTransport()->setOption('template_id', $id);
        }

        return $this;
    }

    /**
     * Sets the timestamp allowing you to specify
     * when you want your email to be delivered
     *
     * Timestamp can be up to 72 hours.
     *
     * Example
     * ```
     *  $email = new SendGridMailer();
     *  $email->setTo('foo@example.com.com')
     *      ->setSendAt(1649500630)
     *      ->deliver();
     * ```
     *
     * @param int $timestamp Unix timestamp
     * @return $this
     */
    public function setSendAt($timestamp = null)
    {
        if (is_numeric($timestamp)) {
            $this->getTransport()->setOption('send_at', $timestamp);
        }

        return $this;
    }
}
