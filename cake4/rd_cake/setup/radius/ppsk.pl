#
#  This program is free software; you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation; either version 2 of the License, or
#  (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with this program; if not, write to the Free Software
#  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301, USA
#
#  Copyright 2002  The FreeRADIUS server project
#  Copyright 2002  Boian Jordanov <bjordanov@orbitel.bg>
#

#
# Example code for use with rlm_perl
#
# You can use every module that comes with your perl distribution!
#

use strict;
use warnings;
use v5.10; # for say() function

use DBI;
use Data::Dumper;
use DateTime;

use Digest::HMAC_SHA1 qw(hmac_sha1);
use Digest::SHA qw(sha1);
use Crypt::PBKDF2;
#use Crypt::OpenSSL::FASTPBKDF2 qw/fastpbkdf2_hmac_sha1 fastpbkdf2_hmac_sha256 fastpbkdf2_hmac_sha512/;

use threads;
use Thread::Queue;

use vars qw(%RAD_REQUEST %RAD_CHECK %RAD_REPLY %RAD_CONFIG $dbh %conf $dbh $stmt_fup_comps $stmt_data_used $conn_valid %comp_limits $default_tz $return $client_type $stmt_realm_id $stmt_ssid_id $stmt_pmk_list);

# This is hash wich hold original request from radius
#my %RAD_REQUEST;
# In this hash you add values that will be returned to NAS.
#my %RAD_REPLY;
#This is for check items
#my %RAD_CHECK;

#
# This the remapping of return values
#
use constant    RLM_MODULE_REJECT=>    0;#  /* immediately reject the request */
use constant    RLM_MODULE_FAIL=>      1;#  /* module failed, don't reply */
use constant    RLM_MODULE_OK=>        2;#  /* the module is OK, continue */
use constant    RLM_MODULE_HANDLED=>   3;#  /* the module handled the request, so stop. */
use constant    RLM_MODULE_INVALID=>   4;#  /* the module considers the request invalid. */
use constant    RLM_MODULE_USERLOCK=>  5;#  /* reject the request (user is locked out) */
use constant    RLM_MODULE_NOTFOUND=>  6;#  /* user not found */
use constant    RLM_MODULE_NOOP=>      7;#  /* module succeeded without doing anything */
use constant    RLM_MODULE_UPDATED=>   8;#  /* OK (pairs modified) */
use constant    RLM_MODULE_NUMCODES=>  9;#  /* How many return codes there are */



#
# This the RADIUS log type
#  
use constant    RAD_LOG_DEBUG=>  0; 
use constant    RAD_LOG_AUTH=>   1; 
use constant    RAD_LOG_PROXY=>  2; 
use constant    RAD_LOG_INFO=>   3; 
use constant    RAD_LOG_ERROR=>  4; 


#___ RADIUSdesk _______
sub read_conf {
   $conf{'db_name'}     = "rd";
   $conf{'db_host'}     = "127.0.0.1";
   $conf{'db_user'}     = "rd";
   $conf{'db_passwd'}   = "rd";
}

sub conn_db {
    $dbh->disconnect() if defined $dbh;
    # $dbh = DBI->connect("DBI:mysql:database=radius;host=localhost","radius","radius_pwd");
    $dbh = DBI->connect("DBI:mysql:database=$conf{'db_name'};host=$conf{'db_host'}",
                        $conf{'db_user'},
                        $conf{'db_passwd'});
    if ($DBI::err) {
        &radiusd::radlog(RAD_LOG_ERROR, "DB Connect Error. $DBI::errstr");
    } else {
        
        $stmt_realm_id  = $dbh->prepare(q{
            SELECT realms.id AS id FROM dynamic_clients 
            LEFT JOIN dynamic_client_realms ON dynamic_clients.id=dynamic_client_realms.dynamic_client_id 
            LEFT JOIN realms ON realms.id=dynamic_client_realms.realm_id 
            WHERE dynamic_clients.nasidentifier=? 
            AND dynamic_clients.type='private_psk'
         });
         
        $stmt_ssid_id  = $dbh->prepare(q{
            SELECT id FROM realm_ssids WHERE name=? AND realm_id=?
        });
         
         $stmt_pmk_list  = $dbh->prepare(q{
            SELECT permanent_users.username,active,realm_vlans.vlan,realm_pmks.pmk,realm_pmks.ppsk from permanent_users 
            LEFT JOIN realm_vlans ON realm_vlans.id=permanent_users.realm_vlan_id 
            INNER JOIN realm_pmks ON realm_pmks.ppsk=permanent_users.ppsk AND realm_pmks.realm_ssid_id=? 
            WHERE permanent_users.realm_id=?;
        });           
    }
    $conn_valid = (! $DBI::err);
}


