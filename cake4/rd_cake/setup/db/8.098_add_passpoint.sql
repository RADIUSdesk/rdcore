drop procedure if exists add_passpoint;

delimiter //
create procedure add_passpoint()
begin

if not exists (select * from information_schema.columns
    where table_name = 'passpoint_profiles' and table_schema = 'rd') then
     CREATE TABLE `passpoint_profiles` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `name` char(64) NOT NULL,
        `cloud_id` int(11) DEFAULT NULL,
        `passpoint_network_type_id` int(11) DEFAULT NULL,
        `passpoint_venue_group_id` int(11) DEFAULT NULL,
        `passpoint_venue_group_type_id` int(11) DEFAULT NULL, 
        `created` datetime NOT NULL,
        `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

end if;

if not exists (select * from information_schema.columns
    where table_name = 'passpoint_domains' and table_schema = 'rd') then
     CREATE TABLE `passpoint_domains` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `passpoint_profile_id` int(11) DEFAULT NULL, 
        `name` char(100) NOT NULL,           
        `created` datetime NOT NULL,
        `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

end if;


if not exists (select * from information_schema.columns
    where table_name = 'passpoint_nai_realms' and table_schema = 'rd') then
     CREATE TABLE `passpoint_nai_realms` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `passpoint_profile_id` int(11) DEFAULT NULL, 
        `encoding` tinyint(1) NOT NULL DEFAULT 0,
        `name` char(64) NOT NULL,           
        `created` datetime NOT NULL,
        `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

end if;

if not exists (select * from information_schema.columns
    where table_name = 'passpoint_eap_methods' and table_schema = 'rd') then
     CREATE TABLE `passpoint_eap_methods` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `name` varchar(25) NOT NULL,
        `short_name` varchar(25) NOT NULL,
        `hostapd_string` varchar(25) NOT NULL,
        `active` tinyint(1) NOT NULL DEFAULT 1,            
        `created` datetime NOT NULL,
        `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    
    INSERT INTO `passpoint_eap_methods` VALUES (1,'EAP-TLS','eap_tls', '13[5:6]',1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(2,'EAP-TTLS/PAP','eap_ttls_pap', '21[2:1][5:7]',1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(3,'EAP-TTLS/MSCHAP2','eap_ttls_mschap2', '21[2:4][5:7]',1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(4,'PEAP','peap', '25[2:4][5:7]',1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(5,'EAP-SIM','eap_sim', '18[5:1]',1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(6,'EAP-USIM','eap_usim', '18[5:2]',1,'2025-01-01 00:00:00','2025-01-01 00:00:00');
 

end if;


if not exists (select * from information_schema.columns
    where table_name = 'passpoint_nai_realm_passpoint_eap_methods' and table_schema = 'rd') then
     CREATE TABLE `passpoint_nai_realm_passpoint_eap_methods` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `passpoint_nai_realm_id` int(11) DEFAULT NULL, 
        `passpoint_eap_method_id` int(11) DEFAULT NULL,          
        `created` datetime NOT NULL,
        `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
     
end if;

if not exists (select * from information_schema.columns
    where table_name = 'passpoint_rcois' and table_schema = 'rd') then
     CREATE TABLE `passpoint_rcois` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `passpoint_profile_id` int(11) DEFAULT NULL, 
        `name` char(100) NOT NULL,
        `rcoi_id` char(100) NOT NULL,          
        `created` datetime NOT NULL,
        `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

end if;

if not exists (select * from information_schema.columns
    where table_name = 'passpoint_cell_networks' and table_schema = 'rd') then
     CREATE TABLE `passpoint_cell_networks` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `passpoint_profile_id` int(11) DEFAULT NULL, 
        `name` char(100) NOT NULL,
        `mcc` int(6) DEFAULT NULL, 
        `mnc` int(6) DEFAULT NULL,         
        `created` datetime NOT NULL,
        `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

end if;


if not exists (select * from information_schema.columns
    where table_name = 'passpoint_network_types' and table_schema = 'rd') then
     CREATE TABLE `passpoint_network_types` (
        `id` int(11) NOT NULL,
        `name` varchar(40) NOT NULL,
        `active` tinyint(1) NOT NULL DEFAULT 1,            
        `created` datetime NOT NULL,
        `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    

    INSERT INTO `passpoint_network_types` VALUES (0,'Private network',1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(1,'Private network with guest access',1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(2,'Chargeable public network',1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(3,'Free public network',1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(4,'Personal device network',1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(5,'Emergency services only network',1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(14,'Test or experimental',1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(15,'Wildcard',1,'2025-01-01 00:00:00','2025-01-01 00:00:00');
  
end if;


if not exists (select * from information_schema.columns
    where table_name = 'passpoint_venue_groups' and table_schema = 'rd') then
     CREATE TABLE `passpoint_venue_groups` (
        `id` int(11) NOT NULL,
        `name` varchar(40) NOT NULL,
        `active` tinyint(1) NOT NULL DEFAULT 1,            
        `created` datetime NOT NULL,
        `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    
    INSERT INTO `passpoint_venue_groups` VALUES (0,'Unspecified',1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(1,'Assembly',1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(2,'Business',1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(3,'Educational',1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(4,'Factory-Industrial',1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(5,'Institutional',1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(6,'Mercantile',1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(7,'Residential',1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(8,'Storage',1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(9,'Utility-Misc',1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(10,'Vehicular',1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(11,'Outdoor',1,'2025-01-01 00:00:00','2025-01-01 00:00:00');
  
end if;


if not exists (select * from information_schema.columns
    where table_name = 'passpoint_venue_group_types' and table_schema = 'rd') then
     CREATE TABLE `passpoint_venue_group_types` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `name` varchar(40) NOT NULL,
        `passpoint_venue_group_id` int(11) NOT NULL,
        `venue_type_value` int(11) NOT NULL,
        `active` tinyint(1) NOT NULL DEFAULT 1,            
        `created` datetime NOT NULL,
        `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    
    INSERT INTO `passpoint_venue_group_types` VALUES (1,'Unspecified',0,0,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(2,'Unspecified Assembly',1,0,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(3,'Arena',1,1,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(4,'Stadium',1,2,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(5,'Passenger Terminal',1,3,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(6,'Amphitheater',1,4,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(7,'Amusement Park',1,5,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(8,'Place of Worship',1,6,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(9,'Cenvention Center',1,7,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(10,'Library',1,8,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(11,'Museum',1,9,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(12,'Restaurant',1,10,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(13,'Theater',1,11,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(14,'Bar',1,12,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(15,'Coffee Shop',1,13,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(16,'Zoo or aquarium',1,14,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(17,'Emergecy Coordination Center',1,1,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(18,'Unspecified Business',2,0,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(19,'Doctor or dentist office',2,1,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(20,'Bank',2,2,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(21,'Fire Station',2,3,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(22,'Police Station',2,4,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(23,'Post Office',2,6,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(24,'Professional Office',2,7,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(25,'Research and development facility',2,8,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(26,'Attourney Office',2,9,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(27,'Unspecified Educational',3,0,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(28,'Primary School',3,1,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(29,'Secondary School',3,2,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(30,'University or College',3,3,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(31,'Unspecified Factory and Inductrial',4,0,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(32,'Factory',4,1,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(33,'Unspecified Institutional',5,0,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(34,'Hospital',5,1,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(35,'Long-term Care Facility',5,2,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(36,'Alchohol and drug re-habilitation center',5,3,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(37,'Group home',5,4,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(38,'Prison or Jail',5,5,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(39,'Unspecified Mercantile',6,0,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(40,'Retail Store',6,1,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(41,'Grocery Market',6,2,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(42,'Automotive Service Station',6,3,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(43,'Shopping Mall',6,4,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(44,'Gas Station',6,5,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(45,'Unspecified Residential',7,0,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(46,'Private Residence',7,1,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(47,'Hotel Or Motel',7,2,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(48,'Dormitory',7,3,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(49,'Boarding House',7,4,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(50,'Unspecified Storage',8,0,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(51,'Unspecified Utility and Miscellaneous',9,0,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(52,'Unspecified Vehicular',10,0,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(53,'Automobile or Truck',10,1,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(54,'Airplane',10,2,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(55,'Bus',10,3,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(56,'Ferry',10,4,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(57,'Ship or Boat',10,5,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(58,'Train',10,6,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(59,'Motor Bike',10,7,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(60,'Unspecified Outdoor',11,0,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(61,'Muni-Mesh Network',11,1,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(62,'City Park',11,2,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(63,'Rest Area',11,3,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(64,'Traffic Control',11,4,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(65,'Bus Stop',11,5,1,'2025-01-01 00:00:00','2025-01-01 00:00:00'),(66,'Kiosk',11,6,1,'2025-01-01 00:00:00','2025-01-01 00:00:00');
 
end if;
      

if not exists (select * from information_schema.columns
    where table_name = 'passpoint_profile_settings' and table_schema = 'rd') then
     CREATE TABLE `passpoint_profile_settings` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `passpoint_profile_id` int(11) DEFAULT NULL, 
        `name` varchar(40) NOT NULL,
        `value` varchar(255) NOT NULL,  
        `created` datetime NOT NULL,
        `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

end if;

if not exists (select * from information_schema.columns
    where table_name = 'passpoint_uplinks' and table_schema = 'rd') then
    CREATE TABLE `passpoint_uplinks` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `cloud_id` int(11) DEFAULT NULL,
        `name` varchar(64) NOT NULL,
        `connection_type` enum('wpa_enterprise','passpoint') DEFAULT 'passpoint',
        `ssid` varchar(64) NOT NULL DEFAULT '',
        `rcoi` varchar(64) NOT NULL DEFAULT '',
        `nai_realm` varchar(64) NOT NULL DEFAULT '',
        `encryption` enum('wpa2','wpa2+tkip','wpa2+aes','wpa2+ccmp','wpa2+tkip+aes','wpa2+tkip+ccmp','wpa3','wpa3-mixed') DEFAULT 'wpa2',
        `eap_method` enum('peap','ttls_pap','ttls_mschap','tls') DEFAULT 'ttls_pap',
        `identity` varchar(128) NOT NULL DEFAULT '',
        `password` varchar(128) NOT NULL DEFAULT '',
        `anonymous_identity` varchar(128) NOT NULL DEFAULT '',
        `ca_cert_usesystem` BOOLEAN NOT NULL DEFAULT 0,
        `domain_suffix_match` varchar(128) NOT NULL DEFAULT '',
        `ca_cert` LONGTEXT NOT NULL,
        `client_cert` LONGTEXT NOT NULL,
        `private_key` LONGTEXT NOT NULL,
        `created` datetime NOT NULL,
        `modified` datetime NOT NULL,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

end if;


if not exists (select * from information_schema.columns where column_name = 'passpoint_uplink_id' and table_name = 'aps' and table_schema = 'rd') then
	alter table aps add column passpoint_uplink_id int(11) DEFAULT NULL;
end if;

if not exists (select * from information_schema.columns where column_name = 'passpoint_uplink_id' and table_name = 'nodes' and table_schema = 'rd') then
	alter table nodes add column passpoint_uplink_id int(11) DEFAULT NULL;
end if;

alter table aps modify column gateway enum('none','lan','3g','wifi','wifi_static','wifi_ppp','wifi_pppoe','wifi_ent','wan_static','wan_ppp','wan_pppoe','mwan') DEFAULT 'none';

alter table nodes modify column gateway enum('none','lan','3g','wifi','wifi_static','wifi_ppp','wifi_pppoe','wifi_ent','wan_static','wan_ppp','wan_pppoe', 'mwan') DEFAULT 'none';

if not exists (select * from information_schema.columns
    where column_name = 'passpoint_profile_id' and table_name = 'ap_profile_entries' and table_schema = 'rd') then
    alter table ap_profile_entries add column `passpoint_profile_id` int(11) DEFAULT NULL;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'passpoint_profile_id' and table_name = 'mesh_entries' and table_schema = 'rd') then
    alter table mesh_entries add column `passpoint_profile_id` int(11) DEFAULT NULL;
end if;


end//

delimiter ;

call add_passpoint;
