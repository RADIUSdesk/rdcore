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
 * @since     1.0.0
 */

namespace SendGrid\Test\TestCase\Mailer\Transport;

use Cake\TestSuite\TestCase;

class SendGridTransportTest extends TestCase
{
    public function setUp(): void
    {
        parent::setUp();
    }

    // public function testTemplate()
    // {
    //     Email::dropTransport('sendgrid');
    //     Email::setConfigTransport('sendgrid', ['className' => 'SendGrid.SendGrid', 'apiKey' => '123']);

    //     $email = new Email();
    //     $email->setProfile(['transport' => 'sendgrid']);

    //     $emailInstance = $email->getTransport();
    //     $emailInstance->setTemplate(111);

    //     $reqParams = $emailInstance->getRequestParams();
    //     $this->assertArrayHasKey('template_id', $reqParams);
    //     $this->assertEquals(111, $reqParams['template_id']);
    // }

    // public function testSchedule()
    // {
    //     Email::dropTransport('sendgrid');
    //     Email::setConfigTransport('sendgrid', ['className' => 'SendGrid.SendGrid', 'apiKey' => '123']);

    //     $email = new Email();
    //     $email->setProfile(['transport' => 'sendgrid']);

    //     $emailInstance = $email->getTransport();
    //     $emailInstance->setScheduleTime(1537958411);

    //     $reqParams = $emailInstance->getRequestParams();
    //     $this->assertArrayHasKey('send_at', $reqParams);
    //     $this->assertEquals(1537958411, $reqParams['send_at']);
    // }

    // public function testAddresses()
    // {
    //     Email::dropTransport('sendgrid');
    //     Email::setConfigTransport('sendgrid', ['className' => 'SendGrid.SendGrid', 'apiKey' => '123']);

    //     $email = new Email();
    //     $email->setProfile(['transport' => 'sendgrid']);
    //     $res = $email->setFrom('from@example.com')
    //         ->setTo('to@example.com')
    //         ->setCc('cc@example.com')
    //         ->setBcc('bcc@example.com')
    //         ->send();

    //     $reqParams = $res['reqParams'];

    //     $this->assertArrayHasKey('from', $reqParams);
    //     $this->assertObjectHasAttribute('email', $reqParams['from']);
    //     $this->assertEquals('from@example.com', $reqParams['from']->email);
    //     $this->assertArrayHasKey('personalizations', $reqParams);
    //     $this->assertObjectHasAttribute('to', $reqParams['personalizations'][0]);
    //     $this->assertArrayHasKey('email', $reqParams['personalizations'][0]->to[0]);
    //     $this->assertEquals('to@example.com', $reqParams['personalizations'][0]->to[0]['email']);
    //     $this->assertObjectHasAttribute('cc', $reqParams['personalizations'][0]);
    //     $this->assertArrayHasKey('email', $reqParams['personalizations'][0]->cc[0]);
    //     $this->assertEquals('cc@example.com', $reqParams['personalizations'][0]->cc[0]['email']);
    //     $this->assertObjectHasAttribute('bcc', $reqParams['personalizations'][0]);
    //     $this->assertArrayHasKey('email', $reqParams['personalizations'][0]->bcc[0]);
    //     $this->assertEquals('bcc@example.com', $reqParams['personalizations'][0]->bcc[0]['email']);
    // }

    // public function testAttachments()
    // {
    //     Email::dropTransport('sendgrid');
    //     Email::setConfigTransport('sendgrid', ['className' => 'SendGrid.SendGrid', 'apiKey' => '123']);

    //     $email = new Email();
    //     $email->setProfile(['transport' => 'sendgrid']);
    //     $res = $email->setFrom(['from@example.com' => 'CakePHP SendGrid Email'])
    //         ->setSender(['from@example.com' => 'CakePHP SendGrid Email'])
    //         ->setTo('to@example.com')
    //         ->setEmailFormat('both')
    //         ->setSubject('Email from CakePHP SendGrid plugin')
    //         ->setAttachments([
    //             'logo.png' => TESTS . DS . 'assets' . DS . 'logo.png'
    //         ])
    //         ->send('Hello there, <br> This is an email from CakePHP SendGrid Email plugin.');

