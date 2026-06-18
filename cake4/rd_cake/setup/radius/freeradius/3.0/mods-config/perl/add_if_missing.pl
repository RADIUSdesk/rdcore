#! /usr/bin/perl -w
use strict;
use Data::Dumper;
use JSON;
use LWP::UserAgent;

# Use core Perl modules for date manipulation
use Time::Piece;  # Core module since Perl 5.10
use Time::Seconds; # Core module since Perl 5.10


# use ...
# This is very important !
use vars qw(%RAD_REQUEST %RAD_CHECK %RAD_REPLY %RAD_CONFIG %conf);

# Bring the global hashes into the package scope
our (%RAD_REQUEST, %RAD_REPLY, %RAD_CHECK, %RAD_CONFIG, %RAD_STATE, %RAD_PERLCONF);

use constant RLM_MODULE_OK=> 2; # /* the module is OK,continue */
use constant RLM_MODULE_NOOP=> 7;
use constant RLM_MODULE_UPDATED=> 8; # /* OK (pairs modified) */

#___ RADIUSdesk _______
#sudo apt install libjson-perl libwww-perl

sub read_conf {
    $conf{'api_url'}     = 'http://127.0.0.1/cake4/rd_cake/permanent-users/add.json';
    $conf{'token'}       = 'fe707fcd-6316-bbbb-aaa-03ae7fc4ffff';
    $conf{'cloud_id'}    = 23;
    $conf{'username'}    = 'testuser'; #This will change
    $conf{'password'}    = 'testing123'; #This will change
    $conf{'realm'}       = 'pppoe';
    $conf{'profile'}     = 'NoLimit';
    $conf{'grace_days'}  = 4;
}

sub add_user {

    my $mac         = $RAD_CONFIG{'Tmp-String-0'};
    my $username    = 'user_'.$mac;
    #Find out when the reset time should be 
   
    # From and To span 
    my $from        = localtime;

    # Create today's date in dd/mm/yyyy format
    my $from_str    = $from->strftime('%Y-%m-%d');

    # Add grace_days days
    my $to_date     = $from + ($conf{'grace_days'} * ONE_DAY);

    # Create future date in dd/mm/yyyy format
    my $to_str      = $to_date->strftime('%Y-%m-%d');
       
    my $payload = {
        username    => $username,
        password    => $conf{'password'},
        realm       => $conf{'realm'},
        profile     => $conf{'profile'},
        cloud_id    => $conf{'cloud_id'},
        token       => $conf{'token'},
        mac_address => $mac,
        active      => 'active',
        from_date   => $from_str,
        to_date     => $to_str
        # Add optional fields as needed
    };

    my $json_payload = encode_json($payload);

    my $ua = LWP::UserAgent->new;
    my $response = $ua->post($conf{'api_url'},
        'Content-Type' => 'application/json',
        Content => $json_payload,
    );

    if ($response->is_success) {
        $RAD_REQUEST{'User-Name'}       = $username;
        $RAD_REQUEST{'User-Password'}   = $conf{'password'};
        $RAD_REPLY{'Class'}             = $username;
        print "Added $conf{'username'} : ", $response->decoded_content, "\n";
    } else {
        print "Error: ", $response->status_line, "\n";
    }
    
}


sub authorize {    
    if (exists $RAD_CONFIG{'Tmp-String-0'}) {
        &add_user();
    }
    return RLM_MODULE_NOOP;
}

sub CLONE {
    read_conf();
}
