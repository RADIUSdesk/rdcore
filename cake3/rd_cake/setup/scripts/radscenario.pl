#!/usr/bin/perl

# print debug output? (0=no, 1=yes)
my $debug = 0;

# INTRODUCTION
##############
#
# radscenario is meant to simulate user sessions.
# It uses radclient to send packets to a radius server.
#

# SCENARIOFILE STRUCTURE
########################
#
# The scenariofile is processed line by line.
# Empty lines and lines starting with # are ignored.
#
# To set the authentication server properties, use the following lines:
#   auth_host    <ipaddress> (default: 127.0.0.1)
#   auth_port    <number>    (default: 1812)
#   auth_secret  <string>    (default: testing123)
#   auth_timeout <number>    (default: 2)
#   auth_retry   <number>    (default: 2)
#
# To set the accounting server properties, use the following lines:
#   acct_host    <ipaddress> (default: 127.0.0.1)
#   acct_port    <number>    (default: 1813)
#   acct_secret  <string>    (default: testing123)
#   acct_timeout <number>    (default: 2)
#   acct_retry   <number>    (default: 2)
#
# To send an authentication packet, use the following line:
#   auth <attribute>=<value> [<attribute>=<value> ...]
#
# To send an accounting packet, use the following line:
#   acct <attribute>=<value> [<attribute>=<value> ...]
#
# To wait a while, use the following line:
#   sleep <number>
#

# SCENARIOFILE EXAMPLE
######################
# Comment out the lines you want to use!
# Send an auth request (default server settings are used)
#auth User-Name=steve User-Password=testing
# Send an acct start request (default server settings are used)
#acct Acct-Status-Type=Start User-Name=steve
# Send an acct stop request (default server settings are used)
#acct Acct-Status-Type=Stop User-Name=steve Acct-Session-Time=10 Acct-Terminate-Cause=User-Request
# Switch to another radius server
#auth_host 10.10.10.10
#auth_port 1645
#auth_secret mysecret
#acct_host 10.10.10.10
#acct_port 1646
#acct_secret mysecret
# Send an auth request, wait 1 second, send an acct start request, wait five seconds, send an acct stop request
#auth User-Name=auser User-Password=apass
#sleep 1
#acct Acct-Status-Type=Start User-Name=auser
#sleep 5
#acct Acct-Status-Type=Stop User-Name=auser Acct-Session-Time=5 Acct-Input-Octets=5000 Acct-Output-Octets=1000
# 

# TODO
######
#
# - allow spaces in values
#

#
# DEVELOPMENT HISTORY
#####################
#
# 2004-10-12 Thor Spruyt <thor.spruyt@pandora.be>
# Start of the script.
# Supports basic auth and acct server configuration
# Supports basic auth, acct and sleep functionality
#

use strict;

my $debugstr = "DEBUG";
my $d = $debugstr;


#------------------------------------------------------
#---Dirk add on and modification-----------------------

#my $username = "steve";
my $username = $ARGV[0];

#my $password = "testing";
my $password    = $ARGV[1];
my $acct_flag   = $ARGV[2];

#Temp add on to do disconnects
my $disconn_flag= $ARGV[3];

my $radclient = "radclient -x";
#my $radclient = "/usr/local/bin/radclient";

my $calling_station = "AA-AA-AA-AA-AA-AA"; #"Calling-Station-Id = 
my $called_station  = "BB-BB-BB-BB-BB-BB"; #Called-Station-Id = 



my @scenario_string = ("auth User-Name=$username User-Password=$password Called-Station-Id=$called_station Calling-Station-Id=$calling_station");

if($disconn_flag){

    system("echo \"User-Name = $username\" | radclient 127.0.0.1:3799 40 testing123");
    exit;
}

