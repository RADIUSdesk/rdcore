<?php

//Turn Limits on or off site wide
$config['Limits']['Global']['Active']               = false;

//Access Providers
$config['Limits']['User']['Active']                 = true;
$config['Limits']['User']['Count']                  = 3;
$config['Limits']['User']['Description']            = '<b>Sub-providers</b> The number of Sub-providers someone can create';

//Realms
$config['Limits']['Realm']['Active']                = true;
$config['Limits']['Realm']['Count']                 = 3;
$config['Limits']['Realm']['Description']           = '<b>Realms</b> The number of Realms someone can create';

//Dynamic RADIUS Clients
$config['Limits']['DynamicClient']['Active']        = true;
$config['Limits']['DynamicClient']['Count']         = 3;
$config['Limits']['DynamicClient']['Description']   = '<b>Dynamic RADIUS Clients</b> The number of Dynamic RADIUS Clients someone can create';

//NAS Devices
$config['Limits']['Na']['Active']                   = true;
$config['Limits']['Na']['Count']                    = 3;
$config['Limits']['Na']['Description']              = '<b>NAS Devices</b> The number of NAS Devices (RADIUS Client with Fixed IP) someone can create';

//Permanent Users
$config['Limits']['PermanentUser']['Active']        = true;
$config['Limits']['PermanentUser']['Count']         = 3;
$config['Limits']['PermanentUser']['Description']   = '<b>Permanent Users</b> The number of Permanent Users someone can create';

//Vouchers
$config['Limits']['Voucher']['Active']              = true;
$config['Limits']['Voucher']['Count']               = 3;
$config['Limits']['Voucher']['Description']         = '<b>Vouchers</b> The number of Vouchers someone can create';

//BYOD
$config['Limits']['Device']['Active']               = true;
$config['Limits']['Device']['Count']                = 3;
$config['Limits']['Device']['Description']          = 'The number of BYOD devices you can attach to a Permanent User';

//APdesk
$config['Limits']['ApProfile']['Active']            = true;
$config['Limits']['ApProfile']['Count']             = 2;
$config['Limits']['ApProfile']['Description']       = '<b>Access Point Profiles</b> The amount of Access Point Profiles someone can create with APdesk';

//APs per ApProfile
$config['Limits']['Ap']['Active']                   = true;
$config['Limits']['Ap']['Count']                    = 1;
$config['Limits']['Ap']['Description']              = 'The number of devices someone can acctach to an Access Point Profile';

//MESHdesk
$config['Limits']['Mesh']['Active']                 = true;
$config['Limits']['Mesh']['Count']                  = 2;
$config['Limits']['Mesh']['Description']            = '<b>Meshes</b> The number of Mesh networks someone can create with MESHdesk';

//Nodes per Mesh
$config['Limits']['Node']['Active']                 = true;
$config['Limits']['Node']['Count']                  = 3;
$config['Limits']['Node']['Description']            = 'The number of nodes a mesh network can contain';

//Total Devices (Special Limit)
$config['Limits']['TotalDevices']['Active']         = true;
$config['Limits']['TotalDevices']['Count']          = 3;
$config['Limits']['TotalDevices']['Description']    = 'Total number of Devices which can <b>EITHER</b> be attached to a Mesh network or an Access Point Probile';


?>
