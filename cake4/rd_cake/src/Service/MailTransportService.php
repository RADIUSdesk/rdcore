<?php

namespace App\Service;

use Cake\Mailer\TransportFactory;
use Cake\ORM\TableRegistry;

class MailTransportService
{
    protected $UserSettings;
    protected $CloudSettings;

    protected int $cloudId = -1;

    public function __construct(){

        $locator                = TableRegistry::getTableLocator();
        $this->UserSettings     = $locator->get('UserSettings');
        $this->CloudSettings    = $locator->get('CloudSettings');
    }

    public function getCloudId(): int{
        return $this->cloudId;
    }

    public function setTransport($cloudId = null){
        /*
         * Load system-wide settings
         */
        $settings = $this->UserSettings
            ->find()
            ->where([
                'user_id' => -1
            ])
            ->all();

        $emailConfig = [];

        foreach ($settings as $setting) {

            if (preg_match('/^email_/', $setting->name)) {
                $emailConfig[$setting->name] = $setting->value;
            }
        }

        /*
         * Override with cloud settings
         */
        if ($cloudId !== null) {

            $enabled = $this->CloudSettings
                ->find()
                ->where([
                    'cloud_id' => $cloudId,
                    'name'     => 'email_enabled',
                    'value'    => '1'
                ])
                ->count();

            if ($enabled) {

                $cloudSettings = $this->CloudSettings
                    ->find()
                    ->where([
                        'cloud_id' => $cloudId
                    ])
                    ->all();

                $emailConfig = [];

                foreach ($cloudSettings as $setting) {

                    if (preg_match('/^email_/', $setting->name)) {

                        $emailConfig[$setting->name]
                            = $setting->value;

                        $this->cloudId = $cloudId;
                    }
                }
            }
        }

        /*
         * Email globally disabled
         */
        if (
            isset($emailConfig['email_enabled']) &&
            $emailConfig['email_enabled'] === '0'
        ) {
            return false;
        }

        /*
         * Drop existing transport
         */
        try {
            TransportFactory::drop('mail_rd');
        } catch (\Exception $e) {
            // Ignore if transport doesn't exist yet
        }

        /*
         * Determine transport
         */
        $transport = $emailConfig['email_transport'] ?? 'smtp';

        $metaData = [];

        /*
         * SMTP transport
         */
        if ($transport === 'smtp') {

            $host = $emailConfig['email_server'];

            if (($emailConfig['email_ssl'] ?? '0') === '1') {
                $host = 'ssl://' . $host;
            }

            $metaData['from']
                = $emailConfig['email_username'];

            if (!empty($emailConfig['email_sendername'])) {

                $metaData['from'] = [
                    $emailConfig['email_username']
                        => $emailConfig['email_sendername']
                ];
            }

            TransportFactory::setConfig('mail_rd', [
                'className' => 'Smtp',
                'host'      => $host,
                'port'      => $emailConfig['email_port'],
                'username'  => $emailConfig['email_username'],
                'password'  => $emailConfig['email_password']
            ]);
        }

        /*
         * SendGrid transport
         */
        if ($transport === 'sendgrid') {

            TransportFactory::setConfig('mail_rd', [
                'className' => 'SendGrid.SendGrid',
                'apiKey'    => $emailConfig['email_sg_api']
            ]);

            $metaData['from']
                = $emailConfig['email_sg_sendername'];

            if (!empty($emailConfig['email_sg_template'])) {

                $metaData['sg_template']
                    = $emailConfig['email_sg_template'];
            }
        }

        return $metaData;
    }
}
