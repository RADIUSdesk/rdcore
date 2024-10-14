<?php
/*
 * Local configuration file to provide any overrides to your app.php configuration.
 * Copy and save this file as app_local.php and make changes as required.
 * Note: It is not recommended to commit files with credentials such as app_local.php
 * into source code version control.
 */
return [
    /*
     * Debug Level:
     *
     * Production Mode:
     * false: No error messages, errors, or warnings shown.
     *
     * Development Mode:
     * true: Errors and warnings shown.
     */
    //'debug' => filter_var(env('DEBUG', true), FILTER_VALIDATE_BOOLEAN),
    
    //RADIUSdesk -> Change this to line above to troubleshoot   
    'debug' => filter_var(env('DEBUG', true), FILTER_VALIDATE_BOOLEAN),

    /*
     * Security and encryption configuration
     *
     * - salt - A random string used in security hashing methods.
     *   The salt value is also used as the encryption key.
     *   You should treat it as extremely sensitive data.
     */
    'Security' => [
        //'salt' => env('SECURITY_SALT', '5792d649929a45793978ed5f16cf7a0395b9c83b2f5fdb761f1cca2141b5f929'), //APP Generated
        'salt' => env('SECURITY_SALT', 'DYhG93b0qyJfIxfs2guVoUubWwvniR2G0FgaC9miAA'), //RD Specific
    ],

    /*
     * Connection information used by the ORM to connect
     * to your application's datastores.
     *
     * See app.php for more configuration options.
     */
    'Datasources' => [
        'default' => [
            'host'          => 'localhost',
            'className'     => 'Cake\Database\Connection',
            'driver'        => 'Cake\Database\Driver\Mysql',
            'persistent'    => false,
            'username'      => 'rd',
            'password'      => 'rd',
            'database'      => 'rd',
            // Comment out the line below if you are using PostgreSQL
            ////'encoding' => 'utf8mb4',
         	'encoding'      => 'utf8',
            'timezone'      => 'UTC',
            'cacheMetadata' => true,
            'log'	        => false,
            'url'           => env('DATABASE_URL', null),
        ], 

//==== FOR Postgresql =====
/*
	'default' => [
             'className' => 'Cake\Database\Connection',
                'driver' => 'Cake\Database\Driver\Postgres',
                'persistent' => false,
                'host' => '127.0.0.1',
                'port' => '5432',
                'username' => 'rd',
                'password' => 'rd',
                'database' => 'rd',
                'schema' => 'public', // Ensure this is correct
        ],
*/

        /*
        	The CakePHPv3 database with the old structure
        	create database rd_cake3;
			GRANT ALL PRIVILEGES ON rd_cake3.* to 'rd_cake3'@'127.0.0.1' IDENTIFIED BY 'rd_cake3';
			GRANT ALL PRIVILEGES ON rd_cake3.* to 'rd_cake3'@'localhost' IDENTIFIED BY 'rd_cake3';
			exit;
        
        */
        
        'cake3' => [
            'host' => 'localhost',
            'className' => 'Cake\Database\Connection',
            'driver' => 'Cake\Database\Driver\Mysql',
            'persistent' => false,
            'username' => 'rd_cake3',
            'password' => 'rd_cake3',
            'database' => 'rd_cake3',
            // Comment out the line below if you are using PostgreSQL
            ////'encoding' => 'utf8mb4',
         	'encoding' => 'utf8',
            'timezone' => 'UTC',
            'cacheMetadata' => true,
            'log'	=> false,
            'url' => env('DATABASE_URL', null),
        ],
        

        /*
         * The test connection is used during the test suite.
         */
         /* //OCT 2022 disable this one for Docker image to work//
        'test' => [
            'host' => 'localhost',
            //'port' => 'non_standard_port_number',
            'username' => 'my_app',
            'password' => 'secret',
            'database' => 'test_myapp',
            //'schema' => 'myapp',
            'url' => env('DATABASE_TEST_URL', 'sqlite://127.0.0.1/tests.sqlite'),
        ],
        */
    ],

    /*
     * Email configuration.
     *
     * Host and credential configuration in case you are using SmtpTransport
     *
     * See app.php for more configuration options.
     */
    'EmailTransport' => [
        'default' => [
            'host' => 'localhost',
            'port' => 25,
            'username' => null,
            'password' => null,
            'client' => null,
            'url' => env('EMAIL_TRANSPORT_DEFAULT_URL', null),
        ],
    ],
];