    //     $reqParams = $res['reqParams'];
    //     $this->assertArrayHasKey('attachments', $reqParams);
    //     $this->assertObjectHasAttribute('filename', $reqParams['attachments'][0]);
    //     $this->assertEquals('logo.png', $reqParams['attachments'][0]->filename);
    //     $this->assertEquals('attachment', $reqParams['attachments'][0]->disposition);
    // }

    // public function testInlineAttachments()
    // {
    //     Email::dropTransport('sendgrid');
    //     Email::setConfigTransport('sendgrid', ['className' => 'SendGrid.SendGrid', 'apiKey' => '123']);

    //     $email = new Email();
    //     $email->setProfile(['transport' => 'sendgrid']);
    //     $res = $email->setFrom(['from@example.com' => 'CakePHP SendGrid Email'])
    //         ->setSender(['from@example.com' => 'CakePHP SendGrid Email'])
    //         ->setTo('to@example.com')
    //         ->setEmailFormat('both')
    //         ->setSubject('Email from CakePHP SendGrid plugin')
    //         ->setAttachments([
    //             'logo.png' => [
    //                 'file' => TESTS . DS . 'assets' . DS . 'logo.png',
    //                 'contentId' => 'my-unique-id'
    //             ]
    //         ])
    //         ->send('Hello there, <br> This is an email from CakePHP SendGrid Email plugin.');

    //     $reqParams = $res['reqParams'];
    //     $this->assertArrayHasKey('attachments', $reqParams);
    //     $this->assertObjectHasAttribute('filename', $reqParams['attachments'][0]);
    //     $this->assertEquals('logo.png', $reqParams['attachments'][0]->filename);
    //     $this->assertEquals('my-unique-id', $reqParams['attachments'][0]->content_id);
    //     $this->assertEquals('inline', $reqParams['attachments'][0]->disposition);
    // }

    // public function testCustomHeaders()
    // {
    //     Email::dropTransport('sendgrid');
    //     Email::setConfigTransport('sendgrid', ['className' => 'SendGrid.SendGrid', 'apiKey' => '123']);

    //     $email = new Email();
    //     $email->setProfile(['transport' => 'sendgrid']);
    //     $res = $email->setFrom(['from@example.com' => 'CakePHP SendGrid Email'])
    //         ->setSender(['from@example.com' => 'CakePHP SendGrid Email'])
    //         ->setTo('to@example.com')
    //         ->setEmailFormat('both')
    //         ->setSubject('Email from CakePHP SendGrid plugin')
    //         ->setHeaders(['X-Custom' => 'headervalue'])
    //         ->send('Hello there, <br> This is an email from CakePHP SendGrid Email plugin.');

    //     $reqParams = $res['reqParams'];
    //     $this->assertArrayHasKey('headers', $reqParams);
    //     $this->assertObjectHasAttribute('Custom', $reqParams['headers']);
    //     $this->assertEquals('headervalue', $reqParams['headers']->Custom);
    // }

    // public function testMissingApiKey()
    // {
    //     $this->expectException('SendGrid\Mailer\Exception\SendGridApiException');

    //     Email::dropTransport('sendgrid');
    //     Email::setConfigTransport('sendgrid', ['className' => 'SendGrid.SendGrid', 'apiKey' => '']);

    //     $email = new Email();
    //     $email->setProfile(['transport' => 'sendgrid']);
    //     $email->setFrom('from@example.com')
    //         ->setSender('from@example.com')
    //         ->setTo('to@example.com')
    //         ->setEmailFormat('both')
    //         ->setSubject('Email from CakePHP SendGrid plugin')
    //         ->send('Hello there, <br> This is an email from CakePHP SendGrid Email plugin.');
    // }

    // public function testInvalidKey()
    // {
    //     Email::dropTransport('sendgrid');
    //     Email::setConfigTransport('sendgrid', ['className' => 'SendGrid.SendGrid', 'apiKey' => '123']);

    //     $email = new Email();
    //     $email->setProfile(['transport' => 'sendgrid']);
    //     $res = $email->setFrom(['from@example.com' => 'CakePHP SendGrid Email'])
    //         ->setSender(['from@example.com' => 'CakePHP SendGrid Email'])
    //         ->setTo('to@example.com')
    //         ->setEmailFormat('both')
    //         ->setSubject('Email from CakePHP SendGrid plugin')
    //         ->send('Hello there, <br> This is an email from CakePHP SendGrid Email plugin.');

    //     $this->assertArrayHasKey('errors', $res['apiResponse']);
    // }
}
