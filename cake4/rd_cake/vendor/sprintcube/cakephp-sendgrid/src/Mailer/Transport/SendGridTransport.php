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

namespace SendGrid\Mailer\Transport;

use Cake\Core\Configure;
use Cake\Http\Client;
use Cake\Mailer\AbstractTransport;
use Cake\Mailer\Message;
use SendGrid\Mailer\Exception\SendGridApiException;

/**
 * Send mail using SendGrid API
 */
class SendGridTransport extends AbstractTransport
{
    /**
     * Default config for this class
     *
     * @var array
     */
    protected $_defaultConfig = [
        'apiEndpoint' => 'https://api.sendgrid.com/v3',
        'apiKey' => '',
    ];

    /**
     * API request parameters
     *
     * @var array
     */
    protected $_reqParams = [];

    /**
     * API Endpoint URL
     *
     * @var string
     */
    protected $_apiEndpoint = 'https://api.sendgrid.com/v3';

    /**
     * Prefix for setting custom headers
     *
     * @var string
     */
    protected $_customHeaderPrefix = 'X-';

    /**
     * @var \Cake\Http\Client HTTP Client to use
     */
    public $Client;

    /**
     * Constructor
     *
     * @param array $config Configuration options.
     */
    public function __construct(array $config = [])
    {
        parent::__construct($config);

        if (empty($this->getConfig('apiEndpoint'))) {
            $this->setConfig('apiEndpoint', $this->_apiEndpoint);
        }

        $this->_reqParams = [];
        $this->Client = new Client();
    }

    /**
     * Send mail
     *
     * Example
     * ```
     * $email->setFrom(['you@yourdomain.com' => 'CakePHP SendGrid'])
     *  ->setTo('foo@example.com.com')
     *  ->addTo('bar@example.com')
     *  ->addCc('john@example.com')
     *  ->setHeaders(['X-Custom' => 'headervalue'])
     *  ->setSubject('Email from CakePHP SendGrid plugin')
     *  ->deliver('Message from CakePHP SendGrid plugin');
     * ```
     *
     * @param \Cake\Mailer\Message $message Email message.
     * @return array An array with api response and email parameters
     * @throws \SendGrid\Mailer\Exception\SendGridApiException If api key or from address is not set
     */
    public function send(Message $message): array
    {
        if (empty($this->getConfig('apiKey'))) {
            throw new SendGridApiException('Api Key for SendGrid could not found.');
        }

        $this->_prepareEmailAddresses($message);

        $this->_reqParams['subject'] = $message->getSubject();

        $emailFormat = $message->getEmailFormat();
        if (!empty($message->getBodyHtml())) {
            $this->_reqParams['content'][] = (object)[
                'type' => 'text/html',
                'value' => trim($message->getBodyHtml()),
            ];
        }
        if ($emailFormat == 'both' || $emailFormat == 'text') {
            $this->_reqParams['content'][] = (object)[
                'type' => 'text/plain',
                'value' => trim($message->getBodyText()),
            ];
        }

        $this->_processHeaders($message);

        $this->_processAttachments($message);

        try {
            return $this->_sendEmail();
        } catch (SendGridApiException $e) {
            throw $e;
        } finally {
            $this->_reset();
        }
    }

    /**
     * Sets option for SendGrid API request
     *
     * @param string $key Name of option e.g. template_id, send_at, etc
     * @param mixed $value Value of the option
     * @return void
     */
    public function setOption($key, $value)
    {
        $this->_reqParams[$key] = $value;
    }

    /**
     * Returns the parameters for API request.
     *
     * @return array
     */
    public function getRequestParams()
    {
        return $this->_reqParams;
    }

    /**
     * Prepares the from, to and sender email addresses
     *
     * @param \Cake\Mailer\Message $message Email message
     * @return void
     * @throws \SendGrid\Mailer\Transport\Exception
     */
    protected function _prepareEmailAddresses(Message $message)
    {
        $from = $message->getFrom();
        if (empty($from)) {
            throw new SendGridApiException('Missing from email address.');
        }

        if (key($from) != $from[key($from)]) {
            $this->_reqParams['from'] = (object)['email' => key($from), 'name' => $from[key($from)]];
        } else {
            $this->_reqParams['from'] = (object)['email' => key($from)];
        }

        $emails = [];
        foreach ($message->getTo() as $toEmail => $toName) {
            $emails['to'][] = [
                'email' => $toEmail,
                'name' => $toName,
            ];
        }

        foreach ($message->getCc() as $ccEmail => $ccName) {
            $emails['cc'][] = [
                'email' => $ccEmail,
                'name' => $ccName,
            ];
        }

        foreach ($message->getBcc() as $bccEmail => $bccName) {
            $emails['bcc'][] = [
                'email' => $bccEmail,
                'name' => $bccName,
            ];
        }

        $this->_reqParams['personalizations'][] = (object)$emails;
    }

    /**
     * Prepares the email headers
     *
     * @param \Cake\Mailer\Message $message Email message
     * @return void
     */
    protected function _processHeaders(Message $message)
    {
        $customHeaders = $message->getHeaders(['_headers']);
        if (!empty($customHeaders)) {
            $headers = [];
            foreach ($customHeaders as $header => $value) {
                if (strpos($header, $this->_customHeaderPrefix) === 0 && !empty($value)) {
                    $headers[substr($header, strlen($this->_customHeaderPrefix))] = $value;
                }
            }
            if (!empty($headers)) {
                $this->_reqParams['headers'] = (object)$headers;
            }
        }
    }

    /**
     * Prepares the attachments
     *
     * @param \Cake\Mailer\Message $message Email message
     * @return void
     */
    protected function _processAttachments(Message $message)
    {
        $attachments = $message->getAttachments();
        if (!empty($attachments)) {
            foreach ($attachments as $name => $file) {
                $this->_reqParams['attachments'][] = (object)[
                    'content' => base64_encode(file_get_contents($file['file'])),
                    'filename' => $name,
                    'disposition' => !empty($file['contentId']) ? 'inline' : 'attachment',
                    'content_id' => !empty($file['contentId']) ? $file['contentId'] : '',
                ];
            }
        }
    }

    /**
     * Make an API request to send email
     *
     * @return mixed JSON Response from SendGrid API
     */
    protected function _sendEmail()
    {
        $options = [
            'type' => 'json',
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $this->getConfig('apiKey'),
            ],
        ];

        $response = $this->Client
            ->post("{$this->getConfig('apiEndpoint')}/mail/send", json_encode($this->_reqParams), $options);

        $result = [];
        $result['apiResponse'] = $response->getJson();
        $result['responseCode'] = $response->getStatusCode();
        $result['status'] = $result['responseCode'] == 202 ? 'OK' : 'ERROR';
        if (Configure::read('debug')) {
            $result['reqParams'] = $this->_reqParams;
        }

        return $result;
    }

    /**
     * Resets the parameters
     *
     * @return void
     */
    protected function _reset()
    {
        $this->_reqParams = [];
    }
}