#For accounting
if($acct_flag){
my $id=time()."_test";
@scenario_string = (
	"auth User-Name=$username User-Password=$password Called-Station-Id=$called_station Calling-Station-Id=$calling_station",
    "acct Acct-Status-Type=Start User-Name=$username Acct-Session-Id=$id Called-Station-Id=$called_station Calling-Station-Id=$calling_station",
    "acct Acct-Status-Type=Stop User-Name=$username Acct-Session-Time=10 Acct-Input-Octets=10 Acct-Output-Octets=10 Acct-Terminate-Cause=User-Request Acct-Session-Id=$id Called-Station-Id=$called_station Calling-Station-Id=$calling_station"
);
}




#--------------------------------------------------------

# set packet codes
my %packetname = (
	1  => "Access-Request",
	2  => "Access-Accept",
	3  => "Access-Reject",
	4  => "Accounting-Request",
	5  => "Accounting-Response",
	6  => "Accounting-Status",
	7  => "Password-Request",
	8  => "Password-Accept",
	9  => "Password-Reject",
	10 => "Accounting-Message",
	11 => "Access-Challenge",
	12 => "Status-Server",
	13 => "Status-Client",
    40 => "Disconnect-Request",
    41 => "Disconnect-ACK",
    42 => "Disconnect-NAK"

    );

# check if scenario file is specified
if (!$radclient) {
	print STDERR "Usage: $0 <radclient> \n";
	exit -1;
} else {
	$debug and print STDERR "$d Using radclient \"$radclient\"\n";
}

use IPC::Open3;
use IO::Select;

my $auth_host    = "127.0.0.1";
my $auth_port    = "1812";
my $auth_secret  = "testing123";
my $auth_timeout = 2;
my $auth_retry   = 2;
my $acct_host    = "127.0.0.1";
my $acct_port    = "1813";
my $acct_secret  = "testing123";
my $acct_timeout = 2;
my $acct_retry   = 2;

my $last_auth_id = 0;
my $last_auth_code = 0;

foreach (@scenario_string) {
	chomp;
	if (/^#/) {
		$debug and print STDERR "$d Skipping comment: $_\n";
		next;
	} elsif (/^\s*$/) {
		$debug and print STDERR "$d Skipping empty line\n";
		next;
	} elsif (/^auth_host\s+(.+)$/i) {
		$debug and print STDERR "$d Setting auth_host to $1\n";
		$auth_host = $1;
	} elsif (/^auth_port\s+(.+)$/i) {
		$debug and print STDERR "$d Setting auth_port to $1\n";
		$auth_port = $1;
	} elsif (/^auth_secret\s+(.+)$/i) {
		$debug and print STDERR "$d Setting auth_secret to $1\n";
		$auth_secret = $1;
	} elsif (/^auth_timeout\s+(.+)$/i) {
		$debug and print STDERR "$d Setting auth_timeout to $1\n";
		$auth_timeout = $1;
	} elsif (/^auth_retry\s+(.+)$/i) {
		$debug and print STDERR "$d Setting auth_retry to $1\n";
		$auth_retry = $1;
	} elsif (/^acct_host\s+(.+)$/i) {
		$debug and print STDERR "$d Setting acct_host to $1\n";
		$acct_host = $1;
	} elsif (/^acct_port\s+(.+)$/i) {
		$debug and print STDERR "$d Setting acct_port to $1\n";
		$acct_port = $1;
	} elsif (/^acct_secret\s+(.+)$/i) {
		$debug and print STDERR "$d Setting acct_secret to $1\n";
		$acct_secret = $1;
	} elsif (/^acct_timeout\s+(.+)$/i) {
		$debug and print STDERR "$d Setting acct_timeout to $1\n";
		$acct_timeout = $1;
	} elsif (/^acct_retry\s+(.+)$/i) {
		$debug and print STDERR "$d Setting acct_retry to $1\n";
		$acct_retry = $1;
	} elsif (/^auth\s+(.+)$/i) {
		$debug and print STDERR "$d Performing auth: $1\n";
		my @pairs = split(/\s+/, $1);
		my %attr = ();
		foreach (@pairs) {
			if (/^(.+)=(.+)$/) {
				$debug and print STDERR "$d Found pair: $1 = $2\n";
				$attr{$1} = $2;
			}
		}
		&user_auth($auth_host, $auth_port, $auth_secret, %attr);
	} elsif (/^acct\s+(.+)$/i) {
		if ($last_auth_code == 2) {
			$debug and print STDERR "$d Performing acct: $1\n";
			my @pairs = split(/\s+/, $1);
			my %attr = ();
			foreach (@pairs) {
				if (/^(.+)=(.+)$/) {
					$debug and print STDERR "$d Found pair: $1 = $2\n";
					$attr{$1} = $2;
				}
			}
			&user_acct($acct_host, $acct_port, $acct_secret, %attr);
		} else {
			print "\tSkipping acct because last auth failed\n";
		}
	} elsif (/^sleep\s+(.+)$/i) {
		if ($last_auth_code == 2) {
			print "Sleeping for $1 seconds ...\n";
			sleep $1;
		} else {
			print "\tSkipping sleep because last auth failed\n";
		}
	} else {
		print STDERR "Ignoring: $_\n";
	}
}