sub CLONE {
    read_conf();
    conn_db();
}


# Function to handle authorize
sub authorize {
    # For debugging purposes only
#       &log_request_attributes;
  
    &ppsk;

    return $return;
}

# Function to handle authenticate
sub authenticate {
    # For debugging purposes only
#       &log_request_attributes;

    if ($RAD_REQUEST{'User-Name'} =~ /^baduser/i) {
            # Reject user and tell him why
            $RAD_REPLY{'Reply-Message'} = "Denied access by rlm_perl function";
            return RLM_MODULE_REJECT;
    } else {
            # Accept user and set some attribute
            $RAD_REPLY{'h323-credit-amount'} = "100";
            return RLM_MODULE_OK;
    }
}

# Function to handle preacct
sub preacct {
    # For debugging purposes only
#       &log_request_attributes;

    return RLM_MODULE_OK;
}

# Function to handle accounting
sub accounting {
    # For debugging purposes only
#       &log_request_attributes;

    # You can call another subroutine from here
    &test_call;

    return RLM_MODULE_OK;
}

# Function to handle checksimul
sub checksimul {
    # For debugging purposes only
#       &log_request_attributes;

    return RLM_MODULE_OK;
}

# Function to handle pre_proxy
sub pre_proxy {
    # For debugging purposes only
#       &log_request_attributes;

    return RLM_MODULE_OK;
}

# Function to handle post_proxy
sub post_proxy {
    # For debugging purposes only
#       &log_request_attributes;

    return RLM_MODULE_OK;
}

# Function to handle post_auth
sub post_auth {
    # For debugging purposes only
#       &log_request_attributes;

    return RLM_MODULE_OK;
}

# Function to handle xlat
sub xlat {
    # For debugging purposes only
#       &log_request_attributes;

    # Loads some external perl and evaluate it
    my ($filename,$a,$b,$c,$d) = @_;
    &radiusd::radlog(1, "From xlat $filename ");
    &radiusd::radlog(1,"From xlat $a $b $c $d ");
    local *FH;
    open FH, $filename or die "open '$filename' $!";
    local($/) = undef;
    my $sub = <FH>;
    close FH;
    my $eval = qq{ sub handler{ $sub;} };
    eval $eval;
    eval {main->handler;};
}

# Function to handle detach
sub detach {
    # For debugging purposes only
#       &log_request_attributes;

    # Do some logging.
    &radiusd::radlog(0,"rlm_perl::Detaching. Reloading. Done.");
}

#
# Some functions that can be called from other functions
#

sub test_call {
    # Some code goes here
    &radiusd::radlog(RAD_LOG_DEBUG,"Brannewyn het nie brieke nie");
}

sub log_request_attributes {
    # This shouldn't be done in production environments!
    # This is only meant for debugging!
    for (keys %RAD_REQUEST) {
            &radiusd::radlog(1, "RAD_REQUEST: $_ = $RAD_REQUEST{$_}");
    }
}


