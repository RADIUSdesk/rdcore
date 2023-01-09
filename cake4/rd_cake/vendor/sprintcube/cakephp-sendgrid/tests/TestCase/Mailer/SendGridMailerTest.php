<?php
declare(strict_types=1);

namespace SendGrid\Test\TestCase\Mailer;

use Cake\Mailer\TransportFactory;
use Cake\TestSuite\TestCase;
use SendGrid\Mailer\SendGridMailer;

/**
 * SendGrid\Mailer\SendGridMailer Test Case
 */
class SendGridMailerTest extends TestCase
{
    /**
     * Test subject
     *
     * @var \SendGrid\Mailer\SendGridMailer
     */
    protected $SendGridMailer;

    /**
     * setUp method
     *
     * @return void
     */
    public function setUp(): void
    {
        parent::setUp();

        TransportFactory::drop('sendgrid');
        TransportFactory::setConfig('sendgrid', ['className' => 'SendGrid.SendGrid', 'apiKey' => 'xxxxxxx-test-xxxxxxx']);

        $this->SendGridMailer = new SendGridMailer();
    }

    /**
     * Test __construct method
     *
     * @return void
     * @uses \SendGrid\Mailer\SendGridMailer::__construct()
     */
    public function testConstruct(): void
    {
        $this->assertInstanceOf('SendGrid\Mailer\Transport\SendGridTransport', $this->SendGridMailer->getTransport());
    }
}