close SCENARIO;

print "\n";

exit 0;

sub user_acct {
	my ($host, $port, $secret, %attr) = @_;
	print "\nSending Accounting-Request to $host:$port ...\n";
	my $return_code = 0;
	my $cmd = "$radclient -r $acct_retry -t $acct_timeout $host:$port acct $secret";
	my $pid = open3 *CMD_IN, *CMD_OUT, *CMD_ERR, $cmd;
	foreach (keys %attr) {
		print "\t$_ = $attr{$_}\n";
		print CMD_IN "$_ = $attr{$_}\n";
	}
	close CMD_IN;
	my $selector = undef;
	$selector = IO::Select->new();
	$selector->add(*CMD_ERR, *CMD_OUT);
	while (my @ready = $selector->can_read) {
		foreach my $fh (@ready) {
			if (fileno($fh) == fileno(CMD_ERR)) {
				my $line = <CMD_ERR> || '';
				print STDERR $line;
			} else {
				my $line = <CMD_OUT> || '';
				chomp $line;
				if ($line =~ /^Received response ID (\d+), code (\d+), length = (\d+)$/) {
					my ($id, $code, $length) = ($1, $2, $3);
					$return_code = $code;
					print "Received " . $packetname{$code} . " packet for request $id (length: $length)\n";
				} else {
					if ($line) { print "$line\n"; }
				}
			}
			$selector->remove($fh) if eof($fh);
		}
	}
	close CMD_OUT;
	close CMD_ERR;
	return $return_code;
}

sub user_auth {
	my ($host, $port, $secret, %attr) = @_;
	print "\nSending Access-Request to $host:$port ...\n";
	my $return_code = 0;
	my $cmd = "$radclient -r $auth_retry -t $auth_timeout $host:$port auth $secret";
	my $pid = open3 *CMD_IN, *CMD_OUT, *CMD_ERR, $cmd;
	foreach (keys %attr) {
		print "\t$_ = $attr{$_}\n";
		print CMD_IN "$_ = $attr{$_}\n";
	}
	close CMD_IN;
	my $selector = undef;
	$selector = IO::Select->new();
	$selector->add(*CMD_ERR, *CMD_OUT);
	while (my @ready = $selector->can_read) {
		foreach my $fh (@ready) {
			if (fileno($fh) == fileno(CMD_ERR)) {
				my $line = <CMD_ERR> || '';
				print STDERR $line;
			} else {
				my $line = <CMD_OUT> || '';
				chomp $line;
				if ($line =~ /^Received response ID (\d+), code (\d+), length = (\d+)$/) {
					my ($id, $code, $length) = ($1, $2, $3);
					$return_code = $code;
					print "Received " . $packetname{$code} . " packet (id=$id, length=$length)\n";
					$last_auth_id = $id;
					$last_auth_code = $code;
				} else {
					if ($line) { print "$line\n"; }
				}
			}
			$selector->remove($fh) if eof($fh);
		}
	}
	close CMD_OUT;
	close CMD_ERR;
	return $return_code;
}

