<?php

namespace App\Command;

//as www-data
//cd /var/www/rdcore/cake4/rd_cake && bin/cake send_notifications >> /dev/null 2>&1 

use Cake\Command\Command;
use Cake\Console\Arguments;
use Cake\Console\ConsoleIo;
use Cake\Mailer\Mailer;
use Cake\ORM\TableRegistry;

class SendNotificationsCommand extends Command {

    protected $UserSettings;
    protected $Clouds;
    protected $CloudAdmins;
    protected $Alerts;
    protected $MailTransport;
    protected $RdLogger;

    public function initialize(): void {

        parent::initialize();

        $this->UserSettings  = TableRegistry::getTableLocator()->get('UserSettings');
        $this->Clouds        = TableRegistry::getTableLocator()->get('Clouds');
        $this->CloudAdmins   = TableRegistry::getTableLocator()->get('CloudAdmins');

        // Replace with your actual alerts table
        $this->Alerts        = TableRegistry::getTableLocator()->get('Alerts');

        // If these are components/services, refactor them into services
        $this->MailTransport = new \App\Service\MailTransportService();
        $this->RdLogger      = new \App\Service\RdLoggerService();
    }

    public function execute(Arguments $args, ConsoleIo $io) {

        $userSettings = $this->UserSettings
            ->find()
            ->where([
                'UserSettings.name'  => 'alert_activate',
                'UserSettings.value' => '1'
            ])
            ->contain([
                'Users' => ['Groups']
            ])
            ->all();

        $alertsCluster = [];

        foreach ($userSettings as $us) {
        
            $user = [
                'id'         => $us->user->id,
                'username'   => $us->user->username,
                'group_name' => $us->user->group->name
            ];

            $id     = $us->user->id;
            $email  = $us->user->email;

            /*
             * Determine frequency
             */
            $freq = 1;

            $qFreq = $this->UserSettings
                ->find()
                ->where([
                    'user_id' => $id,
                    'name'    => 'alert_frequency'
                ])
                ->first();

            if ($qFreq) {
                $freq = (int)$qFreq->value;
            }

            $dateHour  = (int)date('G');
            $hourMatch = $dateHour % $freq;
            

            /*
             * Only send at interval
             */
            if ($hourMatch !== 0) {
                continue;
            }

            /*
             * Build alert query
             */
            $query = $this->Alerts
                ->find()
                ->where([
                    'resolved IS'   => null,
                    'category'      => 'alert', //Only Alerts
                    'acknowledged IS' => null //Only send alert items NOT acknowledged
                ])
                ->contain([
                    'Meshes',
                    'Nodes',
                    'ApProfiles',
                    'Aps',
                    'Users'
                ]);

            /*
             * Non-root user filtering
             */
            if ($id !== 44) {

                $listOfClouds = [];

                /*
                 * Owned clouds
                 */
                $ownClouds = $this->Clouds
                    ->find()
                    ->where([
                        'user_id' => $id
                    ])
                    ->all();

                foreach ($ownClouds as $cloud) {
                    $listOfClouds[] = $cloud->id;
                }

                /*
                 * Admin clouds
                 */
                $cloudAdmins = $this->CloudAdmins
                    ->find()
                    ->where([
                        'user_id' => $id
                    ])
                    ->all();

                foreach ($cloudAdmins as $cloudAdmin) {
                    $listOfClouds[] = $cloudAdmin->cloud_id;
                }

                $listOfClouds = array_unique($listOfClouds);

                /*
                 * Prevent empty IN()
                 */
                if (!empty($listOfClouds)) {

                    $query->where([
                        'OR' => [
                            'Meshes.cloud_id IN'     => $listOfClouds,
                            'ApProfiles.cloud_id IN' => $listOfClouds
                        ]
                    ]);
                }
            }

            $alertsResults = $query->all();

            $alerts = [];

            foreach ($alertsResults as $alert) {

                $row = [];

                /*
                 * Network/device info
                 */
                if ($alert->mesh) {

                    $row['network'] = $alert->mesh->name;
                    $row['type']    = 'mesh';

                    if ($alert->node) {
                        $row['device'] = $alert->node->name;
                    }
                }

                if ($alert->ap_profile) {

                    $row['network'] = $alert->ap_profile->name;
                    $row['type']    = 'ap_profile';

                    if ($alert->ap) {
                        $row['device'] = $alert->ap->name;
                    }
                }

                /*
                 * Dynamic schema fields
                 */
                $fields = $this->Alerts->getSchema()->columns();

                foreach ($fields as $field) {

                    $row[$field] = $alert->{$field};

                    if (in_array($field, [
                        'detected',
                        'created',
                        'modified',
                        'acknowledged',
                        'resolved'
                    ])) {

                        if ($alert->{$field} === null) {

                            $row[$field . '_in_words'] = 'Never';

                        } else {

                            $row[$field . '_in_words']
                                = $alert->{$field}->diffForHumans();

                            if ($field === 'acknowledged') {

                                $row['before_acknowledged_in_words']
                                    = $alert->detected->diffForHumans(
                                        $alert->{$field},
                                        true
                                    );

                                if ($alert->user) {
                                    $row['acknowledged_by']
                                        = $alert->user->username;
                                }
                            }

                            if ($field === 'resolved') {

                                $row['before_resolved_in_words']
                                    = $alert->detected->diffForHumans(
                                        $alert->{$field},
                                        true
                                    );
                            }
                        }
                    }
                }

                $alerts[] = $row;
            }

            /*
             * Store cluster
             */
            $alertsCluster[$id] = [
                'user'   => $user,
                'email'  => $email,
                'alerts' => $alerts
            ];
        }

        /*
         * Send emails
         */
        foreach ($alertsCluster as $cluster) {

            $metaData = $this->MailTransport->setTransport();

            if ($metaData === false) {
                continue;
            }

            $emailAddress = $cluster['email'];
            $alerts       = $cluster['alerts'];

            if (empty($alerts)) {
                continue;
            }

            $mailer = new Mailer([
                'transport' => 'mail_rd'
            ]);

            $mailer
                ->setSubject('Active Alerts')
                ->setFrom($metaData['from'])
                ->setTo($emailAddress)
                ->setViewVars([
                    'user'   => $cluster['user'],   
                    'alerts' => $alerts
                ])
                ->setEmailFormat('html');

            $mailer
                ->viewBuilder()
                ->setTemplate('alert_template')
                ->setLayout('alert_notify');

            $mailer->deliver();

            $settingsCloudId = $this->MailTransport->getCloudId();

            $this->RdLogger->addEmailHistory(
                $settingsCloudId,
                $emailAddress,
                'alerts_email',
                '==Alerts Cluster=='
            );

            $io->success("Alert email sent to {$emailAddress}");
        }

        return Command::CODE_SUCCESS;
    }
}
