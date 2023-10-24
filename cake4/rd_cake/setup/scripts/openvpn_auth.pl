#!/usr/bin/perl

use strict;
use warnings;
use LWP::UserAgent;
use HTTP::Request::Common;


#______________ SETUP VARIABLES ____________________________
#__Modify these values to point to your RADIUSdesk server___
#___________________________________________________________

my $protocol='http';
my $server_name_or_ip='164.160.89.129';
my $api_path="/cake4/rd_cake/openvpn-servers/auth-client.json";

my $filename = '/tmp/openvpn.txt';
open(my $fh, '>', $filename) or die "Could not open file '$filename' $!";

#Taken from the sample script
my $ARG;
if ($ARG = shift @ARGV) {
    if (!open (UPFILE, "<$ARG")) {
	print "Could not open username/password file: $ARG\n";
		exit 1;
    }
} else {
    print "No username/password file specified on command line\n";
    exit 1;
}

my $username = <UPFILE>;
my $password = <UPFILE>;
#my $username='mesh_C4-4B-D1-00-97-49';
#my $password='b4246774bc90d5cad28385cfaa6f8136';

if (!$username || !$password) {
    print "Username/password not found in file: $ARG\n";
    exit 1;
}

chomp $username;
chomp $password;

close (UPFILE);
#END Taken from the sample script

#my $username='ap_78-A3-51-0B-BC-CA';
#my $password='50f8195626e2484555318eaa612743f5';


#my $username='mesh_78-A3-51-0B-BE-C6';
#my $password='9feed52917a13a7a25233fc7d279e2bf';


print $fh "Username: $username\n";
print $fh "Password: $password\n";

close $fh;

my $ua              = LWP::UserAgent->new;
my $server_endpoint = $protocol.'://'.$server_name_or_ip.$api_path;
my @post_data       = [username => $username, password => $password];
my $resp            = $ua->request(POST $server_endpoint, @post_data);

if($resp->is_success){

    my $str = $resp->decoded_content;
    print "Received reply: $str\n";
    
    if(index($str, 'false') != -1){
        print "Contains false - FAIL!!\n";
        exit 1;
    }
    
    if(index($str, 'true') != -1){
        print "Contains true - PASS!!\n";
        exit 0;
    } 
    
}else{
    print "HTTP POST error code: ", $resp->code, "\n";
    print "HTTP POST error message: ", $resp->message, "\n";
    exit 1;
}

#By default we fail them
exit 1;


