# SendGrid Plugin for CakePHP

[![CI](https://github.com/sprintcube/cakephp-sendgrid/workflows/CI/badge.svg?branch=master)](https://github.com/sprintcube/cakephp-sendgrid/actions)
[![codecov](https://codecov.io/gh/sprintcube/cakephp-sendgrid/branch/master/graph/badge.svg)](https://codecov.io/gh/sprintcube/cakephp-sendgrid)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)
[![Latest Stable Version](https://poser.pugx.org/sprintcube/cakephp-sendgrid/v/stable)](https://packagist.org/packages/sprintcube/cakephp-sendgrid)
[![Total Downloads](https://poser.pugx.org/sprintcube/cakephp-sendgrid/downloads)](https://packagist.org/packages/sprintcube/cakephp-sendgrid)

This plugin provides email delivery using [SendGrid](https://sendgrid.com/).

This branch is for use with CakePHP 4.0+. For CakePHP 3, please use cake-3.x branch.

## Requirements

This plugin has the following requirements:

* CakePHP 4.0 or greater.
* PHP 7.2 or greater.

## Installation

You can install this plugin into your CakePHP application using [composer](http://getcomposer.org).

```
composer require sprintcube/cakephp-sendgrid
```

After installation, [Load the plugin](http://book.cakephp.org/3.0/en/plugins.html#loading-a-plugin)
```php
Plugin::load('SendGrid');
```
Or, you can load the plugin using the shell command
```sh
$ bin/cake plugin load SendGrid
```

## Setup

Set your SendGrid Api key in `EmailTransport` settings in app.php

```php
'EmailTransport' => [
...
  'sendgrid' => [
      'className' => 'SendGrid.SendGrid',
      'apiKey' => 'your-api-key' // your api key
  ]
]
```
And create new delivery profile in `Email` settings.

```php
'Email' => [
    'default' => [
        'transport' => 'default',
        'from' => 'you@localhost',
        //'charset' => 'utf-8',
        //'headerCharset' => 'utf-8',
    ],
    'sendgrid' => [
        'transport' => 'sendgrid'
    ]
]
```

## Usage

You can now simply use the CakePHP `Email` to send an email via SendGrid.

```php
$email = new SendGridMailer();
$email->setFrom(['you@yourdomain.com' => 'CakePHP SendGrid'])
    ->setTo('foo@example.com.com')
    ->addTo('bar@example.com')
    ->addCc('john@example.com')
    ->setSubject('Email from CakePHP SendGrid plugin')
    ->deliver('Message from CakePHP SendGrid plugin');
```

That is it.

## Advance Use
You can also use few more options to send email via SendGrid APIs. To do so, just call the appropriate methods before sending the email.

### Custom Headers
You can pass your own headers. It must be prefixed with "X-". Use the default `Email::setHeaders` method like,

```php
$email = new SendGridMailer();
$email->setFrom(['you@yourdomain.com' => 'CakePHP SendGrid'])
    ->setTo('foo@example.com.com')
    ->setHeaders([
        'X-Custom' => 'headervalue',
        'X-MyHeader' => 'myvalue'
    ])
    ->setSubject('Email from CakePHP SendGrid plugin')
    ->deliver('Message from CakePHP SendGrid plugin');
```

> When sending request, `X-` will be removed from header name e.g. X-MyHeader will become MyHeader

### Attachments
Set your attachments using `Email::setAttachments` method.

```php
$email = new SendGridMailer();
$email->setFrom(['you@yourdomain.com' => 'CakePHP SendGrid'])
    ->setTo('foo@example.com.com')
    ->setSubject('Email from CakePHP SendGrid plugin')
    ->setAttachments([
        'cake_icon1.png' => Configure::read('App.imageBaseUrl') . 'cake.icon.png',
        'cake_icon2.png' => ['file' => Configure::read('App.imageBaseUrl') . 'cake.icon.png'],
        WWW_ROOT . 'favicon.ico'
    ])
    ->deliver('Message from CakePHP SendGrid plugin');
```

> To send inline attachment, use `contentId` parameter while setting attachment.

### Template
You can use the template created in SendGrid backend. Get the template id by either using their API or from the URL.
Set the template id using `setTemplate` method.

```php
$email = new SendGridMailer();
$email->setTo('foo@example.com.com')
    ->setTemplate('d-xxxxxx')
    ->deliver();
```

### Schedule
You can schedule the email to be sent in future date. You can set upto 72 hours in future as per SendGrid documentation. You need to pass a unix timestamp value.

```php
$email = new SendGridMailer();
$email->setTo('foo@example.com.com')
    ->setSendAt(1649500630)
    ->deliver();
```

## Reporting Issues

If you have a problem with this plugin or any bug, please open an issue on [GitHub](https://github.com/sprintcube/cakephp-sendgrid/issues).