sub ppsk {

    my $FR_Anonce ='';
    my $FR_EAPoL_Key_Msg='';
    my $FR_Calling_Station='';

    if(($RAD_REQUEST{'Attr-245.26.11344.1'})&&($RAD_REQUEST{'Attr-245.26.11344.2'})){    
        $FR_Anonce           = $RAD_REQUEST{'Attr-245.26.11344.1'};
        $FR_EAPoL_Key_Msg    = $RAD_REQUEST{'Attr-245.26.11344.2'};
	    $FR_Calling_Station  = $RAD_REQUEST{'Calling-Station-Id'};
		$FR_Anonce              =~ s/^0x//i;
		$FR_EAPoL_Key_Msg       =~ s/^0x//i;   
    }else{
        return;
    }

    my $ssid   = 0;
    my $ap_mac = 0;
    if(defined $RAD_REQUEST{'Called-Station-Id'} && length $RAD_REQUEST{'Called-Station-Id'} > 0) {
        if ($RAD_REQUEST{'Called-Station-Id'} =~ /(.+):(.+)/) {
            $ap_mac = $1;  # MAC
            $ssid   = $2;  # SSID
        }          
    }else{
        return;
    }
    
    #remove dashes from mac addresses
	$ap_mac =~ tr/-//d;
	my $sa_mac = $FR_Calling_Station;
	$sa_mac =~ tr/-//d;
    
    #rebuild eapol1/2 from the radius info. 0x888e is ethertype 802.1x. Since we're here, I think we can assume that. 
	my $EAPOL1 = a2b($ap_mac . $sa_mac . "888e" . "0000000000000000000000000000000000" . substr($FR_Anonce,0,64));
	my $EAPOL2 = a2b($sa_mac . $ap_mac . "888e" . substr($FR_EAPoL_Key_Msg,0));

    if(defined $RAD_REQUEST{'NAS-Identifier'} && length $RAD_REQUEST{'NAS-Identifier'} > 0) {
    
        my $realm_id = 0;
        $stmt_realm_id->execute($RAD_REQUEST{'NAS-Identifier'});     
        while(my $row = $stmt_realm_id->fetchrow_hashref()){        
            $realm_id = $row->{'id'};
        }
        $stmt_realm_id->finish();
        
        if(($ssid)&&($realm_id)){
            &radiusd::radlog(1, "Found Realm ID $realm_id and ssid $ssid. We can try to get the realm_ssid ID");
            
            #Get the realm_ssid id
            my $ssid_id = 0;
            $stmt_ssid_id->execute($ssid,$realm_id);        
            while(my $row = $stmt_ssid_id->fetchrow_hashref()){        
                $ssid_id = $row->{'id'};
            }
            $stmt_ssid_id->finish();
            
            if($ssid_id){
                &radiusd::radlog(1, "Found Realm ID $realm_id and ssid_id $ssid_id. We can try to get the LIST OF PPSKs");
                $stmt_pmk_list->execute($ssid_id,$realm_id);             
                while(my $row = $stmt_pmk_list->fetchrow_hashref()){
                    if(process_row($EAPOL1,$EAPOL2,$ssid,$row->{'ppsk'},$row)){
                        #Formulate the reply
                        last;
                    }
                }
                $stmt_pmk_list->finish();             
            }                     
        }        
    }
}

sub formulate_reply{
    my ($row) = @_;
    #say Dumper($row);  
}

# subs below are from the eapol mic matching code
sub PRF_512 {
    my ($key, $A, $B) = @_;
    my $result = '';
    for my $i (0 .. 3) {
        my $input = $A . chr(0) . $B . chr($i);
        $result .= hmac_sha1($input, $key);
    }
    return substr($result, 0, 64);
}

sub a2b {
    my ($s) = @_;
    return pack("H*", $s);
}

sub b2a {
    my ($by) = @_;
    return unpack("H*", $by);
}

sub process_row {

    my $match_found = 0;
    my ($EAPOL1, $EAPOL2,$SSID,$PASS,$line) = @_;
       
    #my $PMK    = pbkdf2($SSID, $PASS, 4096, 32); #calculate PMK
    #my $Hex    = b2a($PMK);
    #$PMK       = a2b($Hex);
    my $PMK    = a2b($line->{'pmk'});
    
    #&radiusd::radlog(1, "=====Whooop $Hex $line->{'pmk'} ======");  
    
    my $R1 = substr($EAPOL1, 31, 32);      # random 1 (AP nonce)
    my $R2 = substr($EAPOL2, 31, 32);      # random 2 (STA nonce)
    my $M1 = substr($EAPOL2, 0, 6);        # MAC 1 (AP MAC)
    my $M2 = substr($EAPOL1, 0, 6);        # MAC 2 (STA MAC)

    # Generate KCK, KEK, TK1, TK2 from the PMK (and AP/STA info)
    my $PTK = PRF_512($PMK, "Pairwise key expansion", ($M1 lt $M2 ? $M1 : $M2) . ($M1 lt $M2 ? $M2 : $M1) . ($R1 lt $R2 ? $R1 : $R2) . ($R1 lt $R2 ? $R2 : $R1));
    my $KCK = substr($PTK, 0, 16);

    # try to validate the MIC in EAPoL message #2 is correct
    my $MICRAW   = hmac_sha1(substr($EAPOL2, 14, 81) . a2b("00000000000000000000000000000000") . substr($EAPOL2,111), $KCK);
    my $MICFOUND = b2a(substr($EAPOL2, 95, 16));
    my $MICCALC  = substr(unpack("H*",$MICRAW), 0, 32);

    if ($MICFOUND eq $MICCALC) {
        &radiusd::radlog(1, "=====Whooop Whoop=======");
        &radiusd::radlog("2","PPSK Match found $PASS");
        $match_found = 1;
    }
    return $match_found;
}

sub pbkdf2 {
    my ($salt, $password, $iterations, $key_length) = @_;
    my $pbkdf2 = Crypt::PBKDF2->new(
        hash_class => 'HMACSHA1',
        iterations => $iterations,
        output_len => $key_length,
        salt_len => 14
        );
    my $result = $pbkdf2->PBKDF2($salt,$password);
    return $result;
}

