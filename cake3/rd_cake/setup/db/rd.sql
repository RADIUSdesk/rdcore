-- MySQL dump 10.19  Distrib 10.3.32-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: rd
-- ------------------------------------------------------
-- Server version	10.3.32-MariaDB-0ubuntu0.20.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account_users`
--

DROP TABLE IF EXISTS `account_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `account_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `token` char(36) DEFAULT NULL,
  `can_invite` tinyint(1) NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 0,
  `verified` tinyint(1) NOT NULL DEFAULT 0,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_users`
--

LOCK TABLES `account_users` WRITE;
/*!40000 ALTER TABLE `account_users` DISABLE KEYS */;
/*!40000 ALTER TABLE `account_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `acl_phinxlog`
--

DROP TABLE IF EXISTS `acl_phinxlog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `acl_phinxlog` (
  `version` bigint(20) NOT NULL,
  `migration_name` varchar(100) DEFAULT NULL,
  `start_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `end_time` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `acl_phinxlog`
--

LOCK TABLES `acl_phinxlog` WRITE;
/*!40000 ALTER TABLE `acl_phinxlog` DISABLE KEYS */;
/*!40000 ALTER TABLE `acl_phinxlog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `acos`
--

DROP TABLE IF EXISTS `acos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `acos` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `parent_id` int(10) DEFAULT NULL,
  `model` varchar(255) DEFAULT NULL,
  `foreign_key` int(10) DEFAULT NULL,
  `alias` varchar(255) DEFAULT NULL,
  `comment` varchar(255) DEFAULT NULL,
  `lft` int(10) DEFAULT NULL,
  `rght` int(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_acos_parent_id` (`parent_id`),
  KEY `idx_acos_model` (`model`),
  KEY `idx_acos_foreign_key` (`foreign_key`),
  KEY `idx_acos_alias` (`alias`),
  KEY `idx_acos_lft` (`lft`),
  KEY `idx_acos_rght` (`rght`)
) ENGINE=InnoDB AUTO_INCREMENT=522 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `acos`
--

LOCK TABLES `acos` WRITE;
/*!40000 ALTER TABLE `acos` DISABLE KEYS */;
INSERT INTO `acos` VALUES (29,NULL,NULL,NULL,'Access Providers','A container with rights available to Access Providers - DO NOT DELETE!!',1,768),(30,NULL,NULL,NULL,'Permanent Users','A container with rights for Permanent Users - DO NOT DELETE!!',769,774),(31,29,NULL,NULL,'Controllers','A container with the various controllers and their actions which can be used by the Access Providers',2,757),(32,29,NULL,NULL,'Other Rights','A list of other rights which can be configured for an Access Provider',758,767),(33,30,NULL,NULL,'Controllers','A container with the various controllers and their actions which can be used by the Permanent Users',770,771),(34,30,NULL,NULL,'Other Rights','A list of other rights which can be configured for a Permanent User',772,773),(42,32,NULL,NULL,'View users or vouchers not created self','',759,760),(43,31,NULL,NULL,'Vouchers','',3,34),(44,43,NULL,NULL,'index','',4,5),(45,31,NULL,NULL,'PermanentUsers','',35,80),(46,45,NULL,NULL,'index','',36,37),(58,31,NULL,NULL,'AccessProviders','Access Providers can only do these actions on any access provider that is a child of the Access Provider',81,104),(59,58,NULL,NULL,'index','Without this right, the Access Providers option will not be shown in the Access Provider\'s menu',82,83),(60,58,NULL,NULL,'add','Without this right an Access Provider will not be able to create Access Provider children',84,85),(61,58,NULL,NULL,'edit','',86,87),(62,58,NULL,NULL,'delete','',88,89),(63,32,NULL,NULL,'Can Change Rights','This is a key option to allow an Access Provider the ability to change the rights of any of his Access Provider children',761,762),(64,32,NULL,NULL,'Can disable activity recording','Can disable Activity Recording on Access Provider children',763,764),(65,58,NULL,NULL,'changePassword','',90,91),(67,31,NULL,NULL,'Realms','',105,130),(68,67,NULL,NULL,'index','',106,107),(69,67,NULL,NULL,'add','',108,109),(70,67,NULL,NULL,'edit','',110,111),(71,67,NULL,NULL,'delete','',112,113),(102,31,NULL,NULL,'Nas','Nas Devices - These rights are also considering the hierarchy of the Access Provider',131,186),(103,102,NULL,NULL,'index','Without this right there will be no NAS Devices in the AP\'s menu',132,133),(104,102,NULL,NULL,'add','',134,135),(105,102,NULL,NULL,'edit','',136,137),(106,102,NULL,NULL,'delete','',138,139),(107,31,NULL,NULL,'Tags','Tags for NAS Devices',187,206),(108,107,NULL,NULL,'index','Without this right, there will be no NAS Device tags in the AP\'s menu',188,189),(109,107,NULL,NULL,'add','',190,191),(110,107,NULL,NULL,'edit','',192,193),(111,107,NULL,NULL,'delete','',194,195),(112,102,NULL,NULL,'manageTags','Attach or remove tags to NAS devices',140,141),(113,107,NULL,NULL,'exportCsv','Exporting the display from the grid to CSV',196,197),(114,107,NULL,NULL,'indexForFilter','A list for of tags to display on the filter field on the Access Provider grid',198,199),(115,107,NULL,NULL,'noteIndex','List notes',200,201),(116,107,NULL,NULL,'noteAdd','',202,203),(117,107,NULL,NULL,'noteDel','Remove a note of a NAS Tag',204,205),(118,102,NULL,NULL,'exportCsv','Exporting the display of the grid to CSV',142,143),(119,102,NULL,NULL,'noteIndex','List notes',144,145),(120,102,NULL,NULL,'noteAdd','',146,147),(121,102,NULL,NULL,'noteDel','',148,149),(122,67,NULL,NULL,'exportCsv','',114,115),(123,67,NULL,NULL,'indexForFilter','',116,117),(124,67,NULL,NULL,'noteIndex','',118,119),(125,67,NULL,NULL,'noteAdd','',120,121),(126,67,NULL,NULL,'noteDel','',122,123),(127,58,NULL,NULL,'exportCsv','',92,93),(128,58,NULL,NULL,'noteIndex','',94,95),(129,58,NULL,NULL,'noteAdd','',96,97),(130,58,NULL,NULL,'noteDel','',98,99),(132,31,NULL,NULL,'AcosRights','Controller to manage the Rights Tree',207,212),(133,132,NULL,NULL,'indexAp','List the rights of a specific AP',208,209),(134,132,NULL,NULL,'editAp','Modify the rights of a specific AP by another AP',210,211),(137,31,NULL,NULL,'Devices','Devices belonging to PermanentUsers',213,250),(138,137,NULL,NULL,'index','',214,215),(149,43,NULL,NULL,'add','',6,7),(150,43,NULL,NULL,'delete','',8,9),(151,31,NULL,NULL,'Desktop','',251,258),(152,151,NULL,NULL,'desktop_shortcuts','',252,253),(153,151,NULL,NULL,'change_password','',254,255),(154,151,NULL,NULL,'save_wallpaper_selection','',256,257),(156,43,NULL,NULL,'viewBasicInfo','',10,11),(157,43,NULL,NULL,'editBasicInfo','',12,13),(158,43,NULL,NULL,'privateAttrIndex','',14,15),(159,43,NULL,NULL,'privateAttrAdd','',16,17),(160,43,NULL,NULL,'privateAttrEdit','',18,19),(161,43,NULL,NULL,'privateAttrDelete','',20,21),(162,43,NULL,NULL,'changePassword','',22,23),(163,43,NULL,NULL,'exportCsv','',24,25),(164,43,NULL,NULL,'exportPdf','',26,27),(165,67,NULL,NULL,'indexAp','',124,125),(166,31,NULL,NULL,'Profiles','',259,284),(167,166,NULL,NULL,'index','',260,261),(168,166,NULL,NULL,'indexAp','Dropdown list based on selected Access Provider owner',262,263),(169,166,NULL,NULL,'add','',264,265),(170,166,NULL,NULL,'manageComponents','',266,267),(171,166,NULL,NULL,'delete','',268,269),(173,166,NULL,NULL,'noteIndex','',270,271),(174,166,NULL,NULL,'noteAdd','',272,273),(175,166,NULL,NULL,'noteDel','',274,275),(176,31,NULL,NULL,'Radaccts','',285,296),(177,176,NULL,NULL,'export_csv','',286,287),(178,176,NULL,NULL,'index','',288,289),(179,176,NULL,NULL,'delete','',290,291),(180,176,NULL,NULL,'kick_active','',292,293),(181,176,NULL,NULL,'close_open','',294,295),(182,43,NULL,NULL,'delete_accounting_data','',28,29),(184,45,NULL,NULL,'add','',38,39),(185,45,NULL,NULL,'delete','',40,41),(186,45,NULL,NULL,'viewBasicInfo','',42,43),(187,45,NULL,NULL,'editBasicInfo','',44,45),(188,45,NULL,NULL,'viewPersonalInfo','',46,47),(189,45,NULL,NULL,'editPersonalInfo','',48,49),(190,45,NULL,NULL,'privateAttrIndex','',50,51),(191,45,NULL,NULL,'privateAttrAdd','',52,53),(192,45,NULL,NULL,'privateAttrEdit','',54,55),(193,45,NULL,NULL,'privateAttrDelete','',56,57),(194,45,NULL,NULL,'changePassword','',58,59),(195,45,NULL,NULL,'enableDisable','',60,61),(196,45,NULL,NULL,'exportCsv','',62,63),(197,45,NULL,NULL,'noteIndex','',64,65),(198,137,NULL,NULL,'add','',216,217),(199,137,NULL,NULL,'delete','',218,219),(200,137,NULL,NULL,'viewBasicInfo','',220,221),(201,137,NULL,NULL,'editBasicInfo','',222,223),(202,137,NULL,NULL,'privateAttrIndex','',224,225),(203,137,NULL,NULL,'privateAttrAdd','',226,227),(204,137,NULL,NULL,'privateAttrEdit','',228,229),(205,137,NULL,NULL,'privateAttrDelete','',230,231),(206,137,NULL,NULL,'enableDisable','',232,233),(207,137,NULL,NULL,'exportCsv','',234,235),(208,137,NULL,NULL,'noteIndex','',236,237),(209,31,NULL,NULL,'FreeRadius','',297,302),(210,209,NULL,NULL,'testRadius','',298,299),(211,209,NULL,NULL,'index','Displays the stats of the FreeRADIUS server',300,301),(212,31,NULL,NULL,'Radpostauths','',303,312),(213,212,NULL,NULL,'index','',304,305),(214,212,NULL,NULL,'add','',306,307),(215,212,NULL,NULL,'delete','',308,309),(221,212,NULL,NULL,'export_csv','',310,311),(223,67,NULL,NULL,'updateNaRealm','',126,127),(224,102,NULL,NULL,'addDirect','',150,151),(225,102,NULL,NULL,'addOpenVpn','',152,153),(226,102,NULL,NULL,'addDynamic','',154,155),(227,102,NULL,NULL,'addPptp','',156,157),(228,102,NULL,NULL,'viewOpenvpn','',158,159),(229,102,NULL,NULL,'editOpenvpn','',160,161),(230,102,NULL,NULL,'viewPptp','',162,163),(231,102,NULL,NULL,'editPptp','',164,165),(232,102,NULL,NULL,'viewDynamic','',166,167),(233,102,NULL,NULL,'editDynamic','',168,169),(234,102,NULL,NULL,'viewNas','',170,171),(235,102,NULL,NULL,'editNas','',172,173),(236,102,NULL,NULL,'viewPhoto','',174,175),(237,102,NULL,NULL,'uploadPhoto','',176,177),(238,102,NULL,NULL,'viewMapPref','',178,179),(239,102,NULL,NULL,'editMapPref','',180,181),(240,102,NULL,NULL,'deleteMap','',182,183),(241,102,NULL,NULL,'edit_map','',184,185),(243,67,NULL,NULL,'view','',128,129),(246,45,NULL,NULL,'restrictListOfDevices','',66,67),(247,45,NULL,NULL,'edit_tracking','',68,69),(248,45,NULL,NULL,'view_tracking','',70,71),(249,45,NULL,NULL,'noteAdd','',72,73),(250,45,NULL,NULL,'noteDel','',74,75),(251,137,NULL,NULL,'noteAdd','',238,239),(252,137,NULL,NULL,'noteDel','',240,241),(253,137,NULL,NULL,'view_tracking','',242,243),(254,137,NULL,NULL,'edit_tracking','',244,245),(258,31,NULL,NULL,'ProfileComponents','',313,330),(259,258,NULL,NULL,'index','',314,315),(260,258,NULL,NULL,'add','',316,317),(261,258,NULL,NULL,'edit','',318,319),(262,258,NULL,NULL,'delete','',320,321),(263,258,NULL,NULL,'noteIndex','',322,323),(264,258,NULL,NULL,'noteAdd','',324,325),(265,258,NULL,NULL,'noteDel','',326,327),(267,31,NULL,NULL,'NaStates','',331,336),(268,267,NULL,NULL,'index','',332,333),(269,267,NULL,NULL,'delete','',334,335),(271,58,NULL,NULL,'view','',100,101),(272,58,NULL,NULL,'enableDisable','',102,103),(275,31,NULL,NULL,'DynamicDetails','',337,392),(276,275,NULL,NULL,'exportCsv','',338,339),(277,275,NULL,NULL,'index','',340,341),(278,275,NULL,NULL,'add','',342,343),(279,275,NULL,NULL,'edit','',344,345),(280,275,NULL,NULL,'delete','',346,347),(281,275,NULL,NULL,'view','',348,349),(282,275,NULL,NULL,'uploadLogo','',350,351),(283,275,NULL,NULL,'indexPhoto','',352,353),(284,275,NULL,NULL,'uploadPhoto','',354,355),(285,275,NULL,NULL,'deletePhoto','',356,357),(286,275,NULL,NULL,'editPhoto','',358,359),(287,275,NULL,NULL,'indexPage','',360,361),(288,275,NULL,NULL,'addPage','',362,363),(289,275,NULL,NULL,'editPage','',364,365),(290,275,NULL,NULL,'deletePage','',366,367),(291,275,NULL,NULL,'indexPair','',368,369),(292,275,NULL,NULL,'addPair','',370,371),(293,275,NULL,NULL,'editPair','',372,373),(294,275,NULL,NULL,'deletePair','',374,375),(295,275,NULL,NULL,'noteIndex','',376,377),(296,275,NULL,NULL,'noteAdd','',378,379),(297,275,NULL,NULL,'noteDel','',380,381),(299,45,NULL,NULL,'autoMacOnOff','',76,77),(300,32,NULL,NULL,'Password Manager Only','Enabling this option will allow the Access Provider ONLY access to the Password Manager applet',765,766),(301,45,NULL,NULL,'viewPassword','',78,79),(302,31,NULL,NULL,'Actions','',393,400),(303,302,NULL,NULL,'index','',394,395),(304,302,NULL,NULL,'add','',396,397),(305,302,NULL,NULL,'delete','',398,399),(309,275,NULL,NULL,'editSettings','',382,383),(310,275,NULL,NULL,'editClickToConnect','',384,385),(311,31,NULL,NULL,'Meshes','MESHdesk main controller',401,470),(312,311,NULL,NULL,'index','',402,403),(313,311,NULL,NULL,'add','',404,405),(314,311,NULL,NULL,'delete','',406,407),(315,311,NULL,NULL,'noteIndex','',408,409),(316,311,NULL,NULL,'noteAdd','',410,411),(317,311,NULL,NULL,'noteDel','',412,413),(318,311,NULL,NULL,'meshEntriesIndex','',414,415),(319,311,NULL,NULL,'meshEntryAdd','',416,417),(320,311,NULL,NULL,'meshEntryEdit','',418,419),(321,311,NULL,NULL,'meshEntryView','',420,421),(322,311,NULL,NULL,'meshEntryDelete','',422,423),(323,311,NULL,NULL,'meshSettingsView','',424,425),(324,311,NULL,NULL,'meshSettingsEdit','',426,427),(325,311,NULL,NULL,'meshExitsIndex','',428,429),(326,311,NULL,NULL,'meshExitAdd','',430,431),(327,311,NULL,NULL,'meshExitEdit','',432,433),(328,311,NULL,NULL,'meshExitView','',434,435),(329,311,NULL,NULL,'meshExitDelete','',436,437),(330,311,NULL,NULL,'meshNodesIndex','',438,439),(332,311,NULL,NULL,'meshNodeAdd','',440,441),(333,311,NULL,NULL,'meshNodeEdit','',442,443),(334,311,NULL,NULL,'meshNodeView','',444,445),(335,311,NULL,NULL,'meshNodeDelete','',446,447),(336,311,NULL,NULL,'meshEntryPoints','',448,449),(337,311,NULL,NULL,'nodeCommonSettingsView','',450,451),(338,311,NULL,NULL,'nodeCommonSettingsEdit','',452,453),(339,311,NULL,NULL,'staticEntryOptions','',454,455),(340,311,NULL,NULL,'staticExitOptions','',456,457),(341,311,NULL,NULL,'mapPrefView','',458,459),(342,311,NULL,NULL,'mapPrefEdit','',460,461),(343,311,NULL,NULL,'mapNodeSave','',462,463),(344,311,NULL,NULL,'mapNodeDelete','',464,465),(345,311,NULL,NULL,'nodesAvailForMap','',466,467),(346,31,NULL,NULL,'NodeActions','',471,478),(347,346,NULL,NULL,'index','',472,473),(348,346,NULL,NULL,'add','',474,475),(349,346,NULL,NULL,'delete','',476,477),(350,31,NULL,NULL,'Ssids','Optional option for Permanent Users to limit their connections',479,490),(351,350,NULL,NULL,'index','',480,481),(352,350,NULL,NULL,'indexAp','List might changed based on the Access Provider specified',482,483),(353,350,NULL,NULL,'add','',484,485),(354,350,NULL,NULL,'delete','',486,487),(355,350,NULL,NULL,'edit','',488,489),(356,31,NULL,NULL,'LicensedDevices','Add-on - non standard',491,500),(357,356,NULL,NULL,'index','',492,493),(358,356,NULL,NULL,'add','',494,495),(359,356,NULL,NULL,'delete','',496,497),(360,356,NULL,NULL,'edit','',498,499),(361,31,NULL,NULL,'NodeLists','Additional convenient add-on to MESHdesk',501,504),(362,361,NULL,NULL,'index','',502,503),(363,31,NULL,NULL,'DynamicClients','Part of FreeRADIUS version 3.x',505,534),(364,363,NULL,NULL,'index','',506,507),(365,363,NULL,NULL,'clientsAvailForMap','',508,509),(366,363,NULL,NULL,'add','',510,511),(367,363,NULL,NULL,'delete','',512,513),(368,363,NULL,NULL,'edit','',514,515),(369,363,NULL,NULL,'view','',516,517),(370,363,NULL,NULL,'viewPhoto','',518,519),(371,363,NULL,NULL,'noteIndex','',520,521),(372,363,NULL,NULL,'noteAdd','',522,523),(373,363,NULL,NULL,'noteDel','',524,525),(374,363,NULL,NULL,'viewMapPref','',526,527),(375,363,NULL,NULL,'editMapPref','',528,529),(376,363,NULL,NULL,'deleteMap','',530,531),(377,363,NULL,NULL,'editMap','',532,533),(378,31,NULL,NULL,'DynamicClientStates','',535,540),(379,378,NULL,NULL,'index','',536,537),(380,378,NULL,NULL,'delete','',538,539),(381,31,NULL,NULL,'UnknownDynamicClients','',541,548),(382,381,NULL,NULL,'index','',542,543),(383,381,NULL,NULL,'edit','',544,545),(384,381,NULL,NULL,'delete','',546,547),(385,31,NULL,NULL,'ApProfiles','Access Point Profiles',549,602),(386,385,NULL,NULL,'index','',550,551),(387,385,NULL,NULL,'add','',552,553),(388,385,NULL,NULL,'delete','',554,555),(389,385,NULL,NULL,'noteIndex','',556,557),(390,385,NULL,NULL,'noteAdd','',558,559),(391,385,NULL,NULL,'noteDel','',560,561),(392,385,NULL,NULL,'apProfileEntriesIndex','',562,563),(393,385,NULL,NULL,'apProfileEntryAdd','',564,565),(394,385,NULL,NULL,'apProfileEntryEdit','',566,567),(395,385,NULL,NULL,'apProfileEntryView','',568,569),(396,385,NULL,NULL,'apProfileEntryDelete','',570,571),(397,385,NULL,NULL,'apProfileExitsIndex','',572,573),(398,385,NULL,NULL,'apProfileExitAdd','',574,575),(399,385,NULL,NULL,'apProfileExitEdit','',576,577),(400,385,NULL,NULL,'apProfileExitView','',578,579),(401,385,NULL,NULL,'apProfileExitDelete','',580,581),(402,385,NULL,NULL,'apProfileEntryPoints','List available Entry Points',582,583),(403,385,NULL,NULL,'apCommonSettingsView','',584,585),(404,385,NULL,NULL,'apCommonSettingsEdit','',586,587),(405,385,NULL,NULL,'advancedSettingsForModel','',588,589),(406,385,NULL,NULL,'apProfileApIndex','',590,591),(407,385,NULL,NULL,'apProfileApAdd','',592,593),(408,385,NULL,NULL,'apProfileApDelete','',594,595),(409,385,NULL,NULL,'apProfileApEdit','',596,597),(410,385,NULL,NULL,'apProfileApView','',598,599),(411,31,NULL,NULL,'Aps','',603,606),(412,411,NULL,NULL,'index','',604,605),(413,385,NULL,NULL,'apProfileExitAddDefaults','',600,601),(414,311,NULL,NULL,'meshExitAddDefaults','',468,469),(435,275,NULL,NULL,'viewSocialLogin','',386,387),(436,275,NULL,NULL,'editSocialLogin','',388,389),(437,43,NULL,NULL,'emailVoucherDetails','',30,31),(438,31,NULL,NULL,'GlobalDomains','Add-on',607,610),(439,438,NULL,NULL,'index','',608,609),(440,275,NULL,NULL,'shufflePhoto','New addition allow rearranging ',390,391),(442,31,NULL,NULL,'TopUps',NULL,611,622),(443,442,NULL,NULL,'exportCsv',NULL,612,613),(444,442,NULL,NULL,'index',NULL,614,615),(445,442,NULL,NULL,'add',NULL,616,617),(446,442,NULL,NULL,'edit',NULL,618,619),(447,442,NULL,NULL,'delete',NULL,620,621),(448,31,NULL,NULL,'TopUpTransactions',NULL,623,626),(449,448,NULL,NULL,'index',NULL,624,625),(450,31,NULL,NULL,'ApActions',NULL,627,636),(451,450,NULL,NULL,'index',NULL,628,629),(452,450,NULL,NULL,'add',NULL,630,631),(453,450,NULL,NULL,'delete',NULL,632,633),(454,450,NULL,NULL,'restartAps',NULL,634,635),(455,31,NULL,NULL,'NotificationLists',NULL,637,642),(456,455,NULL,NULL,'index',NULL,638,639),(457,455,NULL,NULL,'view',NULL,640,641),(458,166,NULL,NULL,'edit',NULL,276,277),(459,166,NULL,NULL,'simpleView',NULL,278,279),(460,166,NULL,NULL,'simpleAdd',NULL,280,281),(461,166,NULL,NULL,'simpleEdit',NULL,282,283),(462,258,NULL,NULL,'exportCsv',NULL,328,329),(463,43,NULL,NULL,'bulkDelete',NULL,32,33),(464,31,NULL,NULL,'Wizards',NULL,643,646),(465,464,NULL,NULL,'index',NULL,644,645),(466,31,NULL,NULL,'Hardwares',NULL,647,664),(467,466,NULL,NULL,'index',NULL,648,649),(468,466,NULL,NULL,'apProfilesList',NULL,650,651),(469,466,NULL,NULL,'meshesList',NULL,652,653),(470,466,NULL,NULL,'advancedSettingsForModel',NULL,654,655),(471,466,NULL,NULL,'add',NULL,656,657),(472,466,NULL,NULL,'edit',NULL,658,659),(473,466,NULL,NULL,'view',NULL,660,661),(474,466,NULL,NULL,'delete',NULL,662,663),(475,31,NULL,NULL,'HomeServerPools',NULL,665,674),(476,475,NULL,NULL,'index',NULL,666,667),(477,475,NULL,NULL,'add',NULL,668,669),(478,475,NULL,NULL,'edit',NULL,670,671),(479,475,NULL,NULL,'delete',NULL,672,673),(480,31,NULL,NULL,'OpenvpnServers',NULL,675,684),(481,480,NULL,NULL,'index',NULL,676,677),(482,480,NULL,NULL,'add',NULL,678,679),(483,480,NULL,NULL,'edit',NULL,680,681),(484,480,NULL,NULL,'delete',NULL,682,683),(485,31,NULL,NULL,'TrafficClasses',NULL,685,694),(486,485,NULL,NULL,'index',NULL,686,687),(487,485,NULL,NULL,'add',NULL,688,689),(488,485,NULL,NULL,'edit',NULL,690,691),(489,485,NULL,NULL,'delete',NULL,692,693),(490,31,NULL,NULL,'Clouds',NULL,695,704),(491,490,NULL,NULL,'index',NULL,696,697),(492,490,NULL,NULL,'add',NULL,698,699),(493,490,NULL,NULL,'edit',NULL,700,701),(494,490,NULL,NULL,'delete',NULL,702,703),(495,31,NULL,NULL,'HardwareOwners',NULL,705,714),(496,495,NULL,NULL,'index',NULL,706,707),(497,495,NULL,NULL,'add',NULL,708,709),(498,495,NULL,NULL,'edit',NULL,710,711),(499,495,NULL,NULL,'delete',NULL,712,713),(500,NULL,'Realms',1,NULL,NULL,775,776),(501,31,NULL,NULL,'UnknownNodes',NULL,715,724),(502,501,NULL,NULL,'index',NULL,716,717),(503,501,NULL,NULL,'add',NULL,718,719),(504,501,NULL,NULL,'edit',NULL,720,721),(505,501,NULL,NULL,'delete',NULL,722,723),(506,31,NULL,NULL,'Schedules',NULL,725,744),(507,506,NULL,NULL,'indexCombo',NULL,726,727),(508,506,NULL,NULL,'index',NULL,728,729),(509,506,NULL,NULL,'add',NULL,730,731),(510,506,NULL,NULL,'edit',NULL,732,733),(511,506,NULL,NULL,'delete',NULL,734,735),(512,506,NULL,NULL,'addScheduleEntry',NULL,736,737),(513,506,NULL,NULL,'viewScheduleEntry',NULL,738,739),(514,506,NULL,NULL,'editScheduleEntry',NULL,740,741),(515,506,NULL,NULL,'deleteScheduleEntry',NULL,742,743),(516,31,NULL,NULL,'PredefinedCommands',NULL,745,756),(517,516,NULL,NULL,'indexCombo',NULL,746,747),(518,516,NULL,NULL,'index',NULL,748,749),(519,516,NULL,NULL,'add',NULL,750,751),(520,516,NULL,NULL,'edit',NULL,752,753),(521,516,NULL,NULL,'delete',NULL,754,755);
/*!40000 ALTER TABLE `acos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `actions`
--

DROP TABLE IF EXISTS `actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `actions` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `na_id` int(10) NOT NULL,
  `action` enum('execute') DEFAULT 'execute',
  `command` varchar(500) DEFAULT '',
  `status` enum('awaiting','fetched','replied') DEFAULT 'awaiting',
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actions`
--

LOCK TABLES `actions` WRITE;
/*!40000 ALTER TABLE `actions` DISABLE KEYS */;
/*!40000 ALTER TABLE `actions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alerts`
--

DROP TABLE IF EXISTS `alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(255) NOT NULL,
  `node_id` int(11) DEFAULT NULL,
  `mesh_id` int(11) DEFAULT NULL,
  `ap_id` int(11) DEFAULT NULL,
  `ap_profile_id` int(11) DEFAULT NULL,
  `detected` timestamp NOT NULL DEFAULT current_timestamp(),
  `acknowledged` datetime DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `resolved` datetime DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alerts`
--

LOCK TABLES `alerts` WRITE;
/*!40000 ALTER TABLE `alerts` DISABLE KEYS */;
/*!40000 ALTER TABLE `alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ap_actions`
--

DROP TABLE IF EXISTS `ap_actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ap_actions` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `ap_id` int(10) NOT NULL,
  `action` enum('execute','execute_and_reply') DEFAULT 'execute',
  `command` varchar(500) DEFAULT '',
  `status` enum('awaiting','fetched','replied') DEFAULT 'awaiting',
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `reply` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ap_actions`
--

LOCK TABLES `ap_actions` WRITE;
/*!40000 ALTER TABLE `ap_actions` DISABLE KEYS */;
/*!40000 ALTER TABLE `ap_actions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ap_connection_settings`
--

DROP TABLE IF EXISTS `ap_connection_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ap_connection_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ap_id` int(11) DEFAULT NULL,
  `grouping` varchar(25) DEFAULT NULL,
  `name` varchar(25) DEFAULT NULL,
  `value` varchar(40) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ap_connection_settings`
--

LOCK TABLES `ap_connection_settings` WRITE;
/*!40000 ALTER TABLE `ap_connection_settings` DISABLE KEYS */;
INSERT INTO `ap_connection_settings` VALUES (20,8,'wifi_pppoe_setting','ssid','LekkerLekker','2021-05-29 18:04:39','2021-05-29 18:04:39'),(21,8,'wifi_pppoe_setting','encryption','psk2','2021-05-29 18:04:39','2021-05-29 18:04:39'),(22,8,'wifi_pppoe_setting','key','12345678','2021-05-29 18:04:39','2021-05-29 18:04:39'),(23,8,'wifi_pppoe_setting','device','radio0','2021-05-29 18:04:39','2021-05-29 18:04:39'),(24,8,'wifi_pppoe_setting','username','koos@kkos','2021-05-29 18:04:39','2021-05-29 18:04:39'),(25,8,'wifi_pppoe_setting','password','koos','2021-05-29 18:04:39','2021-05-29 18:04:39'),(26,8,'wifi_pppoe_setting','dns_1','','2021-05-29 18:04:39','2021-05-29 18:04:39'),(27,8,'wifi_pppoe_setting','dns_2','','2021-05-29 18:04:39','2021-05-29 18:04:39'),(28,8,'wifi_pppoe_setting','mac','','2021-05-29 18:04:39','2021-05-29 18:04:39'),(29,8,'wifi_pppoe_setting','mtu','','2021-05-29 18:04:39','2021-05-29 18:04:39');
/*!40000 ALTER TABLE `ap_connection_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ap_loads`
--

DROP TABLE IF EXISTS `ap_loads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ap_loads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ap_id` int(11) DEFAULT NULL,
  `mem_total` int(11) DEFAULT NULL,
  `mem_free` int(11) DEFAULT NULL,
  `uptime` varchar(255) DEFAULT NULL,
  `system_time` varchar(255) NOT NULL,
  `load_1` float(2,2) NOT NULL,
  `load_2` float(2,2) NOT NULL,
  `load_3` float(2,2) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ap_loads`
--

LOCK TABLES `ap_loads` WRITE;
/*!40000 ALTER TABLE `ap_loads` DISABLE KEYS */;
/*!40000 ALTER TABLE `ap_loads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ap_profile_entries`
--

DROP TABLE IF EXISTS `ap_profile_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ap_profile_entries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ap_profile_id` int(11) DEFAULT NULL,
  `name` varchar(128) NOT NULL,
  `hidden` tinyint(1) NOT NULL DEFAULT 0,
  `isolate` tinyint(1) NOT NULL DEFAULT 0,
  `encryption` enum('none','wep','psk','psk2','wpa','wpa2') DEFAULT 'none',
  `special_key` varchar(100) NOT NULL DEFAULT '',
  `auth_server` varchar(255) NOT NULL DEFAULT '',
  `auth_secret` varchar(255) NOT NULL DEFAULT '',
  `dynamic_vlan` tinyint(1) NOT NULL DEFAULT 0,
  `frequency_band` enum('both','two','five','five_upper','five_lower') DEFAULT 'both',
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `chk_maxassoc` tinyint(1) NOT NULL DEFAULT 0,
  `maxassoc` int(6) DEFAULT 100,
  `macfilter` enum('disable','allow','deny') DEFAULT 'disable',
  `permanent_user_id` int(11) NOT NULL,
  `nasid` varchar(255) NOT NULL DEFAULT '',
  `auto_nasid` tinyint(1) NOT NULL DEFAULT 0,
  `accounting` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ap_profile_entries`
--

LOCK TABLES `ap_profile_entries` WRITE;
/*!40000 ALTER TABLE `ap_profile_entries` DISABLE KEYS */;
INSERT INTO `ap_profile_entries` VALUES (1,1,'Demo1 Guest',0,1,'none','','','',0,'both','2021-10-25 22:48:48','2021-10-25 22:48:48',0,100,'disable',0,'',0,1),(2,1,'Demo1 Wireless',0,0,'psk2','12345678','','',0,'both','2021-10-25 22:48:48','2021-10-25 22:48:48',0,100,'disable',0,'',0,1);
/*!40000 ALTER TABLE `ap_profile_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ap_profile_exit_ap_profile_entries`
--

DROP TABLE IF EXISTS `ap_profile_exit_ap_profile_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ap_profile_exit_ap_profile_entries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ap_profile_exit_id` int(11) NOT NULL,
  `ap_profile_entry_id` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ap_profile_exit_ap_profile_entries`
--

LOCK TABLES `ap_profile_exit_ap_profile_entries` WRITE;
/*!40000 ALTER TABLE `ap_profile_exit_ap_profile_entries` DISABLE KEYS */;
INSERT INTO `ap_profile_exit_ap_profile_entries` VALUES (76,40,17,'2016-09-18 05:00:15','2016-09-18 05:00:15'),(79,23,18,'2017-02-24 21:13:54','2017-02-24 21:13:54'),(80,41,20,'2019-04-12 06:17:36','2019-04-12 06:17:36'),(81,42,21,'2019-09-20 04:22:11','2019-09-20 04:22:11'),(82,43,22,'2019-09-20 04:22:11','2019-09-20 04:22:11'),(83,1,1,'2021-10-25 22:48:48','2021-10-25 22:48:48'),(84,2,2,'2021-10-25 22:48:48','2021-10-25 22:48:48');
/*!40000 ALTER TABLE `ap_profile_exit_ap_profile_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ap_profile_exit_captive_portals`
--

DROP TABLE IF EXISTS `ap_profile_exit_captive_portals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ap_profile_exit_captive_portals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ap_profile_exit_id` int(11) NOT NULL,
  `radius_1` varchar(128) NOT NULL,
  `radius_2` varchar(128) NOT NULL DEFAULT '',
  `radius_secret` varchar(128) NOT NULL,
  `radius_nasid` varchar(128) NOT NULL,
  `uam_url` varchar(255) NOT NULL,
  `uam_secret` varchar(255) NOT NULL,
  `walled_garden` varchar(255) NOT NULL,
  `swap_octets` tinyint(1) NOT NULL DEFAULT 0,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `mac_auth` tinyint(1) NOT NULL DEFAULT 0,
  `proxy_enable` tinyint(1) NOT NULL DEFAULT 0,
  `proxy_ip` varchar(128) NOT NULL DEFAULT '',
  `proxy_port` int(11) NOT NULL DEFAULT 3128,
  `proxy_auth_username` varchar(128) NOT NULL DEFAULT '',
  `proxy_auth_password` varchar(128) NOT NULL DEFAULT '',
  `coova_optional` varchar(255) NOT NULL DEFAULT '',
  `dns_manual` tinyint(1) NOT NULL DEFAULT 0,
  `dns1` varchar(128) NOT NULL DEFAULT '',
  `dns2` varchar(128) NOT NULL DEFAULT '',
  `uamanydns` tinyint(1) NOT NULL DEFAULT 0,
  `dnsparanoia` tinyint(1) NOT NULL DEFAULT 0,
  `dnsdesk` tinyint(1) NOT NULL DEFAULT 0,
  `ap_profile_exit_upstream_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ap_profile_exit_captive_portals`
--

LOCK TABLES `ap_profile_exit_captive_portals` WRITE;
/*!40000 ALTER TABLE `ap_profile_exit_captive_portals` DISABLE KEYS */;
INSERT INTO `ap_profile_exit_captive_portals` VALUES (5,23,'198.27.111.78','','testing123','','http://198.27.111.78/cake3/rd_cake/dynamic-details/chilli-browser-detect/','greatsecret','',0,'2016-05-10 05:23:30','2017-02-24 21:13:54',1,0,'',3128,'','','ssid=radiusdesk',0,'4.4.4.4','8.8.8.8',0,0,0,NULL),(6,42,'206.189.185.139','','testing123','','https://cloud.mesh-manager.com/cake3/rd_cake/dynamic-details/chilli-browser-detect/','greatsecret','',0,'2019-09-20 04:22:11','2019-09-20 04:22:11',1,0,'',3128,'','','ssid 909eynsham_road\n',0,'','',0,0,0,NULL),(7,1,'192.168.8.220','','testing123','','http://192.168.8.220/cake3/rd_cake/dynamic-details/chilli-browser-detect/','greatsecret','',0,'2021-10-25 22:48:48','2021-10-25 22:48:48',1,0,'',3128,'','','ssid demo1\n',0,'','',0,0,0,NULL);
/*!40000 ALTER TABLE `ap_profile_exit_captive_portals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ap_profile_exit_settings`
--

DROP TABLE IF EXISTS `ap_profile_exit_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ap_profile_exit_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ap_profile_exit_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `value` varchar(255) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ap_profile_exit_settings`
--

LOCK TABLES `ap_profile_exit_settings` WRITE;
/*!40000 ALTER TABLE `ap_profile_exit_settings` DISABLE KEYS */;
INSERT INTO `ap_profile_exit_settings` VALUES (24,11,'nat_ipaddr','10.200.220.253','2021-05-20 03:46:43','2021-05-20 03:46:43'),(25,11,'nat_netmask','255.255.255.0','2021-05-20 03:46:43','2021-05-20 03:46:43'),(26,11,'nat_pool_start','100','2021-05-20 03:46:43','2021-05-20 03:46:43'),(27,11,'nat_pool_limit','200','2021-05-20 03:46:43','2021-05-20 03:46:43'),(28,11,'nat_leasetime','12','2021-05-20 03:46:43','2021-05-20 03:46:43'),(29,11,'nat_dns_1','4.4.4.4','2021-05-20 03:46:43','2021-05-20 03:46:43'),(30,11,'nat_dns_2','8.8.8.8','2021-05-20 03:46:43','2021-05-20 03:46:43');
/*!40000 ALTER TABLE `ap_profile_exit_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ap_profile_exits`
--

DROP TABLE IF EXISTS `ap_profile_exits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ap_profile_exits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ap_profile_id` int(11) DEFAULT NULL,
  `type` enum('bridge','tagged_bridge','nat','captive_portal','openvpn_bridge','tagged_bridge_l3') DEFAULT NULL,
  `vlan` int(4) DEFAULT NULL,
  `auto_dynamic_client` tinyint(1) NOT NULL DEFAULT 0,
  `realm_list` varchar(128) NOT NULL DEFAULT '',
  `auto_login_page` tinyint(1) NOT NULL DEFAULT 0,
  `dynamic_detail_id` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `openvpn_server_id` int(11) DEFAULT NULL,
  `proto` enum('static','dhcp','dhcpv6') DEFAULT 'dhcp',
  `ipaddr` varchar(50) NOT NULL DEFAULT '',
  `netmask` varchar(50) NOT NULL DEFAULT '',
  `gateway` varchar(50) NOT NULL DEFAULT '',
  `dns_1` varchar(50) NOT NULL DEFAULT '',
  `dns_2` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ap_profile_exits`
--

LOCK TABLES `ap_profile_exits` WRITE;
/*!40000 ALTER TABLE `ap_profile_exits` DISABLE KEYS */;
INSERT INTO `ap_profile_exits` VALUES (1,1,'captive_portal',NULL,1,'1',1,1,'2021-10-25 22:48:48','2021-10-25 22:48:48',NULL,'dhcp','','','','',''),(2,1,'bridge',NULL,0,'',0,NULL,'2021-10-25 22:48:48','2021-10-25 22:48:48',NULL,'dhcp','','','','','');
/*!40000 ALTER TABLE `ap_profile_exits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ap_profile_notes`
--

DROP TABLE IF EXISTS `ap_profile_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ap_profile_notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ap_profile_id` int(11) NOT NULL,
  `note_id` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ap_profile_notes`
--

LOCK TABLES `ap_profile_notes` WRITE;
/*!40000 ALTER TABLE `ap_profile_notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `ap_profile_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ap_profile_settings`
--

DROP TABLE IF EXISTS `ap_profile_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ap_profile_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ap_profile_id` int(11) DEFAULT NULL,
  `password` varchar(128) NOT NULL,
  `heartbeat_interval` int(5) NOT NULL DEFAULT 60,
  `heartbeat_dead_after` int(5) NOT NULL DEFAULT 600,
  `password_hash` varchar(100) NOT NULL DEFAULT '',
  `tz_name` varchar(128) NOT NULL DEFAULT 'America/New York',
  `tz_value` varchar(128) NOT NULL DEFAULT 'EST5EDT,M3.2.0,M11.1.0',
  `country` varchar(5) NOT NULL DEFAULT 'US',
  `gw_dhcp_timeout` int(5) NOT NULL DEFAULT 120,
  `gw_use_previous` tinyint(1) NOT NULL DEFAULT 1,
  `gw_auto_reboot` tinyint(1) NOT NULL DEFAULT 1,
  `gw_auto_reboot_time` int(5) NOT NULL DEFAULT 600,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `syslog1_ip` varchar(50) NOT NULL DEFAULT '',
  `syslog1_port` varchar(10) NOT NULL DEFAULT '514',
  `syslog2_ip` varchar(50) NOT NULL DEFAULT '',
  `syslog2_port` varchar(10) NOT NULL DEFAULT '514',
  `syslog3_ip` varchar(50) NOT NULL DEFAULT '',
  `syslog3_port` varchar(10) NOT NULL DEFAULT '514',
  `report_adv_enable` tinyint(1) NOT NULL DEFAULT 1,
  `report_adv_proto` enum('https','http') DEFAULT 'http',
  `report_adv_light` int(5) DEFAULT 60,
  `report_adv_full` int(5) DEFAULT 600,
  `report_adv_sampling` int(5) DEFAULT 60,
  `enable_schedules` tinyint(1) NOT NULL DEFAULT 0,
  `schedule_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ap_profile_settings`
--

LOCK TABLES `ap_profile_settings` WRITE;
/*!40000 ALTER TABLE `ap_profile_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `ap_profile_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ap_profile_specifics`
--

DROP TABLE IF EXISTS `ap_profile_specifics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ap_profile_specifics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ap_profile_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `value` varchar(255) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ap_profile_specifics`
--

LOCK TABLES `ap_profile_specifics` WRITE;
/*!40000 ALTER TABLE `ap_profile_specifics` DISABLE KEYS */;
/*!40000 ALTER TABLE `ap_profile_specifics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ap_profiles`
--

DROP TABLE IF EXISTS `ap_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ap_profiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `available_to_siblings` tinyint(1) NOT NULL DEFAULT 0,
  `enable_alerts` tinyint(1) NOT NULL DEFAULT 1,
  `enable_overviews` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ap_profiles`
--

LOCK TABLES `ap_profiles` WRITE;
/*!40000 ALTER TABLE `ap_profiles` DISABLE KEYS */;
INSERT INTO `ap_profiles` VALUES (1,'Demo1',45,'2021-10-25 22:48:48','2021-10-25 22:48:48',1,1,1);
/*!40000 ALTER TABLE `ap_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ap_stations`
--

DROP TABLE IF EXISTS `ap_stations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ap_stations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ap_id` int(11) DEFAULT NULL,
  `ap_profile_entry_id` int(11) DEFAULT NULL,
  `vendor` varchar(255) DEFAULT NULL,
  `mac` varchar(17) NOT NULL,
  `tx_bytes` bigint(20) NOT NULL,
  `rx_bytes` bigint(20) NOT NULL,
  `tx_packets` int(11) NOT NULL,
  `rx_packets` int(11) NOT NULL,
  `tx_bitrate` int(11) NOT NULL,
  `rx_bitrate` int(11) NOT NULL,
  `tx_extra_info` varchar(255) NOT NULL,
  `rx_extra_info` varchar(255) NOT NULL,
  `authenticated` enum('yes','no') DEFAULT 'no',
  `authorized` enum('yes','no') DEFAULT 'no',
  `tdls_peer` varchar(255) NOT NULL,
  `preamble` enum('long','short') DEFAULT 'long',
  `tx_failed` int(11) NOT NULL,
  `inactive_time` int(11) NOT NULL,
  `WMM_WME` enum('yes','no') DEFAULT 'no',
  `tx_retries` int(11) NOT NULL,
  `MFP` enum('yes','no') DEFAULT 'no',
  `signal_now` int(11) NOT NULL,
  `signal_avg` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ap_stations`
--

LOCK TABLES `ap_stations` WRITE;
/*!40000 ALTER TABLE `ap_stations` DISABLE KEYS */;
/*!40000 ALTER TABLE `ap_stations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ap_systems`
--

DROP TABLE IF EXISTS `ap_systems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ap_systems` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ap_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `value` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ap_systems`
--

LOCK TABLES `ap_systems` WRITE;
/*!40000 ALTER TABLE `ap_systems` DISABLE KEYS */;
/*!40000 ALTER TABLE `ap_systems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ap_uptm_histories`
--

DROP TABLE IF EXISTS `ap_uptm_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ap_uptm_histories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ap_id` int(11) DEFAULT NULL,
  `ap_state` tinyint(1) NOT NULL DEFAULT 0,
  `state_datetime` datetime NOT NULL,
  `report_datetime` datetime NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ap_uptm_histories`
--

LOCK TABLES `ap_uptm_histories` WRITE;
/*!40000 ALTER TABLE `ap_uptm_histories` DISABLE KEYS */;
/*!40000 ALTER TABLE `ap_uptm_histories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ap_wifi_settings`
--

DROP TABLE IF EXISTS `ap_wifi_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ap_wifi_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ap_id` int(11) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `value` varchar(255) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ap_wifi_settings`
--

LOCK TABLES `ap_wifi_settings` WRITE;
/*!40000 ALTER TABLE `ap_wifi_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `ap_wifi_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aps`
--

DROP TABLE IF EXISTS `aps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `aps` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ap_profile_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `mac` varchar(255) NOT NULL,
  `hardware` varchar(255) DEFAULT NULL,
  `last_contact_from_ip` varchar(255) DEFAULT NULL,
  `last_contact` datetime DEFAULT NULL,
  `on_public_maps` tinyint(1) NOT NULL DEFAULT 0,
  `lat` double DEFAULT NULL,
  `lon` double DEFAULT NULL,
  `photo_file_name` varchar(128) NOT NULL DEFAULT 'logo.jpg',
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `config_fetched` datetime DEFAULT NULL,
  `lan_proto` varchar(30) NOT NULL DEFAULT '',
  `lan_ip` varchar(30) NOT NULL DEFAULT '',
  `lan_gw` varchar(30) NOT NULL DEFAULT '',
  `gateway` enum('none','lan','3g','wifi','wifi_static','wifi_ppp','wifi_pppoe','wan_static','wan_ppp','wan_pppoe') DEFAULT 'none',
  `reboot_flag` tinyint(1) NOT NULL DEFAULT 0,
  `tree_tag_id` int(11) DEFAULT NULL,
  `enable_alerts` tinyint(1) NOT NULL DEFAULT 1,
  `enable_overviews` tinyint(1) NOT NULL DEFAULT 1,
  `enable_schedules` tinyint(1) NOT NULL DEFAULT 0,
  `schedule_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aps`
--

LOCK TABLES `aps` WRITE;
/*!40000 ALTER TABLE `aps` DISABLE KEYS */;
/*!40000 ALTER TABLE `aps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ar_mesh_daily_summaries`
--

DROP TABLE IF EXISTS `ar_mesh_daily_summaries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ar_mesh_daily_summaries` (
  `id` int(11) NOT NULL,
  `mesh_id` int(11) NOT NULL,
  `the_date` date NOT NULL,
  `tree_tag_id` int(11) DEFAULT NULL,
  `mesh_name` varchar(255) DEFAULT NULL,
  `min_clients` bigint(20) DEFAULT 0,
  `max_clients` bigint(20) DEFAULT 0,
  `min_nodes` bigint(20) DEFAULT 0,
  `max_nodes` bigint(20) DEFAULT 0,
  `min_lv_nodes` bigint(20) DEFAULT 0,
  `max_lv_nodes` bigint(20) DEFAULT 0,
  `min_lv_nodes_down` bigint(20) DEFAULT 0,
  `max_lv_nodes_down` bigint(20) DEFAULT 0,
  `min_nodes_down` bigint(20) DEFAULT 0,
  `max_nodes_down` bigint(20) DEFAULT 0,
  `min_nodes_up` bigint(20) DEFAULT 0,
  `max_nodes_up` bigint(20) DEFAULT 0,
  `min_dual_radios` bigint(20) DEFAULT 0,
  `max_dual_radios` bigint(20) DEFAULT 0,
  `min_single_radios` bigint(20) DEFAULT 0,
  `max_single_radios` bigint(20) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_ar_mesh_daily_summaries_mesh_id_the_date` (`mesh_id`,`the_date`),
  KEY `idx_ar_mesh_daily_summaries_mesh_id` (`mesh_id`),
  KEY `idx_ar_mesh_daily_summaries_tree_tag_id` (`tree_tag_id`),
  KEY `idx_ar_mesh_daily_summaries_the_date` (`the_date`),
  KEY `idx_ar_mesh_daily_summaries_mesh_name` (`mesh_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ar_mesh_daily_summaries`
--

LOCK TABLES `ar_mesh_daily_summaries` WRITE;
/*!40000 ALTER TABLE `ar_mesh_daily_summaries` DISABLE KEYS */;
/*!40000 ALTER TABLE `ar_mesh_daily_summaries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ar_node_ibss_connections`
--

DROP TABLE IF EXISTS `ar_node_ibss_connections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ar_node_ibss_connections` (
  `id` int(11) NOT NULL,
  `node_id` int(11) DEFAULT NULL,
  `station_node_id` int(11) DEFAULT NULL,
  `vendor` varchar(255) DEFAULT NULL,
  `mac` varchar(17) NOT NULL,
  `tx_bytes` bigint(20) NOT NULL,
  `rx_bytes` bigint(20) NOT NULL,
  `tx_packets` int(11) NOT NULL,
  `rx_packets` int(11) NOT NULL,
  `tx_bitrate` int(11) NOT NULL,
  `rx_bitrate` int(11) NOT NULL,
  `tx_extra_info` varchar(255) NOT NULL,
  `rx_extra_info` varchar(255) NOT NULL,
  `authenticated` enum('yes','no') DEFAULT 'no',
  `authorized` enum('yes','no') DEFAULT 'no',
  `tdls_peer` varchar(255) NOT NULL,
  `preamble` enum('long','short') DEFAULT 'long',
  `tx_failed` int(11) NOT NULL,
  `inactive_time` int(11) NOT NULL,
  `WMM_WME` enum('yes','no') DEFAULT 'no',
  `tx_retries` int(11) NOT NULL,
  `MFP` enum('yes','no') DEFAULT 'no',
  `signal_now` int(11) NOT NULL,
  `signal_avg` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ar_node_ibss_connections_node_id` (`node_id`),
  KEY `idx_ar_node_ibss_connections_station_node_id` (`station_node_id`),
  KEY `idx_ar_node_ibss_connections_modified` (`modified`),
  KEY `idx_ar_node_ibss_connections_mac` (`mac`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ar_node_ibss_connections`
--

LOCK TABLES `ar_node_ibss_connections` WRITE;
/*!40000 ALTER TABLE `ar_node_ibss_connections` DISABLE KEYS */;
/*!40000 ALTER TABLE `ar_node_ibss_connections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ar_node_stations`
--

DROP TABLE IF EXISTS `ar_node_stations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ar_node_stations` (
  `id` int(11) NOT NULL,
  `node_id` int(11) DEFAULT NULL,
  `mesh_entry_id` int(11) DEFAULT NULL,
  `vendor` varchar(255) DEFAULT NULL,
  `mac` varchar(17) NOT NULL,
  `tx_bytes` bigint(20) NOT NULL,
  `rx_bytes` bigint(20) NOT NULL,
  `tx_packets` int(11) NOT NULL,
  `rx_packets` int(11) NOT NULL,
  `tx_bitrate` int(11) NOT NULL,
  `rx_bitrate` int(11) NOT NULL,
  `tx_extra_info` varchar(255) NOT NULL,
  `rx_extra_info` varchar(255) NOT NULL,
  `authenticated` enum('yes','no') DEFAULT 'no',
  `authorized` enum('yes','no') DEFAULT 'no',
  `tdls_peer` varchar(255) NOT NULL,
  `preamble` enum('long','short') DEFAULT 'long',
  `tx_failed` int(11) NOT NULL,
  `inactive_time` int(11) NOT NULL,
  `WMM_WME` enum('yes','no') DEFAULT 'no',
  `tx_retries` int(11) NOT NULL,
  `MFP` enum('yes','no') DEFAULT 'no',
  `signal_now` int(11) NOT NULL,
  `signal_avg` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ar_node_stations_node_id` (`node_id`),
  KEY `idx_ar_node_stations_mesh_entry_id` (`mesh_entry_id`),
  KEY `idx_ar_node_stations_modified` (`modified`),
  KEY `idx_ar_node_stations_mac` (`mac`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ar_node_stations`
--

LOCK TABLES `ar_node_stations` WRITE;
/*!40000 ALTER TABLE `ar_node_stations` DISABLE KEYS */;
/*!40000 ALTER TABLE `ar_node_stations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ar_node_uptm_histories`
--

DROP TABLE IF EXISTS `ar_node_uptm_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ar_node_uptm_histories` (
  `id` int(11) NOT NULL,
  `node_id` int(11) DEFAULT NULL,
  `node_state` tinyint(1) NOT NULL DEFAULT 0,
  `state_datetime` datetime NOT NULL,
  `report_datetime` datetime NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ar_node_uptm_histories_node_id` (`node_id`),
  KEY `idx_ar_node_uptm_histories_modified` (`modified`),
  KEY `idx_ar_node_uptm_histories_node_state` (`node_state`),
  KEY `idx_ar_node_uptm_histories_state_datetime` (`state_datetime`),
  KEY `idx_ar_node_uptm_histories_report_datetime` (`report_datetime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ar_node_uptm_histories`
--

LOCK TABLES `ar_node_uptm_histories` WRITE;
/*!40000 ALTER TABLE `ar_node_uptm_histories` DISABLE KEYS */;
/*!40000 ALTER TABLE `ar_node_uptm_histories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aros`
--

DROP TABLE IF EXISTS `aros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `aros` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `parent_id` int(10) DEFAULT NULL,
  `model` varchar(255) DEFAULT NULL,
  `foreign_key` int(10) DEFAULT NULL,
  `alias` varchar(255) DEFAULT NULL,
  `lft` int(10) DEFAULT NULL,
  `rght` int(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_aros_parent_id` (`parent_id`),
  KEY `idx_aros_foreign_key` (`foreign_key`),
  KEY `idx_aros_model` (`model`),
  KEY `idx_aros_lft` (`lft`),
  KEY `idx_aros_rght` (`rght`)
) ENGINE=InnoDB AUTO_INCREMENT=3120 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aros`
--

LOCK TABLES `aros` WRITE;
/*!40000 ALTER TABLE `aros` DISABLE KEYS */;
INSERT INTO `aros` VALUES (3115,NULL,'Groups',8,NULL,1,4),(3116,NULL,'Groups',9,NULL,5,34),(3117,NULL,'Groups',10,NULL,35,210),(3118,3115,'Users',44,NULL,2,3),(3119,3116,'Users',45,NULL,32,33);
/*!40000 ALTER TABLE `aros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aros_acos`
--

DROP TABLE IF EXISTS `aros_acos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `aros_acos` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `aro_id` int(10) NOT NULL,
  `aco_id` int(10) NOT NULL,
  `_create` varchar(2) NOT NULL DEFAULT '0',
  `_read` varchar(2) NOT NULL DEFAULT '0',
  `_update` varchar(2) NOT NULL DEFAULT '0',
  `_delete` varchar(2) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ARO_ACO_KEY` (`aro_id`,`aco_id`),
  KEY `idx_aros_acos_aro_id` (`aro_id`),
  KEY `idx_aros_acos_aco_id` (`aco_id`)
) ENGINE=InnoDB AUTO_INCREMENT=471 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aros_acos`
--

LOCK TABLES `aros_acos` WRITE;
/*!40000 ALTER TABLE `aros_acos` DISABLE KEYS */;
INSERT INTO `aros_acos` VALUES (16,3116,44,'1','1','1','1'),(17,3116,46,'1','1','1','1'),(18,3116,59,'1','1','1','1'),(19,3116,60,'1','1','1','1'),(20,3116,62,'1','1','1','1'),(21,3116,42,'-1','-1','-1','-1'),(22,3116,61,'1','1','1','1'),(23,3116,63,'-1','-1','-1','-1'),(24,3116,64,'1','1','1','1'),(25,3116,65,'1','1','1','1'),(61,3116,68,'1','1','1','1'),(62,3116,69,'1','1','1','1'),(63,3116,70,'1','1','1','1'),(64,3116,71,'1','1','1','1'),(75,3116,103,'1','1','1','1'),(76,3116,104,'1','1','1','1'),(77,3116,105,'1','1','1','1'),(78,3116,106,'1','1','1','1'),(79,3116,108,'1','1','1','1'),(80,3116,109,'1','1','1','1'),(81,3116,110,'1','1','1','1'),(82,3116,111,'1','1','1','1'),(83,3116,112,'1','1','1','1'),(86,3116,117,'1','1','1','1'),(87,3116,116,'1','1','1','1'),(88,3116,115,'1','1','1','1'),(89,3116,114,'1','1','1','1'),(90,3116,113,'1','1','1','1'),(91,3116,118,'1','1','1','1'),(92,3116,119,'1','1','1','1'),(93,3116,120,'1','1','1','1'),(94,3116,121,'1','1','1','1'),(95,3116,122,'1','1','1','1'),(96,3116,123,'1','1','1','1'),(97,3116,124,'1','1','1','1'),(98,3116,125,'1','1','1','1'),(99,3116,126,'1','1','1','1'),(100,3116,127,'1','1','1','1'),(101,3116,128,'1','1','1','1'),(102,3116,129,'1','1','1','1'),(103,3116,130,'1','1','1','1'),(108,3116,133,'1','1','1','1'),(109,3116,134,'1','1','1','1'),(112,3116,138,'1','1','1','1'),(113,3116,149,'1','1','1','1'),(114,3116,150,'1','1','1','1'),(115,3116,152,'1','1','1','1'),(116,3255,46,'1','1','1','1'),(117,3255,138,'1','1','1','1'),(118,3255,44,'1','1','1','1'),(119,3254,46,'1','1','1','1'),(120,3116,153,'1','1','1','1'),(121,3116,154,'1','1','1','1'),(122,3254,155,'1','1','1','1'),(123,3116,163,'1','1','1','1'),(124,3116,162,'1','1','1','1'),(125,3116,161,'1','1','1','1'),(126,3116,160,'1','1','1','1'),(127,3116,159,'1','1','1','1'),(128,3116,158,'1','1','1','1'),(129,3116,157,'1','1','1','1'),(130,3116,156,'1','1','1','1'),(131,3116,164,'1','1','1','1'),(132,3116,165,'1','1','1','1'),(133,3255,32,'1','1','-1','-1'),(134,3255,148,'-1','-1','-1','-1'),(135,3255,146,'-1','-1','-1','-1'),(136,3254,148,'1','1','1','1'),(137,3254,146,'1','1','1','1'),(138,3116,167,'1','1','1','1'),(139,3116,168,'1','1','1','1'),(140,3116,175,'1','1','1','1'),(141,3116,174,'1','1','1','1'),(142,3116,173,'1','1','1','1'),(144,3116,170,'1','1','1','1'),(145,3116,169,'1','1','1','1'),(146,3116,171,'1','1','1','1'),(147,3116,181,'1','1','1','1'),(148,3116,180,'1','1','1','1'),(149,3116,179,'1','1','1','1'),(150,3116,178,'1','1','1','1'),(151,3116,177,'1','1','1','1'),(152,3116,182,'1','1','1','1'),(153,3116,184,'1','1','1','1'),(154,3116,185,'1','1','1','1'),(155,3116,186,'1','1','1','1'),(156,3116,187,'1','1','1','1'),(157,3116,188,'1','1','1','1'),(158,3116,189,'1','1','1','1'),(159,3116,190,'1','1','1','1'),(160,3116,191,'1','1','1','1'),(161,3116,192,'1','1','1','1'),(162,3116,193,'1','1','1','1'),(163,3116,194,'1','1','1','1'),(164,3116,195,'1','1','1','1'),(165,3116,197,'1','1','1','1'),(166,3116,196,'1','1','1','1'),(167,3116,206,'1','1','1','1'),(168,3116,205,'1','1','1','1'),(169,3116,204,'1','1','1','1'),(170,3116,203,'1','1','1','1'),(171,3116,202,'1','1','1','1'),(172,3116,201,'1','1','1','1'),(173,3116,200,'1','1','1','1'),(174,3116,199,'1','1','1','1'),(175,3116,198,'1','1','1','1'),(176,3116,207,'1','1','1','1'),(177,3116,208,'1','1','1','1'),(178,3255,155,'1','1','1','1'),(179,3254,195,'1','1','1','1'),(180,3116,210,'1','1','1','1'),(181,3116,211,'1','1','1','1'),(183,3116,213,'1','1','1','1'),(184,3116,221,'1','1','1','1'),(185,3116,223,'1','1','1','1'),(186,3116,241,'1','1','1','1'),(187,3116,240,'1','1','1','1'),(188,3116,239,'1','1','1','1'),(189,3116,238,'1','1','1','1'),(190,3116,237,'1','1','1','1'),(191,3116,236,'1','1','1','1'),(192,3116,235,'1','1','1','1'),(193,3116,234,'1','1','1','1'),(194,3116,233,'1','1','1','1'),(195,3116,232,'1','1','1','1'),(196,3116,231,'1','1','1','1'),(197,3116,230,'1','1','1','1'),(198,3116,229,'1','1','1','1'),(199,3116,228,'1','1','1','1'),(200,3116,227,'1','1','1','1'),(201,3116,226,'1','1','1','1'),(202,3116,225,'1','1','1','1'),(203,3116,224,'1','1','1','1'),(204,3116,243,'1','1','1','1'),(206,3116,248,'1','1','1','1'),(207,3116,247,'1','1','1','1'),(208,3116,246,'1','1','1','1'),(209,3116,215,'1','1','1','1'),(210,3116,214,'1','1','1','1'),(211,3116,249,'1','1','1','1'),(212,3116,250,'1','1','1','1'),(215,3116,254,'1','1','1','1'),(216,3116,253,'1','1','1','1'),(217,3116,259,'1','1','1','1'),(218,3116,260,'1','1','1','1'),(219,3116,261,'1','1','1','1'),(220,3116,263,'1','1','1','1'),(221,3116,262,'1','1','1','1'),(222,3116,264,'1','1','1','1'),(223,3116,265,'1','1','1','1'),(224,3116,268,'1','1','1','1'),(225,3116,269,'1','1','1','1'),(226,3116,272,'1','1','1','1'),(227,3116,271,'1','1','1','1'),(229,3116,276,'1','1','1','1'),(230,3116,297,'1','1','1','1'),(231,3116,296,'1','1','1','1'),(232,3116,295,'1','1','1','1'),(233,3116,294,'1','1','1','1'),(234,3116,293,'1','1','1','1'),(235,3116,292,'1','1','1','1'),(236,3116,291,'1','1','1','1'),(237,3116,290,'1','1','1','1'),(238,3116,289,'1','1','1','1'),(239,3116,288,'1','1','1','1'),(240,3116,287,'1','1','1','1'),(241,3116,286,'1','1','1','1'),(242,3116,285,'1','1','1','1'),(243,3116,284,'1','1','1','1'),(244,3116,283,'1','1','1','1'),(245,3116,282,'1','1','1','1'),(246,3116,281,'1','1','1','1'),(247,3116,280,'1','1','1','1'),(248,3116,279,'1','1','1','1'),(249,3116,278,'1','1','1','1'),(250,3116,277,'1','1','1','1'),(251,3116,299,'1','1','1','1'),(252,3116,300,'-1','-1','-1','-1'),(255,3116,301,'1','1','1','1'),(256,3116,303,'1','1','1','1'),(257,3116,304,'1','1','1','1'),(258,3116,305,'1','1','1','1'),(259,3116,309,'1','1','1','1'),(260,3116,310,'1','1','1','1'),(261,3116,312,'1','1','1','1'),(262,3116,313,'1','1','1','1'),(263,3116,314,'1','1','1','1'),(264,3116,315,'1','1','1','1'),(265,3116,316,'1','1','1','1'),(266,3116,317,'1','1','1','1'),(267,3116,318,'1','1','1','1'),(268,3116,319,'1','1','1','1'),(269,3116,320,'1','1','1','1'),(270,3116,321,'1','1','1','1'),(271,3116,322,'1','1','1','1'),(272,3116,323,'1','1','1','1'),(273,3116,324,'1','1','1','1'),(274,3116,325,'1','1','1','1'),(275,3116,326,'1','1','1','1'),(276,3116,327,'1','1','1','1'),(277,3116,328,'1','1','1','1'),(278,3116,329,'1','1','1','1'),(279,3116,330,'1','1','1','1'),(280,3116,332,'1','1','1','1'),(281,3116,333,'1','1','1','1'),(282,3116,334,'1','1','1','1'),(283,3116,335,'1','1','1','1'),(284,3116,336,'1','1','1','1'),(285,3116,337,'1','1','1','1'),(286,3116,338,'1','1','1','1'),(287,3116,339,'1','1','1','1'),(288,3116,340,'1','1','1','1'),(289,3116,341,'1','1','1','1'),(290,3116,342,'1','1','1','1'),(291,3116,343,'1','1','1','1'),(292,3116,344,'1','1','1','1'),(293,3116,345,'1','1','1','1'),(294,3116,347,'1','1','1','1'),(295,3116,348,'1','1','1','1'),(296,3116,349,'1','1','1','1'),(297,3116,355,'1','1','1','1'),(298,3116,354,'1','1','1','1'),(299,3116,353,'1','1','1','1'),(300,3116,352,'1','1','1','1'),(301,3116,351,'1','1','1','1'),(302,3116,357,'1','1','1','1'),(303,3116,358,'1','1','1','1'),(304,3116,359,'1','1','1','1'),(305,3116,362,'1','1','1','1'),(306,3116,360,'1','1','1','1'),(315,3276,44,'1','1','1','1'),(317,3116,384,'1','1','1','1'),(318,3116,383,'1','1','1','1'),(319,3116,382,'1','1','1','1'),(320,3116,379,'1','1','1','1'),(321,3116,380,'1','1','1','1'),(322,3116,364,'1','1','1','1'),(323,3116,365,'1','1','1','1'),(324,3116,366,'1','1','1','1'),(325,3116,367,'1','1','1','1'),(326,3116,368,'1','1','1','1'),(327,3116,369,'1','1','1','1'),(328,3116,370,'1','1','1','1'),(329,3116,371,'1','1','1','1'),(330,3116,372,'1','1','1','1'),(331,3116,373,'1','1','1','1'),(332,3116,374,'1','1','1','1'),(333,3116,375,'1','1','1','1'),(334,3116,376,'1','1','1','1'),(335,3116,377,'1','1','1','1'),(336,3116,386,'1','1','1','1'),(337,3116,387,'1','1','1','1'),(338,3116,388,'1','1','1','1'),(339,3116,389,'1','1','1','1'),(340,3116,390,'1','1','1','1'),(341,3116,391,'1','1','1','1'),(342,3116,392,'1','1','1','1'),(343,3116,393,'1','1','1','1'),(344,3116,394,'1','1','1','1'),(345,3116,395,'1','1','1','1'),(346,3116,396,'1','1','1','1'),(347,3116,397,'1','1','1','1'),(348,3116,410,'1','1','1','1'),(349,3116,409,'1','1','1','1'),(350,3116,408,'1','1','1','1'),(351,3116,407,'1','1','1','1'),(352,3116,406,'1','1','1','1'),(353,3116,405,'1','1','1','1'),(354,3116,404,'1','1','1','1'),(355,3116,403,'1','1','1','1'),(356,3116,402,'1','1','1','1'),(357,3116,401,'1','1','1','1'),(358,3116,400,'1','1','1','1'),(359,3116,399,'1','1','1','1'),(360,3116,398,'1','1','1','1'),(361,3116,412,'1','1','1','1'),(362,3116,414,'1','1','1','1'),(363,3116,413,'1','1','1','1'),(364,3284,42,'1','1','1','1'),(365,3284,415,'1','1','1','1'),(366,3285,42,'1','1','1','1'),(367,3285,417,'1','1','1','1'),(378,3280,42,'1','1','1','1'),(379,3280,167,'-1','-1','-1','-1'),(380,3280,259,'-1','-1','-1','-1'),(381,3280,425,'1','1','1','1'),(386,3292,42,'1','1','1','1'),(387,3292,167,'-1','-1','-1','-1'),(388,3292,259,'-1','-1','-1','-1'),(389,3292,429,'1','1','1','1'),(390,3283,42,'1','1','1','1'),(391,3283,167,'-1','-1','-1','-1'),(392,3283,259,'-1','-1','-1','-1'),(393,3283,431,'1','1','1','1'),(398,3116,436,'1','1','1','1'),(399,3116,435,'1','1','1','1'),(400,3116,437,'1','1','1','1'),(401,3116,439,'1','1','1','1'),(402,3116,440,'1','1','1','1'),(404,3116,443,'1','1','1','1'),(405,3116,444,'1','1','1','1'),(406,3116,445,'1','1','1','1'),(407,3116,446,'1','1','1','1'),(408,3116,447,'1','1','1','1'),(409,3116,449,'1','1','1','1'),(410,3116,451,'1','1','1','1'),(411,3116,452,'1','1','1','1'),(412,3116,453,'1','1','1','1'),(413,3116,454,'1','1','1','1'),(414,3116,456,'1','1','1','1'),(415,3116,457,'1','1','1','1'),(416,3116,458,'1','1','1','1'),(417,3116,459,'1','1','1','1'),(418,3116,460,'1','1','1','1'),(419,3116,461,'1','1','1','1'),(420,3116,462,'1','1','1','1'),(421,3116,463,'1','1','1','1'),(422,3116,465,'1','1','1','1'),(423,3116,467,'1','1','1','1'),(424,3116,468,'1','1','1','1'),(425,3116,469,'1','1','1','1'),(426,3116,470,'1','1','1','1'),(427,3116,471,'1','1','1','1'),(428,3116,472,'1','1','1','1'),(429,3116,473,'1','1','1','1'),(430,3116,474,'1','1','1','1'),(431,3116,476,'1','1','1','1'),(432,3116,477,'1','1','1','1'),(433,3116,478,'1','1','1','1'),(434,3116,479,'1','1','1','1'),(435,3116,481,'1','1','1','1'),(436,3116,482,'1','1','1','1'),(437,3116,483,'1','1','1','1'),(438,3116,484,'1','1','1','1'),(439,3116,486,'1','1','1','1'),(440,3116,487,'1','1','1','1'),(441,3116,488,'1','1','1','1'),(442,3116,489,'1','1','1','1'),(443,3116,491,'1','1','1','1'),(444,3116,492,'1','1','1','1'),(445,3116,493,'1','1','1','1'),(446,3116,494,'1','1','1','1'),(447,3116,496,'1','1','1','1'),(448,3116,497,'1','1','1','1'),(449,3116,498,'1','1','1','1'),(450,3116,499,'1','1','1','1'),(451,3119,42,'1','1','1','1'),(452,3119,500,'1','1','1','1'),(453,3116,502,'1','1','1','1'),(454,3116,503,'1','1','1','1'),(455,3116,504,'1','1','1','1'),(456,3116,505,'1','1','1','1'),(457,3116,507,'1','1','1','1'),(458,3116,508,'1','1','1','1'),(459,3116,509,'1','1','1','1'),(460,3116,510,'1','1','1','1'),(461,3116,511,'1','1','1','1'),(462,3116,512,'1','1','1','1'),(463,3116,513,'1','1','1','1'),(464,3116,514,'1','1','1','1'),(465,3116,515,'1','1','1','1'),(466,3116,517,'1','1','1','1'),(467,3116,518,'1','1','1','1'),(468,3116,519,'1','1','1','1'),(469,3116,520,'1','1','1','1'),(470,3116,521,'1','1','1','1');
/*!40000 ALTER TABLE `aros_acos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auto_devices`
--

DROP TABLE IF EXISTS `auto_devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auto_devices` (
  `mac` varchar(17) NOT NULL,
  `username` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`mac`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auto_devices`
--

LOCK TABLES `auto_devices` WRITE;
/*!40000 ALTER TABLE `auto_devices` DISABLE KEYS */;
/*!40000 ALTER TABLE `auto_devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `checks`
--

DROP TABLE IF EXISTS `checks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `checks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(40) NOT NULL,
  `value` varchar(40) NOT NULL DEFAULT '',
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `checks`
--

LOCK TABLES `checks` WRITE;
/*!40000 ALTER TABLE `checks` DISABLE KEYS */;
INSERT INTO `checks` VALUES (2,'radius_restart','1','2013-09-01 20:41:20','2016-03-09 10:00:06');
/*!40000 ALTER TABLE `checks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clouds`
--

DROP TABLE IF EXISTS `clouds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clouds` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `description` varchar(255) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `available_to_siblings` tinyint(1) NOT NULL DEFAULT 0,
  `lat` decimal(11,8) DEFAULT NULL,
  `lng` decimal(11,8) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clouds`
--

LOCK TABLES `clouds` WRITE;
/*!40000 ALTER TABLE `clouds` DISABLE KEYS */;
INSERT INTO `clouds` VALUES (1,'Cloud Demo1','',45,1,-26.53614000,28.04935600,'2021-10-25 22:48:48','2021-10-26 11:05:52');
/*!40000 ALTER TABLE `clouds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coa_requests`
--

DROP TABLE IF EXISTS `coa_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `coa_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `node_id` int(11) DEFAULT NULL,
  `multiple_gateways` tinyint(1) NOT NULL DEFAULT 0,
  `avp_json` text DEFAULT NULL,
  `result` text DEFAULT NULL,
  `status` enum('awaiting','fetched','replied') DEFAULT 'awaiting',
  `request_type` enum('coa','pod') DEFAULT 'coa',
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coa_requests`
--

LOCK TABLES `coa_requests` WRITE;
/*!40000 ALTER TABLE `coa_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `coa_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `countries`
--

DROP TABLE IF EXISTS `countries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `countries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `alpha_2_code` varchar(2) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=246 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `countries`
--

LOCK TABLES `countries` WRITE;
/*!40000 ALTER TABLE `countries` DISABLE KEYS */;
INSERT INTO `countries` VALUES (1,'Afghanistan','AF','2020-06-02 08:25:01','2020-06-02 08:25:01'),(2,'Aland Islands','AX','2020-06-02 08:25:01','2020-06-02 08:25:01'),(3,'Albania','AL','2020-06-02 08:25:01','2020-06-02 08:25:01'),(4,'Algeria','DZ','2020-06-02 08:25:01','2020-06-02 08:25:01'),(5,'American Samoa','AS','2020-06-02 08:25:01','2020-06-02 08:25:01'),(6,'Andorra','AD','2020-06-02 08:25:01','2020-06-02 08:25:01'),(7,'Angola','AO','2020-06-02 08:25:01','2020-06-02 08:25:01'),(8,'Anguilla','AI','2020-06-02 08:25:01','2020-06-02 08:25:01'),(9,'Antarctica','AQ','2020-06-02 08:25:01','2020-06-02 08:25:01'),(10,'Antigua And Barbuda','AG','2020-06-02 08:25:01','2020-06-02 08:25:01'),(11,'Argentina','AR','2020-06-02 08:25:01','2020-06-02 08:25:01'),(12,'Armenia','AM','2020-06-02 08:25:01','2020-06-02 08:25:01'),(13,'Aruba','AW','2020-06-02 08:25:01','2020-06-02 08:25:01'),(14,'Australia','AU','2020-06-02 08:25:01','2020-06-02 08:25:01'),(15,'Austria','AT','2020-06-02 08:25:01','2020-06-02 08:25:01'),(16,'Azerbaijan','AZ','2020-06-02 08:25:01','2020-06-02 08:25:01'),(17,'Bahamas','BS','2020-06-02 08:25:01','2020-06-02 08:25:01'),(18,'Bahrain','BH','2020-06-02 08:25:01','2020-06-02 08:25:01'),(19,'Bangladesh','BD','2020-06-02 08:25:01','2020-06-02 08:25:01'),(20,'Barbados','BB','2020-06-02 08:25:01','2020-06-02 08:25:01'),(21,'Belarus','BY','2020-06-02 08:25:01','2020-06-02 08:25:01'),(22,'Belgium','BE','2020-06-02 08:25:01','2020-06-02 08:25:01'),(23,'Belize','BZ','2020-06-02 08:25:01','2020-06-02 08:25:01'),(24,'Benin','BJ','2020-06-02 08:25:01','2020-06-02 08:25:01'),(25,'Bermuda','BM','2020-06-02 08:25:01','2020-06-02 08:25:01'),(26,'Bhutan','BT','2020-06-02 08:25:01','2020-06-02 08:25:01'),(27,'Bolivia','BO','2020-06-02 08:25:01','2020-06-02 08:25:01'),(28,'Bosnia And Herzegovina','BA','2020-06-02 08:25:01','2020-06-02 08:25:01'),(29,'Botswana','BW','2020-06-02 08:25:01','2020-06-02 08:25:01'),(30,'Bouvet Island','BV','2020-06-02 08:25:01','2020-06-02 08:25:01'),(31,'Brazil','BR','2020-06-02 08:25:01','2020-06-02 08:25:01'),(32,'British Indian Ocean Territory','IO','2020-06-02 08:25:01','2020-06-02 08:25:01'),(33,'Brunei Darussalam','BN','2020-06-02 08:25:01','2020-06-02 08:25:01'),(34,'Bulgaria','BG','2020-06-02 08:25:01','2020-06-02 08:25:01'),(35,'Burkina Faso','BF','2020-06-02 08:25:01','2020-06-02 08:25:01'),(36,'Burundi','BI','2020-06-02 08:25:01','2020-06-02 08:25:01'),(37,'Cambodia','KH','2020-06-02 08:25:01','2020-06-02 08:25:01'),(38,'Cameroon','CM','2020-06-02 08:25:01','2020-06-02 08:25:01'),(39,'Canada','CA','2020-06-02 08:25:01','2020-06-02 08:25:01'),(40,'Cape Verde','CV','2020-06-02 08:25:01','2020-06-02 08:25:01'),(41,'Cayman Islands','KY','2020-06-02 08:25:01','2020-06-02 08:25:01'),(42,'Central African Republic','CF','2020-06-02 08:25:01','2020-06-02 08:25:01'),(43,'Chad','TD','2020-06-02 08:25:01','2020-06-02 08:25:01'),(44,'Chile','CL','2020-06-02 08:25:01','2020-06-02 08:25:01'),(45,'China','CN','2020-06-02 08:25:01','2020-06-02 08:25:01'),(46,'Christmas Island','CX','2020-06-02 08:25:01','2020-06-02 08:25:01'),(47,'Cocos (Keeling) Islands','CC','2020-06-02 08:25:01','2020-06-02 08:25:01'),(48,'Colombia','CO','2020-06-02 08:25:01','2020-06-02 08:25:01'),(49,'Comoros','KM','2020-06-02 08:25:01','2020-06-02 08:25:01'),(50,'Congo','CG','2020-06-02 08:25:01','2020-06-02 08:25:01'),(51,'Congo, Democratic Republic','CD','2020-06-02 08:25:01','2020-06-02 08:25:01'),(52,'Cook Islands','CK','2020-06-02 08:25:01','2020-06-02 08:25:01'),(53,'Costa Rica','CR','2020-06-02 08:25:01','2020-06-02 08:25:01'),(54,'Cote D\'Ivoire','CI','2020-06-02 08:25:01','2020-06-02 08:25:01'),(55,'Croatia','HR','2020-06-02 08:25:01','2020-06-02 08:25:01'),(56,'Cuba','CU','2020-06-02 08:25:01','2020-06-02 08:25:01'),(57,'Cyprus','CY','2020-06-02 08:25:01','2020-06-02 08:25:01'),(58,'Czech Republic','CZ','2020-06-02 08:25:01','2020-06-02 08:25:01'),(59,'Denmark','DK','2020-06-02 08:25:01','2020-06-02 08:25:01'),(60,'Djibouti','DJ','2020-06-02 08:25:01','2020-06-02 08:25:01'),(61,'Dominica','DM','2020-06-02 08:25:01','2020-06-02 08:25:01'),(62,'Dominican Republic','DO','2020-06-02 08:25:01','2020-06-02 08:25:01'),(63,'Ecuador','EC','2020-06-02 08:25:01','2020-06-02 08:25:01'),(64,'Egypt','EG','2020-06-02 08:25:01','2020-06-02 08:25:01'),(65,'El Salvador','SV','2020-06-02 08:25:01','2020-06-02 08:25:01'),(66,'Equatorial Guinea','GQ','2020-06-02 08:25:01','2020-06-02 08:25:01'),(67,'Eritrea','ER','2020-06-02 08:25:01','2020-06-02 08:25:01'),(68,'Estonia','EE','2020-06-02 08:25:01','2020-06-02 08:25:01'),(69,'Ethiopia','ET','2020-06-02 08:25:01','2020-06-02 08:25:01'),(70,'Falkland Islands (Malvinas)','FK','2020-06-02 08:25:01','2020-06-02 08:25:01'),(71,'Faroe Islands','FO','2020-06-02 08:25:01','2020-06-02 08:25:01'),(72,'Fiji','FJ','2020-06-02 08:25:01','2020-06-02 08:25:01'),(73,'Finland','FI','2020-06-02 08:25:01','2020-06-02 08:25:01'),(74,'France','FR','2020-06-02 08:25:01','2020-06-02 08:25:01'),(75,'French Guiana','GF','2020-06-02 08:25:01','2020-06-02 08:25:01'),(76,'French Polynesia','PF','2020-06-02 08:25:01','2020-06-02 08:25:01'),(77,'French Southern Territories','TF','2020-06-02 08:25:01','2020-06-02 08:25:01'),(78,'Gabon','GA','2020-06-02 08:25:01','2020-06-02 08:25:01'),(79,'Gambia','GM','2020-06-02 08:25:01','2020-06-02 08:25:01'),(80,'Georgia','GE','2020-06-02 08:25:01','2020-06-02 08:25:01'),(81,'Germany','DE','2020-06-02 08:25:01','2020-06-02 08:25:01'),(82,'Ghana','GH','2020-06-02 08:25:01','2020-06-02 08:25:01'),(83,'Gibraltar','GI','2020-06-02 08:25:01','2020-06-02 08:25:01'),(84,'Greece','GR','2020-06-02 08:25:01','2020-06-02 08:25:01'),(85,'Greenland','GL','2020-06-02 08:25:01','2020-06-02 08:25:01'),(86,'Grenada','GD','2020-06-02 08:25:01','2020-06-02 08:25:01'),(87,'Guadeloupe','GP','2020-06-02 08:25:01','2020-06-02 08:25:01'),(88,'Guam','GU','2020-06-02 08:25:01','2020-06-02 08:25:01'),(89,'Guatemala','GT','2020-06-02 08:25:01','2020-06-02 08:25:01'),(90,'Guernsey','GG','2020-06-02 08:25:01','2020-06-02 08:25:01'),(91,'Guinea','GN','2020-06-02 08:25:01','2020-06-02 08:25:01'),(92,'Guinea-Bissau','GW','2020-06-02 08:25:01','2020-06-02 08:25:01'),(93,'Guyana','GY','2020-06-02 08:25:01','2020-06-02 08:25:01'),(94,'Haiti','HT','2020-06-02 08:25:01','2020-06-02 08:25:01'),(95,'Heard Island & Mcdonald Islands','HM','2020-06-02 08:25:01','2020-06-02 08:25:01'),(96,'Holy See (Vatican City State)','VA','2020-06-02 08:25:01','2020-06-02 08:25:01'),(97,'Honduras','HN','2020-06-02 08:25:01','2020-06-02 08:25:01'),(98,'Hong Kong','HK','2020-06-02 08:25:01','2020-06-02 08:25:01'),(99,'Hungary','HU','2020-06-02 08:25:01','2020-06-02 08:25:01'),(100,'Iceland','IS','2020-06-02 08:25:01','2020-06-02 08:25:01'),(101,'India','IN','2020-06-02 08:25:01','2020-06-02 08:25:01'),(102,'Indonesia','ID','2020-06-02 08:25:01','2020-06-02 08:25:01'),(103,'Iran, Islamic Republic Of','IR','2020-06-02 08:25:01','2020-06-02 08:25:01'),(104,'Iraq','IQ','2020-06-02 08:25:01','2020-06-02 08:25:01'),(105,'Ireland','IE','2020-06-02 08:25:01','2020-06-02 08:25:01'),(106,'Isle Of Man','IM','2020-06-02 08:25:01','2020-06-02 08:25:01'),(107,'Israel','IL','2020-06-02 08:25:01','2020-06-02 08:25:01'),(108,'Italy','IT','2020-06-02 08:25:01','2020-06-02 08:25:01'),(109,'Jamaica','JM','2020-06-02 08:25:01','2020-06-02 08:25:01'),(110,'Japan','JP','2020-06-02 08:25:01','2020-06-02 08:25:01'),(111,'Jersey','JE','2020-06-02 08:25:01','2020-06-02 08:25:01'),(112,'Jordan','JO','2020-06-02 08:25:02','2020-06-02 08:25:02'),(113,'Kazakhstan','KZ','2020-06-02 08:25:02','2020-06-02 08:25:02'),(114,'Kenya','KE','2020-06-02 08:25:02','2020-06-02 08:25:02'),(115,'Kiribati','KI','2020-06-02 08:25:02','2020-06-02 08:25:02'),(116,'Korea','KR','2020-06-02 08:25:02','2020-06-02 08:25:02'),(117,'Kuwait','KW','2020-06-02 08:25:02','2020-06-02 08:25:02'),(118,'Kyrgyzstan','KG','2020-06-02 08:25:02','2020-06-02 08:25:02'),(119,'Lao People\'s Democratic Republic','LA','2020-06-02 08:25:02','2020-06-02 08:25:02'),(120,'Latvia','LV','2020-06-02 08:25:02','2020-06-02 08:25:02'),(121,'Lebanon','LB','2020-06-02 08:25:02','2020-06-02 08:25:02'),(122,'Lesotho','LS','2020-06-02 08:25:02','2020-06-02 08:25:02'),(123,'Liberia','LR','2020-06-02 08:25:02','2020-06-02 08:25:02'),(124,'Libyan Arab Jamahiriya','LY','2020-06-02 08:25:02','2020-06-02 08:25:02'),(125,'Liechtenstein','LI','2020-06-02 08:25:02','2020-06-02 08:25:02'),(126,'Lithuania','LT','2020-06-02 08:25:02','2020-06-02 08:25:02'),(127,'Luxembourg','LU','2020-06-02 08:25:02','2020-06-02 08:25:02'),(128,'Macao','MO','2020-06-02 08:25:02','2020-06-02 08:25:02'),(129,'Macedonia','MK','2020-06-02 08:25:02','2020-06-02 08:25:02'),(130,'Madagascar','MG','2020-06-02 08:25:02','2020-06-02 08:25:02'),(131,'Malawi','MW','2020-06-02 08:25:02','2020-06-02 08:25:02'),(132,'Malaysia','MY','2020-06-02 08:25:02','2020-06-02 08:25:02'),(133,'Maldives','MV','2020-06-02 08:25:02','2020-06-02 08:25:02'),(134,'Mali','ML','2020-06-02 08:25:02','2020-06-02 08:25:02'),(135,'Malta','MT','2020-06-02 08:25:02','2020-06-02 08:25:02'),(136,'Marshall Islands','MH','2020-06-02 08:25:02','2020-06-02 08:25:02'),(137,'Martinique','MQ','2020-06-02 08:25:02','2020-06-02 08:25:02'),(138,'Mauritania','MR','2020-06-02 08:25:02','2020-06-02 08:25:02'),(139,'Mauritius','MU','2020-06-02 08:25:02','2020-06-02 08:25:02'),(140,'Mayotte','YT','2020-06-02 08:25:02','2020-06-02 08:25:02'),(141,'Mexico','MX','2020-06-02 08:25:02','2020-06-02 08:25:02'),(142,'Micronesia, Federated States Of','FM','2020-06-02 08:25:02','2020-06-02 08:25:02'),(143,'Moldova','MD','2020-06-02 08:25:02','2020-06-02 08:25:02'),(144,'Monaco','MC','2020-06-02 08:25:02','2020-06-02 08:25:02'),(145,'Mongolia','MN','2020-06-02 08:25:02','2020-06-02 08:25:02'),(146,'Montenegro','ME','2020-06-02 08:25:02','2020-06-02 08:25:02'),(147,'Montserrat','MS','2020-06-02 08:25:02','2020-06-02 08:25:02'),(148,'Morocco','MA','2020-06-02 08:25:02','2020-06-02 08:25:02'),(149,'Mozambique','MZ','2020-06-02 08:25:02','2020-06-02 08:25:02'),(150,'Myanmar','MM','2020-06-02 08:25:02','2020-06-02 08:25:02'),(151,'Namibia','NA','2020-06-02 08:25:02','2020-06-02 08:25:02'),(152,'Nauru','NR','2020-06-02 08:25:02','2020-06-02 08:25:02'),(153,'Nepal','NP','2020-06-02 08:25:02','2020-06-02 08:25:02'),(154,'Netherlands','NL','2020-06-02 08:25:02','2020-06-02 08:25:02'),(155,'Netherlands Antilles','AN','2020-06-02 08:25:02','2020-06-02 08:25:02'),(156,'New Caledonia','NC','2020-06-02 08:25:02','2020-06-02 08:25:02'),(157,'New Zealand','NZ','2020-06-02 08:25:02','2020-06-02 08:25:02'),(158,'Nicaragua','NI','2020-06-02 08:25:02','2020-06-02 08:25:02'),(159,'Niger','NE','2020-06-02 08:25:02','2020-06-02 08:25:02'),(160,'Nigeria','NG','2020-06-02 08:25:02','2020-06-02 08:25:02'),(161,'Niue','NU','2020-06-02 08:25:02','2020-06-02 08:25:02'),(162,'Norfolk Island','NF','2020-06-02 08:25:02','2020-06-02 08:25:02'),(163,'Northern Mariana Islands','MP','2020-06-02 08:25:02','2020-06-02 08:25:02'),(164,'Norway','NO','2020-06-02 08:25:02','2020-06-02 08:25:02'),(165,'Oman','OM','2020-06-02 08:25:02','2020-06-02 08:25:02'),(166,'Pakistan','PK','2020-06-02 08:25:02','2020-06-02 08:25:02'),(167,'Palau','PW','2020-06-02 08:25:02','2020-06-02 08:25:02'),(168,'Palestinian Territory, Occupied','PS','2020-06-02 08:25:02','2020-06-02 08:25:02'),(169,'Panama','PA','2020-06-02 08:25:02','2020-06-02 08:25:02'),(170,'Papua New Guinea','PG','2020-06-02 08:25:02','2020-06-02 08:25:02'),(171,'Paraguay','PY','2020-06-02 08:25:02','2020-06-02 08:25:02'),(172,'Peru','PE','2020-06-02 08:25:02','2020-06-02 08:25:02'),(173,'Philippines','PH','2020-06-02 08:25:02','2020-06-02 08:25:02'),(174,'Pitcairn','PN','2020-06-02 08:25:02','2020-06-02 08:25:02'),(175,'Poland','PL','2020-06-02 08:25:02','2020-06-02 08:25:02'),(176,'Portugal','PT','2020-06-02 08:25:02','2020-06-02 08:25:02'),(177,'Puerto Rico','PR','2020-06-02 08:25:02','2020-06-02 08:25:02'),(178,'Qatar','QA','2020-06-02 08:25:02','2020-06-02 08:25:02'),(179,'Reunion','RE','2020-06-02 08:25:02','2020-06-02 08:25:02'),(180,'Romania','RO','2020-06-02 08:25:02','2020-06-02 08:25:02'),(181,'Russian Federation','RU','2020-06-02 08:25:02','2020-06-02 08:25:02'),(182,'Rwanda','RW','2020-06-02 08:25:02','2020-06-02 08:25:02'),(183,'Saint Barthelemy','BL','2020-06-02 08:25:03','2020-06-02 08:25:03'),(184,'Saint Helena','SH','2020-06-02 08:25:03','2020-06-02 08:25:03'),(185,'Saint Kitts And Nevis','KN','2020-06-02 08:25:03','2020-06-02 08:25:03'),(186,'Saint Lucia','LC','2020-06-02 08:25:03','2020-06-02 08:25:03'),(187,'Saint Martin','MF','2020-06-02 08:25:03','2020-06-02 08:25:03'),(188,'Saint Pierre And Miquelon','PM','2020-06-02 08:25:03','2020-06-02 08:25:03'),(189,'Saint Vincent And Grenadines','VC','2020-06-02 08:25:03','2020-06-02 08:25:03'),(190,'Samoa','WS','2020-06-02 08:25:03','2020-06-02 08:25:03'),(191,'San Marino','SM','2020-06-02 08:25:03','2020-06-02 08:25:03'),(192,'Sao Tome And Principe','ST','2020-06-02 08:25:03','2020-06-02 08:25:03'),(193,'Saudi Arabia','SA','2020-06-02 08:25:03','2020-06-02 08:25:03'),(194,'Senegal','SN','2020-06-02 08:25:03','2020-06-02 08:25:03'),(195,'Serbia','RS','2020-06-02 08:25:03','2020-06-02 08:25:03'),(196,'Seychelles','SC','2020-06-02 08:25:03','2020-06-02 08:25:03'),(197,'Sierra Leone','SL','2020-06-02 08:25:03','2020-06-02 08:25:03'),(198,'Singapore','SG','2020-06-02 08:25:03','2020-06-02 08:25:03'),(199,'Slovakia','SK','2020-06-02 08:25:03','2020-06-02 08:25:03'),(200,'Slovenia','SI','2020-06-02 08:25:03','2020-06-02 08:25:03'),(201,'Solomon Islands','SB','2020-06-02 08:25:03','2020-06-02 08:25:03'),(202,'Somalia','SO','2020-06-02 08:25:03','2020-06-02 08:25:03'),(203,'South Africa','ZA','2020-06-02 08:25:03','2020-06-02 08:25:03'),(204,'South Georgia And Sandwich Isl.','GS','2020-06-02 08:25:03','2020-06-02 08:25:03'),(205,'Spain','ES','2020-06-02 08:25:03','2020-06-02 08:25:03'),(206,'Sri Lanka','LK','2020-06-02 08:25:03','2020-06-02 08:25:03'),(207,'Sudan','SD','2020-06-02 08:25:03','2020-06-02 08:25:03'),(208,'Suriname','SR','2020-06-02 08:25:03','2020-06-02 08:25:03'),(209,'Svalbard And Jan Mayen','SJ','2020-06-02 08:25:03','2020-06-02 08:25:03'),(210,'Swaziland','SZ','2020-06-02 08:25:03','2020-06-02 08:25:03'),(211,'Sweden','SE','2020-06-02 08:25:03','2020-06-02 08:25:03'),(212,'Switzerland','CH','2020-06-02 08:25:03','2020-06-02 08:25:03'),(213,'Syrian Arab Republic','SY','2020-06-02 08:25:03','2020-06-02 08:25:03'),(214,'Taiwan','TW','2020-06-02 08:25:03','2020-06-02 08:25:03'),(215,'Tajikistan','TJ','2020-06-02 08:25:03','2020-06-02 08:25:03'),(216,'Tanzania','TZ','2020-06-02 08:25:03','2020-06-02 08:25:03'),(217,'Thailand','TH','2020-06-02 08:25:03','2020-06-02 08:25:03'),(218,'Timor-Leste','TL','2020-06-02 08:25:03','2020-06-02 08:25:03'),(219,'Togo','TG','2020-06-02 08:25:03','2020-06-02 08:25:03'),(220,'Tokelau','TK','2020-06-02 08:25:03','2020-06-02 08:25:03'),(221,'Tonga','TO','2020-06-02 08:25:03','2020-06-02 08:25:03'),(222,'Trinidad And Tobago','TT','2020-06-02 08:25:03','2020-06-02 08:25:03'),(223,'Tunisia','TN','2020-06-02 08:25:03','2020-06-02 08:25:03'),(224,'Turkey','TR','2020-06-02 08:25:03','2020-06-02 08:25:03'),(225,'Turkmenistan','TM','2020-06-02 08:25:03','2020-06-02 08:25:03'),(226,'Turks And Caicos Islands','TC','2020-06-02 08:25:03','2020-06-02 08:25:03'),(227,'Tuvalu','TV','2020-06-02 08:25:03','2020-06-02 08:25:03'),(228,'Uganda','UG','2020-06-02 08:25:03','2020-06-02 08:25:03'),(229,'Ukraine','UA','2020-06-02 08:25:03','2020-06-02 08:25:03'),(230,'United Arab Emirates','AE','2020-06-02 08:25:03','2020-06-02 08:25:03'),(231,'United Kingdom','GB','2020-06-02 08:25:03','2020-06-02 08:25:03'),(232,'United States','US','2020-06-02 08:25:03','2020-06-02 08:25:03'),(233,'United States Outlying Islands','UM','2020-06-02 08:25:03','2020-06-02 08:25:03'),(234,'Uruguay','UY','2020-06-02 08:25:03','2020-06-02 08:25:03'),(235,'Uzbekistan','UZ','2020-06-02 08:25:03','2020-06-02 08:25:03'),(236,'Vanuatu','VU','2020-06-02 08:25:03','2020-06-02 08:25:03'),(237,'Venezuela','VE','2020-06-02 08:25:03','2020-06-02 08:25:03'),(238,'Viet Nam','VN','2020-06-02 08:25:03','2020-06-02 08:25:03'),(239,'Virgin Islands, British','VG','2020-06-02 08:25:03','2020-06-02 08:25:03'),(240,'Virgin Islands, U.S.','VI','2020-06-02 08:25:03','2020-06-02 08:25:03'),(241,'Wallis And Futuna','WF','2020-06-02 08:25:03','2020-06-02 08:25:03'),(242,'Western Sahara','EH','2020-06-02 08:25:03','2020-06-02 08:25:03'),(243,'Yemen','YE','2020-06-02 08:25:03','2020-06-02 08:25:03'),(244,'Zambia','ZM','2020-06-02 08:25:03','2020-06-02 08:25:03'),(245,'Zimbabwe','ZW','2020-06-02 08:25:03','2020-06-02 08:25:03');
/*!40000 ALTER TABLE `countries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_collectors`
--

DROP TABLE IF EXISTS `data_collectors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data_collectors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dynamic_detail_id` int(11) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `mac` varchar(36) NOT NULL,
  `cp_mac` varchar(36) DEFAULT NULL,
  `public_ip` varchar(36) DEFAULT NULL,
  `nasid` varchar(255) DEFAULT NULL,
  `ssid` varchar(255) DEFAULT NULL,
  `is_mobile` tinyint(1) NOT NULL DEFAULT 0,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `phone` varchar(36) NOT NULL DEFAULT '',
  `dn` varchar(36) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_collectors`
--

LOCK TABLES `data_collectors` WRITE;
/*!40000 ALTER TABLE `data_collectors` DISABLE KEYS */;
/*!40000 ALTER TABLE `data_collectors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `device_notes`
--

DROP TABLE IF EXISTS `device_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `device_notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `device_id` int(11) NOT NULL,
  `note_id` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `device_notes`
--

LOCK TABLES `device_notes` WRITE;
/*!40000 ALTER TABLE `device_notes` DISABLE KEYS */;
INSERT INTO `device_notes` VALUES (2,1,90,'2017-05-06 09:39:49','2017-05-06 09:39:49');
/*!40000 ALTER TABLE `device_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devices`
--

DROP TABLE IF EXISTS `devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `devices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  `description` varchar(255) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 0,
  `last_accept_time` datetime DEFAULT NULL,
  `last_reject_time` datetime DEFAULT NULL,
  `last_accept_nas` varchar(128) DEFAULT NULL,
  `last_reject_nas` varchar(128) DEFAULT NULL,
  `last_reject_message` varchar(255) DEFAULT NULL,
  `permanent_user_id` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `perc_time_used` int(6) DEFAULT NULL,
  `perc_data_used` int(6) DEFAULT NULL,
  `data_used` bigint(20) DEFAULT NULL,
  `data_cap` bigint(20) DEFAULT NULL,
  `time_used` int(12) DEFAULT NULL,
  `time_cap` int(12) DEFAULT NULL,
  `time_cap_type` enum('hard','soft') DEFAULT 'soft',
  `data_cap_type` enum('hard','soft') DEFAULT 'soft',
  `realm` varchar(100) NOT NULL DEFAULT '',
  `realm_id` int(11) DEFAULT NULL,
  `profile` varchar(100) NOT NULL DEFAULT '',
  `profile_id` int(11) DEFAULT NULL,
  `from_date` datetime DEFAULT NULL,
  `to_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devices`
--

LOCK TABLES `devices` WRITE;
/*!40000 ALTER TABLE `devices` DISABLE KEYS */;
/*!40000 ALTER TABLE `devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dynamic_client_notes`
--

DROP TABLE IF EXISTS `dynamic_client_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dynamic_client_notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dynamic_client_id` int(11) NOT NULL,
  `note_id` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dynamic_client_notes`
--

LOCK TABLES `dynamic_client_notes` WRITE;
/*!40000 ALTER TABLE `dynamic_client_notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `dynamic_client_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dynamic_client_realms`
--

DROP TABLE IF EXISTS `dynamic_client_realms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dynamic_client_realms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dynamic_client_id` int(11) NOT NULL,
  `realm_id` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dynamic_client_realms`
--

LOCK TABLES `dynamic_client_realms` WRITE;
/*!40000 ALTER TABLE `dynamic_client_realms` DISABLE KEYS */;
INSERT INTO `dynamic_client_realms` VALUES (1,1,1,'2021-10-25 22:48:48','2021-10-25 22:48:48'),(2,2,1,'2021-10-25 22:48:48','2021-10-25 22:48:48');
/*!40000 ALTER TABLE `dynamic_client_realms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dynamic_client_states`
--

DROP TABLE IF EXISTS `dynamic_client_states`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dynamic_client_states` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dynamic_client_id` char(36) NOT NULL,
  `state` tinyint(1) NOT NULL DEFAULT 0,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dynamic_client_states`
--

LOCK TABLES `dynamic_client_states` WRITE;
/*!40000 ALTER TABLE `dynamic_client_states` DISABLE KEYS */;
/*!40000 ALTER TABLE `dynamic_client_states` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dynamic_clients`
--

DROP TABLE IF EXISTS `dynamic_clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dynamic_clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL DEFAULT '',
  `nasidentifier` varchar(128) NOT NULL DEFAULT '',
  `calledstationid` varchar(128) NOT NULL DEFAULT '',
  `last_contact` datetime DEFAULT NULL,
  `last_contact_ip` varchar(128) NOT NULL DEFAULT '',
  `timezone` varchar(255) NOT NULL DEFAULT '',
  `monitor` enum('off','heartbeat','socket') DEFAULT 'off',
  `session_auto_close` tinyint(1) NOT NULL DEFAULT 0,
  `session_dead_time` int(5) NOT NULL DEFAULT 3600,
  `available_to_siblings` tinyint(1) NOT NULL DEFAULT 1,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `on_public_maps` tinyint(1) NOT NULL DEFAULT 0,
  `lat` double DEFAULT NULL,
  `lon` double DEFAULT NULL,
  `photo_file_name` varchar(128) NOT NULL DEFAULT 'logo.jpg',
  `user_id` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `data_limit_active` tinyint(1) NOT NULL DEFAULT 0,
  `data_limit_amount` float(14,3) NOT NULL DEFAULT 1.000,
  `data_limit_unit` enum('kb','mb','gb','tb') DEFAULT 'mb',
  `data_limit_reset_on` int(3) NOT NULL DEFAULT 1,
  `data_limit_reset_hour` int(3) NOT NULL DEFAULT 0,
  `data_limit_reset_minute` int(3) NOT NULL DEFAULT 0,
  `data_used` bigint(20) DEFAULT NULL,
  `data_limit_cap` enum('hard','soft') DEFAULT 'hard',
  `daily_data_limit_active` tinyint(1) NOT NULL DEFAULT 0,
  `daily_data_limit_amount` float(14,3) NOT NULL DEFAULT 1.000,
  `daily_data_limit_unit` enum('kb','mb','gb','tb') DEFAULT 'mb',
  `daily_data_limit_cap` enum('hard','soft') DEFAULT 'hard',
  `daily_data_limit_reset_hour` int(3) NOT NULL DEFAULT 0,
  `daily_data_limit_reset_minute` int(3) NOT NULL DEFAULT 0,
  `daily_data_used` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dynamic_clients`
--

LOCK TABLES `dynamic_clients` WRITE;
/*!40000 ALTER TABLE `dynamic_clients` DISABLE KEYS */;
INSERT INTO `dynamic_clients` VALUES (1,'Demo1','','',NULL,'','','off',0,3600,1,1,0,NULL,NULL,'logo.jpg',45,'2021-10-25 22:48:48','2021-10-25 22:48:48',0,1.000,'mb',1,0,0,NULL,'hard',0,1.000,'mb','hard',0,0,NULL),(2,'MESHdesk_demo1_mcp_1','demo1_mcp_1','',NULL,'','24','off',1,3600,1,1,0,NULL,NULL,'logo.jpg',45,'2021-10-25 22:48:48','2021-10-25 22:48:58',0,1.000,'mb',1,0,0,NULL,'hard',0,1.000,'mb','hard',0,0,NULL);
/*!40000 ALTER TABLE `dynamic_clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dynamic_detail_languages`
--

DROP TABLE IF EXISTS `dynamic_detail_languages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dynamic_detail_languages` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `iso_code` varchar(2) DEFAULT NULL,
  `rtl` tinyint(1) NOT NULL DEFAULT 0,
  `created` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dynamic_detail_languages`
--

LOCK TABLES `dynamic_detail_languages` WRITE;
/*!40000 ALTER TABLE `dynamic_detail_languages` DISABLE KEYS */;
INSERT INTO `dynamic_detail_languages` VALUES (5,'English','en',0,'2021-03-29 14:00:47','2021-03-29 14:00:47'),(6,'German','de',0,'2021-03-29 14:05:36','2021-03-29 14:05:36');
/*!40000 ALTER TABLE `dynamic_detail_languages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dynamic_detail_mobiles`
--

DROP TABLE IF EXISTS `dynamic_detail_mobiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dynamic_detail_mobiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dynamic_detail_id` int(11) DEFAULT NULL,
  `mobile_only` tinyint(1) NOT NULL DEFAULT 0,
  `content` text NOT NULL DEFAULT '',
  `android_enable` tinyint(1) NOT NULL DEFAULT 0,
  `android_href` varchar(255) NOT NULL DEFAULT '',
  `android_text` varchar(255) NOT NULL DEFAULT '',
  `android_content` text NOT NULL DEFAULT '',
  `apple_enable` tinyint(1) NOT NULL DEFAULT 0,
  `apple_href` varchar(255) NOT NULL DEFAULT '',
  `apple_text` varchar(255) NOT NULL DEFAULT '',
  `apple_content` text NOT NULL DEFAULT '',
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dynamic_detail_mobiles`
--

LOCK TABLES `dynamic_detail_mobiles` WRITE;
/*!40000 ALTER TABLE `dynamic_detail_mobiles` DISABLE KEYS */;
/*!40000 ALTER TABLE `dynamic_detail_mobiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dynamic_detail_notes`
--

DROP TABLE IF EXISTS `dynamic_detail_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dynamic_detail_notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dynamic_detail_id` int(11) NOT NULL,
  `note_id` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dynamic_detail_notes`
--

LOCK TABLES `dynamic_detail_notes` WRITE;
/*!40000 ALTER TABLE `dynamic_detail_notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `dynamic_detail_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dynamic_detail_prelogins`
--

DROP TABLE IF EXISTS `dynamic_detail_prelogins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dynamic_detail_prelogins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mac` varchar(64) NOT NULL DEFAULT '',
  `nasid` varchar(64) NOT NULL DEFAULT '',
  `dynamic_detail_id` int(11) NOT NULL,
  `completed` tinyint(1) NOT NULL DEFAULT 0,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dynamic_detail_prelogins`
--

LOCK TABLES `dynamic_detail_prelogins` WRITE;
/*!40000 ALTER TABLE `dynamic_detail_prelogins` DISABLE KEYS */;
/*!40000 ALTER TABLE `dynamic_detail_prelogins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dynamic_detail_social_logins`
--

DROP TABLE IF EXISTS `dynamic_detail_social_logins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dynamic_detail_social_logins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dynamic_detail_id` int(11) NOT NULL,
  `profile_id` int(11) NOT NULL,
  `realm_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `enable` tinyint(1) NOT NULL DEFAULT 0,
  `record_info` tinyint(1) NOT NULL DEFAULT 0,
  `special_key` varchar(100) NOT NULL DEFAULT '',
  `secret` varchar(100) NOT NULL DEFAULT '',
  `type` enum('voucher','user') DEFAULT 'voucher',
  `extra_name` varchar(100) NOT NULL DEFAULT '',
  `extra_value` varchar(100) NOT NULL DEFAULT '',
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dynamic_detail_social_logins`
--

LOCK TABLES `dynamic_detail_social_logins` WRITE;
/*!40000 ALTER TABLE `dynamic_detail_social_logins` DISABLE KEYS */;
/*!40000 ALTER TABLE `dynamic_detail_social_logins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dynamic_detail_trans_keys`
--

DROP TABLE IF EXISTS `dynamic_detail_trans_keys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dynamic_detail_trans_keys` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `dynamic_detail_id` int(11) DEFAULT -1,
  `name` varchar(50) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dynamic_detail_trans_keys`
--

LOCK TABLES `dynamic_detail_trans_keys` WRITE;
/*!40000 ALTER TABLE `dynamic_detail_trans_keys` DISABLE KEYS */;
INSERT INTO `dynamic_detail_trans_keys` VALUES (5,-1,'ok_button','2021-03-29 14:01:07','2021-03-29 14:01:07');
/*!40000 ALTER TABLE `dynamic_detail_trans_keys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dynamic_detail_translations`
--

DROP TABLE IF EXISTS `dynamic_detail_translations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dynamic_detail_translations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dynamic_detail_language_id` int(11) DEFAULT NULL,
  `dynamic_detail_trans_key_id` int(11) DEFAULT NULL,
  `value` varchar(255) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dynamic_detail_translations`
--

LOCK TABLES `dynamic_detail_translations` WRITE;
/*!40000 ALTER TABLE `dynamic_detail_translations` DISABLE KEYS */;
INSERT INTO `dynamic_detail_translations` VALUES (1,5,5,'OK','2021-03-29 14:01:39','2021-03-29 14:01:39');
/*!40000 ALTER TABLE `dynamic_detail_translations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dynamic_details`
--

DROP TABLE IF EXISTS `dynamic_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dynamic_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL DEFAULT '',
  `available_to_siblings` tinyint(1) NOT NULL DEFAULT 1,
  `icon_file_name` varchar(128) NOT NULL DEFAULT 'logo.jpg',
  `phone` varchar(14) NOT NULL DEFAULT '',
  `fax` varchar(14) NOT NULL DEFAULT '',
  `cell` varchar(14) NOT NULL DEFAULT '',
  `email` varchar(128) NOT NULL DEFAULT '',
  `url` varchar(128) NOT NULL DEFAULT '',
  `street_no` char(10) NOT NULL DEFAULT '',
  `street` char(50) NOT NULL DEFAULT '',
  `town_suburb` char(50) NOT NULL DEFAULT '',
  `city` char(50) NOT NULL DEFAULT '',
  `country` char(50) NOT NULL DEFAULT '',
  `lat` double DEFAULT NULL,
  `lon` double DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `t_c_check` tinyint(1) NOT NULL DEFAULT 0,
  `t_c_url` char(50) NOT NULL DEFAULT '',
  `redirect_check` tinyint(1) NOT NULL DEFAULT 0,
  `redirect_url` char(200) NOT NULL DEFAULT '',
  `slideshow_check` tinyint(1) NOT NULL DEFAULT 0,
  `seconds_per_slide` int(3) NOT NULL DEFAULT 30,
  `connect_check` tinyint(1) NOT NULL DEFAULT 0,
  `connect_username` char(50) NOT NULL DEFAULT '',
  `connect_suffix` char(50) NOT NULL DEFAULT 'nasid',
  `connect_delay` int(3) NOT NULL DEFAULT 0,
  `connect_only` tinyint(1) NOT NULL DEFAULT 0,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `user_login_check` tinyint(1) NOT NULL DEFAULT 1,
  `voucher_login_check` tinyint(1) NOT NULL DEFAULT 0,
  `auto_suffix_check` tinyint(1) NOT NULL DEFAULT 0,
  `auto_suffix` char(200) NOT NULL DEFAULT '',
  `usage_show_check` tinyint(1) NOT NULL DEFAULT 1,
  `usage_refresh_interval` int(3) NOT NULL DEFAULT 120,
  `theme` char(200) NOT NULL DEFAULT 'Default',
  `register_users` tinyint(1) NOT NULL DEFAULT 0,
  `lost_password` tinyint(1) NOT NULL DEFAULT 0,
  `social_enable` tinyint(1) NOT NULL DEFAULT 0,
  `social_temp_permanent_user_id` int(11) DEFAULT NULL,
  `coova_desktop_url` varchar(255) NOT NULL DEFAULT '',
  `coova_mobile_url` varchar(255) NOT NULL DEFAULT '',
  `mikrotik_desktop_url` varchar(255) NOT NULL DEFAULT '',
  `mikrotik_mobile_url` varchar(255) NOT NULL DEFAULT '',
  `default_language` varchar(255) NOT NULL DEFAULT '',
  `realm_id` int(11) DEFAULT NULL,
  `profile_id` int(11) DEFAULT NULL,
  `reg_auto_suffix_check` tinyint(1) NOT NULL DEFAULT 0,
  `reg_auto_suffix` char(200) NOT NULL DEFAULT '',
  `reg_mac_check` tinyint(1) NOT NULL DEFAULT 0,
  `reg_auto_add` tinyint(1) NOT NULL DEFAULT 0,
  `reg_email` tinyint(1) NOT NULL DEFAULT 0,
  `slideshow_enforce_watching` tinyint(1) NOT NULL DEFAULT 1,
  `slideshow_enforce_seconds` int(4) NOT NULL DEFAULT 10,
  `available_languages` varchar(255) NOT NULL DEFAULT '',
  `ctc_require_email` tinyint(1) NOT NULL DEFAULT 0,
  `ctc_resupply_email_interval` int(4) NOT NULL DEFAULT 0,
  `show_screen_delay` int(4) NOT NULL DEFAULT 0,
  `show_logo` tinyint(1) NOT NULL DEFAULT 1,
  `show_name` tinyint(1) NOT NULL DEFAULT 1,
  `name_colour` varchar(255) NOT NULL DEFAULT '',
  `ctc_require_phone` tinyint(1) NOT NULL DEFAULT 0,
  `ctc_resupply_phone_interval` int(4) NOT NULL DEFAULT 0,
  `ctc_require_dn` tinyint(1) NOT NULL DEFAULT 0,
  `ctc_resupply_dn_interval` int(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dynamic_details`
--

LOCK TABLES `dynamic_details` WRITE;
/*!40000 ALTER TABLE `dynamic_details` DISABLE KEYS */;
INSERT INTO `dynamic_details` VALUES (1,'Demo1',1,'logo.jpg','','','','','','','','','','',NULL,NULL,45,0,'',0,'',0,30,1,'click_to_connect','ssid',0,0,'2021-10-25 22:48:48','2021-10-26 18:17:34',0,0,0,'demo1',1,120,'Default',0,0,0,NULL,'','','','','en_GB',1,3,1,'demo1',0,0,0,0,10,'',0,0,0,1,0,'',0,0,0,0);
/*!40000 ALTER TABLE `dynamic_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dynamic_pages`
--

DROP TABLE IF EXISTS `dynamic_pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dynamic_pages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dynamic_detail_id` int(11) NOT NULL,
  `name` varchar(128) NOT NULL DEFAULT '',
  `content` text NOT NULL,
  `created` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `dynamic_detail_language_id` int(11) DEFAULT NULL,
  `language` varchar(20) DEFAULT 'en',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dynamic_pages`
--

LOCK TABLES `dynamic_pages` WRITE;
/*!40000 ALTER TABLE `dynamic_pages` DISABLE KEYS */;
INSERT INTO `dynamic_pages` VALUES (7,3,'Welcome to Struisbaai','<font color=\"0000FF\"><font size=\"3\">You are in a High Speed Internet Zone!<br></font></font><ul><li>Thanks to the vibrant community, you can now enjoy being connected 24/7 @ speeds of up to 10Mb/s</li><li>Ideal for watching HD movies over the Internet</li><li>Budget connectivity is also available <br></li></ul><p><br></p>','2013-05-23 10:30:58','2013-05-28 21:45:59',NULL,'en');
/*!40000 ALTER TABLE `dynamic_pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dynamic_pairs`
--

DROP TABLE IF EXISTS `dynamic_pairs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dynamic_pairs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL DEFAULT '',
  `value` varchar(64) NOT NULL DEFAULT '',
  `priority` int(11) NOT NULL DEFAULT 1,
  `dynamic_detail_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dynamic_pairs`
--

LOCK TABLES `dynamic_pairs` WRITE;
/*!40000 ALTER TABLE `dynamic_pairs` DISABLE KEYS */;
INSERT INTO `dynamic_pairs` VALUES (5,'ssid','Struisbaai',1,3,NULL,'2013-05-23 10:32:48','2013-05-28 22:02:38'),(6,'nasid','RADIUSdesk-1',1,3,NULL,'2013-08-21 19:49:38','2013-08-21 19:49:38'),(9,'nasid','lion_cp1',1,3,NULL,'2014-08-11 12:36:28','2014-08-11 12:36:28'),(10,'nasid','lion_cp2',1,3,NULL,'2014-08-11 12:36:40','2014-08-11 12:36:40'),(11,'nasid','lion_cp3',1,3,NULL,'2014-08-11 12:36:54','2014-08-11 12:36:54'),(12,'nasid','cheetah_cp1',1,3,NULL,'2014-08-11 12:37:15','2014-08-11 12:37:15'),(13,'nasid','Hotel_California_Three-Radio_cp_23',1,3,NULL,'2019-04-12 06:13:37','2019-04-12 06:13:37'),(14,'nasid','demo1_mcp_1',1,1,NULL,'2021-10-25 22:48:48','2021-10-25 22:48:48');
/*!40000 ALTER TABLE `dynamic_pairs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dynamic_photo_translations`
--

DROP TABLE IF EXISTS `dynamic_photo_translations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dynamic_photo_translations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dynamic_detail_language_id` int(11) DEFAULT NULL,
  `dynamic_photo_id` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dynamic_photo_translations`
--

LOCK TABLES `dynamic_photo_translations` WRITE;
/*!40000 ALTER TABLE `dynamic_photo_translations` DISABLE KEYS */;
INSERT INTO `dynamic_photo_translations` VALUES (1,5,1,'Gooi Hom','In Engels','2021-04-23 07:24:32','2021-04-23 07:24:32');
/*!40000 ALTER TABLE `dynamic_photo_translations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dynamic_photos`
--

DROP TABLE IF EXISTS `dynamic_photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dynamic_photos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dynamic_detail_id` int(11) NOT NULL,
  `title` varchar(128) NOT NULL DEFAULT '',
  `description` varchar(250) NOT NULL DEFAULT '',
  `url` varchar(250) NOT NULL DEFAULT '',
  `file_name` varchar(128) NOT NULL DEFAULT 'logo.jpg',
  `created` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `fit` enum('stretch_to_fit','horizontal','vertical','original','dynamic') DEFAULT 'stretch_to_fit',
  `background_color` varchar(7) NOT NULL DEFAULT 'ffffff',
  `slide_duration` int(4) NOT NULL DEFAULT 10,
  `include_title` tinyint(1) NOT NULL DEFAULT 1,
  `include_description` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `title` (`title`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dynamic_photos`
--

LOCK TABLES `dynamic_photos` WRITE;
/*!40000 ALTER TABLE `dynamic_photos` DISABLE KEYS */;
INSERT INTO `dynamic_photos` VALUES (1,1,'Sample Title','Sample Description','','demo1.jpg','2021-10-25 22:48:48','2021-10-26 18:17:48',1,'stretch_to_fit','ffffff',10,0,0);
/*!40000 ALTER TABLE `dynamic_photos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_messages`
--

DROP TABLE IF EXISTS `email_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `email_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL DEFAULT '',
  `title` varchar(64) NOT NULL DEFAULT '',
  `message` varchar(255) NOT NULL DEFAULT '',
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_messages`
--

LOCK TABLES `email_messages` WRITE;
/*!40000 ALTER TABLE `email_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `email_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `firmware_keys`
--

DROP TABLE IF EXISTS `firmware_keys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `firmware_keys` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `token_key` char(36) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `available_to_siblings` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `firmware_keys`
--

LOCK TABLES `firmware_keys` WRITE;
/*!40000 ALTER TABLE `firmware_keys` DISABLE KEYS */;
/*!40000 ALTER TABLE `firmware_keys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forward_lookups`
--

DROP TABLE IF EXISTS `forward_lookups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `forward_lookups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fqdn` varchar(255) NOT NULL,
  `ip` varchar(255) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forward_lookups`
--

LOCK TABLES `forward_lookups` WRITE;
/*!40000 ALTER TABLE `forward_lookups` DISABLE KEYS */;
/*!40000 ALTER TABLE `forward_lookups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `groups`
--

DROP TABLE IF EXISTS `groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `created` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `groups`
--

LOCK TABLES `groups` WRITE;
/*!40000 ALTER TABLE `groups` DISABLE KEYS */;
INSERT INTO `groups` VALUES (8,'Administrators','2012-12-10 13:13:09','2012-12-10 13:13:09'),(9,'Access Providers','2012-12-10 13:13:19','2012-12-10 13:13:19'),(10,'Permanent Users','2012-12-10 13:13:28','2012-12-10 13:13:28');
/*!40000 ALTER TABLE `groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hardware_owners`
--

DROP TABLE IF EXISTS `hardware_owners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hardware_owners` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `hardware_id` int(11) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `name` varchar(17) NOT NULL,
  `available_to_siblings` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('awaiting-check-in','checked-in','awaiting-check-out','checked-out') DEFAULT 'awaiting-check-in',
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hardware_owners`
--

LOCK TABLES `hardware_owners` WRITE;
/*!40000 ALTER TABLE `hardware_owners` DISABLE KEYS */;
/*!40000 ALTER TABLE `hardware_owners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hardware_radios`
--

DROP TABLE IF EXISTS `hardware_radios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hardware_radios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `radio_number` tinyint(2) NOT NULL DEFAULT 0,
  `disabled` tinyint(1) NOT NULL DEFAULT 0,
  `txpower` tinyint(2) NOT NULL DEFAULT 1,
  `include_beacon_int` tinyint(1) NOT NULL DEFAULT 0,
  `beacon_int` int(11) NOT NULL DEFAULT 100,
  `include_distance` tinyint(1) NOT NULL DEFAULT 0,
  `distance` int(7) NOT NULL DEFAULT 100,
  `ht_capab` varchar(255) DEFAULT NULL,
  `mesh` tinyint(1) NOT NULL DEFAULT 1,
  `ap` tinyint(1) NOT NULL DEFAULT 1,
  `config` tinyint(1) NOT NULL DEFAULT 1,
  `hardware_id` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `band` enum('2g','5g') DEFAULT '2g',
  `mode` enum('n','ac','ax') DEFAULT 'n',
  `width` enum('20','40','80','160') DEFAULT '20',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hardware_radios`
--

LOCK TABLES `hardware_radios` WRITE;
/*!40000 ALTER TABLE `hardware_radios` DISABLE KEYS */;
INSERT INTO `hardware_radios` VALUES (35,0,0,20,0,100,0,100,'',0,1,1,10,'2022-01-07 13:44:20','2022-01-07 13:44:20','2g','n','20'),(36,1,0,20,0,100,0,100,'',1,1,0,10,'2022-01-07 13:44:20','2022-01-07 13:44:20','5g','ac','80'),(37,0,0,20,0,100,0,100,'',1,1,1,8,'2022-01-07 13:44:33','2022-01-07 13:44:33','2g','n','20'),(38,0,0,20,0,100,0,100,'',0,1,1,9,'2022-01-07 13:44:48','2022-01-07 13:44:48','2g','n','20'),(39,1,0,20,0,100,0,100,'',1,1,0,9,'2022-01-07 13:44:48','2022-01-07 13:44:48','5g','ac','80'),(40,0,0,20,0,100,0,100,'',0,1,0,11,'2022-01-07 13:45:02','2022-01-07 13:45:02','2g','n','20'),(41,0,0,20,0,100,0,100,'',0,1,1,12,'2022-01-07 13:47:55','2022-01-07 13:47:55','2g','ax','20'),(42,1,0,20,0,100,0,100,'',1,1,0,12,'2022-01-07 13:47:55','2022-01-07 13:47:55','5g','ac','80');
/*!40000 ALTER TABLE `hardware_radios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hardwares`
--

DROP TABLE IF EXISTS `hardwares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hardwares` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `vendor` varchar(255) NOT NULL,
  `model` varchar(255) NOT NULL,
  `fw_id` varchar(20) NOT NULL,
  `for_mesh` tinyint(1) NOT NULL DEFAULT 1,
  `for_ap` tinyint(1) NOT NULL DEFAULT 1,
  `wan` varchar(20) NOT NULL DEFAULT 'eth1',
  `lan` varchar(20) DEFAULT NULL,
  `radio_count` tinyint(2) NOT NULL DEFAULT 0,
  `photo_file_name` varchar(128) NOT NULL DEFAULT 'hardware.png',
  `user_id` int(11) DEFAULT NULL,
  `available_to_siblings` tinyint(1) NOT NULL DEFAULT 0,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hardwares`
--

LOCK TABLES `hardwares` WRITE;
/*!40000 ALTER TABLE `hardwares` DISABLE KEYS */;
INSERT INTO `hardwares` VALUES (8,'Xiaomi 4C 300M','Xiaomi','4C 300M','xiaomi_4c',1,1,'eth0.1','eth0.2',1,'8_xiaomi_4c.png',44,1,'2021-10-25 23:43:25','2022-01-07 13:44:33'),(9,'Xiaomi 4A 100M','Xiaomi','4A 100M','xiaomi_4a_100',1,1,'eth0.1','eth0.2',2,'9_xiaomi_4a_100m.png',44,1,'2021-10-25 23:44:18','2022-01-07 13:44:48'),(10,'Xiaomi 4A 1G','Xiaomi','4A 1G','xiaomi_4a_1g',1,1,'wan','lan1 lan2',2,'10_xiaomi_4a_1g.png',44,1,'2021-10-25 23:45:58','2022-01-07 13:44:20'),(11,'Raspberry Pi3','Raspberry','Pi3','pi3',0,1,'eth0','',1,'11_pi3.png',44,1,'2021-10-25 23:46:52','2022-01-07 13:45:02'),(12,'TOTOLink X5000R','TOTOLink','X5000R','t_x5000r',1,1,'wan','lan1 lan2 lan3 lan4',2,'12_t_x5000r.jpeg',44,1,'2022-01-07 13:46:28','2022-01-07 13:53:40');
/*!40000 ALTER TABLE `hardwares` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `home_server_pools`
--

DROP TABLE IF EXISTS `home_server_pools`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `home_server_pools` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('fail-over','load-balance','client-balance','client-port-balance','keyed-balance') DEFAULT 'fail-over',
  `user_id` int(11) DEFAULT NULL,
  `available_to_siblings` tinyint(1) NOT NULL DEFAULT 0,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `home_server_pools`
--

LOCK TABLES `home_server_pools` WRITE;
/*!40000 ALTER TABLE `home_server_pools` DISABLE KEYS */;
/*!40000 ALTER TABLE `home_server_pools` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `home_servers`
--

DROP TABLE IF EXISTS `home_servers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `home_servers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('auth','acct','auth+acct','coa') DEFAULT 'auth+acct',
  `ipaddr` varchar(255) NOT NULL DEFAULT '',
  `port` int(5) NOT NULL DEFAULT 1812,
  `secret` varchar(255) NOT NULL DEFAULT '',
  `response_window` int(5) NOT NULL DEFAULT 20,
  `zombie_period` int(5) NOT NULL DEFAULT 40,
  `revive_interval` int(5) NOT NULL DEFAULT 120,
  `home_server_pool_id` int(11) DEFAULT NULL,
  `accept_coa` tinyint(1) NOT NULL DEFAULT 1,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `home_servers`
--

LOCK TABLES `home_servers` WRITE;
/*!40000 ALTER TABLE `home_servers` DISABLE KEYS */;
/*!40000 ALTER TABLE `home_servers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `languages`
--

DROP TABLE IF EXISTS `languages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `languages` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `iso_code` varchar(2) DEFAULT NULL,
  `rtl` tinyint(1) NOT NULL DEFAULT 0,
  `created` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `languages`
--

LOCK TABLES `languages` WRITE;
/*!40000 ALTER TABLE `languages` DISABLE KEYS */;
INSERT INTO `languages` VALUES (4,'English','en',0,'2012-10-05 04:55:28','2012-10-06 07:58:26');
/*!40000 ALTER TABLE `languages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `licensed_devices`
--

DROP TABLE IF EXISTS `licensed_devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `licensed_devices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL DEFAULT '',
  `available_to_siblings` tinyint(1) NOT NULL DEFAULT 1,
  `master_key` tinyint(1) NOT NULL DEFAULT 1,
  `provider_key` tinyint(1) NOT NULL DEFAULT 0,
  `user_id` int(11) DEFAULT NULL,
  `extra_name` varchar(100) NOT NULL DEFAULT '',
  `extra_value` varchar(100) NOT NULL DEFAULT '',
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `licensed_devices`
--

LOCK TABLES `licensed_devices` WRITE;
/*!40000 ALTER TABLE `licensed_devices` DISABLE KEYS */;
/*!40000 ALTER TABLE `licensed_devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `limits`
--

DROP TABLE IF EXISTS `limits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `limits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `alias` varchar(100) NOT NULL DEFAULT '',
  `active` tinyint(1) NOT NULL DEFAULT 0,
  `count` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `limits`
--

LOCK TABLES `limits` WRITE;
/*!40000 ALTER TABLE `limits` DISABLE KEYS */;
/*!40000 ALTER TABLE `limits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mac_aliases`
--

DROP TABLE IF EXISTS `mac_aliases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mac_aliases` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mac` char(20) DEFAULT NULL,
  `alias` char(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `available_to_siblings` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mac_aliases`
--

LOCK TABLES `mac_aliases` WRITE;
/*!40000 ALTER TABLE `mac_aliases` DISABLE KEYS */;
INSERT INTO `mac_aliases` VALUES (1,'9c:ae:d3:89:51:ee','Epson Printer',44,'2021-04-19 12:48:21','2021-04-19 12:48:21',0),(2,'08:ed:b9:00:bc:55','Danielle Laptop',44,'2021-04-19 12:48:41','2021-04-19 12:48:41',0),(3,'00:be:3b:03:1e:f9','Danielle Phone',44,'2021-04-19 12:48:55','2021-04-19 12:48:55',0),(4,'fc:3f:7c:85:61:95','Klara Phone',44,'2021-04-19 12:49:09','2021-04-19 12:49:09',0),(5,'a8:9c:ed:76:1d:91','Dirk Phone',44,'2021-04-19 12:49:24','2021-04-19 12:49:24',0),(6,'80:ad:16:e9:01:47','Amasoak Phone',44,'2021-04-19 12:49:42','2021-04-19 12:49:42',0),(7,'68:17:29:d2:ac:62','Dirk Xubuntu',44,'2021-04-19 12:52:33','2021-04-19 12:52:33',0),(8,'1c:3e:84:5f:22:39','Petra Laptop',44,'2021-05-10 12:26:28','2021-05-10 12:26:28',0);
/*!40000 ALTER TABLE `mac_aliases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mac_usages`
--

DROP TABLE IF EXISTS `mac_usages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mac_usages` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `mac` varchar(17) NOT NULL,
  `username` varchar(255) NOT NULL DEFAULT '',
  `data_used` bigint(20) DEFAULT NULL,
  `data_cap` bigint(20) DEFAULT NULL,
  `time_used` int(12) DEFAULT NULL,
  `time_cap` int(12) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mac_usages`
--

LOCK TABLES `mac_usages` WRITE;
/*!40000 ALTER TABLE `mac_usages` DISABLE KEYS */;
INSERT INTO `mac_usages` VALUES (1,'aa-aa-aa-aa-aa-aa','click_to_connect@Struisbaai',20,5000000,NULL,NULL,'2014-09-02 15:25:07','2014-09-02 15:25:07');
/*!40000 ALTER TABLE `mac_usages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mesh_daily_summaries`
--

DROP TABLE IF EXISTS `mesh_daily_summaries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mesh_daily_summaries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mesh_id` int(11) NOT NULL,
  `the_date` date NOT NULL,
  `tree_tag_id` int(11) DEFAULT NULL,
  `mesh_name` varchar(255) DEFAULT NULL,
  `min_clients` bigint(20) DEFAULT 0,
  `max_clients` bigint(20) DEFAULT 0,
  `min_nodes` bigint(20) DEFAULT 0,
  `max_nodes` bigint(20) DEFAULT 0,
  `min_lv_nodes` bigint(20) DEFAULT 0,
  `max_lv_nodes` bigint(20) DEFAULT 0,
  `min_lv_nodes_down` bigint(20) DEFAULT 0,
  `max_lv_nodes_down` bigint(20) DEFAULT 0,
  `min_nodes_down` bigint(20) DEFAULT 0,
  `max_nodes_down` bigint(20) DEFAULT 0,
  `min_nodes_up` bigint(20) DEFAULT 0,
  `max_nodes_up` bigint(20) DEFAULT 0,
  `min_dual_radios` bigint(20) DEFAULT 0,
  `max_dual_radios` bigint(20) DEFAULT 0,
  `min_single_radios` bigint(20) DEFAULT 0,
  `max_single_radios` bigint(20) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_mesh_daily_summaries_mesh_id_the_date` (`mesh_id`,`the_date`),
  KEY `idx_mesh_daily_summaries_mesh_id` (`mesh_id`),
  KEY `idx_mesh_daily_summaries_tree_tag_id` (`tree_tag_id`),
  KEY `idx_mesh_daily_summaries_the_date` (`the_date`),
  KEY `idx_mesh_daily_summaries_mesh_name` (`mesh_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mesh_daily_summaries`
--

LOCK TABLES `mesh_daily_summaries` WRITE;
/*!40000 ALTER TABLE `mesh_daily_summaries` DISABLE KEYS */;
INSERT INTO `mesh_daily_summaries` VALUES (1,1,'2021-10-25',1,'Demo1',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0),(2,1,'2021-10-26',1,'Demo1',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0),(3,1,'2021-10-27',1,'Demo1',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0),(4,1,'2021-11-03',1,'Demo1',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0),(5,1,'2022-01-07',1,'Demo1',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
/*!40000 ALTER TABLE `mesh_daily_summaries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mesh_entries`
--

DROP TABLE IF EXISTS `mesh_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mesh_entries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mesh_id` int(11) DEFAULT NULL,
  `name` varchar(128) NOT NULL,
  `hidden` tinyint(1) NOT NULL DEFAULT 0,
  `isolate` tinyint(1) NOT NULL DEFAULT 0,
  `apply_to_all` tinyint(1) NOT NULL DEFAULT 0,
  `encryption` enum('none','wep','psk','psk2','wpa','wpa2') DEFAULT 'none',
  `special_key` varchar(100) NOT NULL DEFAULT '',
  `auth_server` varchar(255) NOT NULL DEFAULT '',
  `auth_secret` varchar(255) NOT NULL DEFAULT '',
  `dynamic_vlan` tinyint(1) NOT NULL DEFAULT 0,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `chk_maxassoc` tinyint(1) NOT NULL DEFAULT 0,
  `maxassoc` int(6) DEFAULT 100,
  `macfilter` enum('disable','allow','deny') DEFAULT 'disable',
  `permanent_user_id` int(11) NOT NULL,
  `nasid` varchar(255) NOT NULL DEFAULT '',
  `auto_nasid` tinyint(1) NOT NULL DEFAULT 0,
  `accounting` tinyint(1) NOT NULL DEFAULT 1,
  `frequency_band` enum('both','two','five','five_upper','five_lower') DEFAULT 'both',
  PRIMARY KEY (`id`),
  KEY `idx_mesh_entries_mesh_id` (`mesh_id`),
  KEY `idx_mesh_entries_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mesh_entries`
--

LOCK TABLES `mesh_entries` WRITE;
/*!40000 ALTER TABLE `mesh_entries` DISABLE KEYS */;
INSERT INTO `mesh_entries` VALUES (1,1,'Demo1 Guest',0,1,1,'none','','','',0,'2021-10-25 22:48:48','2021-10-25 22:48:48',0,100,'disable',0,'',0,1,'both'),(2,1,'Demo1 Wireless',0,0,1,'psk2','12345678','','',0,'2021-10-25 22:48:48','2021-10-25 22:48:48',0,100,'disable',0,'',0,1,'both');
/*!40000 ALTER TABLE `mesh_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mesh_exit_captive_portals`
--

DROP TABLE IF EXISTS `mesh_exit_captive_portals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mesh_exit_captive_portals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mesh_exit_id` int(11) NOT NULL,
  `radius_1` varchar(128) NOT NULL,
  `radius_2` varchar(128) NOT NULL DEFAULT '',
  `radius_secret` varchar(128) NOT NULL,
  `radius_nasid` varchar(128) NOT NULL,
  `uam_url` varchar(255) NOT NULL,
  `uam_secret` varchar(255) NOT NULL,
  `walled_garden` varchar(255) NOT NULL,
  `swap_octets` tinyint(1) NOT NULL DEFAULT 0,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `mac_auth` tinyint(1) NOT NULL DEFAULT 0,
  `proxy_enable` tinyint(1) NOT NULL DEFAULT 0,
  `proxy_ip` varchar(128) NOT NULL DEFAULT '',
  `proxy_port` int(11) NOT NULL DEFAULT 3128,
  `proxy_auth_username` varchar(128) NOT NULL DEFAULT '',
  `proxy_auth_password` varchar(128) NOT NULL DEFAULT '',
  `coova_optional` varchar(255) NOT NULL DEFAULT '',
  `dns_manual` tinyint(1) NOT NULL DEFAULT 0,
  `dns1` varchar(128) NOT NULL DEFAULT '',
  `dns2` varchar(128) NOT NULL DEFAULT '',
  `uamanydns` tinyint(1) NOT NULL DEFAULT 0,
  `dnsparanoia` tinyint(1) NOT NULL DEFAULT 0,
  `dnsdesk` tinyint(1) NOT NULL DEFAULT 0,
  `mesh_exit_upstream_id` int(11) DEFAULT NULL,
  `xwf_enable` tinyint(1) NOT NULL DEFAULT 0,
  `xwf_traffic_class_id` int(11) DEFAULT NULL,
  `xwf_uamhomepage` varchar(255) NOT NULL DEFAULT '',
  `xwf_radiuslocationname` varchar(255) NOT NULL DEFAULT '',
  `xwf_bw_enable` tinyint(1) NOT NULL DEFAULT 0,
  `xwf_bw_down` int(11) DEFAULT 1,
  `xwf_bw_up` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_mesh_exit_captive_portals_mesh_exit_id` (`mesh_exit_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mesh_exit_captive_portals`
--

LOCK TABLES `mesh_exit_captive_portals` WRITE;
/*!40000 ALTER TABLE `mesh_exit_captive_portals` DISABLE KEYS */;
INSERT INTO `mesh_exit_captive_portals` VALUES (1,33,'198.27.111.78','','testing123','cheetah_cp1','http://198.27.111.78/cake3/rd_cake/dynamic-details/chilli-browser-detect/','greatsecret','www.radiusdesk.com',0,'2014-08-11 12:21:02','2017-02-24 20:56:38',0,0,'192.168.10.10',3128,'admin','admin','',0,'4.4.4.4','8.8.8.8',0,0,0,NULL,0,NULL,'','',0,1,1),(2,61,'206.189.185.139','','testing123','909eynsham_road_mcp_61','https://cloud.mesh-manager.com/cake3/rd_cake/dynamic-details/chilli-browser-detect/','greatsecret','',0,'2019-09-20 04:22:11','2019-09-20 04:22:11',1,0,'',3128,'','','ssid 909eynsham_road\n',0,'','',0,0,0,NULL,0,NULL,'','',0,1,1),(3,1,'192.168.8.220','','testing123','demo1_mcp_1','http://192.168.8.220/cake3/rd_cake/dynamic-details/chilli-browser-detect/','greatsecret','',0,'2021-10-25 22:48:48','2021-10-25 22:48:48',1,0,'',3128,'','','ssid demo1\n',0,'','',0,0,0,NULL,0,NULL,'','',0,1,1);
/*!40000 ALTER TABLE `mesh_exit_captive_portals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mesh_exit_mesh_entries`
--

DROP TABLE IF EXISTS `mesh_exit_mesh_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mesh_exit_mesh_entries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mesh_exit_id` int(11) NOT NULL,
  `mesh_entry_id` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_mesh_exit_mesh_entries_mesh_exit_id` (`mesh_exit_id`),
  KEY `idx_mesh_exit_mesh_entries_mesh_entry_id` (`mesh_entry_id`)
) ENGINE=InnoDB AUTO_INCREMENT=140 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mesh_exit_mesh_entries`
--

LOCK TABLES `mesh_exit_mesh_entries` WRITE;
/*!40000 ALTER TABLE `mesh_exit_mesh_entries` DISABLE KEYS */;
INSERT INTO `mesh_exit_mesh_entries` VALUES (65,35,57,'2014-08-11 12:28:41','2014-08-11 12:28:41'),(96,32,53,'2016-04-24 15:33:04','2016-04-24 15:33:04'),(102,30,50,'2016-04-30 11:56:06','2016-04-30 11:56:06'),(132,59,54,'2016-09-19 03:34:27','2016-09-19 03:34:27'),(133,60,55,'2016-09-19 03:34:43','2016-09-19 03:34:43'),(135,33,52,'2017-02-24 20:56:38','2017-02-24 20:56:38'),(136,61,58,'2019-09-20 04:22:11','2019-09-20 04:22:11'),(137,62,59,'2019-09-20 04:22:11','2019-09-20 04:22:11'),(138,1,1,'2021-10-25 22:48:48','2021-10-25 22:48:48'),(139,2,2,'2021-10-25 22:48:48','2021-10-25 22:48:48');
/*!40000 ALTER TABLE `mesh_exit_mesh_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mesh_exit_settings`
--

DROP TABLE IF EXISTS `mesh_exit_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mesh_exit_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mesh_exit_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `value` varchar(255) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mesh_exit_settings`
--

LOCK TABLES `mesh_exit_settings` WRITE;
/*!40000 ALTER TABLE `mesh_exit_settings` DISABLE KEYS */;
INSERT INTO `mesh_exit_settings` VALUES (6,28,'nat_ipaddr','10.222.100.1','2021-05-21 03:37:38','2021-05-21 03:37:38'),(7,28,'nat_netmask','255.255.255.0','2021-05-21 03:37:38','2021-05-21 03:37:38'),(8,28,'nat_pool_start','100','2021-05-21 03:37:38','2021-05-21 03:37:38'),(9,28,'nat_pool_limit','200','2021-05-21 03:37:38','2021-05-21 03:37:38'),(10,28,'nat_leasetime','12','2021-05-21 03:37:38','2021-05-21 03:37:38');
/*!40000 ALTER TABLE `mesh_exit_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mesh_exits`
--

DROP TABLE IF EXISTS `mesh_exits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mesh_exits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mesh_id` int(11) DEFAULT NULL,
  `name` varchar(128) NOT NULL,
  `type` enum('bridge','tagged_bridge','nat','captive_portal','openvpn_bridge','tagged_bridge_l3') DEFAULT NULL,
  `auto_detect` tinyint(1) NOT NULL DEFAULT 0,
  `vlan` int(4) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `openvpn_server_id` int(11) DEFAULT NULL,
  `proto` enum('static','dhcp','dhcpv6') DEFAULT 'dhcp',
  `ipaddr` varchar(50) NOT NULL DEFAULT '',
  `netmask` varchar(50) NOT NULL DEFAULT '',
  `gateway` varchar(50) NOT NULL DEFAULT '',
  `dns_1` varchar(50) NOT NULL DEFAULT '',
  `dns_2` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `idx_mesh_exits_mesh_id` (`mesh_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mesh_exits`
--

LOCK TABLES `mesh_exits` WRITE;
/*!40000 ALTER TABLE `mesh_exits` DISABLE KEYS */;
INSERT INTO `mesh_exits` VALUES (1,1,'','captive_portal',1,NULL,'2021-10-25 22:48:48','2021-10-25 22:48:48',NULL,'dhcp','','','','',''),(2,1,'','bridge',1,NULL,'2021-10-25 22:48:48','2021-10-25 22:48:48',NULL,'dhcp','','','','','');
/*!40000 ALTER TABLE `mesh_exits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mesh_notes`
--

DROP TABLE IF EXISTS `mesh_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mesh_notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mesh_id` int(11) NOT NULL,
  `note_id` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_mesh_notes_mesh_id` (`mesh_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mesh_notes`
--

LOCK TABLES `mesh_notes` WRITE;
/*!40000 ALTER TABLE `mesh_notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `mesh_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mesh_settings`
--

DROP TABLE IF EXISTS `mesh_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mesh_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mesh_id` int(11) DEFAULT NULL,
  `aggregated_ogms` tinyint(1) NOT NULL DEFAULT 1,
  `ap_isolation` tinyint(1) NOT NULL DEFAULT 0,
  `bonding` tinyint(1) NOT NULL DEFAULT 0,
  `bridge_loop_avoidance` tinyint(1) NOT NULL DEFAULT 0,
  `fragmentation` tinyint(1) NOT NULL DEFAULT 1,
  `distributed_arp_table` tinyint(1) NOT NULL DEFAULT 1,
  `orig_interval` int(10) NOT NULL DEFAULT 1000,
  `gw_sel_class` int(10) NOT NULL DEFAULT 20,
  `connectivity` enum('IBSS','mesh_point') DEFAULT 'mesh_point',
  `encryption` tinyint(1) NOT NULL DEFAULT 0,
  `encryption_key` varchar(63) NOT NULL DEFAULT '',
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_mesh_settings_mesh_id` (`mesh_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mesh_settings`
--

LOCK TABLES `mesh_settings` WRITE;
/*!40000 ALTER TABLE `mesh_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `mesh_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mesh_specifics`
--

DROP TABLE IF EXISTS `mesh_specifics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mesh_specifics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mesh_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `value` varchar(255) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_mesh_specifics_mesh_id` (`mesh_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mesh_specifics`
--

LOCK TABLES `mesh_specifics` WRITE;
/*!40000 ALTER TABLE `mesh_specifics` DISABLE KEYS */;
/*!40000 ALTER TABLE `mesh_specifics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meshes`
--

DROP TABLE IF EXISTS `meshes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `meshes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  `ssid` varchar(32) NOT NULL,
  `bssid` varchar(32) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `available_to_siblings` tinyint(1) NOT NULL DEFAULT 0,
  `tree_tag_id` int(11) DEFAULT NULL,
  `last_contact` datetime DEFAULT NULL,
  `enable_alerts` tinyint(1) NOT NULL DEFAULT 1,
  `enable_overviews` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_meshes_name` (`name`),
  KEY `idx_meshes_modified` (`modified`),
  KEY `idx_meshes_user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meshes`
--

LOCK TABLES `meshes` WRITE;
/*!40000 ALTER TABLE `meshes` DISABLE KEYS */;
INSERT INTO `meshes` VALUES (1,'Demo1','02_CA_FE_CA_00_01','02:CA:FE:CA:00:01',45,'2021-10-25 22:48:48','2021-10-25 22:48:48',1,1,NULL,1,1);
/*!40000 ALTER TABLE `meshes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `na_notes`
--

DROP TABLE IF EXISTS `na_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `na_notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `na_id` int(11) NOT NULL,
  `note_id` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `na_notes`
--

LOCK TABLES `na_notes` WRITE;
/*!40000 ALTER TABLE `na_notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `na_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `na_realms`
--

DROP TABLE IF EXISTS `na_realms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `na_realms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `na_id` int(11) NOT NULL,
  `realm_id` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `na_realms`
--

LOCK TABLES `na_realms` WRITE;
/*!40000 ALTER TABLE `na_realms` DISABLE KEYS */;
INSERT INTO `na_realms` VALUES (1,58,33,'2013-08-24 19:11:47','2013-08-24 19:11:47');
/*!40000 ALTER TABLE `na_realms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `na_states`
--

DROP TABLE IF EXISTS `na_states`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `na_states` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `na_id` char(36) NOT NULL,
  `state` tinyint(1) NOT NULL DEFAULT 0,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `na_states`
--

LOCK TABLES `na_states` WRITE;
/*!40000 ALTER TABLE `na_states` DISABLE KEYS */;
/*!40000 ALTER TABLE `na_states` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `na_tags`
--

DROP TABLE IF EXISTS `na_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `na_tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `na_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `na_tags`
--

LOCK TABLES `na_tags` WRITE;
/*!40000 ALTER TABLE `na_tags` DISABLE KEYS */;
INSERT INTO `na_tags` VALUES (1,59,1,'2016-12-29 15:32:25','2016-12-29 15:32:25');
/*!40000 ALTER TABLE `na_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nas`
--

DROP TABLE IF EXISTS `nas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `nas` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `nasname` varchar(128) NOT NULL,
  `shortname` varchar(32) DEFAULT NULL,
  `nasidentifier` varchar(64) NOT NULL DEFAULT '',
  `type` varchar(30) DEFAULT 'other',
  `ports` int(5) DEFAULT NULL,
  `secret` varchar(60) NOT NULL DEFAULT 'secret',
  `server` varchar(64) DEFAULT NULL,
  `community` varchar(50) DEFAULT NULL,
  `description` varchar(200) DEFAULT 'RADIUS Client',
  `connection_type` enum('direct','openvpn','pptp','dynamic') DEFAULT 'direct',
  `available_to_siblings` tinyint(1) NOT NULL DEFAULT 1,
  `record_auth` tinyint(1) NOT NULL DEFAULT 0,
  `ignore_acct` tinyint(1) NOT NULL DEFAULT 0,
  `dynamic_attribute` varchar(50) NOT NULL DEFAULT '',
  `dynamic_value` varchar(50) NOT NULL DEFAULT '',
  `monitor` enum('off','ping','heartbeat') DEFAULT 'off',
  `ping_interval` int(5) NOT NULL DEFAULT 600,
  `heartbeat_dead_after` int(5) NOT NULL DEFAULT 600,
  `last_contact` datetime DEFAULT NULL,
  `session_auto_close` tinyint(1) NOT NULL DEFAULT 0,
  `session_dead_time` int(5) NOT NULL DEFAULT 3600,
  `on_public_maps` tinyint(1) NOT NULL DEFAULT 0,
  `lat` double DEFAULT NULL,
  `lon` double DEFAULT NULL,
  `photo_file_name` varchar(128) NOT NULL DEFAULT 'logo.jpg',
  `user_id` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `nasname` (`nasname`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nas`
--

LOCK TABLES `nas` WRITE;
/*!40000 ALTER TABLE `nas` DISABLE KEYS */;
/*!40000 ALTER TABLE `nas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `networks`
--

DROP TABLE IF EXISTS `networks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `networks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `site_id` int(11) DEFAULT NULL,
  `lat` decimal(11,8) DEFAULT NULL,
  `lng` decimal(11,8) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `networks`
--

LOCK TABLES `networks` WRITE;
/*!40000 ALTER TABLE `networks` DISABLE KEYS */;
INSERT INTO `networks` VALUES (1,'Network Demo1',1,-26.53641400,28.05343900,'2021-10-25 22:48:48','2021-10-26 11:06:31');
/*!40000 ALTER TABLE `networks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `new_accountings`
--

DROP TABLE IF EXISTS `new_accountings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `new_accountings` (
  `mac` varchar(17) NOT NULL,
  `username` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`mac`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `new_accountings`
--

LOCK TABLES `new_accountings` WRITE;
/*!40000 ALTER TABLE `new_accountings` DISABLE KEYS */;
/*!40000 ALTER TABLE `new_accountings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `node_actions`
--

DROP TABLE IF EXISTS `node_actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `node_actions` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `node_id` int(10) NOT NULL,
  `action` enum('execute','execute_and_reply') DEFAULT 'execute',
  `command` varchar(500) DEFAULT '',
  `status` enum('awaiting','fetched','replied') DEFAULT 'awaiting',
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `reply` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_node_actions_node_id` (`node_id`),
  KEY `idx_node_actions_modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `node_actions`
--

LOCK TABLES `node_actions` WRITE;
/*!40000 ALTER TABLE `node_actions` DISABLE KEYS */;
/*!40000 ALTER TABLE `node_actions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `node_connection_settings`
--

DROP TABLE IF EXISTS `node_connection_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `node_connection_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `node_id` int(11) DEFAULT NULL,
  `grouping` varchar(25) DEFAULT NULL,
  `name` varchar(25) DEFAULT NULL,
  `value` varchar(40) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `node_connection_settings`
--

LOCK TABLES `node_connection_settings` WRITE;
/*!40000 ALTER TABLE `node_connection_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `node_connection_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `node_ibss_connections`
--

DROP TABLE IF EXISTS `node_ibss_connections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `node_ibss_connections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `node_id` int(11) DEFAULT NULL,
  `station_node_id` int(11) DEFAULT NULL,
  `radio_number` tinyint(3) NOT NULL DEFAULT 0,
  `frequency_band` enum('two','five_lower','five_upper') DEFAULT 'two',
  `if_mac` varchar(17) NOT NULL,
  `mac` varchar(17) NOT NULL,
  `tx_bytes` bigint(20) NOT NULL,
  `rx_bytes` bigint(20) NOT NULL,
  `tx_packets` bigint(20) NOT NULL,
  `rx_packets` bigint(20) NOT NULL,
  `tx_bitrate` int(11) NOT NULL,
  `rx_bitrate` int(11) NOT NULL,
  `authenticated` tinyint(2) NOT NULL DEFAULT 1,
  `authorized` tinyint(2) NOT NULL DEFAULT 1,
  `tdls_peer` tinyint(2) NOT NULL DEFAULT 1,
  `preamble` varchar(255) NOT NULL,
  `tx_failed` int(11) NOT NULL,
  `wmm_wme` tinyint(2) NOT NULL DEFAULT 0,
  `tx_retries` int(11) NOT NULL,
  `mfp` tinyint(2) NOT NULL DEFAULT 1,
  `signal_now` int(11) NOT NULL,
  `signal_avg` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_node_ibss_connections_node_id` (`node_id`),
  KEY `idx_node_ibss_connections_station_node_id` (`station_node_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `node_ibss_connections`
--

LOCK TABLES `node_ibss_connections` WRITE;
/*!40000 ALTER TABLE `node_ibss_connections` DISABLE KEYS */;
/*!40000 ALTER TABLE `node_ibss_connections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `node_ibss_connections_dailies`
--

DROP TABLE IF EXISTS `node_ibss_connections_dailies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `node_ibss_connections_dailies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mac` varchar(64) NOT NULL DEFAULT '',
  `mesh_id` int(11) NOT NULL,
  `node_id` int(11) NOT NULL,
  `station_node_id` int(11) NOT NULL,
  `if_mac` varchar(64) NOT NULL DEFAULT '',
  `radio_number` int(2) NOT NULL,
  `frequency_band` enum('two','five_lower','five_upper') DEFAULT 'two',
  `tx_bytes` bigint(20) NOT NULL,
  `rx_bytes` bigint(20) NOT NULL,
  `tx_bitrate` int(6) NOT NULL,
  `rx_bitrate` int(6) NOT NULL,
  `signal_avg` int(6) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `node_ibss_connections_dailies`
--

LOCK TABLES `node_ibss_connections_dailies` WRITE;
/*!40000 ALTER TABLE `node_ibss_connections_dailies` DISABLE KEYS */;
/*!40000 ALTER TABLE `node_ibss_connections_dailies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `node_loads`
--

DROP TABLE IF EXISTS `node_loads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `node_loads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `node_id` int(11) DEFAULT NULL,
  `mem_total` int(11) DEFAULT NULL,
  `mem_free` int(11) DEFAULT NULL,
  `uptime` varchar(255) DEFAULT NULL,
  `system_time` varchar(255) NOT NULL,
  `load_1` float(2,2) NOT NULL,
  `load_2` float(2,2) NOT NULL,
  `load_3` float(2,2) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_node_loads_node_id` (`node_id`),
  KEY `idx_node_loads_modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `node_loads`
--

LOCK TABLES `node_loads` WRITE;
/*!40000 ALTER TABLE `node_loads` DISABLE KEYS */;
/*!40000 ALTER TABLE `node_loads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `node_mesh_entries`
--

DROP TABLE IF EXISTS `node_mesh_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `node_mesh_entries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `node_id` int(11) NOT NULL,
  `mesh_entry_id` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_node_mesh_entries_node_id` (`node_id`),
  KEY `idx_node_mesh_entries_mesh_entry_id` (`mesh_entry_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `node_mesh_entries`
--

LOCK TABLES `node_mesh_entries` WRITE;
/*!40000 ALTER TABLE `node_mesh_entries` DISABLE KEYS */;
/*!40000 ALTER TABLE `node_mesh_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `node_mesh_exits`
--

DROP TABLE IF EXISTS `node_mesh_exits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `node_mesh_exits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `node_id` int(11) NOT NULL,
  `mesh_exit_id` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_node_mesh_exits_node_id` (`node_id`),
  KEY `idx_node_mesh_exits_mesh_exit_id` (`mesh_exit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `node_mesh_exits`
--

LOCK TABLES `node_mesh_exits` WRITE;
/*!40000 ALTER TABLE `node_mesh_exits` DISABLE KEYS */;
/*!40000 ALTER TABLE `node_mesh_exits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `node_mp_settings`
--

DROP TABLE IF EXISTS `node_mp_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `node_mp_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `node_id` int(11) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `value` varchar(255) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_node_mp_settings_node_id` (`node_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `node_mp_settings`
--

LOCK TABLES `node_mp_settings` WRITE;
/*!40000 ALTER TABLE `node_mp_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `node_mp_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `node_neighbors`
--

DROP TABLE IF EXISTS `node_neighbors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `node_neighbors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `node_id` int(11) DEFAULT NULL,
  `gateway` enum('yes','no') DEFAULT 'no',
  `neighbor_id` int(11) DEFAULT NULL,
  `metric` decimal(6,4) NOT NULL,
  `hwmode` char(5) DEFAULT '11g',
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_node_neighbors_node_id` (`node_id`),
  KEY `idx_node_neighbors_gateway` (`gateway`),
  KEY `idx_node_neighbors_neighbor_id` (`neighbor_id`),
  KEY `idx_node_neighbors_modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `node_neighbors`
--

LOCK TABLES `node_neighbors` WRITE;
/*!40000 ALTER TABLE `node_neighbors` DISABLE KEYS */;
/*!40000 ALTER TABLE `node_neighbors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `node_scans`
--

DROP TABLE IF EXISTS `node_scans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `node_scans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `node_id` int(11) DEFAULT NULL,
  `ap_id` int(11) DEFAULT NULL,
  `scan_data` text DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `node_scans`
--

LOCK TABLES `node_scans` WRITE;
/*!40000 ALTER TABLE `node_scans` DISABLE KEYS */;
/*!40000 ALTER TABLE `node_scans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `node_settings`
--

DROP TABLE IF EXISTS `node_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `node_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mesh_id` int(11) DEFAULT NULL,
  `password` varchar(128) NOT NULL,
  `power` int(3) NOT NULL DEFAULT 100,
  `all_power` tinyint(1) NOT NULL DEFAULT 1,
  `two_chan` int(3) NOT NULL DEFAULT 6,
  `five_chan` int(3) NOT NULL DEFAULT 44,
  `heartbeat_interval` int(5) NOT NULL DEFAULT 60,
  `heartbeat_dead_after` int(5) NOT NULL DEFAULT 600,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `password_hash` varchar(100) NOT NULL DEFAULT '',
  `eth_br_chk` tinyint(1) NOT NULL DEFAULT 0,
  `eth_br_with` int(11) NOT NULL DEFAULT 0,
  `eth_br_for_all` tinyint(1) NOT NULL DEFAULT 1,
  `tz_name` varchar(128) NOT NULL DEFAULT 'America/New York',
  `tz_value` varchar(128) NOT NULL DEFAULT 'EST5EDT,M3.2.0,M11.1.0',
  `country` varchar(5) NOT NULL DEFAULT 'US',
  `gw_dhcp_timeout` int(5) NOT NULL DEFAULT 120,
  `gw_use_previous` tinyint(1) NOT NULL DEFAULT 1,
  `gw_auto_reboot` tinyint(1) NOT NULL DEFAULT 1,
  `gw_auto_reboot_time` int(5) NOT NULL DEFAULT 600,
  `client_key` varchar(255) NOT NULL DEFAULT 'radiusdesk',
  `syslog1_ip` varchar(50) NOT NULL DEFAULT '',
  `syslog1_port` varchar(10) NOT NULL DEFAULT '514',
  `syslog2_ip` varchar(50) NOT NULL DEFAULT '',
  `syslog2_port` varchar(10) NOT NULL DEFAULT '514',
  `syslog3_ip` varchar(50) NOT NULL DEFAULT '',
  `syslog3_port` varchar(10) NOT NULL DEFAULT '514',
  `report_adv_enable` tinyint(1) NOT NULL DEFAULT 1,
  `report_adv_proto` enum('https','http') DEFAULT 'http',
  `report_adv_light` int(5) DEFAULT 60,
  `report_adv_full` int(5) DEFAULT 600,
  `report_adv_sampling` int(5) DEFAULT 60,
  `enable_schedules` tinyint(1) NOT NULL DEFAULT 0,
  `schedule_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_node_settings_mesh_id` (`mesh_id`),
  KEY `idx_node_settings_modified` (`modified`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `node_settings`
--

LOCK TABLES `node_settings` WRITE;
/*!40000 ALTER TABLE `node_settings` DISABLE KEYS */;
INSERT INTO `node_settings` VALUES (1,1,'demo1',100,1,6,44,60,600,'2021-10-25 22:48:58','2021-10-25 22:48:58','$1$2lBtTFTk$CuOC5Wk7DWTmvoRg9Hfqg/',0,0,1,'Africa/Johannesburg','SAST-2','ZA',120,1,1,600,'radiusdesk','','514','','514','','514',1,'http',60,600,60,0,NULL);
/*!40000 ALTER TABLE `node_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `node_stations`
--

DROP TABLE IF EXISTS `node_stations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `node_stations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `node_id` int(11) DEFAULT NULL,
  `mesh_entry_id` int(11) DEFAULT NULL,
  `radio_number` tinyint(3) NOT NULL DEFAULT 0,
  `frequency_band` enum('two','five_lower','five_upper') DEFAULT 'two',
  `mac` varchar(17) NOT NULL,
  `tx_bytes` bigint(20) NOT NULL,
  `rx_bytes` bigint(20) NOT NULL,
  `tx_packets` bigint(20) NOT NULL,
  `rx_packets` bigint(20) NOT NULL,
  `tx_bitrate` int(11) NOT NULL,
  `rx_bitrate` int(11) NOT NULL,
  `authenticated` tinyint(2) NOT NULL DEFAULT 1,
  `authorized` tinyint(2) NOT NULL DEFAULT 1,
  `tdls_peer` tinyint(2) NOT NULL DEFAULT 1,
  `preamble` varchar(255) NOT NULL,
  `tx_failed` int(11) NOT NULL,
  `wmm_wme` tinyint(2) NOT NULL DEFAULT 0,
  `tx_retries` int(11) NOT NULL,
  `mfp` tinyint(2) NOT NULL DEFAULT 1,
  `signal_now` int(11) NOT NULL,
  `signal_avg` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_node_stations_node_id` (`node_id`),
  KEY `idx_node_stations_mesh_entry_id` (`mesh_entry_id`),
  KEY `idx_node_stations_modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `node_stations`
--

LOCK TABLES `node_stations` WRITE;
/*!40000 ALTER TABLE `node_stations` DISABLE KEYS */;
/*!40000 ALTER TABLE `node_stations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `node_stations_dailies`
--

DROP TABLE IF EXISTS `node_stations_dailies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `node_stations_dailies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mac` varchar(64) NOT NULL DEFAULT '',
  `node_station_id` int(11) NOT NULL,
  `mesh_id` int(11) NOT NULL,
  `mesh_entry_id` int(11) NOT NULL,
  `node_id` int(11) NOT NULL,
  `radio_number` int(2) NOT NULL,
  `frequency_band` enum('two','five_lower','five_upper') DEFAULT 'two',
  `tx_bytes` bigint(20) NOT NULL,
  `rx_bytes` bigint(20) NOT NULL,
  `tx_bitrate` int(6) NOT NULL,
  `rx_bitrate` int(6) NOT NULL,
  `signal_avg` int(6) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `node_stations_dailies`
--

LOCK TABLES `node_stations_dailies` WRITE;
/*!40000 ALTER TABLE `node_stations_dailies` DISABLE KEYS */;
/*!40000 ALTER TABLE `node_stations_dailies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `node_systems`
--

DROP TABLE IF EXISTS `node_systems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `node_systems` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `node_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `value` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_node_systems_node_id` (`node_id`),
  KEY `idx_node_systems_name` (`name`),
  KEY `idx_node_systems_modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `node_systems`
--

LOCK TABLES `node_systems` WRITE;
/*!40000 ALTER TABLE `node_systems` DISABLE KEYS */;
/*!40000 ALTER TABLE `node_systems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `node_uptm_histories`
--

DROP TABLE IF EXISTS `node_uptm_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `node_uptm_histories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `node_id` int(11) DEFAULT NULL,
  `node_state` tinyint(1) NOT NULL DEFAULT 0,
  `state_datetime` datetime NOT NULL,
  `report_datetime` datetime NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_node_uptm_histories_node_id` (`node_id`),
  KEY `idx_node_uptm_histories_modified` (`modified`),
  KEY `idx_node_uptm_histories_node_state` (`node_state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `node_uptm_histories`
--

LOCK TABLES `node_uptm_histories` WRITE;
/*!40000 ALTER TABLE `node_uptm_histories` DISABLE KEYS */;
/*!40000 ALTER TABLE `node_uptm_histories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `node_wifi_settings`
--

DROP TABLE IF EXISTS `node_wifi_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `node_wifi_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `node_id` int(11) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `value` varchar(255) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_node_wifi_settings_node_id` (`node_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `node_wifi_settings`
--

LOCK TABLES `node_wifi_settings` WRITE;
/*!40000 ALTER TABLE `node_wifi_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `node_wifi_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nodes`
--

DROP TABLE IF EXISTS `nodes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `nodes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mesh_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `mac` varchar(255) NOT NULL,
  `hardware` varchar(255) DEFAULT NULL,
  `ip` varchar(255) DEFAULT NULL,
  `last_contact` datetime DEFAULT NULL,
  `lat` double DEFAULT NULL,
  `lon` double DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `config_fetched` datetime DEFAULT NULL,
  `lan_proto` varchar(30) NOT NULL DEFAULT '',
  `lan_ip` varchar(30) NOT NULL DEFAULT '',
  `lan_gw` varchar(30) NOT NULL DEFAULT '',
  `last_contact_from_ip` varchar(30) NOT NULL DEFAULT '',
  `mesh0` varchar(25) NOT NULL DEFAULT '',
  `mesh1` varchar(25) NOT NULL DEFAULT '',
  `mesh2` varchar(25) NOT NULL DEFAULT '',
  `gateway` enum('none','lan','3g','wifi','wifi_static','wifi_ppp','wifi_pppoe','wan_static','wan_ppp','wan_pppoe') DEFAULT 'none',
  `bootcycle` int(11) NOT NULL DEFAULT 0,
  `mesh0_frequency_band` enum('two','five_lower','five_upper') DEFAULT 'two',
  `mesh1_frequency_band` enum('two','five_lower','five_upper') DEFAULT 'two',
  `mesh2_frequency_band` enum('two','five_lower','five_upper') DEFAULT 'two',
  `mesh0_channel` int(3) NOT NULL DEFAULT 0,
  `mesh1_channel` int(3) NOT NULL DEFAULT 0,
  `mesh2_channel` int(3) NOT NULL DEFAULT 0,
  `mesh0_txpower` int(3) NOT NULL DEFAULT 0,
  `mesh1_txpower` int(3) NOT NULL DEFAULT 0,
  `mesh2_txpower` int(3) NOT NULL DEFAULT 0,
  `reboot_flag` tinyint(1) NOT NULL DEFAULT 0,
  `enable_alerts` tinyint(1) NOT NULL DEFAULT 1,
  `enable_overviews` tinyint(1) NOT NULL DEFAULT 1,
  `enable_schedules` tinyint(1) NOT NULL DEFAULT 0,
  `schedule_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_nodes_mesh_id` (`mesh_id`),
  KEY `idx_nodes_name` (`name`),
  KEY `idx_nodes_mac` (`mac`),
  KEY `idx_nodes_last_contact` (`last_contact`),
  KEY `idx_nodes_modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nodes`
--

LOCK TABLES `nodes` WRITE;
/*!40000 ALTER TABLE `nodes` DISABLE KEYS */;
/*!40000 ALTER TABLE `nodes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notes`
--

DROP TABLE IF EXISTS `notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `note` text NOT NULL,
  `available_to_siblings` tinyint(1) NOT NULL DEFAULT 1,
  `user_id` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notes`
--

LOCK TABLES `notes` WRITE;
/*!40000 ALTER TABLE `notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `severity` int(11) NOT NULL DEFAULT 1,
  `is_resolved` tinyint(1) NOT NULL DEFAULT 0,
  `notification_datetime` datetime NOT NULL,
  `notification_type` varchar(32) NOT NULL DEFAULT 'network',
  `notification_code` int(11) NOT NULL DEFAULT 2,
  `short_description` varchar(64) DEFAULT NULL,
  `description` varchar(512) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `item_table` varchar(64) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_severity` (`severity`),
  KEY `idx_notifications_modified` (`modified`),
  KEY `idx_notification_datetime` (`notification_datetime`),
  KEY `idx_notification_is_resolved` (`is_resolved`),
  KEY `idx_notification_notification_type` (`notification_type`),
  KEY `idx_notification_notification_code` (`notification_code`),
  KEY `idx_notification_item_id` (`item_id`),
  KEY `idx_notification_item_table` (`item_table`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `openvpn_clients`
--

DROP TABLE IF EXISTS `openvpn_clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `openvpn_clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `subnet` int(3) DEFAULT NULL,
  `peer1` int(3) DEFAULT NULL,
  `peer2` int(3) DEFAULT NULL,
  `na_id` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `openvpn_clients`
--

LOCK TABLES `openvpn_clients` WRITE;
/*!40000 ALTER TABLE `openvpn_clients` DISABLE KEYS */;
/*!40000 ALTER TABLE `openvpn_clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `openvpn_server_clients`
--

DROP TABLE IF EXISTS `openvpn_server_clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `openvpn_server_clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mesh_ap_profile` enum('mesh','ap_profile') DEFAULT 'mesh',
  `openvpn_server_id` int(11) DEFAULT NULL,
  `mesh_id` int(11) DEFAULT NULL,
  `mesh_exit_id` int(11) DEFAULT NULL,
  `ap_profile_id` int(11) DEFAULT NULL,
  `ap_profile_exit_id` int(11) DEFAULT NULL,
  `ap_id` int(11) DEFAULT NULL,
  `ip_address` varchar(40) NOT NULL,
  `last_contact_to_server` datetime DEFAULT NULL,
  `state` tinyint(1) NOT NULL DEFAULT 0,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `openvpn_server_clients`
--

LOCK TABLES `openvpn_server_clients` WRITE;
/*!40000 ALTER TABLE `openvpn_server_clients` DISABLE KEYS */;
INSERT INTO `openvpn_server_clients` VALUES (19,'mesh',1,41,59,NULL,NULL,NULL,'10.8.0.129',NULL,0,'2016-09-19 03:34:27','2016-09-19 03:34:27'),(20,'mesh',2,41,60,NULL,NULL,NULL,'10.8.0.129',NULL,0,'2016-09-19 03:34:43','2016-09-19 03:34:43'),(21,'ap_profile',2,NULL,NULL,14,40,1,'10.8.0.130',NULL,0,'2019-04-12 06:13:37','2019-04-12 06:13:37');
/*!40000 ALTER TABLE `openvpn_server_clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `openvpn_servers`
--

DROP TABLE IF EXISTS `openvpn_servers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `openvpn_servers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL DEFAULT '',
  `description` varchar(255) NOT NULL DEFAULT '',
  `available_to_siblings` tinyint(1) NOT NULL DEFAULT 1,
  `user_id` int(11) DEFAULT NULL,
  `local_remote` enum('local','remote') DEFAULT 'local',
  `protocol` enum('udp','tcp') DEFAULT 'udp',
  `ip_address` varchar(40) NOT NULL,
  `port` int(6) NOT NULL,
  `vpn_gateway_address` varchar(40) NOT NULL,
  `vpn_bridge_start_address` varchar(40) NOT NULL,
  `vpn_mask` varchar(40) NOT NULL,
  `config_preset` varchar(100) NOT NULL DEFAULT 'default',
  `ca_crt` text NOT NULL,
  `extra_name` varchar(100) NOT NULL DEFAULT '',
  `extra_value` varchar(100) NOT NULL DEFAULT '',
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `openvpn_servers`
--

LOCK TABLES `openvpn_servers` WRITE;
/*!40000 ALTER TABLE `openvpn_servers` DISABLE KEYS */;
INSERT INTO `openvpn_servers` VALUES (1,'USA-1','Tunnel to West Coast',1,44,'local','udp','198.27.111.76',1194,'10.8.0.1','10.8.0.129','255.255.255.0','default','-----BEGIN CERTIFICATE-----\nMIIE+jCCA+KgAwIBAgIJAIZVNkfIiREVMA0GCSqGSIb3DQEBCwUAMIGuMQswCQYD\nVQQGEwJaQTEQMA4GA1UECBMHR2F1dGVuZzERMA8GA1UEBxMITWV5ZXJ0b24xETAP\nBgNVBAoTCExpbm92YXRlMRUwEwYDVQQLEwxDb21wdXRlckxhYnMxFDASBgNVBAMT\nC0xpbm92YXRlIENBMREwDwYDVQQpEwhMaW5vdmF0ZTEnMCUGCSqGSIb3DQEJARYY\nZGlya3ZhbmRlcndhbHRAZ21haWwuY29tMB4XDTE2MDkxMjA4MTQwMVoXDTI2MDkx\nMDA4MTQwMVowga4xCzAJBgNVBAYTAlpBMRAwDgYDVQQIEwdHYXV0ZW5nMREwDwYD\nVQQHEwhNZXllcnRvbjERMA8GA1UEChMITGlub3ZhdGUxFTATBgNVBAsTDENvbXB1\ndGVyTGFiczEUMBIGA1UEAxMLTGlub3ZhdGUgQ0ExETAPBgNVBCkTCExpbm92YXRl\nMScwJQYJKoZIhvcNAQkBFhhkaXJrdmFuZGVyd2FsdEBnbWFpbC5jb20wggEiMA0G\nCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDDwCqsTqiQOWqC+nAw04GC4wDOvCWM\nMkzjGM1A7W/BJe3vt8gxFg7ffcXjJWrROQvJacv4vodNgL0lNrzltEyhTwkHhkqx\nCHQZMGPBclg0izP5Lz/6cyOd0zv5I9RQGDnBLQPq+baXVfBPudaFi8kBYPlRiFRY\nrDt2N76b13mqMHEdeANhDfwAl5T5ftmd2wKlfQo0wltFkDGmiiwStSdz5e3nDI6D\nyRuopS/hq2gGJWutlw9ucaDIYJf4X5OzvyRrEx9M5bj2MZf4QaDQphW9NMrO8TbN\n7mbh1bS0aJ9b/SSK4vegtqlGLpCx1SME00HuC1osiraHbIPZ0/8L9y4HAgMBAAGj\nggEXMIIBEzAdBgNVHQ4EFgQUYa19kSBWE/C1fEr2tI9j3Zq7238wgeMGA1UdIwSB\n2zCB2IAUYa19kSBWE/C1fEr2tI9j3Zq723+hgbSkgbEwga4xCzAJBgNVBAYTAlpB\nMRAwDgYDVQQIEwdHYXV0ZW5nMREwDwYDVQQHEwhNZXllcnRvbjERMA8GA1UEChMI\nTGlub3ZhdGUxFTATBgNVBAsTDENvbXB1dGVyTGFiczEUMBIGA1UEAxMLTGlub3Zh\ndGUgQ0ExETAPBgNVBCkTCExpbm92YXRlMScwJQYJKoZIhvcNAQkBFhhkaXJrdmFu\nZGVyd2FsdEBnbWFpbC5jb22CCQCGVTZHyIkRFTAMBgNVHRMEBTADAQH/MA0GCSqG\nSIb3DQEBCwUAA4IBAQCk3PW1kz26Qg1SkXYjK1plp3dBeQjZ2mkJ+3MZn5wau4+u\nEinJ8OxGdUoiQMliniecOhkuavibrz4vEnIGi0K5OGzA8msLLWb9glHDUSjRXwlV\nTWRgEtL8vmEjcz57vN556zwe/4rNOLLTPjcvexG41PuCw7OQGRV3+Gw2YGREvNn6\nKLjcEqBsT2ju4NJNRAyXu50t4Ugvvi7QJtL3YFniSE87ojsJ06heuDXM58LJf5jz\nPA8p+LCh6V9esHNa3AkHp0M+tHdmlrR0qtfVB8oBk8yuCJQGhlefC80RZFAnhEQN\nwuU0JY1bWFc579IdU/bBIWaxvy7ZGSXpKscbGCpu\n-----END CERTIFICATE-----\n','','','2016-09-15 22:25:46','2016-09-15 23:28:56'),(2,'USA-2','Tunnel to East Coast',1,44,'remote','udp','198.27.111.77',1194,'10.8.0.1','10.8.0.129','255.255.255.0','default','-----BEGIN CERTIFICATE-----\nMIIE+jCCA+KgAwIBAgIJAIZVNkfIiREVMA0GCSqGSIb3DQEBCwUAMIGuMQswCQYD\nVQQGEwJaQTEQMA4GA1UECBMHR2F1dGVuZzERMA8GA1UEBxMITWV5ZXJ0b24xETAP\nBgNVBAoTCExpbm92YXRlMRUwEwYDVQQLEwxDb21wdXRlckxhYnMxFDASBgNVBAMT\nC0xpbm92YXRlIENBMREwDwYDVQQpEwhMaW5vdmF0ZTEnMCUGCSqGSIb3DQEJARYY\nZGlya3ZhbmRlcndhbHRAZ21haWwuY29tMB4XDTE2MDkxMjA4MTQwMVoXDTI2MDkx\nMDA4MTQwMVowga4xCzAJBgNVBAYTAlpBMRAwDgYDVQQIEwdHYXV0ZW5nMREwDwYD\nVQQHEwhNZXllcnRvbjERMA8GA1UEChMITGlub3ZhdGUxFTATBgNVBAsTDENvbXB1\ndGVyTGFiczEUMBIGA1UEAxMLTGlub3ZhdGUgQ0ExETAPBgNVBCkTCExpbm92YXRl\nMScwJQYJKoZIhvcNAQkBFhhkaXJrdmFuZGVyd2FsdEBnbWFpbC5jb20wggEiMA0G\nCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDDwCqsTqiQOWqC+nAw04GC4wDOvCWM\nMkzjGM1A7W/BJe3vt8gxFg7ffcXjJWrROQvJacv4vodNgL0lNrzltEyhTwkHhkqx\nCHQZMGPBclg0izP5Lz/6cyOd0zv5I9RQGDnBLQPq+baXVfBPudaFi8kBYPlRiFRY\nrDt2N76b13mqMHEdeANhDfwAl5T5ftmd2wKlfQo0wltFkDGmiiwStSdz5e3nDI6D\nyRuopS/hq2gGJWutlw9ucaDIYJf4X5OzvyRrEx9M5bj2MZf4QaDQphW9NMrO8TbN\n7mbh1bS0aJ9b/SSK4vegtqlGLpCx1SME00HuC1osiraHbIPZ0/8L9y4HAgMBAAGj\nggEXMIIBEzAdBgNVHQ4EFgQUYa19kSBWE/C1fEr2tI9j3Zq7238wgeMGA1UdIwSB\n2zCB2IAUYa19kSBWE/C1fEr2tI9j3Zq723+hgbSkgbEwga4xCzAJBgNVBAYTAlpB\nMRAwDgYDVQQIEwdHYXV0ZW5nMREwDwYDVQQHEwhNZXllcnRvbjERMA8GA1UEChMI\nTGlub3ZhdGUxFTATBgNVBAsTDENvbXB1dGVyTGFiczEUMBIGA1UEAxMLTGlub3Zh\ndGUgQ0ExETAPBgNVBCkTCExpbm92YXRlMScwJQYJKoZIhvcNAQkBFhhkaXJrdmFu\nZGVyd2FsdEBnbWFpbC5jb22CCQCGVTZHyIkRFTAMBgNVHRMEBTADAQH/MA0GCSqG\nSIb3DQEBCwUAA4IBAQCk3PW1kz26Qg1SkXYjK1plp3dBeQjZ2mkJ+3MZn5wau4+u\nEinJ8OxGdUoiQMliniecOhkuavibrz4vEnIGi0K5OGzA8msLLWb9glHDUSjRXwlV\nTWRgEtL8vmEjcz57vN556zwe/4rNOLLTPjcvexG41PuCw7OQGRV3+Gw2YGREvNn6\nKLjcEqBsT2ju4NJNRAyXu50t4Ugvvi7QJtL3YFniSE87ojsJ06heuDXM58LJf5jz\nPA8p+LCh6V9esHNa3AkHp0M+tHdmlrR0qtfVB8oBk8yuCJQGhlefC80RZFAnhEQN\nwuU0JY1bWFc579IdU/bBIWaxvy7ZGSXpKscbGCpu\n-----END CERTIFICATE-----\n','','','2016-09-16 07:42:38','2016-09-16 07:46:30');
/*!40000 ALTER TABLE `openvpn_servers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permanent_user_notes`
--

DROP TABLE IF EXISTS `permanent_user_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permanent_user_notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `permanent_user_id` int(11) NOT NULL,
  `note_id` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permanent_user_notes`
--

LOCK TABLES `permanent_user_notes` WRITE;
/*!40000 ALTER TABLE `permanent_user_notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `permanent_user_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permanent_user_notifications`
--

DROP TABLE IF EXISTS `permanent_user_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permanent_user_notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `permanent_user_id` int(11) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `method` enum('whatsapp','email','sms') DEFAULT 'email',
  `type` enum('daily','usage') DEFAULT 'daily',
  `address_1` varchar(255) DEFAULT NULL,
  `address_2` varchar(255) DEFAULT NULL,
  `start` int(3) DEFAULT 80,
  `increment` int(3) DEFAULT 10,
  `last_value` int(3) DEFAULT NULL,
  `last_notification` datetime DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permanent_user_notifications`
--

LOCK TABLES `permanent_user_notifications` WRITE;
/*!40000 ALTER TABLE `permanent_user_notifications` DISABLE KEYS */;
INSERT INTO `permanent_user_notifications` VALUES (2,187,1,'email','daily','dirkvanderwalt@gmail.com','',80,10,NULL,NULL,'2015-07-19 19:35:19','2015-07-20 09:26:23');
/*!40000 ALTER TABLE `permanent_user_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permanent_user_settings`
--

DROP TABLE IF EXISTS `permanent_user_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permanent_user_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `permanent_user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `value` varchar(255) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permanent_user_settings`
--

LOCK TABLES `permanent_user_settings` WRITE;
/*!40000 ALTER TABLE `permanent_user_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `permanent_user_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permanent_users`
--

DROP TABLE IF EXISTS `permanent_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permanent_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(50) NOT NULL,
  `token` char(36) DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `surname` varchar(50) NOT NULL,
  `address` varchar(255) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `auth_type` varchar(128) NOT NULL DEFAULT 'sql',
  `active` tinyint(1) NOT NULL DEFAULT 0,
  `last_accept_time` datetime DEFAULT NULL,
  `last_reject_time` datetime DEFAULT NULL,
  `last_accept_nas` varchar(128) DEFAULT NULL,
  `last_reject_nas` varchar(128) DEFAULT NULL,
  `last_reject_message` varchar(255) DEFAULT NULL,
  `perc_time_used` int(6) DEFAULT NULL,
  `perc_data_used` int(6) DEFAULT NULL,
  `data_used` bigint(20) DEFAULT NULL,
  `data_cap` bigint(20) DEFAULT NULL,
  `time_used` int(12) DEFAULT NULL,
  `time_cap` int(12) DEFAULT NULL,
  `time_cap_type` enum('hard','soft') DEFAULT 'soft',
  `data_cap_type` enum('hard','soft') DEFAULT 'soft',
  `realm` varchar(50) NOT NULL DEFAULT '',
  `realm_id` int(11) DEFAULT NULL,
  `profile` varchar(50) NOT NULL DEFAULT '',
  `profile_id` int(11) DEFAULT NULL,
  `from_date` datetime DEFAULT NULL,
  `to_date` datetime DEFAULT NULL,
  `track_auth` tinyint(1) NOT NULL DEFAULT 0,
  `track_acct` tinyint(1) NOT NULL DEFAULT 1,
  `static_ip` varchar(50) NOT NULL DEFAULT '',
  `extra_name` varchar(100) NOT NULL DEFAULT '',
  `extra_value` varchar(100) NOT NULL DEFAULT '',
  `country_id` int(11) DEFAULT NULL,
  `language_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permanent_users`
--

LOCK TABLES `permanent_users` WRITE;
/*!40000 ALTER TABLE `permanent_users` DISABLE KEYS */;
INSERT INTO `permanent_users` VALUES (1,'demo1@demo1','a5e56198b8bba02794d5a2c92d7b94ee3cbeba76','69223098-5f41-4b4c-b806-322208f80072','','','','','','sql',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'soft','soft','Demo1',1,'Demo1_User-Registration',3,NULL,NULL,0,1,'','','',4,4,45,'2021-10-25 22:48:48','2022-01-07 14:00:37'),(2,'click_to_connect@demo1','2d7b59408a4b5ce7c3362e55c55863d68ac3f396',NULL,'','','','','','sql',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'soft','soft','Demo1',1,'Demo1_Click-To-Connect',2,NULL,NULL,0,1,'','','',4,4,45,'2021-10-25 22:48:48','2021-10-25 22:48:48');
/*!40000 ALTER TABLE `permanent_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pptp_clients`
--

DROP TABLE IF EXISTS `pptp_clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pptp_clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `ip` varchar(255) DEFAULT NULL,
  `na_id` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pptp_clients`
--

LOCK TABLES `pptp_clients` WRITE;
/*!40000 ALTER TABLE `pptp_clients` DISABLE KEYS */;
/*!40000 ALTER TABLE `pptp_clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `predefined_commands`
--

DROP TABLE IF EXISTS `predefined_commands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `predefined_commands` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` char(64) DEFAULT NULL,
  `command` varchar(255) NOT NULL DEFAULT '',
  `action` enum('execute','execute_and_reply') DEFAULT 'execute',
  `user_id` int(11) DEFAULT NULL,
  `available_to_siblings` tinyint(1) NOT NULL DEFAULT 0,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `predefined_commands`
--

LOCK TABLES `predefined_commands` WRITE;
/*!40000 ALTER TABLE `predefined_commands` DISABLE KEYS */;
INSERT INTO `predefined_commands` VALUES (1,'Reboot','reboot','execute',44,1,'2021-11-03 14:30:51','2021-11-03 14:30:51');
/*!40000 ALTER TABLE `predefined_commands` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profile_component_notes`
--

DROP TABLE IF EXISTS `profile_component_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `profile_component_notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `profile_component_id` int(11) NOT NULL,
  `note_id` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profile_component_notes`
--

LOCK TABLES `profile_component_notes` WRITE;
/*!40000 ALTER TABLE `profile_component_notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `profile_component_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profile_components`
--

DROP TABLE IF EXISTS `profile_components`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `profile_components` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  `available_to_siblings` tinyint(1) NOT NULL DEFAULT 1,
  `user_id` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profile_components`
--

LOCK TABLES `profile_components` WRITE;
/*!40000 ALTER TABLE `profile_components` DISABLE KEYS */;
INSERT INTO `profile_components` VALUES (1,'SimpleAdd_1',0,45,'2021-10-25 22:48:48','2021-10-25 22:48:48'),(2,'SimpleAdd_2',0,45,'2021-10-25 22:48:48','2021-10-25 22:48:48'),(3,'SimpleAdd_3',0,45,'2021-10-25 22:48:48','2021-10-25 22:48:48');
/*!40000 ALTER TABLE `profile_components` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profile_notes`
--

DROP TABLE IF EXISTS `profile_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `profile_notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `profile_id` int(11) NOT NULL,
  `note_id` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profile_notes`
--

LOCK TABLES `profile_notes` WRITE;
/*!40000 ALTER TABLE `profile_notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `profile_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profiles`
--

DROP TABLE IF EXISTS `profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `profiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  `available_to_siblings` tinyint(1) NOT NULL DEFAULT 1,
  `user_id` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profiles`
--

LOCK TABLES `profiles` WRITE;
/*!40000 ALTER TABLE `profiles` DISABLE KEYS */;
INSERT INTO `profiles` VALUES (1,'Demo1',0,45,'2021-10-25 22:48:48','2021-10-25 22:48:48'),(2,'Demo1_Click-To-Connect',0,45,'2021-10-25 22:48:48','2021-10-25 22:48:48'),(3,'Demo1_User-Registration',0,45,'2021-10-25 22:48:48','2021-10-25 22:48:48');
/*!40000 ALTER TABLE `profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `radacct`
--

DROP TABLE IF EXISTS `radacct`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `radacct` (
  `radacctid` bigint(21) NOT NULL AUTO_INCREMENT,
  `acctsessionid` varchar(64) NOT NULL DEFAULT '',
  `acctuniqueid` varchar(32) NOT NULL DEFAULT '',
  `username` varchar(64) NOT NULL DEFAULT '',
  `groupname` varchar(64) NOT NULL DEFAULT '',
  `realm` varchar(64) DEFAULT '',
  `nasipaddress` varchar(15) NOT NULL DEFAULT '',
  `nasidentifier` varchar(64) NOT NULL DEFAULT '',
  `nasportid` varchar(15) DEFAULT NULL,
  `nasporttype` varchar(32) DEFAULT NULL,
  `acctstarttime` datetime DEFAULT NULL,
  `acctupdatetime` datetime DEFAULT NULL,
  `acctstoptime` datetime DEFAULT NULL,
  `acctinterval` int(12) DEFAULT NULL,
  `acctsessiontime` int(12) unsigned DEFAULT NULL,
  `acctauthentic` varchar(32) DEFAULT NULL,
  `connectinfo_start` varchar(50) DEFAULT NULL,
  `connectinfo_stop` varchar(50) DEFAULT NULL,
  `acctinputoctets` bigint(20) DEFAULT NULL,
  `acctoutputoctets` bigint(20) DEFAULT NULL,
  `calledstationid` varchar(50) NOT NULL DEFAULT '',
  `callingstationid` varchar(50) NOT NULL DEFAULT '',
  `acctterminatecause` varchar(32) NOT NULL DEFAULT '',
  `servicetype` varchar(32) DEFAULT NULL,
  `framedprotocol` varchar(32) DEFAULT NULL,
  `framedipaddress` varchar(15) NOT NULL DEFAULT '',
  `acctstartdelay` int(12) DEFAULT NULL,
  `acctstopdelay` int(12) DEFAULT NULL,
  `xascendsessionsvrkey` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`radacctid`),
  UNIQUE KEY `acctuniqueid` (`acctuniqueid`),
  KEY `username` (`username`),
  KEY `framedipaddress` (`framedipaddress`),
  KEY `acctsessionid` (`acctsessionid`),
  KEY `acctsessiontime` (`acctsessiontime`),
  KEY `acctstarttime` (`acctstarttime`),
  KEY `acctinterval` (`acctinterval`),
  KEY `acctstoptime` (`acctstoptime`),
  KEY `nasipaddress` (`nasipaddress`),
  KEY `nasidentifier` (`nasidentifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `radacct`
--

LOCK TABLES `radacct` WRITE;
/*!40000 ALTER TABLE `radacct` DISABLE KEYS */;
/*!40000 ALTER TABLE `radacct` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `radcheck`
--

DROP TABLE IF EXISTS `radcheck`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `radcheck` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(64) NOT NULL DEFAULT '',
  `attribute` varchar(64) NOT NULL DEFAULT '',
  `op` char(2) NOT NULL DEFAULT '==',
  `value` varchar(253) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `username` (`username`(32)),
  KEY `FK_radcheck_ref_vouchers` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=10388 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `radcheck`
--

LOCK TABLES `radcheck` WRITE;
/*!40000 ALTER TABLE `radcheck` DISABLE KEYS */;
INSERT INTO `radcheck` VALUES (10369,'demo1@demo1','Rd-Realm',':=','Demo1'),(10370,'demo1@demo1','Rd-Account-Disabled',':=','0'),(10371,'demo1@demo1','Cleartext-Password',':=','demo1'),(10372,'demo1@demo1','Rd-User-Type',':=','user'),(10373,'click_to_connect@demo1','User-Profile',':=','Demo1_Click-To-Connect'),(10374,'click_to_connect@demo1','Rd-Realm',':=','Demo1'),(10375,'click_to_connect@demo1','Rd-Account-Disabled',':=','0'),(10376,'click_to_connect@demo1','Cleartext-Password',':=','click_to_connect'),(10377,'click_to_connect@demo1','Rd-User-Type',':=','user'),(10387,'demo1@demo1','User-Profile',':=','Demo1_User-Registration');
/*!40000 ALTER TABLE `radcheck` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `radgroupcheck`
--

DROP TABLE IF EXISTS `radgroupcheck`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `radgroupcheck` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `groupname` varchar(64) NOT NULL DEFAULT '',
  `attribute` varchar(64) NOT NULL DEFAULT '',
  `op` char(2) NOT NULL DEFAULT '==',
  `value` varchar(253) NOT NULL DEFAULT '',
  `comment` varchar(253) NOT NULL DEFAULT '',
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `groupname` (`groupname`(32))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `radgroupcheck`
--

LOCK TABLES `radgroupcheck` WRITE;
/*!40000 ALTER TABLE `radgroupcheck` DISABLE KEYS */;
INSERT INTO `radgroupcheck` VALUES (1,'SimpleAdd_2','Rd-Reset-Type-Data',':=','daily','SimpleProfile','2021-10-25 22:48:48','2021-10-25 22:48:48'),(2,'SimpleAdd_2','Rd-Total-Data',':=','250000000','SimpleProfile','2021-10-25 22:48:48','2021-10-25 22:48:48'),(3,'SimpleAdd_2','Rd-Cap-Type-Data',':=','hard','SimpleProfile','2021-10-25 22:48:48','2021-10-25 22:48:48'),(4,'SimpleAdd_2','Rd-Mac-Counter-Data',':=','1','SimpleProfile','2021-10-25 22:48:48','2021-10-25 22:48:48');
/*!40000 ALTER TABLE `radgroupcheck` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `radgroupreply`
--

DROP TABLE IF EXISTS `radgroupreply`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `radgroupreply` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `groupname` varchar(64) NOT NULL DEFAULT '',
  `attribute` varchar(64) NOT NULL DEFAULT '',
  `op` char(2) NOT NULL DEFAULT '=',
  `value` varchar(253) NOT NULL DEFAULT '',
  `comment` varchar(253) NOT NULL DEFAULT '',
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `groupname` (`groupname`(32))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `radgroupreply`
--

LOCK TABLES `radgroupreply` WRITE;
/*!40000 ALTER TABLE `radgroupreply` DISABLE KEYS */;
INSERT INTO `radgroupreply` VALUES (1,'SimpleAdd_2','WISPr-Bandwidth-Max-Up',':=','512000','SimpleProfile','2021-10-25 22:48:48','2021-10-25 22:48:48'),(2,'SimpleAdd_2','WISPr-Bandwidth-Max-Down',':=','512000','SimpleProfile','2021-10-25 22:48:48','2021-10-25 22:48:48');
/*!40000 ALTER TABLE `radgroupreply` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `radippool`
--

DROP TABLE IF EXISTS `radippool`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `radippool` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `pool_name` varchar(30) NOT NULL,
  `framedipaddress` varchar(15) NOT NULL DEFAULT '',
  `nasipaddress` varchar(15) NOT NULL DEFAULT '',
  `calledstationid` varchar(30) NOT NULL,
  `callingstationid` varchar(30) NOT NULL,
  `expiry_time` datetime DEFAULT NULL,
  `username` varchar(64) NOT NULL DEFAULT '',
  `pool_key` varchar(30) NOT NULL DEFAULT '',
  `nasidentifier` varchar(64) NOT NULL DEFAULT '',
  `extra_name` varchar(100) NOT NULL DEFAULT '',
  `extra_value` varchar(100) NOT NULL DEFAULT '',
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `permanent_user_id` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `radippool_poolname_expire` (`pool_name`,`expiry_time`),
  KEY `framedipaddress` (`framedipaddress`),
  KEY `radippool_nasip_poolkey_ipaddress` (`nasipaddress`,`pool_key`,`framedipaddress`)
) ENGINE=InnoDB AUTO_INCREMENT=169 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `radippool`
--

LOCK TABLES `radippool` WRITE;
/*!40000 ALTER TABLE `radippool` DISABLE KEYS */;
/*!40000 ALTER TABLE `radippool` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `radpostauth`
--

DROP TABLE IF EXISTS `radpostauth`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `radpostauth` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(64) NOT NULL DEFAULT '',
  `realm` varchar(64) DEFAULT NULL,
  `pass` varchar(64) NOT NULL DEFAULT '',
  `reply` varchar(32) NOT NULL DEFAULT '',
  `nasname` varchar(128) NOT NULL DEFAULT '',
  `authdate` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `radpostauth`
--

LOCK TABLES `radpostauth` WRITE;
/*!40000 ALTER TABLE `radpostauth` DISABLE KEYS */;
/*!40000 ALTER TABLE `radpostauth` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `radreply`
--

DROP TABLE IF EXISTS `radreply`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `radreply` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(64) NOT NULL DEFAULT '',
  `attribute` varchar(64) NOT NULL DEFAULT '',
  `op` char(2) NOT NULL DEFAULT '=',
  `value` varchar(253) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `username` (`username`(32)),
  KEY `FK_radreply_ref_vouchers` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `radreply`
--

LOCK TABLES `radreply` WRITE;
/*!40000 ALTER TABLE `radreply` DISABLE KEYS */;
/*!40000 ALTER TABLE `radreply` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `radusergroup`
--

DROP TABLE IF EXISTS `radusergroup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `radusergroup` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(64) NOT NULL DEFAULT '',
  `groupname` varchar(64) NOT NULL DEFAULT '',
  `priority` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `username` (`username`(32))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `radusergroup`
--

LOCK TABLES `radusergroup` WRITE;
/*!40000 ALTER TABLE `radusergroup` DISABLE KEYS */;
INSERT INTO `radusergroup` VALUES (1,'Demo1','SimpleAdd_1',5),(2,'Demo1_Click-To-Connect','SimpleAdd_2',5),(3,'Demo1_User-Registration','SimpleAdd_3',5);
/*!40000 ALTER TABLE `radusergroup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `realm_notes`
--

DROP TABLE IF EXISTS `realm_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `realm_notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `realm_id` int(11) NOT NULL,
  `note_id` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `realm_notes`
--

LOCK TABLES `realm_notes` WRITE;
/*!40000 ALTER TABLE `realm_notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `realm_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `realms`
--

DROP TABLE IF EXISTS `realms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `realms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL DEFAULT '',
  `available_to_siblings` tinyint(1) NOT NULL DEFAULT 1,
  `icon_file_name` varchar(128) NOT NULL DEFAULT 'logo.jpg',
  `phone` varchar(14) NOT NULL DEFAULT '',
  `fax` varchar(14) NOT NULL DEFAULT '',
  `cell` varchar(14) NOT NULL DEFAULT '',
  `email` varchar(128) NOT NULL DEFAULT '',
  `url` varchar(128) NOT NULL DEFAULT '',
  `street_no` char(10) NOT NULL DEFAULT '',
  `street` char(50) NOT NULL DEFAULT '',
  `town_suburb` char(50) NOT NULL DEFAULT '',
  `city` char(50) NOT NULL DEFAULT '',
  `country` char(50) NOT NULL DEFAULT '',
  `lat` double DEFAULT NULL,
  `lon` double DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `twitter` varchar(255) NOT NULL DEFAULT '',
  `facebook` varchar(255) NOT NULL DEFAULT '',
  `youtube` varchar(255) NOT NULL DEFAULT '',
  `google_plus` varchar(255) NOT NULL DEFAULT '',
  `linkedin` varchar(255) NOT NULL DEFAULT '',
  `t_c_title` varchar(255) NOT NULL DEFAULT '',
  `t_c_content` text NOT NULL,
  `suffix` char(200) NOT NULL DEFAULT '',
  `suffix_permanent_users` tinyint(1) NOT NULL DEFAULT 0,
  `suffix_vouchers` tinyint(1) NOT NULL DEFAULT 0,
  `suffix_devices` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `realms`
--

LOCK TABLES `realms` WRITE;
/*!40000 ALTER TABLE `realms` DISABLE KEYS */;
INSERT INTO `realms` VALUES (1,'Demo1',1,'logo.jpg','','','','','','','','','','',NULL,NULL,45,'2021-10-25 22:48:48','2021-10-25 22:48:48','','','','','','','','demo1',1,0,0);
/*!40000 ALTER TABLE `realms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registration_requests`
--

DROP TABLE IF EXISTS `registration_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `registration_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `registration_code` char(36) DEFAULT NULL,
  `state` enum('not_allocated','allocated','email_sent','verified','registration_completed','expired') DEFAULT 'not_allocated',
  `expire` datetime DEFAULT NULL,
  `email_sent` datetime DEFAULT NULL,
  `token_key` char(36) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registration_requests`
--

LOCK TABLES `registration_requests` WRITE;
/*!40000 ALTER TABLE `registration_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `registration_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reverse_lookups`
--

DROP TABLE IF EXISTS `reverse_lookups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reverse_lookups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ip` varchar(255) NOT NULL,
  `fqdn` varchar(255) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=322 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reverse_lookups`
--

LOCK TABLES `reverse_lookups` WRITE;
/*!40000 ALTER TABLE `reverse_lookups` DISABLE KEYS */;
/*!40000 ALTER TABLE `reverse_lookups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rolling_last_day`
--

DROP TABLE IF EXISTS `rolling_last_day`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rolling_last_day` (
  `mesh_id` int(11) NOT NULL,
  `tree_tag_id` int(11) DEFAULT NULL,
  `mesh_name` varchar(255) DEFAULT NULL,
  `tot_clients` bigint(20) DEFAULT 0,
  `tot_tx_bytes` bigint(20) DEFAULT 0,
  `tot_rx_bytes` bigint(20) DEFAULT 0,
  `tot_bytes` bigint(20) DEFAULT 0,
  `tot_nodes` bigint(20) DEFAULT 0,
  `tot_lv_nodes` bigint(20) DEFAULT 0,
  `tot_lv_nodes_down` bigint(20) DEFAULT 0,
  `tot_nodes_down` bigint(20) DEFAULT 0,
  `tot_nodes_up` bigint(20) DEFAULT 0,
  `dual_radios` bigint(20) DEFAULT 0,
  `single_radios` bigint(20) DEFAULT 0,
  `nup_beg_remove_secs` float(14,2) DEFAULT 0.00,
  `nup_end_add_secs` float(14,2) DEFAULT 0.00,
  `nup_up_seconds` float(14,2) DEFAULT 0.00,
  `nup_down_seconds` float(14,2) DEFAULT 0.00,
  `ndwn_beg_remove_secs` float(14,2) DEFAULT 0.00,
  `ndwn_end_add_secs` float(14,2) DEFAULT 0.00,
  `ndwn_up_seconds` float(14,2) DEFAULT 0.00,
  `ndwn_down_seconds` float(14,2) DEFAULT 0.00,
  PRIMARY KEY (`mesh_id`),
  KEY `idx_rolling_last_day_tree_tag_id` (`tree_tag_id`),
  KEY `idx_rolling_last_day_mesh_name` (`mesh_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rolling_last_day`
--

LOCK TABLES `rolling_last_day` WRITE;
/*!40000 ALTER TABLE `rolling_last_day` DISABLE KEYS */;
INSERT INTO `rolling_last_day` VALUES (1,1,'Demo1',0,0,0,0,0,0,0,0,0,0,0,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00);
/*!40000 ALTER TABLE `rolling_last_day` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rolling_last_hour`
--

DROP TABLE IF EXISTS `rolling_last_hour`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rolling_last_hour` (
  `mesh_id` int(11) NOT NULL,
  `tree_tag_id` int(11) DEFAULT NULL,
  `mesh_name` varchar(255) DEFAULT NULL,
  `tot_clients` bigint(20) DEFAULT 0,
  `tot_tx_bytes` bigint(20) DEFAULT 0,
  `tot_rx_bytes` bigint(20) DEFAULT 0,
  `tot_bytes` bigint(20) DEFAULT 0,
  `tot_nodes` bigint(20) DEFAULT 0,
  `tot_lv_nodes` bigint(20) DEFAULT 0,
  `tot_lv_nodes_down` bigint(20) DEFAULT 0,
  `tot_nodes_down` bigint(20) DEFAULT 0,
  `tot_nodes_up` bigint(20) DEFAULT 0,
  `dual_radios` bigint(20) DEFAULT 0,
  `single_radios` bigint(20) DEFAULT 0,
  `nup_beg_remove_secs` float(14,2) DEFAULT 0.00,
  `nup_end_add_secs` float(14,2) DEFAULT 0.00,
  `nup_up_seconds` float(14,2) DEFAULT 0.00,
  `nup_down_seconds` float(14,2) DEFAULT 0.00,
  `ndwn_beg_remove_secs` float(14,2) DEFAULT 0.00,
  `ndwn_end_add_secs` float(14,2) DEFAULT 0.00,
  `ndwn_up_seconds` float(14,2) DEFAULT 0.00,
  `ndwn_down_seconds` float(14,2) DEFAULT 0.00,
  PRIMARY KEY (`mesh_id`),
  KEY `idx_rolling_last_hour_tree_tag_id` (`tree_tag_id`),
  KEY `idx_rolling_last_hour_tree_mesh_name` (`mesh_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rolling_last_hour`
--

LOCK TABLES `rolling_last_hour` WRITE;
/*!40000 ALTER TABLE `rolling_last_hour` DISABLE KEYS */;
INSERT INTO `rolling_last_hour` VALUES (1,1,'Demo1',0,0,0,0,0,0,0,0,0,0,0,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00);
/*!40000 ALTER TABLE `rolling_last_hour` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rolling_last_ninety_days`
--

DROP TABLE IF EXISTS `rolling_last_ninety_days`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rolling_last_ninety_days` (
  `mesh_id` int(11) NOT NULL,
  `tree_tag_id` int(11) DEFAULT NULL,
  `mesh_name` varchar(255) DEFAULT NULL,
  `tot_clients` bigint(20) DEFAULT 0,
  `tot_tx_bytes` bigint(20) DEFAULT 0,
  `tot_rx_bytes` bigint(20) DEFAULT 0,
  `tot_bytes` bigint(20) DEFAULT 0,
  `tot_nodes` bigint(20) DEFAULT 0,
  `tot_lv_nodes` bigint(20) DEFAULT 0,
  `tot_lv_nodes_down` bigint(20) DEFAULT 0,
  `tot_nodes_down` bigint(20) DEFAULT 0,
  `tot_nodes_up` bigint(20) DEFAULT 0,
  `dual_radios` bigint(20) DEFAULT 0,
  `single_radios` bigint(20) DEFAULT 0,
  `nup_beg_remove_secs` float(14,2) DEFAULT 0.00,
  `nup_end_add_secs` float(14,2) DEFAULT 0.00,
  `nup_up_seconds` float(14,2) DEFAULT 0.00,
  `nup_down_seconds` float(14,2) DEFAULT 0.00,
  `ndwn_beg_remove_secs` float(14,2) DEFAULT 0.00,
  `ndwn_end_add_secs` float(14,2) DEFAULT 0.00,
  `ndwn_up_seconds` float(14,2) DEFAULT 0.00,
  `ndwn_down_seconds` float(14,2) DEFAULT 0.00,
  PRIMARY KEY (`mesh_id`),
  KEY `idx_rolling_last_ninety_days_tree_tag_id` (`tree_tag_id`),
  KEY `idx_rolling_last_ninety_days_mesh_name` (`mesh_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rolling_last_ninety_days`
--

LOCK TABLES `rolling_last_ninety_days` WRITE;
/*!40000 ALTER TABLE `rolling_last_ninety_days` DISABLE KEYS */;
INSERT INTO `rolling_last_ninety_days` VALUES (1,1,'Demo1',0,0,0,0,0,0,0,0,0,0,0,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00);
/*!40000 ALTER TABLE `rolling_last_ninety_days` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rolling_last_seven_days`
--

DROP TABLE IF EXISTS `rolling_last_seven_days`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rolling_last_seven_days` (
  `mesh_id` int(11) NOT NULL,
  `tree_tag_id` int(11) DEFAULT NULL,
  `mesh_name` varchar(255) DEFAULT NULL,
  `tot_clients` bigint(20) DEFAULT 0,
  `tot_tx_bytes` bigint(20) DEFAULT 0,
  `tot_rx_bytes` bigint(20) DEFAULT 0,
  `tot_bytes` bigint(20) DEFAULT 0,
  `tot_nodes` bigint(20) DEFAULT 0,
  `tot_lv_nodes` bigint(20) DEFAULT 0,
  `tot_lv_nodes_down` bigint(20) DEFAULT 0,
  `tot_nodes_down` bigint(20) DEFAULT 0,
  `tot_nodes_up` bigint(20) DEFAULT 0,
  `dual_radios` bigint(20) DEFAULT 0,
  `single_radios` bigint(20) DEFAULT 0,
  `nup_beg_remove_secs` float(14,2) DEFAULT 0.00,
  `nup_end_add_secs` float(14,2) DEFAULT 0.00,
  `nup_up_seconds` float(14,2) DEFAULT 0.00,
  `nup_down_seconds` float(14,2) DEFAULT 0.00,
  `ndwn_beg_remove_secs` float(14,2) DEFAULT 0.00,
  `ndwn_end_add_secs` float(14,2) DEFAULT 0.00,
  `ndwn_up_seconds` float(14,2) DEFAULT 0.00,
  `ndwn_down_seconds` float(14,2) DEFAULT 0.00,
  PRIMARY KEY (`mesh_id`),
  KEY `idx_rolling_last_seven_days_tree_tag_id` (`tree_tag_id`),
  KEY `idx_rolling_last_seven_days_mesh_name` (`mesh_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rolling_last_seven_days`
--

LOCK TABLES `rolling_last_seven_days` WRITE;
/*!40000 ALTER TABLE `rolling_last_seven_days` DISABLE KEYS */;
INSERT INTO `rolling_last_seven_days` VALUES (1,1,'Demo1',0,0,0,0,0,0,0,0,0,0,0,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00);
/*!40000 ALTER TABLE `rolling_last_seven_days` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rolling_last_sixty_days`
--

DROP TABLE IF EXISTS `rolling_last_sixty_days`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rolling_last_sixty_days` (
  `mesh_id` int(11) NOT NULL,
  `tree_tag_id` int(11) DEFAULT NULL,
  `mesh_name` varchar(255) DEFAULT NULL,
  `tot_clients` bigint(20) DEFAULT 0,
  `tot_tx_bytes` bigint(20) DEFAULT 0,
  `tot_rx_bytes` bigint(20) DEFAULT 0,
  `tot_bytes` bigint(20) DEFAULT 0,
  `tot_nodes` bigint(20) DEFAULT 0,
  `tot_lv_nodes` bigint(20) DEFAULT 0,
  `tot_lv_nodes_down` bigint(20) DEFAULT 0,
  `tot_nodes_down` bigint(20) DEFAULT 0,
  `tot_nodes_up` bigint(20) DEFAULT 0,
  `dual_radios` bigint(20) DEFAULT 0,
  `single_radios` bigint(20) DEFAULT 0,
  `nup_beg_remove_secs` float(14,2) DEFAULT 0.00,
  `nup_end_add_secs` float(14,2) DEFAULT 0.00,
  `nup_up_seconds` float(14,2) DEFAULT 0.00,
  `nup_down_seconds` float(14,2) DEFAULT 0.00,
  `ndwn_beg_remove_secs` float(14,2) DEFAULT 0.00,
  `ndwn_end_add_secs` float(14,2) DEFAULT 0.00,
  `ndwn_up_seconds` float(14,2) DEFAULT 0.00,
  `ndwn_down_seconds` float(14,2) DEFAULT 0.00,
  PRIMARY KEY (`mesh_id`),
  KEY `idx_rolling_last_sixty_days_tree_tag_id` (`tree_tag_id`),
  KEY `idx_rolling_last_sixty_days_mesh_name` (`mesh_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rolling_last_sixty_days`
--

LOCK TABLES `rolling_last_sixty_days` WRITE;
/*!40000 ALTER TABLE `rolling_last_sixty_days` DISABLE KEYS */;
INSERT INTO `rolling_last_sixty_days` VALUES (1,1,'Demo1',0,0,0,0,0,0,0,0,0,0,0,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00);
/*!40000 ALTER TABLE `rolling_last_sixty_days` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rolling_last_thirty_days`
--

DROP TABLE IF EXISTS `rolling_last_thirty_days`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rolling_last_thirty_days` (
  `mesh_id` int(11) NOT NULL,
  `tree_tag_id` int(11) DEFAULT NULL,
  `mesh_name` varchar(255) DEFAULT NULL,
  `tot_clients` bigint(20) DEFAULT 0,
  `tot_tx_bytes` bigint(20) DEFAULT 0,
  `tot_rx_bytes` bigint(20) DEFAULT 0,
  `tot_bytes` bigint(20) DEFAULT 0,
  `tot_nodes` bigint(20) DEFAULT 0,
  `tot_lv_nodes` bigint(20) DEFAULT 0,
  `tot_lv_nodes_down` bigint(20) DEFAULT 0,
  `tot_nodes_down` bigint(20) DEFAULT 0,
  `tot_nodes_up` bigint(20) DEFAULT 0,
  `dual_radios` bigint(20) DEFAULT 0,
  `single_radios` bigint(20) DEFAULT 0,
  `nup_beg_remove_secs` float(14,2) DEFAULT 0.00,
  `nup_end_add_secs` float(14,2) DEFAULT 0.00,
  `nup_up_seconds` float(14,2) DEFAULT 0.00,
  `nup_down_seconds` float(14,2) DEFAULT 0.00,
  `ndwn_beg_remove_secs` float(14,2) DEFAULT 0.00,
  `ndwn_end_add_secs` float(14,2) DEFAULT 0.00,
  `ndwn_up_seconds` float(14,2) DEFAULT 0.00,
  `ndwn_down_seconds` float(14,2) DEFAULT 0.00,
  PRIMARY KEY (`mesh_id`),
  KEY `idx_rolling_last_thirty_days_tree_tag_id` (`tree_tag_id`),
  KEY `idx_rolling_last_thirty_days_mesh_name` (`mesh_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rolling_last_thirty_days`
--

LOCK TABLES `rolling_last_thirty_days` WRITE;
/*!40000 ALTER TABLE `rolling_last_thirty_days` DISABLE KEYS */;
INSERT INTO `rolling_last_thirty_days` VALUES (1,1,'Demo1',0,0,0,0,0,0,0,0,0,0,0,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00);
/*!40000 ALTER TABLE `rolling_last_thirty_days` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedule_entries`
--

DROP TABLE IF EXISTS `schedule_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `schedule_entries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `schedule_id` int(11) DEFAULT NULL,
  `description` varchar(255) NOT NULL DEFAULT '',
  `type` enum('predefined_command','command') DEFAULT 'command',
  `command` varchar(255) NOT NULL DEFAULT '',
  `predefined_command_id` int(11) DEFAULT NULL,
  `mo` tinyint(1) NOT NULL DEFAULT 0,
  `tu` tinyint(1) NOT NULL DEFAULT 0,
  `we` tinyint(1) NOT NULL DEFAULT 0,
  `th` tinyint(1) NOT NULL DEFAULT 0,
  `fr` tinyint(1) NOT NULL DEFAULT 0,
  `sa` tinyint(1) NOT NULL DEFAULT 0,
  `su` tinyint(1) NOT NULL DEFAULT 0,
  `event_time` varchar(10) NOT NULL DEFAULT '',
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule_entries`
--

LOCK TABLES `schedule_entries` WRITE;
/*!40000 ALTER TABLE `schedule_entries` DISABLE KEYS */;
/*!40000 ALTER TABLE `schedule_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedules`
--

DROP TABLE IF EXISTS `schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` char(64) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `available_to_siblings` tinyint(1) NOT NULL DEFAULT 0,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedules`
--

LOCK TABLES `schedules` WRITE;
/*!40000 ALTER TABLE `schedules` DISABLE KEYS */;
/*!40000 ALTER TABLE `schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sites`
--

DROP TABLE IF EXISTS `sites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `cloud_id` int(11) DEFAULT NULL,
  `lat` decimal(11,8) DEFAULT NULL,
  `lng` decimal(11,8) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sites`
--

LOCK TABLES `sites` WRITE;
/*!40000 ALTER TABLE `sites` DISABLE KEYS */;
INSERT INTO `sites` VALUES (1,'Site Demo1',1,-26.53363500,28.05182900,'2021-10-25 22:48:48','2021-10-26 11:06:55');
/*!40000 ALTER TABLE `sites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `social_login_user_realms`
--

DROP TABLE IF EXISTS `social_login_user_realms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `social_login_user_realms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `social_login_user_id` int(11) DEFAULT NULL,
  `realm_id` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `social_login_user_realms`
--

LOCK TABLES `social_login_user_realms` WRITE;
/*!40000 ALTER TABLE `social_login_user_realms` DISABLE KEYS */;
/*!40000 ALTER TABLE `social_login_user_realms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `social_login_users`
--

DROP TABLE IF EXISTS `social_login_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `social_login_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `provider` enum('Facebook','Google','Twitter') DEFAULT 'Facebook',
  `uid` varchar(100) NOT NULL DEFAULT '',
  `name` varchar(100) NOT NULL DEFAULT '',
  `first_name` varchar(100) NOT NULL DEFAULT '',
  `last_name` varchar(100) NOT NULL DEFAULT '',
  `email` varchar(100) NOT NULL DEFAULT '',
  `image` varchar(100) NOT NULL DEFAULT '',
  `locale` varchar(5) NOT NULL DEFAULT '',
  `timezone` tinyint(1) NOT NULL DEFAULT 0,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female') DEFAULT 'male',
  `last_connect_time` datetime DEFAULT NULL,
  `extra_name` varchar(100) NOT NULL DEFAULT '',
  `extra_value` varchar(100) NOT NULL DEFAULT '',
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `social_login_users`
--

LOCK TABLES `social_login_users` WRITE;
/*!40000 ALTER TABLE `social_login_users` DISABLE KEYS */;
/*!40000 ALTER TABLE `social_login_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `softflows`
--

DROP TABLE IF EXISTS `softflows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `softflows` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dynamic_client_id` int(11) DEFAULT NULL,
  `username` varchar(64) DEFAULT NULL,
  `src_mac` varchar(64) DEFAULT NULL,
  `src_ip` varchar(64) DEFAULT NULL,
  `dst_ip` varchar(64) DEFAULT NULL,
  `src_port` int(11) DEFAULT NULL,
  `dst_port` int(11) DEFAULT NULL,
  `proto` int(11) DEFAULT NULL,
  `pckt_in` int(11) DEFAULT NULL,
  `pckt_out` int(11) DEFAULT NULL,
  `oct_in` bigint(20) DEFAULT NULL,
  `oct_out` bigint(20) DEFAULT NULL,
  `start` datetime DEFAULT NULL,
  `finish` datetime DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `softflows`
--

LOCK TABLES `softflows` WRITE;
/*!40000 ALTER TABLE `softflows` DISABLE KEYS */;
/*!40000 ALTER TABLE `softflows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ssids`
--

DROP TABLE IF EXISTS `ssids`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ssids` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL DEFAULT '',
  `available_to_siblings` tinyint(1) NOT NULL DEFAULT 1,
  `user_id` int(11) DEFAULT NULL,
  `extra_name` varchar(100) NOT NULL DEFAULT '',
  `extra_value` varchar(100) NOT NULL DEFAULT '',
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ssids`
--

LOCK TABLES `ssids` WRITE;
/*!40000 ALTER TABLE `ssids` DISABLE KEYS */;
/*!40000 ALTER TABLE `ssids` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tag_notes`
--

DROP TABLE IF EXISTS `tag_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tag_notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tag_id` int(11) NOT NULL,
  `note_id` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tag_notes`
--

LOCK TABLES `tag_notes` WRITE;
/*!40000 ALTER TABLE `tag_notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `tag_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  `available_to_siblings` tinyint(1) NOT NULL DEFAULT 1,
  `user_id` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `temp_flow_logs`
--

DROP TABLE IF EXISTS `temp_flow_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `temp_flow_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `node_id` int(11) DEFAULT NULL,
  `mesh_id` int(11) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `proto` int(11) NOT NULL,
  `src_mac` varchar(255) NOT NULL,
  `src_ip` varchar(255) NOT NULL,
  `src_port` int(11) NOT NULL,
  `dst_ip` varchar(255) NOT NULL,
  `dst_port` int(11) NOT NULL,
  `oct_in` int(11) NOT NULL,
  `pckt_in` int(11) NOT NULL,
  `oct_out` int(11) NOT NULL,
  `pckt_out` int(11) NOT NULL,
  `start` datetime NOT NULL,
  `finish` datetime NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `temp_flow_logs`
--

LOCK TABLES `temp_flow_logs` WRITE;
/*!40000 ALTER TABLE `temp_flow_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `temp_flow_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `temp_proxy_logs`
--

DROP TABLE IF EXISTS `temp_proxy_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `temp_proxy_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `node_id` int(11) DEFAULT NULL,
  `mesh_id` int(11) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `host` varchar(255) NOT NULL,
  `source_ip` varchar(255) NOT NULL,
  `mac` varchar(255) NOT NULL,
  `full_string` text DEFAULT NULL,
  `full_url` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2072 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `temp_proxy_logs`
--

LOCK TABLES `temp_proxy_logs` WRITE;
/*!40000 ALTER TABLE `temp_proxy_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `temp_proxy_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `temp_reports`
--

DROP TABLE IF EXISTS `temp_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `temp_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mesh_id` int(11) NOT NULL,
  `node_id` int(11) NOT NULL,
  `ap_id` int(11) NOT NULL,
  `ap_profile_id` int(11) NOT NULL,
  `report` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `temp_reports`
--

LOCK TABLES `temp_reports` WRITE;
/*!40000 ALTER TABLE `temp_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `temp_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `template_attributes`
--

DROP TABLE IF EXISTS `template_attributes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `template_attributes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `template_id` int(11) DEFAULT NULL,
  `attribute` varchar(128) NOT NULL,
  `type` enum('Check','Reply') DEFAULT 'Check',
  `tooltip` varchar(200) NOT NULL,
  `unit` varchar(100) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `template_attributes`
--

LOCK TABLES `template_attributes` WRITE;
/*!40000 ALTER TABLE `template_attributes` DISABLE KEYS */;
/*!40000 ALTER TABLE `template_attributes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `template_notes`
--

DROP TABLE IF EXISTS `template_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `template_notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `template_id` int(11) NOT NULL,
  `note_id` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `template_notes`
--

LOCK TABLES `template_notes` WRITE;
/*!40000 ALTER TABLE `template_notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `template_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `templates`
--

DROP TABLE IF EXISTS `templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  `available_to_siblings` tinyint(1) NOT NULL DEFAULT 1,
  `user_id` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `templates`
--

LOCK TABLES `templates` WRITE;
/*!40000 ALTER TABLE `templates` DISABLE KEYS */;
/*!40000 ALTER TABLE `templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timezones`
--

DROP TABLE IF EXISTS `timezones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timezones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `value` varchar(64) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=397 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timezones`
--

LOCK TABLES `timezones` WRITE;
/*!40000 ALTER TABLE `timezones` DISABLE KEYS */;
INSERT INTO `timezones` VALUES (1,'Africa/Abidjan','GMT0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(2,'Africa/Accra','GMT0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(3,'Africa/Addis_Ababa','EAT-3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(4,'Africa/Algiers','CET-1','2020-06-02 08:58:48','2020-06-02 08:58:48'),(5,'Africa/Asmara','EAT-3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(6,'Africa/Bamako','GMT0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(7,'Africa/Bangui','WAT-1','2020-06-02 08:58:48','2020-06-02 08:58:48'),(8,'Africa/Banjul','GMT0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(9,'Africa/Bissau','GMT0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(10,'Africa/Blantyre','CAT-2','2020-06-02 08:58:48','2020-06-02 08:58:48'),(12,'Africa/Bujumbura','CAT-2','2020-06-02 08:58:48','2020-06-02 08:58:48'),(13,'Africa/Casablanca','WET0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(14,'Africa/Ceuta','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(15,'Africa/Conakry','GMT0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(16,'Africa/Dakar','GMT0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(17,'Africa/Dar_es_Salaam','EAT-3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(18,'Africa/Djibouti','EAT-3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(19,'Africa/Douala','WAT-1','2020-06-02 08:58:48','2020-06-02 08:58:48'),(20,'Africa/El_Aaiun','WET0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(21,'Africa/Freetown','GMT0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(22,'Africa/Gaborone','CAT-2','2020-06-02 08:58:48','2020-06-02 08:58:48'),(23,'Africa/Harare','CAT-2','2020-06-02 08:58:48','2020-06-02 08:58:48'),(24,'Africa/Johannesburg','SAST-2','2020-06-02 08:58:48','2020-06-02 08:58:48'),(25,'Africa/Kampala','EAT-3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(26,'Africa/Khartoum','EAT-3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(27,'Africa/Kigali','CAT-2','2020-06-02 08:58:48','2020-06-02 08:58:48'),(28,'Africa/Kinshasa','WAT-1','2020-06-02 08:58:48','2020-06-02 08:58:48'),(29,'Africa/Lagos','WAT-1','2020-06-02 08:58:48','2020-06-02 08:58:48'),(30,'Africa/Libreville','WAT-1','2020-06-02 08:58:48','2020-06-02 08:58:48'),(31,'Africa/Lome','GMT0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(32,'Africa/Luanda','WAT-1','2020-06-02 08:58:48','2020-06-02 08:58:48'),(33,'Africa/Lubumbashi','CAT-2','2020-06-02 08:58:48','2020-06-02 08:58:48'),(34,'Africa/Lusaka','CAT-2','2020-06-02 08:58:48','2020-06-02 08:58:48'),(35,'Africa/Malabo','WAT-1','2020-06-02 08:58:48','2020-06-02 08:58:48'),(36,'Africa/Maputo','CAT-2','2020-06-02 08:58:48','2020-06-02 08:58:48'),(37,'Africa/Maseru','SAST-2','2020-06-02 08:58:48','2020-06-02 08:58:48'),(38,'Africa/Mbabane','SAST-2','2020-06-02 08:58:48','2020-06-02 08:58:48'),(39,'Africa/Mogadishu','EAT-3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(40,'Africa/Monrovia','GMT0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(41,'Africa/Nairobi','EAT-3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(42,'Africa/Ndjamena','WAT-1','2020-06-02 08:58:48','2020-06-02 08:58:48'),(43,'Africa/Niamey','WAT-1','2020-06-02 08:58:48','2020-06-02 08:58:48'),(44,'Africa/Nouakchott','GMT0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(45,'Africa/Ouagadougou','GMT0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(46,'Africa/Porto-Novo','WAT-1','2020-06-02 08:58:48','2020-06-02 08:58:48'),(47,'Africa/Sao_Tome','GMT0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(48,'Africa/Tripoli','EET-2','2020-06-02 08:58:48','2020-06-02 08:58:48'),(49,'Africa/Tunis','CET-1','2020-06-02 08:58:48','2020-06-02 08:58:48'),(50,'Africa/Windhoek','WAT-1WAST,M9.1.0,M4.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(51,'America/Adak','HAST10HADT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(52,'America/Anchorage','AKST9AKDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(53,'America/Anguilla','AST4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(54,'America/Antigua','AST4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(55,'America/Araguaina','BRT3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(56,'America/Argentina/Buenos_Aires','ART3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(57,'America/Argentina/Catamarca','ART3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(58,'America/Argentina/Cordoba','ART3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(59,'America/Argentina/Jujuy','ART3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(60,'America/Argentina/La_Rioja','ART3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(61,'America/Argentina/Mendoza','ART3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(62,'America/Argentina/Rio_Gallegos','ART3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(63,'America/Argentina/Salta','ART3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(64,'America/Argentina/San_Juan','ART3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(65,'America/Argentina/Tucuman','ART3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(66,'America/Argentina/Ushuaia','ART3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(67,'America/Aruba','AST4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(68,'America/Asuncion','PYT4PYST,M10.1.0/0,M4.2.0/0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(69,'America/Atikokan','EST5','2020-06-02 08:58:48','2020-06-02 08:58:48'),(70,'America/Bahia','BRT3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(71,'America/Barbados','AST4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(72,'America/Belem','BRT3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(73,'America/Belize','CST6','2020-06-02 08:58:48','2020-06-02 08:58:48'),(74,'America/Blanc-Sablon','AST4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(75,'America/Boa_Vista','AMT4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(76,'America/Bogota','COT5','2020-06-02 08:58:48','2020-06-02 08:58:48'),(77,'America/Boise','MST7MDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(78,'America/Cambridge_Bay','MST7MDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(79,'America/Campo_Grande','AMT4AMST,M10.3.0/0,M2.3.0/0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(80,'America/Cancun','CST6CDT,M4.1.0,M10.5.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(81,'America/Cayenne','GFT3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(82,'America/Cayman','EST5','2020-06-02 08:58:48','2020-06-02 08:58:48'),(83,'America/Chicago','CST6CDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(84,'America/Chihuahua','MST7MDT,M4.1.0,M10.5.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(85,'America/Costa_Rica','CST6','2020-06-02 08:58:48','2020-06-02 08:58:48'),(86,'America/Cuiaba','AMT4AMST,M10.3.0/0,M2.3.0/0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(87,'America/Curacao','AST4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(88,'America/Danmarkshavn','GMT0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(89,'America/Dawson','PST8PDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(90,'America/Dawson_Creek','MST7','2020-06-02 08:58:48','2020-06-02 08:58:48'),(91,'America/Denver','MST7MDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(92,'America/Detroit','EST5EDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(93,'America/Dominica','AST4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(94,'America/Edmonton','MST7MDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(95,'America/Eirunepe','AMT4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(96,'America/El_Salvador','CST6','2020-06-02 08:58:48','2020-06-02 08:58:48'),(97,'America/Fortaleza','BRT3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(98,'America/Glace_Bay','AST4ADT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(99,'America/Goose_Bay','AST4ADT,M3.2.0/0:01,M11.1.0/0:01','2020-06-02 08:58:48','2020-06-02 08:58:48'),(100,'America/Grand_Turk','EST5EDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(101,'America/Grenada','AST4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(102,'America/Guadeloupe','AST4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(103,'America/Guatemala','CST6','2020-06-02 08:58:48','2020-06-02 08:58:48'),(104,'America/Guayaquil','ECT5','2020-06-02 08:58:48','2020-06-02 08:58:48'),(105,'America/Guyana','GYT4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(106,'America/Halifax','AST4ADT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(107,'America/Havana','CST5CDT,M3.2.0/0,M10.5.0/1','2020-06-02 08:58:48','2020-06-02 08:58:48'),(108,'America/Hermosillo','MST7','2020-06-02 08:58:48','2020-06-02 08:58:48'),(109,'America/Indiana/Indianapolis','EST5EDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(110,'America/Indiana/Knox','CST6CDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(111,'America/Indiana/Marengo','EST5EDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(112,'America/Indiana/Petersburg','EST5EDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(113,'America/Indiana/Tell_City','CST6CDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(114,'America/Indiana/Vevay','EST5EDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(115,'America/Indiana/Vincennes','EST5EDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(116,'America/Indiana/Winamac','EST5EDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(117,'America/Inuvik','MST7MDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(118,'America/Iqaluit','EST5EDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(119,'America/Jamaica','EST5','2020-06-02 08:58:48','2020-06-02 08:58:48'),(120,'America/Juneau','AKST9AKDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(121,'America/Kentucky/Louisville','EST5EDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(122,'America/Kentucky/Monticello','EST5EDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(123,'America/La_Paz','BOT4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(124,'America/Lima','PET5','2020-06-02 08:58:48','2020-06-02 08:58:48'),(125,'America/Los_Angeles','PST8PDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(126,'America/Maceio','BRT3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(127,'America/Managua','CST6','2020-06-02 08:58:48','2020-06-02 08:58:48'),(128,'America/Manaus','AMT4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(129,'America/Marigot','AST4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(130,'America/Martinique','AST4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(131,'America/Matamoros','CST6CDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(132,'America/Mazatlan','MST7MDT,M4.1.0,M10.5.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(133,'America/Menominee','CST6CDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(134,'America/Merida','CST6CDT,M4.1.0,M10.5.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(135,'America/Mexico_City','CST6CDT,M4.1.0,M10.5.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(136,'America/Miquelon','PMST3PMDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(137,'America/Moncton','AST4ADT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(138,'America/Monterrey','CST6CDT,M4.1.0,M10.5.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(139,'America/Montevideo','UYT3UYST,M10.1.0,M3.2.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(140,'America/Montreal','EST5EDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(141,'America/Montserrat','AST4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(142,'America/Nassau','EST5EDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(143,'America/New_York','EST5EDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(144,'America/Nipigon','EST5EDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(145,'America/Nome','AKST9AKDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(146,'America/Noronha','FNT2','2020-06-02 08:58:48','2020-06-02 08:58:48'),(147,'America/North_Dakota/Center','CST6CDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(148,'America/North_Dakota/New_Salem','CST6CDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(149,'America/Ojinaga','MST7MDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(150,'America/Panama','EST5','2020-06-02 08:58:48','2020-06-02 08:58:48'),(151,'America/Pangnirtung','EST5EDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(152,'America/Paramaribo','SRT3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(153,'America/Phoenix','MST7','2020-06-02 08:58:48','2020-06-02 08:58:48'),(154,'America/Port_of_Spain','AST4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(155,'America/Port-au-Prince','EST5','2020-06-02 08:58:48','2020-06-02 08:58:48'),(156,'America/Porto_Velho','AMT4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(157,'America/Puerto_Rico','AST4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(158,'America/Rainy_River','CST6CDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(159,'America/Rankin_Inlet','CST6CDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(160,'America/Recife','BRT3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(161,'America/Regina','CST6','2020-06-02 08:58:48','2020-06-02 08:58:48'),(162,'America/Rio_Branco','AMT4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(163,'America/Santa_Isabel','PST8PDT,M4.1.0,M10.5.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(164,'America/Santarem','BRT3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(165,'America/Santo_Domingo','AST4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(166,'America/Sao_Paulo','BRT3BRST,M10.3.0/0,M2.3.0/0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(167,'America/Scoresbysund','EGT1EGST,M3.5.0/0,M10.5.0/1','2020-06-02 08:58:48','2020-06-02 08:58:48'),(168,'America/Shiprock','MST7MDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(169,'America/St_Barthelemy','AST4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(170,'America/St_Johns','NST3:30NDT,M3.2.0/0:01,M11.1.0/0:01','2020-06-02 08:58:48','2020-06-02 08:58:48'),(171,'America/St_Kitts','AST4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(172,'America/St_Lucia','AST4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(173,'America/St_Thomas','AST4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(174,'America/St_Vincent','AST4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(175,'America/Swift_Current','CST6','2020-06-02 08:58:48','2020-06-02 08:58:48'),(176,'America/Tegucigalpa','CST6','2020-06-02 08:58:48','2020-06-02 08:58:48'),(177,'America/Thule','AST4ADT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(178,'America/Thunder_Bay','EST5EDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(179,'America/Tijuana','PST8PDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(180,'America/Toronto','EST5EDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(181,'America/Tortola','AST4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(182,'America/Vancouver','PST8PDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(183,'America/Whitehorse','PST8PDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(184,'America/Winnipeg','CST6CDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(185,'America/Yakutat','AKST9AKDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(186,'America/Yellowknife','MST7MDT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(187,'Antarctica/Casey','WST-8','2020-06-02 08:58:48','2020-06-02 08:58:48'),(188,'Antarctica/Davis','DAVT-7','2020-06-02 08:58:48','2020-06-02 08:58:48'),(189,'Antarctica/DumontDUrville','DDUT-10','2020-06-02 08:58:48','2020-06-02 08:58:48'),(190,'Antarctica/Macquarie','MIST-11','2020-06-02 08:58:48','2020-06-02 08:58:48'),(191,'Antarctica/Mawson','MAWT-5','2020-06-02 08:58:48','2020-06-02 08:58:48'),(192,'Antarctica/McMurdo','NZST-12NZDT,M9.5.0,M4.1.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(193,'Antarctica/Rothera','ROTT3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(194,'Antarctica/South_Pole','NZST-12NZDT,M9.5.0,M4.1.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(195,'Antarctica/Syowa','SYOT-3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(196,'Antarctica/Vostok','VOST-6','2020-06-02 08:58:48','2020-06-02 08:58:48'),(197,'Arctic/Longyearbyen','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(198,'Asia/Aden','AST-3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(199,'Asia/Almaty','ALMT-6','2020-06-02 08:58:48','2020-06-02 08:58:48'),(200,'Asia/Anadyr','ANAT-11ANAST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(201,'Asia/Aqtau','AQTT-5','2020-06-02 08:58:48','2020-06-02 08:58:48'),(202,'Asia/Aqtobe','AQTT-5','2020-06-02 08:58:48','2020-06-02 08:58:48'),(203,'Asia/Ashgabat','TMT-5','2020-06-02 08:58:48','2020-06-02 08:58:48'),(204,'Asia/Baghdad','AST-3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(205,'Asia/Bahrain','AST-3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(206,'Asia/Baku','AZT-4AZST,M3.5.0/4,M10.5.0/5','2020-06-02 08:58:48','2020-06-02 08:58:48'),(207,'Asia/Bangkok','ICT-7','2020-06-02 08:58:48','2020-06-02 08:58:48'),(208,'Asia/Beirut','EET-2EEST,M3.5.0/0,M10.5.0/0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(209,'Asia/Bishkek','KGT-6','2020-06-02 08:58:48','2020-06-02 08:58:48'),(210,'Asia/Brunei','BNT-8','2020-06-02 08:58:48','2020-06-02 08:58:48'),(211,'Asia/Choibalsan','CHOT-8','2020-06-02 08:58:48','2020-06-02 08:58:48'),(212,'Asia/Chongqing','CST-8','2020-06-02 08:58:48','2020-06-02 08:58:48'),(213,'Asia/Colombo','IST-5:30','2020-06-02 08:58:48','2020-06-02 08:58:48'),(214,'Asia/Damascus','EET-2EEST,M4.1.5/0,M10.5.5/0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(215,'Asia/Dhaka','BDT-6','2020-06-02 08:58:48','2020-06-02 08:58:48'),(216,'Asia/Dili','TLT-9','2020-06-02 08:58:48','2020-06-02 08:58:48'),(217,'Asia/Dubai','GST-4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(218,'Asia/Dushanbe','TJT-5','2020-06-02 08:58:48','2020-06-02 08:58:48'),(219,'Asia/Gaza','EET-2EEST,M3.5.6/0:01,M9.1.5','2020-06-02 08:58:48','2020-06-02 08:58:48'),(220,'Asia/Harbin','CST-8','2020-06-02 08:58:48','2020-06-02 08:58:48'),(221,'Asia/Ho_Chi_Minh','ICT-7','2020-06-02 08:58:48','2020-06-02 08:58:48'),(222,'Asia/Hong_Kong','HKT-8','2020-06-02 08:58:48','2020-06-02 08:58:48'),(223,'Asia/Hovd','HOVT-7','2020-06-02 08:58:48','2020-06-02 08:58:48'),(224,'Asia/Irkutsk','IRKT-8IRKST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(225,'Asia/Jakarta','WIT-7','2020-06-02 08:58:48','2020-06-02 08:58:48'),(226,'Asia/Jayapura','EIT-9','2020-06-02 08:58:48','2020-06-02 08:58:48'),(227,'Asia/Kabul','AFT-4:30','2020-06-02 08:58:48','2020-06-02 08:58:48'),(228,'Asia/Kamchatka','PETT-11PETST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(229,'Asia/Karachi','PKT-5','2020-06-02 08:58:48','2020-06-02 08:58:48'),(230,'Asia/Kashgar','CST-8','2020-06-02 08:58:48','2020-06-02 08:58:48'),(231,'Asia/Kathmandu','NPT-5:45','2020-06-02 08:58:48','2020-06-02 08:58:48'),(232,'Asia/Kolkata','IST-5:30','2020-06-02 08:58:48','2020-06-02 08:58:48'),(233,'Asia/Krasnoyarsk','KRAT-7KRAST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(234,'Asia/Kuala_Lumpur','MYT-8','2020-06-02 08:58:48','2020-06-02 08:58:48'),(235,'Asia/Kuching','MYT-8','2020-06-02 08:58:48','2020-06-02 08:58:48'),(236,'Asia/Kuwait','AST-3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(237,'Asia/Macau','CST-8','2020-06-02 08:58:48','2020-06-02 08:58:48'),(238,'Asia/Magadan','MAGT-11MAGST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(239,'Asia/Makassar','CIT-8','2020-06-02 08:58:48','2020-06-02 08:58:48'),(240,'Asia/Manila','PHT-8','2020-06-02 08:58:48','2020-06-02 08:58:48'),(241,'Asia/Muscat','GST-4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(242,'Asia/Nicosia','EET-2EEST,M3.5.0/3,M10.5.0/4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(243,'Asia/Novokuznetsk','NOVT-6NOVST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(244,'Asia/Novosibirsk','NOVT-6NOVST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(245,'Asia/Omsk','OMST-7','2020-06-02 08:58:48','2020-06-02 08:58:48'),(246,'Asia/Oral','ORAT-5','2020-06-02 08:58:48','2020-06-02 08:58:48'),(247,'Asia/Phnom_Penh','ICT-7','2020-06-02 08:58:48','2020-06-02 08:58:48'),(248,'Asia/Pontianak','WIT-7','2020-06-02 08:58:48','2020-06-02 08:58:48'),(249,'Asia/Pyongyang','KST-9','2020-06-02 08:58:48','2020-06-02 08:58:48'),(250,'Asia/Qatar','AST-3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(251,'Asia/Qyzylorda','QYZT-6','2020-06-02 08:58:48','2020-06-02 08:58:48'),(252,'Asia/Rangoon','MMT-6:30','2020-06-02 08:58:48','2020-06-02 08:58:48'),(253,'Asia/Riyadh','AST-3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(254,'Asia/Sakhalin','SAKT-10SAKST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(255,'Asia/Samarkand','UZT-5','2020-06-02 08:58:48','2020-06-02 08:58:48'),(256,'Asia/Seoul','KST-9','2020-06-02 08:58:48','2020-06-02 08:58:48'),(257,'Asia/Shanghai','CST-8','2020-06-02 08:58:48','2020-06-02 08:58:48'),(258,'Asia/Singapore','SGT-8','2020-06-02 08:58:48','2020-06-02 08:58:48'),(259,'Asia/Taipei','CST-8','2020-06-02 08:58:48','2020-06-02 08:58:48'),(260,'Asia/Tashkent','UZT-5','2020-06-02 08:58:48','2020-06-02 08:58:48'),(261,'Asia/Tbilisi','GET-4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(262,'Asia/Tehran','IRST-3:30IRDT,80/0,264/0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(263,'Asia/Thimphu','BTT-6','2020-06-02 08:58:48','2020-06-02 08:58:48'),(264,'Asia/Tokyo','JST-9','2020-06-02 08:58:48','2020-06-02 08:58:48'),(265,'Asia/Ulaanbaatar','ULAT-8','2020-06-02 08:58:48','2020-06-02 08:58:48'),(266,'Asia/Urumqi','CST-8','2020-06-02 08:58:48','2020-06-02 08:58:48'),(267,'Asia/Vientiane','ICT-7','2020-06-02 08:58:48','2020-06-02 08:58:48'),(268,'Asia/Vladivostok','VLAT-10VLAST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(269,'Asia/Yakutsk','YAKT-9YAKST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(270,'Asia/Yekaterinburg','YEKT-5YEKST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(271,'Asia/Yerevan','AMT-4AMST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(272,'Atlantic/Azores','AZOT1AZOST,M3.5.0/0,M10.5.0/1','2020-06-02 08:58:48','2020-06-02 08:58:48'),(273,'Atlantic/Bermuda','AST4ADT,M3.2.0,M11.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(274,'Atlantic/Canary','WET0WEST,M3.5.0/1,M10.5.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(275,'Atlantic/Cape_Verde','CVT1','2020-06-02 08:58:48','2020-06-02 08:58:48'),(276,'Atlantic/Faroe','WET0WEST,M3.5.0/1,M10.5.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(277,'Atlantic/Madeira','WET0WEST,M3.5.0/1,M10.5.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(278,'Atlantic/Reykjavik','GMT0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(279,'Atlantic/South_Georgia','GST2','2020-06-02 08:58:48','2020-06-02 08:58:48'),(280,'Atlantic/St_Helena','GMT0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(281,'Atlantic/Stanley','FKT4FKST,M9.1.0,M4.3.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(282,'Australia/Adelaide','CST-9:30CST,M10.1.0,M4.1.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(283,'Australia/Brisbane','EST-10','2020-06-02 08:58:48','2020-06-02 08:58:48'),(284,'Australia/Broken_Hill','CST-9:30CST,M10.1.0,M4.1.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(285,'Australia/Currie','EST-10EST,M10.1.0,M4.1.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(286,'Australia/Darwin','CST-9:30','2020-06-02 08:58:48','2020-06-02 08:58:48'),(287,'Australia/Eucla','CWST-8:45','2020-06-02 08:58:48','2020-06-02 08:58:48'),(288,'Australia/Hobart','EST-10EST,M10.1.0,M4.1.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(289,'Australia/Lindeman','EST-10','2020-06-02 08:58:48','2020-06-02 08:58:48'),(290,'Australia/Lord_Howe','LHST-10:30LHST-11,M10.1.0,M4.1.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(291,'Australia/Melbourne','EST-10EST,M10.1.0,M4.1.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(292,'Australia/Perth','WST-8','2020-06-02 08:58:48','2020-06-02 08:58:48'),(293,'Australia/Sydney','EST-10EST,M10.1.0,M4.1.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(294,'Europe/Amsterdam','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(295,'Europe/Andorra','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(296,'Europe/Athens','EET-2EEST,M3.5.0/3,M10.5.0/4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(297,'Europe/Belgrade','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(298,'Europe/Berlin','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(299,'Europe/Bratislava','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(300,'Europe/Brussels','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(301,'Europe/Bucharest','EET-2EEST,M3.5.0/3,M10.5.0/4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(302,'Europe/Budapest','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(303,'Europe/Chisinau','EET-2EEST,M3.5.0/3,M10.5.0/4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(304,'Europe/Copenhagen','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(305,'Europe/Dublin','GMT0IST,M3.5.0/1,M10.5.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(306,'Europe/Gibraltar','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(307,'Europe/Guernsey','GMT0BST,M3.5.0/1,M10.5.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(308,'Europe/Helsinki','EET-2EEST,M3.5.0/3,M10.5.0/4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(309,'Europe/Isle_of_Man','GMT0BST,M3.5.0/1,M10.5.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(310,'Europe/Istanbul','EET-2EEST,M3.5.0/3,M10.5.0/4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(311,'Europe/Jersey','GMT0BST,M3.5.0/1,M10.5.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(312,'Europe/Kaliningrad','EET-2EEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(313,'Europe/Kiev','EET-2EEST,M3.5.0/3,M10.5.0/4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(314,'Europe/Lisbon','WET0WEST,M3.5.0/1,M10.5.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(315,'Europe/Ljubljana','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(316,'Europe/London','GMT0BST,M3.5.0/1,M10.5.0','2020-06-02 08:58:48','2020-06-02 08:58:48'),(317,'Europe/Luxembourg','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(318,'Europe/Madrid','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(319,'Europe/Malta','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(320,'Europe/Mariehamn','EET-2EEST,M3.5.0/3,M10.5.0/4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(321,'Europe/Minsk','EET-2EEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(322,'Europe/Monaco','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(323,'Europe/Moscow','MSK-4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(324,'Europe/Oslo','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(325,'Europe/Paris','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(326,'Europe/Podgorica','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(327,'Europe/Prague','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(328,'Europe/Riga','EET-2EEST,M3.5.0/3,M10.5.0/4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(329,'Europe/Rome','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(330,'Europe/Samara','SAMT-3SAMST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(331,'Europe/San_Marino','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(332,'Europe/Sarajevo','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(333,'Europe/Simferopol','EET-2EEST,M3.5.0/3,M10.5.0/4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(334,'Europe/Skopje','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(335,'Europe/Sofia','EET-2EEST,M3.5.0/3,M10.5.0/4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(336,'Europe/Stockholm','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(337,'Europe/Tallinn','EET-2EEST,M3.5.0/3,M10.5.0/4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(338,'Europe/Tirane','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(339,'Europe/Uzhgorod','EET-2EEST,M3.5.0/3,M10.5.0/4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(340,'Europe/Vaduz','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(341,'Europe/Vatican','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(342,'Europe/Vienna','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(343,'Europe/Vilnius','EET-2EEST,M3.5.0/3,M10.5.0/4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(344,'Europe/Volgograd','VOLT-3VOLST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(345,'Europe/Warsaw','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(346,'Europe/Zagreb','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(347,'Europe/Zaporozhye','EET-2EEST,M3.5.0/3,M10.5.0/4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(348,'Europe/Zurich','CET-1CEST,M3.5.0,M10.5.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(349,'Indian/Antananarivo','EAT-3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(350,'Indian/Chagos','IOT-6','2020-06-02 08:58:48','2020-06-02 08:58:48'),(351,'Indian/Christmas','CXT-7','2020-06-02 08:58:48','2020-06-02 08:58:48'),(352,'Indian/Cocos','CCT-6:30','2020-06-02 08:58:48','2020-06-02 08:58:48'),(353,'Indian/Comoro','EAT-3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(354,'Indian/Kerguelen','TFT-5','2020-06-02 08:58:48','2020-06-02 08:58:48'),(355,'Indian/Mahe','SCT-4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(356,'Indian/Maldives','MVT-5','2020-06-02 08:58:48','2020-06-02 08:58:48'),(357,'Indian/Mauritius','MUT-4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(358,'Indian/Mayotte','EAT-3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(359,'Indian/Reunion','RET-4','2020-06-02 08:58:48','2020-06-02 08:58:48'),(360,'Pacific/Apia','WST11','2020-06-02 08:58:48','2020-06-02 08:58:48'),(361,'Pacific/Auckland','NZST-12NZDT,M9.5.0,M4.1.0/3','2020-06-02 08:58:48','2020-06-02 08:58:48'),(362,'Pacific/Chatham','CHAST-12:45CHADT,M9.5.0/2:45,M4.1.0/3:45','2020-06-02 08:58:48','2020-06-02 08:58:48'),(363,'Pacific/Efate','VUT-11','2020-06-02 08:58:48','2020-06-02 08:58:48'),(364,'Pacific/Enderbury','PHOT-13','2020-06-02 08:58:48','2020-06-02 08:58:48'),(365,'Pacific/Fakaofo','TKT10','2020-06-02 08:58:48','2020-06-02 08:58:48'),(366,'Pacific/Fiji','FJT-12','2020-06-02 08:58:48','2020-06-02 08:58:48'),(367,'Pacific/Funafuti','TVT-12','2020-06-02 08:58:48','2020-06-02 08:58:48'),(368,'Pacific/Galapagos','GALT6','2020-06-02 08:58:48','2020-06-02 08:58:48'),(369,'Pacific/Gambier','GAMT9','2020-06-02 08:58:48','2020-06-02 08:58:48'),(370,'Pacific/Guadalcanal','SBT-11','2020-06-02 08:58:48','2020-06-02 08:58:48'),(371,'Pacific/Guam','ChST-10','2020-06-02 08:58:48','2020-06-02 08:58:48'),(372,'Pacific/Honolulu','HST10','2020-06-02 08:58:48','2020-06-02 08:58:48'),(373,'Pacific/Johnston','HST10','2020-06-02 08:58:48','2020-06-02 08:58:48'),(374,'Pacific/Kiritimati','LINT-14','2020-06-02 08:58:48','2020-06-02 08:58:48'),(375,'Pacific/Kosrae','KOST-11','2020-06-02 08:58:48','2020-06-02 08:58:48'),(376,'Pacific/Kwajalein','MHT-12','2020-06-02 08:58:48','2020-06-02 08:58:48'),(377,'Pacific/Majuro','MHT-12','2020-06-02 08:58:48','2020-06-02 08:58:48'),(378,'Pacific/Marquesas','MART9:30','2020-06-02 08:58:48','2020-06-02 08:58:48'),(379,'Pacific/Midway','SST11','2020-06-02 08:58:48','2020-06-02 08:58:48'),(380,'Pacific/Nauru','NRT-12','2020-06-02 08:58:48','2020-06-02 08:58:48'),(381,'Pacific/Niue','NUT11','2020-06-02 08:58:48','2020-06-02 08:58:48'),(382,'Pacific/Norfolk','NFT-11:30','2020-06-02 08:58:48','2020-06-02 08:58:48'),(383,'Pacific/Noumea','NCT-11','2020-06-02 08:58:48','2020-06-02 08:58:48'),(384,'Pacific/Pago_Pago','SST11','2020-06-02 08:58:48','2020-06-02 08:58:48'),(385,'Pacific/Palau','PWT-9','2020-06-02 08:58:48','2020-06-02 08:58:48'),(386,'Pacific/Pitcairn','PST8','2020-06-02 08:58:48','2020-06-02 08:58:48'),(387,'Pacific/Ponape','PONT-11','2020-06-02 08:58:48','2020-06-02 08:58:48'),(388,'Pacific/Port_Moresby','PGT-10','2020-06-02 08:58:48','2020-06-02 08:58:48'),(389,'Pacific/Rarotonga','CKT10','2020-06-02 08:58:48','2020-06-02 08:58:48'),(390,'Pacific/Saipan','ChST-10','2020-06-02 08:58:48','2020-06-02 08:58:48'),(391,'Pacific/Tahiti','TAHT10','2020-06-02 08:58:48','2020-06-02 08:58:48'),(392,'Pacific/Tarawa','GILT-12','2020-06-02 08:58:48','2020-06-02 08:58:48'),(393,'Pacific/Tongatapu','TOT-13','2020-06-02 08:58:48','2020-06-02 08:58:48'),(394,'Pacific/Truk','TRUT-10','2020-06-02 08:58:48','2020-06-02 08:58:48'),(395,'Pacific/Wake','WAKT-12','2020-06-02 08:58:48','2020-06-02 08:58:48'),(396,'Pacific/Wallis','WFT-12','2020-06-02 08:58:48','2020-06-02 08:58:48');
/*!40000 ALTER TABLE `timezones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `top_up_transactions`
--

DROP TABLE IF EXISTS `top_up_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `top_up_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `permanent_user_id` int(11) DEFAULT NULL,
  `permanent_user` varchar(255) DEFAULT NULL,
  `top_up_id` int(11) DEFAULT NULL,
  `type` enum('data','time','days_to_use') DEFAULT 'data',
  `action` enum('create','update','delete') DEFAULT 'create',
  `radius_attribute` varchar(30) NOT NULL DEFAULT '',
  `old_value` varchar(30) DEFAULT NULL,
  `new_value` varchar(30) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `top_up_transactions`
--

LOCK TABLES `top_up_transactions` WRITE;
/*!40000 ALTER TABLE `top_up_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `top_up_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `top_ups`
--

DROP TABLE IF EXISTS `top_ups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `top_ups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `permanent_user_id` int(11) DEFAULT NULL,
  `data` bigint(11) DEFAULT NULL,
  `time` int(11) DEFAULT NULL,
  `days_to_use` int(11) DEFAULT NULL,
  `comment` varchar(255) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `type` enum('data','time','days_to_use') DEFAULT 'data',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `top_ups`
--

LOCK TABLES `top_ups` WRITE;
/*!40000 ALTER TABLE `top_ups` DISABLE KEYS */;
/*!40000 ALTER TABLE `top_ups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `traffic_classes`
--

DROP TABLE IF EXISTS `traffic_classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `traffic_classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `description` varchar(255) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `available_to_siblings` tinyint(1) NOT NULL DEFAULT 0,
  `content` text NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `traffic_classes`
--

LOCK TABLES `traffic_classes` WRITE;
/*!40000 ALTER TABLE `traffic_classes` DISABLE KEYS */;
/*!40000 ALTER TABLE `traffic_classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tree_tags`
--

DROP TABLE IF EXISTS `tree_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tree_tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `comment` varchar(255) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `lft` int(11) DEFAULT NULL,
  `rght` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `center_lat` decimal(10,8) DEFAULT NULL,
  `center_lng` decimal(11,8) DEFAULT NULL,
  `kml_file` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tree_tags_parent_id` (`parent_id`),
  KEY `idx_tree_tags_lft` (`lft`),
  KEY `idx_tree_tags_rght` (`rght`),
  KEY `idx_tree_tags_name` (`name`),
  KEY `idx_tree_tags_modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tree_tags`
--

LOCK TABLES `tree_tags` WRITE;
/*!40000 ALTER TABLE `tree_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `tree_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unknown_aps`
--

DROP TABLE IF EXISTS `unknown_aps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unknown_aps` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `mac` varchar(255) NOT NULL,
  `vendor` varchar(255) DEFAULT NULL,
  `last_contact_from_ip` varchar(255) DEFAULT NULL,
  `last_contact` datetime DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `new_server` varchar(255) NOT NULL DEFAULT '',
  `new_server_status` enum('awaiting','fetched','replied') DEFAULT 'awaiting',
  `name` varchar(255) NOT NULL DEFAULT '',
  `firmware_key_id` int(11) DEFAULT NULL,
  `new_server_protocol` enum('https','http') DEFAULT NULL,
  `new_mode` enum('ap','mesh') DEFAULT NULL,
  `new_mode_status` enum('awaiting','fetched','replied') DEFAULT 'awaiting',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unknown_aps`
--

LOCK TABLES `unknown_aps` WRITE;
/*!40000 ALTER TABLE `unknown_aps` DISABLE KEYS */;
/*!40000 ALTER TABLE `unknown_aps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unknown_dynamic_clients`
--

DROP TABLE IF EXISTS `unknown_dynamic_clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unknown_dynamic_clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nasidentifier` varchar(128) NOT NULL DEFAULT '',
  `calledstationid` varchar(128) NOT NULL DEFAULT '',
  `last_contact` datetime DEFAULT NULL,
  `last_contact_ip` varchar(128) NOT NULL DEFAULT '',
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nasidentifier` (`nasidentifier`),
  UNIQUE KEY `calledstationid` (`calledstationid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unknown_dynamic_clients`
--

LOCK TABLES `unknown_dynamic_clients` WRITE;
/*!40000 ALTER TABLE `unknown_dynamic_clients` DISABLE KEYS */;
/*!40000 ALTER TABLE `unknown_dynamic_clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unknown_nodes`
--

DROP TABLE IF EXISTS `unknown_nodes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unknown_nodes` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `mac` varchar(255) NOT NULL,
  `vendor` varchar(255) DEFAULT NULL,
  `from_ip` varchar(15) NOT NULL DEFAULT '',
  `gateway` tinyint(1) NOT NULL DEFAULT 1,
  `last_contact` datetime DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `new_server` varchar(255) NOT NULL DEFAULT '',
  `new_server_status` enum('awaiting','fetched','replied') DEFAULT 'awaiting',
  `name` varchar(255) NOT NULL DEFAULT '',
  `firmware_key_id` int(11) DEFAULT NULL,
  `new_server_protocol` enum('https','http') DEFAULT NULL,
  `new_mode` enum('ap','mesh') DEFAULT NULL,
  `new_mode_status` enum('awaiting','fetched','replied') DEFAULT 'awaiting',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unknown_nodes`
--

LOCK TABLES `unknown_nodes` WRITE;
/*!40000 ALTER TABLE `unknown_nodes` DISABLE KEYS */;
/*!40000 ALTER TABLE `unknown_nodes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_notes`
--

DROP TABLE IF EXISTS `user_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `note_id` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_notes_user_id` (`user_id`),
  KEY `idx_user_notes_note_id` (`note_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_notes`
--

LOCK TABLES `user_notes` WRITE;
/*!40000 ALTER TABLE `user_notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_settings`
--

DROP TABLE IF EXISTS `user_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `value` varchar(255) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_settings_user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=147 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_settings`
--

LOCK TABLES `user_settings` WRITE;
/*!40000 ALTER TABLE `user_settings` DISABLE KEYS */;
INSERT INTO `user_settings` VALUES (89,183,'notif_threshold','0','2019-09-20 04:21:02','2019-09-20 04:21:02'),(90,183,'notif_frequency','1','2019-09-20 04:21:02','2019-09-20 04:21:02'),(91,-1,'UserStatsLastRun','1641565802','2019-11-12 19:00:03','2022-01-07 14:30:02'),(101,44,'wl_active','1','2021-06-26 06:02:53','2021-06-26 06:02:53'),(102,44,'wl_header','RADIUSdesk','2021-06-26 06:02:53','2021-06-26 06:02:53'),(103,44,'wl_h_bg','ffffff','2021-06-26 06:02:53','2021-06-26 06:02:53'),(104,44,'wl_h_fg','005691','2021-06-26 06:02:53','2021-06-26 06:02:53'),(105,44,'wl_footer','RADIUSdesk','2021-06-26 06:02:53','2021-06-26 06:02:53'),(106,44,'wl_img_active','1','2021-06-26 06:02:53','2021-06-26 06:02:53'),(107,44,'wl_img_file','logo.png','2021-06-26 06:02:53','2021-06-26 06:02:53'),(108,44,'compact_view','1','2021-06-26 06:02:53','2021-06-26 06:02:53'),(109,44,'meshdesk_overview','1','2021-06-26 06:02:53','2021-06-26 06:02:53'),(110,-1,'password','admin','2021-06-26 06:47:40','2021-06-26 06:47:40'),(111,-1,'country','ZA','2021-06-26 06:47:40','2021-06-26 06:47:40'),(112,-1,'timezone','24','2021-06-26 06:47:40','2021-06-26 06:47:40'),(113,-1,'heartbeat_dead_after','900','2021-06-26 06:47:40','2021-10-25 22:12:37'),(114,-1,'cp_radius_1','192.168.8.220','2021-06-26 06:47:40','2021-10-25 22:12:37'),(115,-1,'cp_radius_2','','2021-06-26 06:47:40','2021-06-26 06:47:40'),(116,-1,'cp_radius_secret','testing123','2021-06-26 06:47:40','2021-06-26 06:47:40'),(117,-1,'cp_uam_url','http://192.168.8.220/cake3/rd_cake/dynamic-details/chilli-browser-detect/','2021-06-26 06:47:40','2021-10-25 22:12:37'),(118,-1,'cp_uam_secret','greatsecret','2021-06-26 06:47:40','2021-06-26 06:47:40'),(119,-1,'cp_swap_octet','cp_swap_octet','2021-06-26 06:47:40','2021-06-26 06:47:40'),(120,-1,'cp_mac_auth','cp_mac_auth','2021-06-26 06:47:40','2021-06-26 06:47:40'),(121,-1,'cp_coova_optional','','2021-06-26 06:47:40','2021-06-26 06:47:40'),(122,-1,'email_enabled','0','2021-06-26 06:47:40','2021-06-26 06:47:40'),(123,-1,'email_ssl','0','2021-06-26 06:47:40','2021-06-26 06:47:40'),(124,-1,'s_k','xJ3ktaC39H','2021-10-25 22:15:38','2021-10-25 22:15:38'),(125,-1,'s_iv','anSYCDY1C9','2021-10-25 22:15:38','2021-10-25 22:15:38'),(126,-1,'s_l','Ryttd0xFdFZTK210Z2JFOGw4c0M1WTdtOUJxeXRGdnBDZnduNHRUS0xzcz0=','2021-10-25 22:36:29','2021-10-25 22:36:29'),(138,45,'wl_active','1','2021-10-26 18:17:10','2021-10-26 18:17:10'),(139,45,'wl_header','RADIUSdesk','2021-10-26 18:17:10','2021-10-26 18:17:10'),(140,45,'wl_h_bg','ffffff','2021-10-26 18:17:10','2021-10-26 18:17:10'),(141,45,'wl_h_fg','005691','2021-10-26 18:17:10','2021-10-26 18:17:10'),(142,45,'wl_footer','RADIUSdesk','2021-10-26 18:17:10','2021-10-26 18:17:10'),(143,45,'wl_img_active','1','2021-10-26 18:17:10','2021-10-26 18:17:10'),(144,45,'wl_img_file','logo.png','2021-10-26 18:17:10','2021-10-26 18:17:10'),(145,45,'compact_view','1','2021-10-26 18:17:10','2021-10-26 18:17:10'),(146,45,'meshdesk_overview','1','2021-10-26 18:17:10','2021-10-26 18:17:10');
/*!40000 ALTER TABLE `user_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_ssids`
--

DROP TABLE IF EXISTS `user_ssids`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_ssids` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(64) NOT NULL DEFAULT '',
  `ssidname` varchar(64) NOT NULL DEFAULT '',
  `priority` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `username` (`username`(32)),
  KEY `idx_user_ssids_username` (`username`),
  KEY `idx_user_ssids_ssidname` (`ssidname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_ssids`
--

LOCK TABLES `user_ssids` WRITE;
/*!40000 ALTER TABLE `user_ssids` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_ssids` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_stats`
--

DROP TABLE IF EXISTS `user_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_stats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `radacct_id` int(11) NOT NULL,
  `username` varchar(64) NOT NULL DEFAULT '',
  `realm` varchar(64) DEFAULT '',
  `nasipaddress` varchar(15) NOT NULL DEFAULT '',
  `nasidentifier` varchar(64) NOT NULL DEFAULT '',
  `framedipaddress` varchar(15) NOT NULL DEFAULT '',
  `callingstationid` varchar(50) NOT NULL DEFAULT '',
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `acctinputoctets` bigint(20) NOT NULL,
  `acctoutputoctets` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `us_realm_timestamp` (`realm`,`timestamp`),
  KEY `us_username_timestamp` (`username`,`timestamp`),
  KEY `us_nasidentifier_timestamp` (`nasidentifier`,`timestamp`),
  KEY `us_callingstationid_timestamp` (`callingstationid`,`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_stats`
--

LOCK TABLES `user_stats` WRITE;
/*!40000 ALTER TABLE `user_stats` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_stats_dailies`
--

DROP TABLE IF EXISTS `user_stats_dailies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_stats_dailies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_stat_id` int(11) NOT NULL,
  `username` varchar(64) NOT NULL DEFAULT '',
  `realm` varchar(64) DEFAULT '',
  `nasidentifier` varchar(64) NOT NULL DEFAULT '',
  `callingstationid` varchar(50) NOT NULL DEFAULT '',
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `acctinputoctets` bigint(20) NOT NULL,
  `acctoutputoctets` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `usd_realm_timestamp` (`realm`,`timestamp`),
  KEY `usd_username_timestamp` (`username`,`timestamp`),
  KEY `usd_nasidentifier_timestamp` (`nasidentifier`,`timestamp`),
  KEY `usd_callingstationid_timestamp` (`callingstationid`,`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_stats_dailies`
--

LOCK TABLES `user_stats_dailies` WRITE;
/*!40000 ALTER TABLE `user_stats_dailies` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_stats_dailies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(50) NOT NULL,
  `token` char(36) DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `surname` varchar(50) NOT NULL,
  `address` varchar(255) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 0,
  `monitor` tinyint(1) NOT NULL DEFAULT 0,
  `country_id` int(11) DEFAULT NULL,
  `group_id` int(11) NOT NULL,
  `language_id` int(11) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `lft` int(11) DEFAULT NULL,
  `rght` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `tree_tag_id` int(11) DEFAULT NULL,
  `can_manage_tree_tags` tinyint(1) NOT NULL DEFAULT 0,
  `timezone_id` int(11) DEFAULT 316,
  PRIMARY KEY (`id`),
  KEY `idx_users_group_id` (`group_id`),
  KEY `idx_users_parent_id` (`parent_id`),
  KEY `idx_users_country_id` (`country_id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (44,'root','9b2b0416194bfdd0db089b9c09fad3163eae5383','b4c6ac81-8c7c-4802-b50a-0a6380555b50','root','','','','',1,0,4,8,4,NULL,1,4,'2012-12-10 13:14:13','2021-06-26 06:02:53',NULL,0,24),(45,'demo1','a5e56198b8bba02794d5a2c92d7b94ee3cbeba76','65e215f7-f19f-4b27-b5d8-f0bdb9b8c8fb','','','','','',1,1,4,9,4,44,2,3,'2021-10-25 22:48:48','2021-10-25 22:48:48',NULL,0,316);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `view_notifications`
--

DROP TABLE IF EXISTS `view_notifications`;
/*!50001 DROP VIEW IF EXISTS `view_notifications`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `view_notifications` (
  `id` tinyint NOT NULL,
  `object_id` tinyint NOT NULL,
  `object_name` tinyint NOT NULL,
  `user_id` tinyint NOT NULL,
  `object_type` tinyint NOT NULL,
  `related_type` tinyint NOT NULL,
  `parent_id` tinyint NOT NULL,
  `parent_name` tinyint NOT NULL,
  `severity` tinyint NOT NULL,
  `is_resolved` tinyint NOT NULL,
  `notification_datetime` tinyint NOT NULL,
  `notification_type` tinyint NOT NULL,
  `notification_code` tinyint NOT NULL,
  `short_description` tinyint NOT NULL,
  `description` tinyint NOT NULL,
  `available_to_siblings` tinyint NOT NULL,
  `created` tinyint NOT NULL,
  `modified` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `vouchers`
--

DROP TABLE IF EXISTS `vouchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vouchers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) DEFAULT NULL,
  `batch` varchar(128) NOT NULL DEFAULT '',
  `status` enum('new','used','depleted','expired') DEFAULT 'new',
  `perc_time_used` int(6) DEFAULT NULL,
  `perc_data_used` int(6) DEFAULT NULL,
  `last_accept_time` datetime DEFAULT NULL,
  `last_reject_time` datetime DEFAULT NULL,
  `last_accept_nas` varchar(128) DEFAULT NULL,
  `last_reject_nas` varchar(128) DEFAULT NULL,
  `last_reject_message` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `extra_name` varchar(100) NOT NULL DEFAULT '',
  `extra_value` varchar(100) NOT NULL DEFAULT '',
  `password` varchar(30) NOT NULL DEFAULT '',
  `realm` varchar(50) NOT NULL DEFAULT '',
  `realm_id` int(11) DEFAULT NULL,
  `profile` varchar(50) NOT NULL DEFAULT '',
  `profile_id` int(11) DEFAULT NULL,
  `expire` datetime DEFAULT NULL,
  `time_valid` varchar(10) NOT NULL DEFAULT '',
  `data_used` bigint(20) DEFAULT NULL,
  `data_cap` bigint(20) DEFAULT NULL,
  `time_used` int(12) DEFAULT NULL,
  `time_cap` int(12) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ak_vouchers` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vouchers`
--

LOCK TABLES `vouchers` WRITE;
/*!40000 ALTER TABLE `vouchers` DISABLE KEYS */;
/*!40000 ALTER TABLE `vouchers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'rd'
--
/*!50003 DROP PROCEDURE IF EXISTS `add_alert_option` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_alert_option`()
begin

if not exists (select * from information_schema.columns
    where table_name = 'alerts' and table_schema = 'rd') then
	CREATE TABLE `alerts` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `description` varchar(255) NOT NULL,
      `node_id` int(11) DEFAULT NULL,
      `mesh_id` int(11) DEFAULT NULL,
      `ap_id` int(11) DEFAULT NULL,
      `ap_profile_id` int(11) DEFAULT NULL,
      `detected` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `acknowledged` datetime DEFAULT NULL,
      `user_id` int(11) DEFAULT NULL,
      `resolved` datetime DEFAULT NULL,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB CHARSET=utf8;

end if;


if not exists (select * from information_schema.columns
    where column_name = 'enable_alerts' and table_name = 'meshes' and table_schema = 'rd') then
    alter table meshes add column `enable_alerts` tinyint(1) NOT NULL DEFAULT '1';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'enable_overviews' and table_name = 'meshes' and table_schema = 'rd') then
    alter table meshes add column `enable_overviews` tinyint(1) NOT NULL DEFAULT '1';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'enable_alerts' and table_name = 'nodes' and table_schema = 'rd') then
    alter table nodes add column `enable_alerts` tinyint(1) NOT NULL DEFAULT '1';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'enable_overviews' and table_name = 'nodes' and table_schema = 'rd') then
    alter table nodes add column `enable_overviews` tinyint(1) NOT NULL DEFAULT '1';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'enable_alerts' and table_name = 'ap_profiles' and table_schema = 'rd') then
    alter table ap_profiles add column `enable_alerts` tinyint(1) NOT NULL DEFAULT '1';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'enable_overviews' and table_name = 'ap_profiles' and table_schema = 'rd') then
    alter table ap_profiles add column `enable_overviews` tinyint(1) NOT NULL DEFAULT '1';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'enable_alerts' and table_name = 'aps' and table_schema = 'rd') then
    alter table aps add column `enable_alerts` tinyint(1) NOT NULL DEFAULT '1';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'enable_overviews' and table_name = 'aps' and table_schema = 'rd') then
    alter table aps add column `enable_overviews` tinyint(1) NOT NULL DEFAULT '1';
end if;
              
end ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `add_dynamic_detail_mobile` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_dynamic_detail_mobile`()
begin

if not exists (select * from information_schema.columns
    where table_name = 'dynamic_detail_mobiles' and table_schema = 'rd') then
	CREATE TABLE `dynamic_detail_mobiles` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `dynamic_detail_id` int(11) DEFAULT NULL,
      `mobile_only` tinyint(1) NOT NULL DEFAULT '0',
      `content` text NOT NULL DEFAULT '',
      `android_enable` tinyint(1) NOT NULL DEFAULT '0',
      `android_href` varchar(255) NOT NULL DEFAULT '',
      `android_text` varchar(255) NOT NULL DEFAULT '',
      `android_content` text NOT NULL DEFAULT '',
      `apple_enable` tinyint(1) NOT NULL DEFAULT '0',
      `apple_href` varchar(255) NOT NULL DEFAULT '',
      `apple_text` varchar(255) NOT NULL DEFAULT '',
      `apple_content` text NOT NULL DEFAULT '',
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB CHARSET=utf8;

end if;

end ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `add_dynamic_detail_show_screen_delay` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_dynamic_detail_show_screen_delay`()
begin

if not exists (select * from information_schema.columns
    where column_name = 'show_screen_delay' and table_name = 'dynamic_details' and table_schema = 'rd') then
    alter table dynamic_details add column `show_screen_delay` int(4) NOT NULL DEFAULT '0';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'show_logo' and table_name = 'dynamic_details' and table_schema = 'rd') then
    alter table dynamic_details add column `show_logo` tinyint(1) NOT NULL DEFAULT '1';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'show_name' and table_name = 'dynamic_details' and table_schema = 'rd') then
    alter table dynamic_details add column `show_name` tinyint(1) NOT NULL DEFAULT '1';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'name_colour' and table_name = 'dynamic_details' and table_schema = 'rd') then
    alter table dynamic_details add column `name_colour` varchar(255) NOT NULL DEFAULT '';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'ctc_require_phone' and table_name = 'dynamic_details' and table_schema = 'rd') then
    alter table dynamic_details add column `ctc_require_phone` tinyint(1) NOT NULL DEFAULT '0';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'ctc_resupply_phone_interval' and table_name = 'dynamic_details' and table_schema = 'rd') then
    alter table dynamic_details add column `ctc_resupply_phone_interval` int(4) NOT NULL DEFAULT '0';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'ctc_require_dn' and table_name = 'dynamic_details' and table_schema = 'rd') then
    alter table dynamic_details add column `ctc_require_dn` tinyint(1) NOT NULL DEFAULT '0';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'ctc_resupply_dn_interval' and table_name = 'dynamic_details' and table_schema = 'rd') then
    alter table dynamic_details add column `ctc_resupply_dn_interval` int(4) NOT NULL DEFAULT '0';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'phone' and table_name = 'data_collectors' and table_schema = 'rd') then
    alter table data_collectors add column `phone` varchar(36) NOT NULL DEFAULT '';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'dn' and table_name = 'data_collectors' and table_schema = 'rd') then
    alter table data_collectors add column `dn` varchar(36) NOT NULL DEFAULT '';
end if;

if exists (select * from information_schema.columns
    where column_name = 'prelogin_check' and table_name = 'dynamic_details' and table_schema = 'rd') then
    alter table dynamic_details drop column prelogin_check, drop column prelogin_url, drop column prelogin_expire;    
end if;


end ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `add_more_wan_gw_types` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_more_wan_gw_types`()
begin

ALTER TABLE aps MODIFY COLUMN gateway enum('none','lan','3g','wifi','wifi_static','wifi_ppp','wifi_pppoe','wan_static','wan_ppp','wan_pppoe') DEFAULT 'none';
ALTER TABLE nodes MODIFY COLUMN gateway enum('none','lan','3g','wifi','wifi_static','wifi_ppp','wifi_pppoe','wan_static','wan_ppp','wan_pppoe') DEFAULT 'none';

               
end ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `add_schedules` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_schedules`()
begin

if not exists (select * from information_schema.columns
    where table_name = 'schedules' and table_schema = 'rd') then	
    CREATE TABLE IF NOT EXISTS `schedules` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `name` char(64) DEFAULT NULL,
      `user_id` int(11) DEFAULT NULL,
      `available_to_siblings` tinyint(1) NOT NULL DEFAULT '0',
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT 1 DEFAULT CHARSET=utf8;

end if;

if not exists (select * from information_schema.columns
    where table_name = 'predefined_commands' and table_schema = 'rd') then	
    CREATE TABLE IF NOT EXISTS `predefined_commands` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `name` char(64) DEFAULT NULL,
      `command` varchar(255) NOT NULL DEFAULT '',
      `action` enum('execute','execute_and_reply') DEFAULT 'execute',
      `user_id` int(11) DEFAULT NULL,
      `available_to_siblings` tinyint(1) NOT NULL DEFAULT '0',
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT 1 DEFAULT CHARSET=utf8;

end if;

if not exists (select * from information_schema.columns
    where table_name = 'schedule_entries' and table_schema = 'rd') then	
    CREATE TABLE IF NOT EXISTS `schedule_entries` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `schedule_id` int(11) DEFAULT NULL,
      `description` varchar(255) NOT NULL DEFAULT '',
      `type` enum('predefined_command','command') DEFAULT 'command',
      `command` varchar(255) NOT NULL DEFAULT '',
      `predefined_command_id` int(11) DEFAULT NULL,
      `mo` tinyint(1) NOT NULL DEFAULT '0',
      `tu` tinyint(1) NOT NULL DEFAULT '0',
      `we` tinyint(1) NOT NULL DEFAULT '0',
      `th` tinyint(1) NOT NULL DEFAULT '0',
      `fr` tinyint(1) NOT NULL DEFAULT '0',
      `sa` tinyint(1) NOT NULL DEFAULT '0',
      `su` tinyint(1) NOT NULL DEFAULT '0',
      `event_time` varchar(10) NOT NULL DEFAULT '',
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT 1 DEFAULT CHARSET=utf8;

end if;


end ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `add_schedule_option` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_schedule_option`()
begin

if not exists (select * from information_schema.columns
    where column_name = 'enable_schedules' and table_name = 'node_settings' and table_schema = 'rd') then
    alter table node_settings add column `enable_schedules` tinyint(1) NOT NULL DEFAULT '0';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'schedule_id' and table_name = 'node_settings' and table_schema = 'rd') then
    alter table node_settings add column `schedule_id` int(11) DEFAULT NULL;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'enable_schedules' and table_name = 'nodes' and table_schema = 'rd') then
    alter table nodes add column `enable_schedules` tinyint(1) NOT NULL DEFAULT '0';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'schedule_id' and table_name = 'nodes' and table_schema = 'rd') then
    alter table nodes add column `schedule_id` int(11) DEFAULT NULL;
end if;

if not exists (select * from information_schema.columns
    where column_name = 'enable_schedules' and table_name = 'ap_profile_settings' and table_schema = 'rd') then
    alter table ap_profile_settings add column `enable_schedules` tinyint(1) NOT NULL DEFAULT '0';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'schedule_id' and table_name = 'ap_profile_settings' and table_schema = 'rd') then
    alter table ap_profile_settings add column `schedule_id` int(11) DEFAULT NULL;
end if;


if not exists (select * from information_schema.columns
    where column_name = 'enable_schedules' and table_name = 'aps' and table_schema = 'rd') then
    alter table aps add column `enable_schedules` tinyint(1) NOT NULL DEFAULT '0';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'schedule_id' and table_name = 'aps' and table_schema = 'rd') then
    alter table aps add column `schedule_id` int(11) DEFAULT NULL;
end if;
              
end ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `add_softflows` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_softflows`()
begin

if not exists (select * from information_schema.columns
    where table_name = 'softflows' and table_schema = 'rd') then
	CREATE TABLE `softflows` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `dynamic_client_id` int(11) DEFAULT NULL,
      `username`  varchar(64) DEFAULT NULL,
      `src_mac`  varchar(64) DEFAULT NULL,
      `src_ip`  varchar(64) DEFAULT NULL,
      `dst_ip`  varchar(64) DEFAULT NULL,
      `src_port` int(11) DEFAULT NULL,
      `dst_port` int(11) DEFAULT NULL,
      `proto` int(11) DEFAULT NULL,
      `pckt_in` int(11) DEFAULT NULL,
      `pckt_out` int(11) DEFAULT NULL,
      `oct_in` bigint(20) DEFAULT NULL,
      `oct_out`  bigint(20) DEFAULT NULL,
      `start` datetime DEFAULT NULL,
      `finish` datetime DEFAULT NULL,
      `created` datetime NOT NULL,
      `modified` datetime NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB CHARSET=utf8;

end if;

end ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `add_wifi6_support` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_wifi6_support`()
begin


if not exists (select * from information_schema.columns
    where column_name = 'band' and table_name = 'hardware_radios' and table_schema = 'rd') then
    alter table hardware_radios add column `band` enum('2g','5g') DEFAULT '2g';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'mode' and table_name = 'hardware_radios' and table_schema = 'rd') then
    alter table hardware_radios add column `mode` enum('n','ac','ax') DEFAULT 'n';
end if;

if not exists (select * from information_schema.columns
    where column_name = 'width' and table_name = 'hardware_radios' and table_schema = 'rd') then
    alter table hardware_radios add column `width` enum('20','40','80','160') DEFAULT '20';
end if;

if exists (select * from information_schema.columns
    where column_name = 'hwmode' and table_name = 'hardware_radios' and table_schema = 'rd') then
    alter table hardware_radios drop column hwmode, drop column htmode;  
end if;

end ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_archive_mesh_daily_summaries` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_archive_mesh_daily_summaries`(OUT ar_ns_message varchar(512))
ar_ns_block: BEGIN
 
	DECLARE v_finished INTEGER DEFAULT 0;
	DECLARE v_begin_date date;
	DECLARE v_max_date date;
	DECLARE v_adj_max_date date;
	DECLARE v_end_date date;
	 
	DECLARE exit handler for sqlexception
		BEGIN
			set ar_ns_message = 'Failed, transaction rolled back';
			ROLLBACK;
		END;			
	
	set ar_ns_message = 'Success';
	
	
	select the_date into v_begin_date from mesh_daily_summaries
		order by the_date asc
		limit 0,1 ;
	
	select the_date into v_max_date from mesh_daily_summaries
		order by the_date desc
		limit 0,1 ;
	
	set v_adj_max_date = date_add(v_max_date,interval -14 day);
	
	set v_end_date = date_add(v_begin_date,interval 1 week);
	
	
	IF (v_adj_max_date > v_begin_date) THEN
		IF (v_end_date > v_adj_max_date) THEN
			set v_end_date = v_adj_max_date;
		END IF;
		START TRANSACTION;
			insert ignore into ar_mesh_daily_summaries (
					id,
					mesh_id,
					the_date,
					tree_tag_id,
					mesh_name,
					min_clients,
					max_clients,
					min_nodes,
					max_nodes,
					min_lv_nodes,
					max_lv_nodes,
					min_lv_nodes_down,
					max_lv_nodes_down,
					min_nodes_down,
					max_nodes_down,
					min_nodes_up,
					max_nodes_up,
					min_dual_radios,
					max_dual_radios,
					min_single_radios,
					max_single_radios
				)
				select 
					id,
					mesh_id,
					the_date,
					tree_tag_id,
					mesh_name,
					min_clients,
					max_clients,
					min_nodes,
					max_nodes,
					min_lv_nodes,
					max_lv_nodes,
					min_lv_nodes_down,
					max_lv_nodes_down,
					min_nodes_down,
					max_nodes_down,
					min_nodes_up,
					max_nodes_up,
					min_dual_radios,
					max_dual_radios,
					min_single_radios,
					max_single_radios
						from mesh_daily_summaries mds 
					where the_date between v_begin_date and v_end_date;
			
			delete from mesh_daily_summaries
				where the_date between v_begin_date and v_end_date;
			
			set ar_ns_message = concat('Success. v_begin_date: ',v_begin_date,' | v_end_date: ',v_end_date);
		COMMIT;
	ELSE
		set ar_ns_message = concat('Nothing to process. v_begin_date: ',v_begin_date,' | v_adj_max_date: ',v_adj_max_date);
	END IF;

END ar_ns_block ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_archive_node_ibss_connections` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_archive_node_ibss_connections`(OUT ar_ns_message varchar(512))
ar_ns_block: BEGIN
 
	DECLARE v_finished INTEGER DEFAULT 0;
	DECLARE v_begin_date datetime;
	DECLARE v_max_date datetime;
	DECLARE v_adj_max_date datetime;
	DECLARE v_end_date datetime;
	 
	DECLARE exit handler for sqlexception
		BEGIN
			set ar_ns_message = 'Failed, transaction rolled back';
			ROLLBACK;
		END;			
	
	set ar_ns_message = 'Success';
	
	
	select modified into v_begin_date from node_ibss_connections
		order by modified asc
		limit 0,1 ;
	
	select modified into v_max_date from node_ibss_connections
		order by modified desc
		limit 0,1 ;
	
	set v_adj_max_date = date_add(v_max_date,interval -14 day);
	
	set v_end_date = date_add(v_begin_date,interval 1 week);
	
	
	IF (v_adj_max_date > v_begin_date) THEN
		IF (v_end_date > v_adj_max_date) THEN
			set v_end_date = v_adj_max_date;
		END IF;
		START TRANSACTION;
			insert ignore into ar_node_ibss_connections (
				  id,
				  node_id,
				  station_node_id,
				  vendor,
				  mac,
				  tx_bytes,
				  rx_bytes,
				  tx_packets,
				  rx_packets,
				  tx_bitrate,
				  rx_bitrate,
				  tx_extra_info,
				  rx_extra_info,
				  authenticated,
				  authorized,
				  tdls_peer,
				  preamble,
				  tx_failed,
				  inactive_time,
				  WMM_WME,
				  tx_retries,
				  MFP,
				  signal_now,
				  signal_avg,
				  created,
				  modified
				)
				select 
					  id,
					  node_id,
					  station_node_id,
					  vendor,
					  mac,
					  tx_bytes,
					  rx_bytes,
					  tx_packets,
					  rx_packets,
					  tx_bitrate,
					  rx_bitrate,
					  tx_extra_info,
					  rx_extra_info,
					  authenticated,
					  authorized,
					  tdls_peer,
					  preamble,
					  tx_failed,
					  inactive_time,
					  WMM_WME,
					  tx_retries,
					  MFP,
					  signal_now,
					  signal_avg,
					  created,
					  modified
						from node_ibss_connections nic 
					where modified between v_begin_date and v_end_date;
			
			delete from node_ibss_connections
				where modified between v_begin_date and v_end_date;
			
			set ar_ns_message = concat('Success. v_begin_date: ',v_begin_date,' | v_end_date: ',v_end_date);
		COMMIT;
	ELSE
		set ar_ns_message = concat('Nothing to process. v_begin_date: ',v_begin_date,' | v_adj_max_date: ',v_adj_max_date);
	END IF;

END ar_ns_block ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_archive_node_stations` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_archive_node_stations`(OUT ar_ns_message varchar(512))
ar_ns_block: BEGIN
 
	DECLARE v_finished INTEGER DEFAULT 0;
	DECLARE v_begin_date datetime;
	DECLARE v_max_date datetime;
	DECLARE v_adj_max_date datetime;
	DECLARE v_end_date datetime;
	 
	DECLARE exit handler for sqlexception
		BEGIN
			set ar_ns_message = 'Failed, transaction rolled back';
			ROLLBACK;
		END;			
	
	set ar_ns_message = 'Success';
	
	
	select modified into v_begin_date from node_stations
		order by modified asc
		limit 0,1 ;
	
	select modified into v_max_date from node_stations
		order by modified desc
		limit 0,1 ;
	
	set v_adj_max_date = date_add(v_max_date,interval -14 day);
	
	set v_end_date = date_add(v_begin_date,interval 1 week);
	
	
	IF (v_adj_max_date > v_begin_date) THEN
		IF (v_end_date > v_adj_max_date) THEN
			set v_end_date = v_adj_max_date;
		END IF;
		START TRANSACTION;
			insert ignore into ar_node_stations (
					  id,
					  node_id,
					  mesh_entry_id,
					  vendor,
					  mac,
					  tx_bytes,
					  rx_bytes,
					  tx_packets,
					  rx_packets,
					  tx_bitrate,
					  rx_bitrate,
					  tx_extra_info,
					  rx_extra_info,
					  authenticated,
					  authorized,
					  tdls_peer,
					  preamble,
					  tx_failed,
					  inactive_time,
					  WMM_WME,
					  tx_retries,
					  MFP,
					  signal_now,
					  signal_avg,
					  created,
					  modified
				)
				select 
					  id,
					  node_id,
					  mesh_entry_id,
					  vendor,
					  mac,
					  tx_bytes,
					  rx_bytes,
					  tx_packets,
					  rx_packets,
					  tx_bitrate,
					  rx_bitrate,
					  tx_extra_info,
					  rx_extra_info,
					  authenticated,
					  authorized,
					  tdls_peer,
					  preamble,
					  tx_failed,
					  inactive_time,
					  WMM_WME,
					  tx_retries,
					  MFP,
					  signal_now,
					  signal_avg,
					  created,
					  modified
						from node_stations ns 
					where modified between v_begin_date and v_end_date;
			
			delete from node_stations
				where modified between v_begin_date and v_end_date;
			
			set ar_ns_message = concat('Success. v_begin_date: ',v_begin_date,' | v_end_date: ',v_end_date);
		COMMIT;
	ELSE
		set ar_ns_message = concat('Nothing to process. v_begin_date: ',v_begin_date,' | v_adj_max_date: ',v_adj_max_date);
	END IF;

END ar_ns_block ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_update_ap_downtime` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_ap_downtime`(in dead_seconds integer, OUT nodes_down_cnt integer)
down_nodes_block: BEGIN
 
	DECLARE v_finished INTEGER DEFAULT 0;
	DECLARE v_ap_profile_id INTEGER DEFAULT 0;
	DECLARE v_node_id INTEGER DEFAULT 0;
	DECLARE v_notif_id INTEGER DEFAULT 0;
	DECLARE v_now DATETIME;
	DECLARE v_uptm_id INTEGER DEFAULT 0;
	DECLARE v_node_state INTEGER DEFAULT 0;
	DECLARE v_state_datetime DATETIME;
	DECLARE v_report_datetime DATETIME;
	 
	
	DEClARE down_nodes_cursor CURSOR FOR 
		select n.ap_profile_id,n.id as ap_id
			from aps n 
			left outer join ap_profile_settings n_set on n_set.ap_profile_id = n.ap_profile_id   
		where (n.last_contact is null OR UNIX_TIMESTAMP()-ifnull(n_set.heartbeat_dead_after,dead_seconds) > UNIX_TIMESTAMP(n.last_contact) );
	 
	
	DEClARE up_nodes_cursor CURSOR FOR 
		select ntf.id,ntf.item_id 
		from notifications ntf
		inner join (
			select n.id from aps n
					left outer join ap_profile_settings n_set on n_set.ap_profile_id = n.ap_profile_id   
				where (n.last_contact is not null AND UNIX_TIMESTAMP()-ifnull(n_set.heartbeat_dead_after,@dead_seconds) <= UNIX_TIMESTAMP(n.last_contact) )
		) n1 on (ntf.item_table = 'aps' and n1.id = ntf.item_id)
		where ntf.is_resolved = 0;
		
		
	DECLARE CONTINUE HANDLER 
			FOR NOT FOUND SET v_finished = 1;
			
	set nodes_down_cnt = 0;
	 
	OPEN down_nodes_cursor;
	OPEN up_nodes_cursor;
	 
	get_down_node: LOOP
	 
	FETCH down_nodes_cursor INTO v_ap_profile_id,v_node_id;
	 
		IF v_finished = 1 THEN 
			LEAVE get_down_node;
		END IF;
		
		uptime_block: begin
			DECLARE v_empty INTEGER DEFAULT 0;
			DECLARE v_uptm_id INTEGER DEFAULT 0;
			DECLARE v_node_state INTEGER DEFAULT 0;
			DECLARE v_state_datetime DATETIME;
			DECLARE v_report_datetime DATETIME;
			
			DECLARE CONTINUE HANDLER 
			FOR NOT FOUND SET v_empty = 1;
			set v_empty = 0;
			set v_now = now();
			set v_uptm_id = null;
			set v_node_state = 0;
			set v_state_datetime = null;
			set v_report_datetime = now();
			 
			select now() as ct,
				a.id,
				a.ap_state,
				a.state_datetime,
				a.report_datetime
			into v_now,v_uptm_id,v_node_state,v_state_datetime,v_report_datetime
			from
				(select * from ap_uptm_histories uh
					where uh.ap_id = v_node_id
					order by uh.modified desc
					limit 1
				) as a ;
			IF v_empty = 1 then
				
				INSERT INTO `rd`.`ap_uptm_histories`
					(
						`ap_id`,
						`ap_state`,
						`state_datetime`,
						`report_datetime`,
						`created`,
						`modified`
					)
				VALUES
				(
					v_node_id,
					0,
					v_now,
					v_now,
					v_now,
					v_now
				);
				INSERT INTO `rd`.`notifications`
					(
						`severity`,
						`is_resolved`,
						`notification_datetime`,
						`notification_type`,
						`notification_code`,
						`short_description`,
						`description`,
						`item_id`,
						`item_table`,
						`created`,
						`modified`
					)
					VALUES
					(
						1,
						0,
						v_now,
						'network',
						2,
						'Device Unreachable',
						'The network device has not reported a connection',
						v_node_id,
						'aps',
						v_now,
						v_now
					);
			ELSE
				
				IF (v_node_state = 0 AND v_uptm_id IS NOT NULL) THEN
					
					UPDATE `rd`.`ap_uptm_histories`
					SET
						`report_datetime` = v_now,
						`modified` = v_now
					WHERE `id` = v_uptm_id;
				ELSE 
					
					INSERT INTO `rd`.`ap_uptm_histories`
						(
							`ap_id`,
							`ap_state`,
							`state_datetime`,
							`report_datetime`,
							`created`,
							`modified`
						)
					VALUES
					(
						v_node_id,
						0,
						DATE_ADD(v_report_datetime, INTERVAL 1 MINUTE),
						v_now,
						v_now,
						v_now
					);
					INSERT INTO `rd`.`notifications`
						(
							`severity`,
							`is_resolved`,
							`notification_datetime`,
							`notification_type`,
							`notification_code`,
							`short_description`,
							`description`,
							`item_id`,
							`item_table`,
							`created`,
							`modified`
						)
					VALUES
						(
							1,
							0,
							DATE_ADD(v_report_datetime, INTERVAL 1 MINUTE),
							'network',
							2,
							'Device Unreachable',
							'The network device has not reported a connection',
							v_node_id,
							'aps',
							v_now,
							v_now
						);
				END IF;
			END IF;
		END uptime_block; 
		set nodes_down_cnt = nodes_down_cnt + 1;
	END LOOP get_down_node;
	
	set v_finished = 0;
	set v_now = now();
	get_up_node: LOOP
	 
	FETCH up_nodes_cursor INTO v_notif_id,v_node_id;
	
		IF v_finished = 1 THEN 
			LEAVE get_up_node;
		END IF;
		
		UPDATE `rd`.`notifications`
		SET
			`is_resolved` = 1,
			`modified` = v_now
		WHERE `id` = v_notif_id;
		
	END LOOP get_up_node;
	 
	CLOSE down_nodes_cursor;
	CLOSE up_nodes_cursor;
 
END down_nodes_block ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_update_node_downtime` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_node_downtime`(in dead_seconds integer, OUT nodes_down_cnt integer)
down_nodes_block: BEGIN
 
	DECLARE v_finished INTEGER DEFAULT 0;
	DECLARE v_mesh_id INTEGER DEFAULT 0;
	DECLARE v_node_id INTEGER DEFAULT 0;
	DECLARE v_notif_id INTEGER DEFAULT 0;
	DECLARE v_now DATETIME;
	DECLARE v_uptm_id INTEGER DEFAULT 0;
	DECLARE v_node_state INTEGER DEFAULT 0;
	DECLARE v_state_datetime DATETIME;
	DECLARE v_report_datetime DATETIME;
	 
	
	DEClARE down_nodes_cursor CURSOR FOR 
		select n.mesh_id,n.id as node_id
			from nodes n 
			left outer join node_settings n_set on n_set.mesh_id = n.mesh_id   
		where (n.last_contact is null OR UNIX_TIMESTAMP()-ifnull(n_set.heartbeat_dead_after,dead_seconds) > UNIX_TIMESTAMP(n.last_contact) );
	 
	
	DEClARE up_nodes_cursor CURSOR FOR 
		
		select ntf.id,ntf.item_id 
		from notifications ntf
		inner join (
			select n.id from nodes n
					left outer join node_settings n_set on n_set.mesh_id = n.mesh_id   
				where (n.last_contact is not null AND UNIX_TIMESTAMP()-ifnull(n_set.heartbeat_dead_after,@dead_seconds) <= UNIX_TIMESTAMP(n.last_contact) )
		) n1 on (ntf.item_table = 'nodes' and n1.id = ntf.item_id)
		where ntf.is_resolved = 0; 
		
		
	DECLARE CONTINUE HANDLER 
			FOR NOT FOUND SET v_finished = 1;
			
	set nodes_down_cnt = 0;
	 
	OPEN down_nodes_cursor;
	OPEN up_nodes_cursor;
	 
	get_down_node: LOOP
	 
	FETCH down_nodes_cursor INTO v_mesh_id,v_node_id;
	 
		IF v_finished = 1 THEN 
			LEAVE get_down_node;
		END IF;
		
		uptime_block: begin
			DECLARE v_empty INTEGER DEFAULT 0;
			DECLARE v_uptm_id INTEGER DEFAULT 0;
			DECLARE v_node_state INTEGER DEFAULT 0;
			DECLARE v_state_datetime DATETIME;
			DECLARE v_report_datetime DATETIME;
			
			DECLARE CONTINUE HANDLER 
			FOR NOT FOUND SET v_empty = 1;
			set v_empty = 0;
			set v_now = now();
			set v_uptm_id = null;
			set v_node_state = 0;
			set v_state_datetime = null;
			set v_report_datetime = now();
			 
			select now() as ct,
				a.id,
				a.node_state,
				a.state_datetime,
				a.report_datetime
			into v_now,v_uptm_id,v_node_state,v_state_datetime,v_report_datetime
			from
				(select * from node_uptm_histories uh
					where uh.node_id = v_node_id
					order by uh.modified desc
					limit 1
				) as a ;
			IF v_empty = 1 then
				
				INSERT INTO `rd`.`node_uptm_histories`
					(
						`node_id`,
						`node_state`,
						`state_datetime`,
						`report_datetime`,
						`created`,
						`modified`
					)
				VALUES
				(
					v_node_id,
					0,
					v_now,
					v_now,
					v_now,
					v_now
				);
				INSERT INTO `rd`.`notifications`
					(
						`severity`,
						`is_resolved`,
						`notification_datetime`,
						`notification_type`,
						`notification_code`,
						`short_description`,
						`description`,
						`item_id`,
						`item_table`,
						`created`,
						`modified`
					)
					VALUES
					(
						1,
						0,
						v_now,
						'network',
						2,
						'Device Unreachable',
						'The network device has not reported a connection',
						v_node_id,
						'nodes',
						v_now,
						v_now
					);
			ELSE
				
				IF (v_node_state = 0 AND v_uptm_id IS NOT NULL) THEN
					
					UPDATE `rd`.`node_uptm_histories`
					SET
						`report_datetime` = v_now,
						`modified` = v_now
					WHERE `id` = v_uptm_id;
				ELSE 
					
					INSERT INTO `rd`.`node_uptm_histories`
						(
							`node_id`,
							`node_state`,
							`state_datetime`,
							`report_datetime`,
							`created`,
							`modified`
						)
					VALUES
					(
						v_node_id,
						0,
						DATE_ADD(v_report_datetime, INTERVAL 1 MINUTE),
						v_now,
						v_now,
						v_now
					);
					INSERT INTO `rd`.`notifications`
						(
							`severity`,
							`is_resolved`,
							`notification_datetime`,
							`notification_type`,
							`notification_code`,
							`short_description`,
							`description`,
							`item_id`,
							`item_table`,
							`created`,
							`modified`
						)
					VALUES
						(
							1,
							0,
							DATE_ADD(v_report_datetime, INTERVAL 1 MINUTE),
							'network',
							2,
							'Device Unreachable',
							'The network device has not reported a connection',
							v_node_id,
							'nodes',
							v_now,
							v_now
						);
				END IF;
			END IF;
		END uptime_block; 
		set nodes_down_cnt = nodes_down_cnt + 1;
	END LOOP get_down_node;
	
	set v_finished = 0;
	set v_now = now();
	get_up_node: LOOP
	 
	FETCH up_nodes_cursor INTO v_notif_id,v_node_id;
	
		IF v_finished = 1 THEN 
			LEAVE get_up_node;
		END IF;
		
		UPDATE `rd`.`notifications`
		SET
			`is_resolved` = 1,
			`modified` = v_now
		WHERE `id` = v_notif_id;
		
	END LOOP get_up_node;
	 
	CLOSE down_nodes_cursor;
	CLOSE up_nodes_cursor;
 
END down_nodes_block ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_update_rolling_last_day` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_rolling_last_day`(in in_date_time varchar(255),in in_date varchar(255), in dead_seconds integer, OUT mesh_cnt integer, OUT ins_err_cnt integer, out err_update_cnt integer)
meshes_block: BEGIN
 
	DECLARE v_finished INTEGER DEFAULT 0;							
	DECLARE v_seconds INTEGER DEFAULT (60*60)*24;					
	
	
	DECLARE v_modified INTEGER DEFAULT UNIX_TIMESTAMP(in_date_time)-v_seconds;	
	DECLARE v_modified_top INTEGER DEFAULT UNIX_TIMESTAMP(in_date_time);
	
	DECLARE v_mesh_id INTEGER;
	DECLARE v_mesh_name varchar(255);
	DECLARE v_tree_tag_id INTEGER;
	DECLARE v_tot_clients bigint(20) default 0;
	DECLARE v_tot_tx_bytes bigint(20) default 0;
	DECLARE v_tot_rx_bytes bigint(20) default 0;
	DECLARE v_tot_bytes bigint(20) default 0;
	DECLARE v_tot_nodes bigint(20) default 0;
	DECLARE v_tot_lv_nodes bigint(20) default 0;
	DECLARE v_tot_lv_nodes_down bigint(20) default 0;
	DECLARE v_tot_nodes_down bigint(20) default 0;
	DECLARE v_tot_nodes_up bigint(20) default 0;
	DECLARE v_dual_radios bigint(20) default 0;
	DECLARE v_single_radios bigint(20) default 0;
	
	DECLARE v_now DATETIME default now();
	
	
	DECLARE v_the_date DATE default DATE_SUB(in_date, INTERVAL 1 DAY);
	
	DECLARE v_last_mesh_id INTEGER DEFAULT 0;						
	DECLARE v_node_state INTEGER DEFAULT 0;
	DECLARE v_beg_remove_secs FLOAT(14,2) default 0;
	DECLARE v_end_add_secs FLOAT(14,2) default 0;
	DECLARE v_up_seconds FLOAT(14,2) default 0;
	DECLARE v_down_seconds FLOAT(14,2) default 0;
	
	DECLARE v_nup_beg_remove_secs FLOAT(14,2) default 0;
	DECLARE v_nup_end_add_secs FLOAT(14,2) default 0;
	DECLARE v_nup_up_seconds FLOAT(14,2) default 0;
	DECLARE v_nup_down_seconds FLOAT(14,2) default 0;
	DECLARE v_ndwn_beg_remove_secs FLOAT(14,2) default 0;
	DECLARE v_ndwn_end_add_secs FLOAT(14,2) default 0;
	DECLARE v_ndwn_up_seconds FLOAT(14,2) default 0;
	DECLARE v_ndwn_down_seconds FLOAT(14,2) default 0;
		
	
	DECLARE all_meshes_cursor CURSOR FOR 
		select m.id as mesh_id, 
			m.name as mesh_name, 
			m.tree_tag_id, 
			ifnull(dt_cnts.d_max_clients,0) as tot_clients, 
			ifnull(dt_cnts.tot_tx_bytes,0) as tot_tx_bytes, 
			ifnull(dt_cnts.tot_rx_bytes,0) as tot_rx_bytes, 
			ifnull(dt_cnts.tot_bytes,0) as tot_bytes,
			ifnull(ds_cnts.d_max_nodes,0) as tot_nodes, 
			ifnull(ds_cnts.d_max_lv_nodes,0) as tot_lv_nodes, 
			ifnull(ds_cnts.d_max_lv_nodes_down,0) as tot_lv_nodes_down, 
			ifnull(ds_cnts.d_max_nodes_down,0) as tot_nodes_down, 
			ifnull(ds_cnts.d_max_nodes_up,0) as tot_nodes_up, 
			ifnull(ds_cnts.d_max_dual_radios,0) as dual_radios, 
			ifnull(ds_cnts.d_max_single_radios,0) as single_radios  
		from meshes as m 
		left outer join (
				select mesh_id,
					
					max(max_nodes) as d_max_nodes,
					max(max_lv_nodes) as d_max_lv_nodes,
					max(max_lv_nodes_down) as d_max_lv_nodes_down,
					max(max_nodes_down) as d_max_nodes_down,
					max(max_nodes_up) as d_max_nodes_up,
					max(max_dual_radios) as d_max_dual_radios,
					max(max_single_radios) as d_max_single_radios
					from mesh_daily_summaries
					where the_date = v_the_date
					group by mesh_id
		) as ds_cnts on ds_cnts.mesh_id = m.id
		left outer join ( 
				select n.mesh_id, 
				count(distinct ns.mac) as d_max_clients, 
				sum(ns.tx_bytes) as tot_tx_bytes, 
				sum(ns.rx_bytes) as tot_rx_bytes, 
				sum(ns.tx_bytes + ns.rx_bytes) as tot_bytes 
				from node_stations ns 
				inner join nodes n on n.id = ns.node_id 
				where (UNIX_TIMESTAMP(ns.modified) between v_modified and v_modified_top)
				group by n.mesh_id) 
			as dt_cnts on dt_cnts.mesh_id = m.id 

		group by m.id,m.name,m.tree_tag_id;
	 
	
	DECLARE mesh_uptime_cursor CURSOR FOR 
		select 
			mesh_id,
			node_state,
            sum(beg_remove_secs) as beg_rem_secs,
            sum(end_add_secs) as end_add_secs,
            sum(up_seconds) as m_up_secs,
			sum(down_seconds) as m_dwn_secs
		from (
			select n.mesh_id as mesh_id,
				nuh.node_id as node_id,
				nuh.node_state, 
				case 
					when UNIX_TIMESTAMP(nuh.state_datetime) < v_modified then 
						v_modified - UNIX_TIMESTAMP(nuh.state_datetime)  
					else 
						0 
				end as beg_remove_secs, 
				case 
					when UNIX_TIMESTAMP(nuh.modified) > v_modified_top AND UNIX_TIMESTAMP(nuh.created) < v_modified_top then 
						UNIX_TIMESTAMP(nuh.modified) - v_modified_top
					else 
						0 
				end as end_add_secs, 
				case  
					when node_state = 1 then UNIX_TIMESTAMP(nuh.report_datetime) - UNIX_TIMESTAMP(nuh.created) 
					else 0 
				end as up_seconds, 
				case  
					when node_state = 0 then UNIX_TIMESTAMP(nuh.modified) - UNIX_TIMESTAMP(nuh.state_datetime) 
					else 0 
				end as down_seconds 
			from node_uptm_histories nuh 
			inner join nodes n on n.id = nuh.node_id 
			left outer join node_settings n_set on n_set.mesh_id = n.mesh_id
			where  UNIX_TIMESTAMP(nuh.report_datetime) > v_modified 
					  and (n.last_contact is not null AND UNIX_TIMESTAMP(n.last_contact) > v_modified)
					  and n.mesh_id is not null
        ) as uptm
		group by mesh_id,node_state
        order by mesh_id asc;	
	
	
	DECLARE CONTINUE HANDLER 
			FOR NOT FOUND SET v_finished = 1;
			
	
	
	set mesh_cnt = 0;
	set ins_err_cnt = 0;
	set err_update_cnt = 0;

	
	truncate rolling_last_day;
	
	
	OPEN all_meshes_cursor;
	 
	get_meshes: LOOP
	 
		FETCH all_meshes_cursor INTO 
			v_mesh_id,
			v_mesh_name,
			v_tree_tag_id,
			v_tot_clients,
			v_tot_tx_bytes,
			v_tot_rx_bytes,
			v_tot_bytes,
			v_tot_nodes,
			v_tot_lv_nodes,
			v_tot_lv_nodes_down,
			v_tot_nodes_down,
			v_tot_nodes_up,
			v_dual_radios,
			v_single_radios;
	 
		IF v_finished = 1 THEN 
			LEAVE get_meshes; 
		END IF;
		
		mesh_update_block: begin
			
			DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
				SET ins_err_cnt = ins_err_cnt + 1; 				
			INSERT INTO `rd`.`rolling_last_day` (
				`mesh_id`,
				`tree_tag_id`,
				`mesh_name`,
				`tot_clients`,
				`tot_tx_bytes`,
				`tot_rx_bytes`,
				`tot_bytes`,
				`tot_nodes`,
				`tot_lv_nodes`,
				`tot_lv_nodes_down`,
				`tot_nodes_down`,
				`tot_nodes_up`,
				`dual_radios`,
				`single_radios`
			) VALUES (
				v_mesh_id,
				v_tree_tag_id,
				v_mesh_name,
				v_tot_clients,
				v_tot_tx_bytes,
				v_tot_rx_bytes,
				v_tot_bytes,
				v_tot_nodes,
				v_tot_lv_nodes,
				v_tot_lv_nodes_down,
				v_tot_nodes_down,
				v_tot_nodes_up,
				v_dual_radios,
				v_single_radios
			);
		END mesh_update_block;
		
		set mesh_cnt = mesh_cnt + 1;
	END LOOP get_meshes;
	 
	CLOSE all_meshes_cursor;
	
	
	SET v_finished = 0;
	set v_last_mesh_id = 0;
	
	OPEN mesh_uptime_cursor;
	 
	get_mesh_uptime: LOOP
	 
		FETCH mesh_uptime_cursor INTO 
			v_mesh_id,
			v_node_state,
			v_beg_remove_secs,
			v_end_add_secs,
			v_up_seconds,
			v_down_seconds;
	
		IF v_finished = 1 THEN 
			LEAVE get_mesh_uptime;
		END IF;
		
		uptime_update_block: begin
			DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
				SET err_update_cnt = err_update_cnt + 1;
			
			IF v_mesh_id != v_last_mesh_id then
				
				UPDATE `rd`.`rolling_last_day`
					SET
						`nup_beg_remove_secs` = v_nup_beg_remove_secs,
						`nup_end_add_secs` = v_nup_end_add_secs,
						`nup_up_seconds` = v_nup_up_seconds,
						`nup_down_seconds` = v_nup_down_seconds,
						`ndwn_beg_remove_secs` = v_ndwn_beg_remove_secs,
						`ndwn_end_add_secs` = v_ndwn_end_add_secs,
						`ndwn_up_seconds` = v_ndwn_up_seconds,
						`ndwn_down_seconds` = v_ndwn_down_seconds
				WHERE `mesh_id` = v_last_mesh_id;
				
				set v_last_mesh_id = v_mesh_id;
				set v_nup_beg_remove_secs = 0;
				set v_nup_end_add_secs = 0;
				set v_nup_up_seconds = 0;
				set v_nup_down_seconds = 0;
				set v_ndwn_beg_remove_secs = 0;
				set v_ndwn_end_add_secs = 0;
				set v_ndwn_up_seconds = 0;
				set v_ndwn_down_seconds = 0;
				IF v_node_state = 1 then
					set v_nup_beg_remove_secs = v_beg_remove_secs;
					set v_nup_end_add_secs = v_end_add_secs;
					set v_nup_up_seconds = v_up_seconds;
					set v_nup_down_seconds = v_down_seconds;				
				ELSE
					set v_ndwn_beg_remove_secs = v_beg_remove_secs;
					set v_ndwn_end_add_secs = v_end_add_secs;
					set v_ndwn_up_seconds = v_up_seconds;
					set v_ndwn_down_seconds = v_down_seconds;
				END IF;
			ELSE
				
				IF v_node_state = 1 then
					set v_nup_beg_remove_secs = v_beg_remove_secs;
					set v_nup_end_add_secs = v_end_add_secs;
					set v_nup_up_seconds = v_up_seconds;
					set v_nup_down_seconds = v_down_seconds;				
				ELSE
					set v_ndwn_beg_remove_secs = v_beg_remove_secs;
					set v_ndwn_end_add_secs = v_end_add_secs;
					set v_ndwn_up_seconds = v_up_seconds;
					set v_ndwn_down_seconds = v_down_seconds;
				END IF;
			END IF;
			
		END uptime_update_block; 
	END LOOP get_mesh_uptime;
	
	CLOSE mesh_uptime_cursor;
 
END meshes_block ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_update_rolling_last_hour` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_rolling_last_hour`(in in_date_time varchar(255), in in_date varchar(255), in dead_seconds integer, OUT mesh_cnt integer, OUT ins_err_cnt integer, out err_update_cnt integer)
meshes_block: BEGIN
 
	DECLARE v_finished INTEGER DEFAULT 0;							
	DECLARE v_seconds INTEGER DEFAULT (60*60);				
	
	
	DECLARE v_modified INTEGER DEFAULT UNIX_TIMESTAMP(in_date_time)-v_seconds;	
	DECLARE v_modified_top INTEGER DEFAULT UNIX_TIMESTAMP(in_date_time);
	
	DECLARE v_mesh_id INTEGER;
	DECLARE v_mesh_name varchar(255);
	DECLARE v_tree_tag_id INTEGER;
	DECLARE v_tot_clients bigint(20) default 0;
	DECLARE v_tot_tx_bytes bigint(20) default 0;
	DECLARE v_tot_rx_bytes bigint(20) default 0;
	DECLARE v_tot_bytes bigint(20) default 0;
	DECLARE v_tot_nodes bigint(20) default 0;
	DECLARE v_tot_lv_nodes bigint(20) default 0;
	DECLARE v_tot_lv_nodes_down bigint(20) default 0;
	DECLARE v_tot_nodes_down bigint(20) default 0;
	DECLARE v_tot_nodes_up bigint(20) default 0;
	DECLARE v_dual_radios bigint(20) default 0;
	DECLARE v_single_radios bigint(20) default 0;
	
	DECLARE v_now DATETIME default now();
	
	
	DECLARE v_the_date DATE default in_date;
	
	DECLARE v_last_mesh_id INTEGER DEFAULT 0;						
	DECLARE v_node_state INTEGER DEFAULT 0;
	DECLARE v_beg_remove_secs FLOAT(14,2) default 0;
	DECLARE v_end_add_secs FLOAT(14,2) default 0;
	DECLARE v_up_seconds FLOAT(14,2) default 0;
	DECLARE v_down_seconds FLOAT(14,2) default 0;
	
	DECLARE v_nup_beg_remove_secs FLOAT(14,2) default 0;
	DECLARE v_nup_end_add_secs FLOAT(14,2) default 0;
	DECLARE v_nup_up_seconds FLOAT(14,2) default 0;
	DECLARE v_nup_down_seconds FLOAT(14,2) default 0;
	DECLARE v_ndwn_beg_remove_secs FLOAT(14,2) default 0;
	DECLARE v_ndwn_end_add_secs FLOAT(14,2) default 0;
	DECLARE v_ndwn_up_seconds FLOAT(14,2) default 0;
	DECLARE v_ndwn_down_seconds FLOAT(14,2) default 0;
		
	
	DECLARE all_meshes_cursor CURSOR FOR 
		select m.id as mesh_id, 
			m.name as mesh_name, 
			m.tree_tag_id, 
			ifnull(dt_cnts.tot_clients,0) as tot_clients, 
			ifnull(dt_cnts.tot_tx_bytes,0) as tot_tx_bytes, 
			ifnull(dt_cnts.tot_rx_bytes,0) as tot_rx_bytes, 
			ifnull(dt_cnts.tot_bytes,0) as tot_bytes,
			ifnull(sum(n_cnts.each_node),0) as tot_nodes, 
			ifnull(sum(n_cnts.lv_each_node),0) as tot_lv_nodes, 
			ifnull(sum(n_cnts.lv_nodes_down),0) as tot_lv_nodes_down, 
			ifnull(sum(n_cnts.nodes_down),0) as tot_nodes_down, 
			ifnull(sum(n_cnts.nodes_up),0) as tot_nodes_up, 
			ifnull(sum(n_cnts.dual_radio),0) as dual_radios, 
			ifnull(sum(n_cnts.single_radio),0) as single_radios  
		from meshes as m 
		left outer join ( 
				select n.mesh_id, 
				count(distinct ns.mac) as tot_clients, 
				sum(ns.tx_bytes) as tot_tx_bytes, 
				sum(ns.rx_bytes) as tot_rx_bytes, 
				sum(ns.tx_bytes + ns.rx_bytes) as tot_bytes 
				from node_stations ns 
				inner join nodes n on n.id = ns.node_id 
				where (UNIX_TIMESTAMP(ns.modified) > v_modified)
				group by n.mesh_id) 
			as dt_cnts on dt_cnts.mesh_id = m.id 
		 left outer join ( 
			select n.mesh_id,n.id, 
				1 as each_node, 
				case 
					when n.last_contact is not null then 1 
					else 0 
				end as lv_each_node, 
				case 
					when (n.last_contact is not null AND UNIX_TIMESTAMP()-ifnull(n_set.heartbeat_dead_after,dead_seconds) > UNIX_TIMESTAMP(n.last_contact) ) then 1 
					else 0 
				end as lv_nodes_down, 
				case 
					when (n.last_contact is null OR UNIX_TIMESTAMP()-ifnull(n_set.heartbeat_dead_after,dead_seconds) > UNIX_TIMESTAMP(n.last_contact) ) then 1 
					else 0 
				end as nodes_down, 
				case 
					when UNIX_TIMESTAMP()-ifnull(n_set.heartbeat_dead_after,dead_seconds) <= UNIX_TIMESTAMP(n.last_contact) then 1 
					else 0 
				end as nodes_up, 
				case  
					when (n.hardware not like '%1907h%') then 1  
					else 0  
				end as dual_radio,  
				case  
					when (n.hardware like '%1907h%') then 1  
					else 0  
				end as single_radio  
				from nodes n 
				left outer join node_settings n_set on n_set.mesh_id = n.mesh_id   
			group by n.mesh_id,n.id 
			) as n_cnts on n_cnts.mesh_id = m.id 
		group by m.id,m.name,m.tree_tag_id,	dt_cnts.tot_clients, 
			dt_cnts.tot_tx_bytes, 
			dt_cnts.tot_rx_bytes, 
			dt_cnts.tot_bytes;
	 
	
	DECLARE mesh_uptime_cursor CURSOR FOR 
		select 
			mesh_id,
			node_state,
            sum(beg_remove_secs) as beg_rem_secs,
            sum(end_add_secs) as end_add_secs,
            sum(up_seconds) as m_up_secs,
			sum(down_seconds) as m_dwn_secs
		from (
			select n.mesh_id as mesh_id,
				nuh.node_id as node_id,
				nuh.node_state, 
				case 
					when UNIX_TIMESTAMP(nuh.state_datetime) < v_modified then 
						v_modified - UNIX_TIMESTAMP(nuh.state_datetime)  
					else 
						0 
				end as beg_remove_secs, 
				case 
					when UNIX_TIMESTAMP(nuh.modified) > v_modified_top AND UNIX_TIMESTAMP(nuh.created) < v_modified_top then 
						UNIX_TIMESTAMP(nuh.modified) - v_modified_top
					else 
						0 
				end as end_add_secs, 
				case  
					when node_state = 1 then UNIX_TIMESTAMP(nuh.report_datetime) - UNIX_TIMESTAMP(nuh.created) 
					else 0 
				end as up_seconds, 
				case  
					when node_state = 0 then UNIX_TIMESTAMP(nuh.modified) - UNIX_TIMESTAMP(nuh.state_datetime) 
					else 0 
				end as down_seconds 
			from node_uptm_histories nuh 
			inner join nodes n on n.id = nuh.node_id 
			left outer join node_settings n_set on n_set.mesh_id = n.mesh_id
			where  UNIX_TIMESTAMP(nuh.report_datetime) > v_modified 
					  and (n.last_contact is not null AND UNIX_TIMESTAMP(n.last_contact) > (v_modified-((60*60)*24)) )
					  and n.mesh_id is not null
        ) as uptm
		group by mesh_id,node_state
        order by mesh_id asc;	
	
	
	DECLARE CONTINUE HANDLER 
			FOR NOT FOUND SET v_finished = 1;
			
	
	set mesh_cnt = 0;
	set ins_err_cnt = 0;
	set err_update_cnt = 0;

	
	truncate rolling_last_hour;
	
	
	OPEN all_meshes_cursor;
	 
	get_meshes: LOOP
	 
		FETCH all_meshes_cursor INTO 
			v_mesh_id,
			v_mesh_name,
			v_tree_tag_id,
			v_tot_clients,
			v_tot_tx_bytes,
			v_tot_rx_bytes,
			v_tot_bytes,
			v_tot_nodes,
			v_tot_lv_nodes,
			v_tot_lv_nodes_down,
			v_tot_nodes_down,
			v_tot_nodes_up,
			v_dual_radios,
			v_single_radios;
	 
		IF v_finished = 1 THEN 
			LEAVE get_meshes; 
		END IF;
		
		mesh_update_block: begin
			
			DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
				SET ins_err_cnt = ins_err_cnt + 1; 				
			INSERT INTO `rd`.`rolling_last_hour` (
				`mesh_id`,
				`tree_tag_id`,
				`mesh_name`,
				`tot_clients`,
				`tot_tx_bytes`,
				`tot_rx_bytes`,
				`tot_bytes`,
				`tot_nodes`,
				`tot_lv_nodes`,
				`tot_lv_nodes_down`,
				`tot_nodes_down`,
				`tot_nodes_up`,
				`dual_radios`,
				`single_radios`
			) VALUES (
				v_mesh_id,
				v_tree_tag_id,
				v_mesh_name,
				v_tot_clients,
				v_tot_tx_bytes,
				v_tot_rx_bytes,
				v_tot_bytes,
				v_tot_nodes,
				v_tot_lv_nodes,
				v_tot_lv_nodes_down,
				v_tot_nodes_down,
				v_tot_nodes_up,
				v_dual_radios,
				v_single_radios
			);
		END mesh_update_block;
		
		
		mesh_summary_update_block: begin
			
			DECLARE v_min_clients bigint(20) default 0;
			DECLARE v_max_clients bigint(20) default 0;
			DECLARE v_min_nodes bigint(20) default 0;
			DECLARE v_max_nodes bigint(20) default 0;
			DECLARE v_min_lv_nodes bigint(20) default 0;
			DECLARE v_max_lv_nodes bigint(20) default 0;
			DECLARE v_min_lv_nodes_down bigint(20) default 0;
			DECLARE v_max_lv_nodes_down bigint(20) default 0;
			DECLARE v_min_nodes_down bigint(20) default 0;
			DECLARE v_max_nodes_down bigint(20) default 0;
			DECLARE v_min_nodes_up bigint(20) default 0;
			DECLARE v_max_nodes_up bigint(20) default 0;
			DECLARE v_min_dual_radios bigint(20) default 0;
			DECLARE v_max_dual_radios bigint(20) default 0;
			DECLARE v_min_single_radios bigint(20) default 0;
			DECLARE v_max_single_radios bigint(20) default 0;
			
			DECLARE v_nf int default 0;
			declare v_case_lvl varchar(255) default '';
			
			DECLARE EXIT HANDLER FOR 1339 
				SELECT 'mesh_id: '+v_mesh_id+' -- '+v_case_lvl;
			
			DECLARE CONTINUE HANDLER FOR NOT FOUND
				BEGIN 
					set v_nf = 1;
					
					INSERT INTO `rd`.`mesh_daily_summaries` (
						`mesh_id`,
						`the_date`,
						`tree_tag_id`,
						`mesh_name`
					) VALUES (
						v_mesh_id,
						v_the_date,
						v_tree_tag_id,
						v_mesh_name
					);
				END;
				
				
			
			select 
				min_clients,
				max_clients,
				min_nodes,
				max_nodes,
				min_lv_nodes,
				max_lv_nodes,
				min_lv_nodes_down,
				max_lv_nodes_down,
				min_nodes_down,
				max_nodes_down,
				min_nodes_up,
				max_nodes_up,
				min_dual_radios,
				max_dual_radios,
				min_single_radios,
				max_single_radios
			into 				
				v_min_clients,
				v_max_clients,
				v_min_nodes,
				v_max_nodes,
				v_min_lv_nodes,
				v_max_lv_nodes,
				v_min_lv_nodes_down,
				v_max_lv_nodes_down,
				v_min_nodes_down,
				v_max_nodes_down,
				v_min_nodes_up,
				v_max_nodes_up,
				v_min_dual_radios,
				v_max_dual_radios,
				v_min_single_radios,
				v_max_single_radios
			from rd.mesh_daily_summaries
			where mesh_id = v_mesh_id and the_date = v_the_date;

			
			IF v_nf = 1 THEN 
				
				set v_nf = 0; 
				set v_min_clients = v_tot_clients;
				set v_max_clients = v_tot_clients;
				set v_min_nodes = v_tot_nodes;
				set v_max_nodes = v_tot_nodes;
				set v_min_lv_nodes = v_tot_lv_nodes;
				set v_max_lv_nodes = v_tot_lv_nodes;
				set v_min_lv_nodes_down = v_tot_lv_nodes_down;
				set v_max_lv_nodes_down = v_tot_lv_nodes_down;
				set v_min_nodes_down = v_tot_nodes_down;
				set v_max_nodes_down = v_tot_nodes_down;
				set v_min_nodes_up = v_tot_nodes_up;
				set v_max_nodes_up = v_tot_nodes_up;
				set v_min_dual_radios = v_dual_radios;
				set v_max_dual_radios = v_dual_radios;
				set v_min_single_radios = v_single_radios;
				set v_max_single_radios = v_single_radios;
			ELSE
				
				
				set v_case_lvl = 'v_tot_clients:'+v_tot_clients+', v_max_clients:'+v_max_clients+', v_min_clients:'+v_min_clients;
				CASE  
					WHEN v_tot_clients > ifnull(v_max_clients,0) THEN 
						SET v_max_clients = v_tot_clients;
					WHEN v_tot_clients <= ifnull(v_min_clients,0) THEN
						SET v_min_clients = v_tot_clients;
				END CASE;				
				set v_case_lvl = 'v_tot_nodes:'+v_tot_nodes+', v_max_nodes:'+v_max_nodes+', v_min_nodes:'+v_min_nodes;
				CASE  
					WHEN v_tot_nodes > v_max_nodes THEN 
						SET v_max_nodes = v_tot_nodes;
					WHEN v_tot_nodes <= v_min_nodes THEN
						SET v_min_nodes = v_tot_nodes;
				END CASE;				
				set v_case_lvl = 'v_tot_lv_nodes:'+v_tot_lv_nodes+', v_max_lv_nodes:'+v_max_lv_nodes+', v_min_lv_nodes:'+v_min_lv_nodes;
				CASE  
					WHEN v_tot_lv_nodes > v_max_lv_nodes THEN 
						SET v_max_lv_nodes = v_tot_lv_nodes;
					WHEN v_tot_lv_nodes <= v_min_lv_nodes THEN
						SET v_min_lv_nodes = v_tot_lv_nodes;
				END CASE;				
				set v_case_lvl = 'v_tot_lv_nodes_down:'+v_tot_lv_nodes_down+', v_max_lv_nodes_down:'+v_max_lv_nodes_down+', v_min_lv_nodes_down:'+v_min_lv_nodes_down;
				CASE  
					WHEN v_tot_lv_nodes_down > v_max_lv_nodes_down THEN 
						SET v_max_lv_nodes_down = v_tot_lv_nodes_down;
					WHEN v_tot_lv_nodes_down <= v_min_lv_nodes_down THEN
						SET v_min_lv_nodes_down = v_tot_lv_nodes_down;
				END CASE;				
				set v_case_lvl = 'v_tot_nodes_down:'+v_tot_nodes_down+', v_max_nodes_down:'+v_max_nodes_down+', v_min_nodes_down:'+v_min_nodes_down;
				CASE  
					WHEN v_tot_nodes_down > v_max_nodes_down THEN 
						SET v_max_nodes_down = v_tot_nodes_down;
					WHEN v_tot_nodes_down <= v_min_nodes_down THEN
						SET v_min_nodes_down = v_tot_nodes_down;
				END CASE;				
				set v_case_lvl = 'v_tot_nodes_up:'+v_tot_nodes_up+', v_max_nodes_up:'+v_max_nodes_up+', v_min_nodes_up:'+v_min_nodes_up;
				CASE  
					WHEN v_tot_nodes_up > v_max_nodes_up THEN 
						SET v_max_nodes_up = v_tot_nodes_up;
					WHEN v_tot_nodes_up <= v_min_nodes_up THEN
						SET v_min_nodes_up = v_tot_nodes_up;
				END CASE;				
				set v_case_lvl = 'v_dual_radios:'+v_dual_radios+', v_max_dual_radios:'+v_max_dual_radios+', v_min_dual_radios:'+v_min_dual_radios;
				CASE  
					WHEN v_dual_radios > v_max_dual_radios THEN 
						SET v_max_dual_radios = v_dual_radios;
					WHEN v_dual_radios <= v_min_dual_radios THEN
						SET v_min_dual_radios = v_dual_radios;
				END CASE;				
				set v_case_lvl = 'v_single_radios:'+v_single_radios+', v_max_single_radios:'+v_max_single_radios+', v_min_single_radios:'+v_min_single_radios;
				CASE  
					WHEN v_single_radios > v_max_single_radios THEN 
						SET v_max_single_radios = v_single_radios;
					WHEN v_single_radios <= v_min_single_radios THEN
						SET v_min_single_radios = v_single_radios;
				END CASE;				
			END IF;
			
			
			UPDATE `rd`.`mesh_daily_summaries`
			SET
				`min_clients` = v_min_clients,
				`max_clients` = v_max_clients,
				`min_nodes` = v_min_nodes,
				`max_nodes` = v_max_nodes,
				`min_lv_nodes` = v_min_lv_nodes,
				`max_lv_nodes` = v_max_lv_nodes,
				`min_lv_nodes_down` = v_min_lv_nodes_down,
				`max_lv_nodes_down` = v_max_lv_nodes_down,
				`min_nodes_down` = v_min_nodes_down,
				`max_nodes_down` = v_max_nodes_down,
				`min_nodes_up` = v_min_nodes_up,
				`max_nodes_up` = v_max_nodes_up,
				`min_dual_radios` = v_min_dual_radios,
				`max_dual_radios` = v_max_dual_radios,
				`min_single_radios` = v_min_single_radios,
				`max_single_radios` = v_max_single_radios
			WHERE  mesh_id = v_mesh_id and the_date = v_the_date;
			
		END mesh_summary_update_block;
		set mesh_cnt = mesh_cnt + 1;
	END LOOP get_meshes;
	 
	CLOSE all_meshes_cursor;
	
	
	SET v_finished = 0;
	set v_last_mesh_id = 0;
	
	OPEN mesh_uptime_cursor;
	 
	get_mesh_uptime: LOOP
	 
		FETCH mesh_uptime_cursor INTO 
			v_mesh_id,
			v_node_state,
			v_beg_remove_secs,
			v_end_add_secs,
			v_up_seconds,
			v_down_seconds;
	
		IF v_finished = 1 THEN 
			LEAVE get_mesh_uptime;
		END IF;
		
		uptime_update_block: begin
			DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
				SET err_update_cnt = err_update_cnt + 1;
			
			IF v_mesh_id != v_last_mesh_id then
				
				UPDATE `rd`.`rolling_last_hour`
					SET
						`nup_beg_remove_secs` = v_nup_beg_remove_secs,
						`nup_end_add_secs` = v_nup_end_add_secs,
						`nup_up_seconds` = v_nup_up_seconds,
						`nup_down_seconds` = v_nup_down_seconds,
						`ndwn_beg_remove_secs` = v_ndwn_beg_remove_secs,
						`ndwn_end_add_secs` = v_ndwn_end_add_secs,
						`ndwn_up_seconds` = v_ndwn_up_seconds,
						`ndwn_down_seconds` = v_ndwn_down_seconds
				WHERE `mesh_id` = v_last_mesh_id;
				
				set v_last_mesh_id = v_mesh_id;
				set v_nup_beg_remove_secs = 0;
				set v_nup_end_add_secs = 0;
				set v_nup_up_seconds = 0;
				set v_nup_down_seconds = 0;
				set v_ndwn_beg_remove_secs = 0;
				set v_ndwn_end_add_secs = 0;
				set v_ndwn_up_seconds = 0;
				set v_ndwn_down_seconds = 0;
				IF v_node_state = 1 then
					set v_nup_beg_remove_secs = v_beg_remove_secs;
					set v_nup_end_add_secs = v_end_add_secs;
					set v_nup_up_seconds = v_up_seconds;
					set v_nup_down_seconds = v_down_seconds;				
				ELSE
					set v_ndwn_beg_remove_secs = v_beg_remove_secs;
					set v_ndwn_end_add_secs = v_end_add_secs;
					set v_ndwn_up_seconds = v_up_seconds;
					set v_ndwn_down_seconds = v_down_seconds;
				END IF;
			ELSE
				
				IF v_node_state = 1 then
					set v_nup_beg_remove_secs = v_beg_remove_secs;
					set v_nup_end_add_secs = v_end_add_secs;
					set v_nup_up_seconds = v_up_seconds;
					set v_nup_down_seconds = v_down_seconds;				
				ELSE
					set v_ndwn_beg_remove_secs = v_beg_remove_secs;
					set v_ndwn_end_add_secs = v_end_add_secs;
					set v_ndwn_up_seconds = v_up_seconds;
					set v_ndwn_down_seconds = v_down_seconds;
				END IF;
			END IF;
			
		END uptime_update_block; 
	END LOOP get_mesh_uptime;
	
	CLOSE mesh_uptime_cursor;
 
END meshes_block ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_update_rolling_last_ninety_days` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_rolling_last_ninety_days`(in in_date_time varchar(255),in in_date varchar(255), in dead_seconds integer, OUT mesh_cnt integer, OUT ins_err_cnt integer, out err_update_cnt integer)
meshes_block: BEGIN
 
	DECLARE v_finished INTEGER DEFAULT 0;							
	DECLARE v_seconds INTEGER DEFAULT ((60*60)*24)*91;					
	
	DECLARE v_modified INTEGER DEFAULT UNIX_TIMESTAMP(in_date_time)-v_seconds;	
	DECLARE v_modified_top INTEGER DEFAULT UNIX_TIMESTAMP(in_date_time);
	
	DECLARE v_mesh_id INTEGER;
	DECLARE v_mesh_name varchar(255);
	DECLARE v_tree_tag_id INTEGER;
	DECLARE v_tot_clients bigint(20) default 0;
	DECLARE v_tot_tx_bytes bigint(20) default 0;
	DECLARE v_tot_rx_bytes bigint(20) default 0;
	DECLARE v_tot_bytes bigint(20) default 0;
	DECLARE v_tot_nodes bigint(20) default 0;
	DECLARE v_tot_lv_nodes bigint(20) default 0;
	DECLARE v_tot_lv_nodes_down bigint(20) default 0;
	DECLARE v_tot_nodes_down bigint(20) default 0;
	DECLARE v_tot_nodes_up bigint(20) default 0;
	DECLARE v_dual_radios bigint(20) default 0;
	DECLARE v_single_radios bigint(20) default 0;
	
	DECLARE v_now DATETIME default now();
	
	
	DECLARE v_the_date DATE default DATE_SUB(in_date, INTERVAL 91 DAY);
	DECLARE v_the_date_top DATE default DATE_SUB(in_date, INTERVAL 1 DAY);
	
	DECLARE v_last_mesh_id INTEGER DEFAULT 0;						
	DECLARE v_node_state INTEGER DEFAULT 0;
	DECLARE v_beg_remove_secs FLOAT(14,2) default 0;
	DECLARE v_end_add_secs FLOAT(14,2) default 0;
	DECLARE v_up_seconds FLOAT(14,2) default 0;
	DECLARE v_down_seconds FLOAT(14,2) default 0;
	
	DECLARE v_nup_beg_remove_secs FLOAT(14,2) default 0;
	DECLARE v_nup_end_add_secs FLOAT(14,2) default 0;
	DECLARE v_nup_up_seconds FLOAT(14,2) default 0;
	DECLARE v_nup_down_seconds FLOAT(14,2) default 0;
	DECLARE v_ndwn_beg_remove_secs FLOAT(14,2) default 0;
	DECLARE v_ndwn_end_add_secs FLOAT(14,2) default 0;
	DECLARE v_ndwn_up_seconds FLOAT(14,2) default 0;
	DECLARE v_ndwn_down_seconds FLOAT(14,2) default 0;
		
	
	DECLARE all_meshes_cursor CURSOR FOR 
		select m.id as mesh_id, 
			m.name as mesh_name, 
			m.tree_tag_id, 
			ifnull(dt_cnts.d_max_clients,0) as tot_clients, 
			ifnull(dt_cnts.tot_tx_bytes,0) as tot_tx_bytes, 
			ifnull(dt_cnts.tot_rx_bytes,0) as tot_rx_bytes, 
			ifnull(dt_cnts.tot_bytes,0) as tot_bytes,
			ifnull(ds_cnts.d_max_nodes,0) as tot_nodes, 
			ifnull(ds_cnts.d_max_lv_nodes,0) as tot_lv_nodes, 
			ifnull(ds_cnts.d_max_lv_nodes_down,0) as tot_lv_nodes_down, 
			ifnull(ds_cnts.d_max_nodes_down,0) as tot_nodes_down, 
			ifnull(ds_cnts.d_max_nodes_up,0) as tot_nodes_up, 
			ifnull(ds_cnts.d_max_dual_radios,0) as dual_radios, 
			ifnull(ds_cnts.d_max_single_radios,0) as single_radios  
		from meshes as m 
		left outer join (
			select mesh_id,
					d_max_nodes,
					d_max_lv_nodes,
					d_max_lv_nodes_down,
					d_max_nodes_down,
					d_max_nodes_up,
					d_max_dual_radios,
					d_max_single_radios
				from (
					 select mesh_id,
						
						max(max_nodes) as d_max_nodes,
						max(max_lv_nodes) as d_max_lv_nodes,
						max(max_lv_nodes_down) as d_max_lv_nodes_down,
						max(max_nodes_down) as d_max_nodes_down,
						max(max_nodes_up) as d_max_nodes_up,
						max(max_dual_radios) as d_max_dual_radios,
						max(max_single_radios) as d_max_single_radios
					from mesh_daily_summaries
					where the_date between v_the_date and v_the_date_top
					 UNION ALL 
					select mesh_id,
						
						max(max_nodes) as d_max_nodes,
						max(max_lv_nodes) as d_max_lv_nodes,
						max(max_lv_nodes_down) as d_max_lv_nodes_down,
						max(max_nodes_down) as d_max_nodes_down,
						max(max_nodes_up) as d_max_nodes_up,
						max(max_dual_radios) as d_max_dual_radios,
						max(max_single_radios) as d_max_single_radios
					from ar_mesh_daily_summaries
					where the_date between v_the_date and v_the_date_top
				) as mdsaru_cnts
				group by mesh_id
			) as ds_cnts on ds_cnts.mesh_id = m.id
		left outer join ( 
			select mesh_id,
				d_max_clients,
                tot_tx_bytes,
                tot_rx_bytes,
                tot_bytes
                from (
					select n.mesh_id as mesh_id, 
						count(distinct ns.mac) as d_max_clients, 
						sum(ns.tx_bytes) as tot_tx_bytes, 
						sum(ns.rx_bytes) as tot_rx_bytes, 
						sum(ns.tx_bytes + ns.rx_bytes) as tot_bytes 
						from node_stations ns 
						inner join nodes n on n.id = ns.node_id 
						where (UNIX_TIMESTAMP(ns.modified) between v_modified and v_modified_top)
					UNION ALL
					select n1.mesh_id as mesh_id, 
						count(distinct arns.mac) as d_max_clients, 
						sum(arns.tx_bytes) as tot_tx_bytes, 
						sum(arns.rx_bytes) as tot_rx_bytes, 
						sum(arns.tx_bytes + arns.rx_bytes) as tot_bytes 
						from ar_node_stations arns 
						inner join nodes n1 on n1.id = arns.node_id 
						where (UNIX_TIMESTAMP(arns.modified) between v_modified and v_modified_top)
				) as nsaru_cnts
				group by mesh_id
		) as dt_cnts on dt_cnts.mesh_id = m.id 

		group by m.id,m.name,m.tree_tag_id;
	 
	
	DECLARE mesh_uptime_cursor CURSOR FOR 
		select 
			mesh_id,
			node_state,
            sum(beg_remove_secs) as beg_rem_secs,
            sum(end_add_secs) as end_add_secs,
            sum(up_seconds) as m_up_secs,
			sum(down_seconds) as m_dwn_secs
		from (
			select n.mesh_id as mesh_id,
				nuh.node_id as node_id,
				nuh.node_state, 
				case 
					when UNIX_TIMESTAMP(nuh.state_datetime) < v_modified then 
						v_modified - UNIX_TIMESTAMP(nuh.state_datetime)  
					else 
						0 
				end as beg_remove_secs, 
				case 
					when UNIX_TIMESTAMP(nuh.modified) > v_modified_top AND UNIX_TIMESTAMP(nuh.created) < v_modified_top then 
						UNIX_TIMESTAMP(nuh.modified) - v_modified_top
					else 
						0 
				end as end_add_secs, 
				case  
					when node_state = 1 then UNIX_TIMESTAMP(nuh.report_datetime) - UNIX_TIMESTAMP(nuh.created) 
					else 0 
				end as up_seconds, 
				case  
					when node_state = 0 then UNIX_TIMESTAMP(nuh.modified) - UNIX_TIMESTAMP(nuh.state_datetime) 
					else 0 
				end as down_seconds 
			from node_uptm_histories nuh 
			inner join nodes n on n.id = nuh.node_id 
			left outer join node_settings n_set on n_set.mesh_id = n.mesh_id
			where  UNIX_TIMESTAMP(nuh.report_datetime) > v_modified 
					  and (n.last_contact is not null AND UNIX_TIMESTAMP(n.last_contact) > v_modified)
					  and n.mesh_id is not null
        ) as uptm
		group by mesh_id,node_state
        order by mesh_id asc;	
	
	
	DECLARE CONTINUE HANDLER 
			FOR NOT FOUND SET v_finished = 1;
			
	
	
	set mesh_cnt = 0;
	set ins_err_cnt = 0;
	set err_update_cnt = 0;

	
	truncate rolling_last_ninety_days;
	
	
	OPEN all_meshes_cursor;
	 
	get_meshes: LOOP
	 
		FETCH all_meshes_cursor INTO 
			v_mesh_id,
			v_mesh_name,
			v_tree_tag_id,
			v_tot_clients,
			v_tot_tx_bytes,
			v_tot_rx_bytes,
			v_tot_bytes,
			v_tot_nodes,
			v_tot_lv_nodes,
			v_tot_lv_nodes_down,
			v_tot_nodes_down,
			v_tot_nodes_up,
			v_dual_radios,
			v_single_radios;
	 
		IF v_finished = 1 THEN 
			LEAVE get_meshes; 
		END IF;
		
		mesh_update_block: begin
			
			DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
				SET ins_err_cnt = ins_err_cnt + 1; 				
			INSERT INTO `rd`.`rolling_last_ninety_days` (
				`mesh_id`,
				`tree_tag_id`,
				`mesh_name`,
				`tot_clients`,
				`tot_tx_bytes`,
				`tot_rx_bytes`,
				`tot_bytes`,
				`tot_nodes`,
				`tot_lv_nodes`,
				`tot_lv_nodes_down`,
				`tot_nodes_down`,
				`tot_nodes_up`,
				`dual_radios`,
				`single_radios`
			) VALUES (
				v_mesh_id,
				v_tree_tag_id,
				v_mesh_name,
				v_tot_clients,
				v_tot_tx_bytes,
				v_tot_rx_bytes,
				v_tot_bytes,
				v_tot_nodes,
				v_tot_lv_nodes,
				v_tot_lv_nodes_down,
				v_tot_nodes_down,
				v_tot_nodes_up,
				v_dual_radios,
				v_single_radios
			);
		END mesh_update_block;
		
		set mesh_cnt = mesh_cnt + 1;
	END LOOP get_meshes;
	 
	CLOSE all_meshes_cursor;
	
	
	SET v_finished = 0;
	set v_last_mesh_id = 0;
	
	OPEN mesh_uptime_cursor;
	 
	get_mesh_uptime: LOOP
	 
		FETCH mesh_uptime_cursor INTO 
			v_mesh_id,
			v_node_state,
			v_beg_remove_secs,
			v_end_add_secs,
			v_up_seconds,
			v_down_seconds;
	
		IF v_finished = 1 THEN 
			LEAVE get_mesh_uptime;
		END IF;
		
		uptime_update_block: begin
			DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
				SET err_update_cnt = err_update_cnt + 1;
			
			IF v_mesh_id != v_last_mesh_id then
				
				UPDATE `rd`.`rolling_last_ninety_days`
					SET
						`nup_beg_remove_secs` = v_nup_beg_remove_secs,
						`nup_end_add_secs` = v_nup_end_add_secs,
						`nup_up_seconds` = v_nup_up_seconds,
						`nup_down_seconds` = v_nup_down_seconds,
						`ndwn_beg_remove_secs` = v_ndwn_beg_remove_secs,
						`ndwn_end_add_secs` = v_ndwn_end_add_secs,
						`ndwn_up_seconds` = v_ndwn_up_seconds,
						`ndwn_down_seconds` = v_ndwn_down_seconds
				WHERE `mesh_id` = v_last_mesh_id;
				
				set v_last_mesh_id = v_mesh_id;
				set v_nup_beg_remove_secs = 0;
				set v_nup_end_add_secs = 0;
				set v_nup_up_seconds = 0;
				set v_nup_down_seconds = 0;
				set v_ndwn_beg_remove_secs = 0;
				set v_ndwn_end_add_secs = 0;
				set v_ndwn_up_seconds = 0;
				set v_ndwn_down_seconds = 0;
				IF v_node_state = 1 then
					set v_nup_beg_remove_secs = v_beg_remove_secs;
					set v_nup_end_add_secs = v_end_add_secs;
					set v_nup_up_seconds = v_up_seconds;
					set v_nup_down_seconds = v_down_seconds;				
				ELSE
					set v_ndwn_beg_remove_secs = v_beg_remove_secs;
					set v_ndwn_end_add_secs = v_end_add_secs;
					set v_ndwn_up_seconds = v_up_seconds;
					set v_ndwn_down_seconds = v_down_seconds;
				END IF;
			ELSE
				
				IF v_node_state = 1 then
					set v_nup_beg_remove_secs = v_beg_remove_secs;
					set v_nup_end_add_secs = v_end_add_secs;
					set v_nup_up_seconds = v_up_seconds;
					set v_nup_down_seconds = v_down_seconds;				
				ELSE
					set v_ndwn_beg_remove_secs = v_beg_remove_secs;
					set v_ndwn_end_add_secs = v_end_add_secs;
					set v_ndwn_up_seconds = v_up_seconds;
					set v_ndwn_down_seconds = v_down_seconds;
				END IF;
			END IF;
			
		END uptime_update_block; 
	END LOOP get_mesh_uptime;
	
	CLOSE mesh_uptime_cursor;
 
END meshes_block ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_update_rolling_last_seven_days` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_rolling_last_seven_days`(in in_date_time varchar(255),in in_date varchar(255), in dead_seconds integer, OUT mesh_cnt integer, OUT ins_err_cnt integer, out err_update_cnt integer)
meshes_block: BEGIN
 
	DECLARE v_finished INTEGER DEFAULT 0;							
	DECLARE v_seconds INTEGER DEFAULT ((60*60)*24)*8;					
	
	DECLARE v_modified INTEGER DEFAULT UNIX_TIMESTAMP(in_date_time)-v_seconds;	
	DECLARE v_modified_top INTEGER DEFAULT UNIX_TIMESTAMP(in_date_time);
	
	DECLARE v_mesh_id INTEGER;
	DECLARE v_mesh_name varchar(255);
	DECLARE v_tree_tag_id INTEGER;
	DECLARE v_tot_clients bigint(20) default 0;
	DECLARE v_tot_tx_bytes bigint(20) default 0;
	DECLARE v_tot_rx_bytes bigint(20) default 0;
	DECLARE v_tot_bytes bigint(20) default 0;
	DECLARE v_tot_nodes bigint(20) default 0;
	DECLARE v_tot_lv_nodes bigint(20) default 0;
	DECLARE v_tot_lv_nodes_down bigint(20) default 0;
	DECLARE v_tot_nodes_down bigint(20) default 0;
	DECLARE v_tot_nodes_up bigint(20) default 0;
	DECLARE v_dual_radios bigint(20) default 0;
	DECLARE v_single_radios bigint(20) default 0;
	
	DECLARE v_now DATETIME default now();
	
	
	DECLARE v_the_date DATE default DATE_SUB(in_date, INTERVAL 8 DAY);
	DECLARE v_the_date_top DATE default DATE_SUB(in_date, INTERVAL 1 DAY);
	
	DECLARE v_last_mesh_id INTEGER DEFAULT 0;						
	DECLARE v_node_state INTEGER DEFAULT 0;
	DECLARE v_beg_remove_secs FLOAT(14,2) default 0;
	DECLARE v_end_add_secs FLOAT(14,2) default 0;
	DECLARE v_up_seconds FLOAT(14,2) default 0;
	DECLARE v_down_seconds FLOAT(14,2) default 0;
	
	DECLARE v_nup_beg_remove_secs FLOAT(14,2) default 0;
	DECLARE v_nup_end_add_secs FLOAT(14,2) default 0;
	DECLARE v_nup_up_seconds FLOAT(14,2) default 0;
	DECLARE v_nup_down_seconds FLOAT(14,2) default 0;
	DECLARE v_ndwn_beg_remove_secs FLOAT(14,2) default 0;
	DECLARE v_ndwn_end_add_secs FLOAT(14,2) default 0;
	DECLARE v_ndwn_up_seconds FLOAT(14,2) default 0;
	DECLARE v_ndwn_down_seconds FLOAT(14,2) default 0;
		
	
	DECLARE all_meshes_cursor CURSOR FOR 
		select m.id as mesh_id, 
			m.name as mesh_name, 
			m.tree_tag_id, 
			ifnull(dt_cnts.d_max_clients,0) as tot_clients, 
			ifnull(dt_cnts.tot_tx_bytes,0) as tot_tx_bytes, 
			ifnull(dt_cnts.tot_rx_bytes,0) as tot_rx_bytes, 
			ifnull(dt_cnts.tot_bytes,0) as tot_bytes,
			ifnull(ds_cnts.d_max_nodes,0) as tot_nodes, 
			ifnull(ds_cnts.d_max_lv_nodes,0) as tot_lv_nodes, 
			ifnull(ds_cnts.d_max_lv_nodes_down,0) as tot_lv_nodes_down, 
			ifnull(ds_cnts.d_max_nodes_down,0) as tot_nodes_down, 
			ifnull(ds_cnts.d_max_nodes_up,0) as tot_nodes_up, 
			ifnull(ds_cnts.d_max_dual_radios,0) as dual_radios, 
			ifnull(ds_cnts.d_max_single_radios,0) as single_radios  
		from meshes as m 
		left outer join (
				select mesh_id,
					
					max(max_nodes) as d_max_nodes,
					max(max_lv_nodes) as d_max_lv_nodes,
					max(max_lv_nodes_down) as d_max_lv_nodes_down,
					max(max_nodes_down) as d_max_nodes_down,
					max(max_nodes_up) as d_max_nodes_up,
					max(max_dual_radios) as d_max_dual_radios,
					max(max_single_radios) as d_max_single_radios
					from mesh_daily_summaries
					where the_date between v_the_date and v_the_date_top
					group by mesh_id
		) as ds_cnts on ds_cnts.mesh_id = m.id
		left outer join ( 
				select n.mesh_id, 
				count(distinct ns.mac) as d_max_clients, 
				sum(ns.tx_bytes) as tot_tx_bytes, 
				sum(ns.rx_bytes) as tot_rx_bytes, 
				sum(ns.tx_bytes + ns.rx_bytes) as tot_bytes 
				from node_stations ns 
				inner join nodes n on n.id = ns.node_id 
				where (UNIX_TIMESTAMP(ns.modified) between v_modified and v_modified_top)
				group by n.mesh_id) 
			as dt_cnts on dt_cnts.mesh_id = m.id 

		group by m.id,m.name,m.tree_tag_id;
	 
	
	DECLARE mesh_uptime_cursor CURSOR FOR 
		select 
			mesh_id,
			node_state,
            sum(beg_remove_secs) as beg_rem_secs,
            sum(end_add_secs) as end_add_secs,
            sum(up_seconds) as m_up_secs,
			sum(down_seconds) as m_dwn_secs
		from (
			select n.mesh_id as mesh_id,
				nuh.node_id as node_id,
				nuh.node_state, 
				case 
					when UNIX_TIMESTAMP(nuh.state_datetime) < v_modified then 
						v_modified - UNIX_TIMESTAMP(nuh.state_datetime)  
					else 
						0 
				end as beg_remove_secs, 
				case 
					when UNIX_TIMESTAMP(nuh.modified) > v_modified_top AND UNIX_TIMESTAMP(nuh.created) < v_modified_top then 
						UNIX_TIMESTAMP(nuh.modified) - v_modified_top
					else 
						0 
				end as end_add_secs, 
				case  
					when node_state = 1 then UNIX_TIMESTAMP(nuh.report_datetime) - UNIX_TIMESTAMP(nuh.created) 
					else 0 
				end as up_seconds, 
				case  
					when node_state = 0 then UNIX_TIMESTAMP(nuh.modified) - UNIX_TIMESTAMP(nuh.state_datetime) 
					else 0 
				end as down_seconds 
			from node_uptm_histories nuh 
			inner join nodes n on n.id = nuh.node_id 
			left outer join node_settings n_set on n_set.mesh_id = n.mesh_id
			where  UNIX_TIMESTAMP(nuh.report_datetime) > v_modified 
					  and (n.last_contact is not null AND UNIX_TIMESTAMP(n.last_contact) > v_modified)
					  and n.mesh_id is not null
        ) as uptm
		group by mesh_id,node_state
        order by mesh_id asc;	
	
	
	DECLARE CONTINUE HANDLER 
			FOR NOT FOUND SET v_finished = 1;
			
	
	
	set mesh_cnt = 0;
	set ins_err_cnt = 0;
	set err_update_cnt = 0;

	
	truncate rolling_last_seven_days;
	
	
	OPEN all_meshes_cursor;
	 
	get_meshes: LOOP
	 
		FETCH all_meshes_cursor INTO 
			v_mesh_id,
			v_mesh_name,
			v_tree_tag_id,
			v_tot_clients,
			v_tot_tx_bytes,
			v_tot_rx_bytes,
			v_tot_bytes,
			v_tot_nodes,
			v_tot_lv_nodes,
			v_tot_lv_nodes_down,
			v_tot_nodes_down,
			v_tot_nodes_up,
			v_dual_radios,
			v_single_radios;
	 
		IF v_finished = 1 THEN 
			LEAVE get_meshes; 
		END IF;
		
		mesh_update_block: begin
			
			DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
				SET ins_err_cnt = ins_err_cnt + 1; 				
			INSERT INTO `rd`.`rolling_last_seven_days` (
				`mesh_id`,
				`tree_tag_id`,
				`mesh_name`,
				`tot_clients`,
				`tot_tx_bytes`,
				`tot_rx_bytes`,
				`tot_bytes`,
				`tot_nodes`,
				`tot_lv_nodes`,
				`tot_lv_nodes_down`,
				`tot_nodes_down`,
				`tot_nodes_up`,
				`dual_radios`,
				`single_radios`
			) VALUES (
				v_mesh_id,
				v_tree_tag_id,
				v_mesh_name,
				v_tot_clients,
				v_tot_tx_bytes,
				v_tot_rx_bytes,
				v_tot_bytes,
				v_tot_nodes,
				v_tot_lv_nodes,
				v_tot_lv_nodes_down,
				v_tot_nodes_down,
				v_tot_nodes_up,
				v_dual_radios,
				v_single_radios
			);
		END mesh_update_block;
		
		set mesh_cnt = mesh_cnt + 1;
	END LOOP get_meshes;
	 
	CLOSE all_meshes_cursor;
	
	
	SET v_finished = 0;
	set v_last_mesh_id = 0;
	
	OPEN mesh_uptime_cursor;
	 
	get_mesh_uptime: LOOP
	 
		FETCH mesh_uptime_cursor INTO 
			v_mesh_id,
			v_node_state,
			v_beg_remove_secs,
			v_end_add_secs,
			v_up_seconds,
			v_down_seconds;
	
		IF v_finished = 1 THEN 
			LEAVE get_mesh_uptime;
		END IF;
		
		uptime_update_block: begin
			DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
				SET err_update_cnt = err_update_cnt + 1;
			
			IF v_mesh_id != v_last_mesh_id then
				
				UPDATE `rd`.`rolling_last_seven_days`
					SET
						`nup_beg_remove_secs` = v_nup_beg_remove_secs,
						`nup_end_add_secs` = v_nup_end_add_secs,
						`nup_up_seconds` = v_nup_up_seconds,
						`nup_down_seconds` = v_nup_down_seconds,
						`ndwn_beg_remove_secs` = v_ndwn_beg_remove_secs,
						`ndwn_end_add_secs` = v_ndwn_end_add_secs,
						`ndwn_up_seconds` = v_ndwn_up_seconds,
						`ndwn_down_seconds` = v_ndwn_down_seconds
				WHERE `mesh_id` = v_last_mesh_id;
				
				set v_last_mesh_id = v_mesh_id;
				set v_nup_beg_remove_secs = 0;
				set v_nup_end_add_secs = 0;
				set v_nup_up_seconds = 0;
				set v_nup_down_seconds = 0;
				set v_ndwn_beg_remove_secs = 0;
				set v_ndwn_end_add_secs = 0;
				set v_ndwn_up_seconds = 0;
				set v_ndwn_down_seconds = 0;
				IF v_node_state = 1 then
					set v_nup_beg_remove_secs = v_beg_remove_secs;
					set v_nup_end_add_secs = v_end_add_secs;
					set v_nup_up_seconds = v_up_seconds;
					set v_nup_down_seconds = v_down_seconds;				
				ELSE
					set v_ndwn_beg_remove_secs = v_beg_remove_secs;
					set v_ndwn_end_add_secs = v_end_add_secs;
					set v_ndwn_up_seconds = v_up_seconds;
					set v_ndwn_down_seconds = v_down_seconds;
				END IF;
			ELSE
				
				IF v_node_state = 1 then
					set v_nup_beg_remove_secs = v_beg_remove_secs;
					set v_nup_end_add_secs = v_end_add_secs;
					set v_nup_up_seconds = v_up_seconds;
					set v_nup_down_seconds = v_down_seconds;				
				ELSE
					set v_ndwn_beg_remove_secs = v_beg_remove_secs;
					set v_ndwn_end_add_secs = v_end_add_secs;
					set v_ndwn_up_seconds = v_up_seconds;
					set v_ndwn_down_seconds = v_down_seconds;
				END IF;
			END IF;
			
		END uptime_update_block; 
	END LOOP get_mesh_uptime;
	
	CLOSE mesh_uptime_cursor;
 
END meshes_block ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_update_rolling_last_sixty_days` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_rolling_last_sixty_days`(in in_date_time varchar(255),in in_date varchar(255), in dead_seconds integer, OUT mesh_cnt integer, OUT ins_err_cnt integer, out err_update_cnt integer)
meshes_block: BEGIN
 
	DECLARE v_finished INTEGER DEFAULT 0;							
	DECLARE v_seconds INTEGER DEFAULT ((60*60)*24)*61;					
	
	DECLARE v_modified INTEGER DEFAULT UNIX_TIMESTAMP(in_date_time)-v_seconds;	
	DECLARE v_modified_top INTEGER DEFAULT UNIX_TIMESTAMP(in_date_time);
	
	DECLARE v_mesh_id INTEGER;
	DECLARE v_mesh_name varchar(255);
	DECLARE v_tree_tag_id INTEGER;
	DECLARE v_tot_clients bigint(20) default 0;
	DECLARE v_tot_tx_bytes bigint(20) default 0;
	DECLARE v_tot_rx_bytes bigint(20) default 0;
	DECLARE v_tot_bytes bigint(20) default 0;
	DECLARE v_tot_nodes bigint(20) default 0;
	DECLARE v_tot_lv_nodes bigint(20) default 0;
	DECLARE v_tot_lv_nodes_down bigint(20) default 0;
	DECLARE v_tot_nodes_down bigint(20) default 0;
	DECLARE v_tot_nodes_up bigint(20) default 0;
	DECLARE v_dual_radios bigint(20) default 0;
	DECLARE v_single_radios bigint(20) default 0;
	
	DECLARE v_now DATETIME default now();
	
	
	DECLARE v_the_date DATE default DATE_SUB(in_date, INTERVAL 61 DAY);
	DECLARE v_the_date_top DATE default DATE_SUB(in_date, INTERVAL 1 DAY);
	
	DECLARE v_last_mesh_id INTEGER DEFAULT 0;						
	DECLARE v_node_state INTEGER DEFAULT 0;
	DECLARE v_beg_remove_secs FLOAT(14,2) default 0;
	DECLARE v_end_add_secs FLOAT(14,2) default 0;
	DECLARE v_up_seconds FLOAT(14,2) default 0;
	DECLARE v_down_seconds FLOAT(14,2) default 0;
	
	DECLARE v_nup_beg_remove_secs FLOAT(14,2) default 0;
	DECLARE v_nup_end_add_secs FLOAT(14,2) default 0;
	DECLARE v_nup_up_seconds FLOAT(14,2) default 0;
	DECLARE v_nup_down_seconds FLOAT(14,2) default 0;
	DECLARE v_ndwn_beg_remove_secs FLOAT(14,2) default 0;
	DECLARE v_ndwn_end_add_secs FLOAT(14,2) default 0;
	DECLARE v_ndwn_up_seconds FLOAT(14,2) default 0;
	DECLARE v_ndwn_down_seconds FLOAT(14,2) default 0;
		
	
	DECLARE all_meshes_cursor CURSOR FOR 
		select m.id as mesh_id, 
			m.name as mesh_name, 
			m.tree_tag_id, 
			ifnull(dt_cnts.d_max_clients,0) as tot_clients, 
			ifnull(dt_cnts.tot_tx_bytes,0) as tot_tx_bytes, 
			ifnull(dt_cnts.tot_rx_bytes,0) as tot_rx_bytes, 
			ifnull(dt_cnts.tot_bytes,0) as tot_bytes,
			ifnull(ds_cnts.d_max_nodes,0) as tot_nodes, 
			ifnull(ds_cnts.d_max_lv_nodes,0) as tot_lv_nodes, 
			ifnull(ds_cnts.d_max_lv_nodes_down,0) as tot_lv_nodes_down, 
			ifnull(ds_cnts.d_max_nodes_down,0) as tot_nodes_down, 
			ifnull(ds_cnts.d_max_nodes_up,0) as tot_nodes_up, 
			ifnull(ds_cnts.d_max_dual_radios,0) as dual_radios, 
			ifnull(ds_cnts.d_max_single_radios,0) as single_radios  
		from meshes as m 
		left outer join (
			select mesh_id,
					d_max_nodes,
					d_max_lv_nodes,
					d_max_lv_nodes_down,
					d_max_nodes_down,
					d_max_nodes_up,
					d_max_dual_radios,
					d_max_single_radios
				from (
					 select mesh_id,
						
						max(max_nodes) as d_max_nodes,
						max(max_lv_nodes) as d_max_lv_nodes,
						max(max_lv_nodes_down) as d_max_lv_nodes_down,
						max(max_nodes_down) as d_max_nodes_down,
						max(max_nodes_up) as d_max_nodes_up,
						max(max_dual_radios) as d_max_dual_radios,
						max(max_single_radios) as d_max_single_radios
					from mesh_daily_summaries
					where the_date between v_the_date and v_the_date_top
					 UNION ALL 
					select mesh_id,
						
						max(max_nodes) as d_max_nodes,
						max(max_lv_nodes) as d_max_lv_nodes,
						max(max_lv_nodes_down) as d_max_lv_nodes_down,
						max(max_nodes_down) as d_max_nodes_down,
						max(max_nodes_up) as d_max_nodes_up,
						max(max_dual_radios) as d_max_dual_radios,
						max(max_single_radios) as d_max_single_radios
					from ar_mesh_daily_summaries
					where the_date between v_the_date and v_the_date_top
				) as mdsaru_cnts
				group by mesh_id
			) as ds_cnts on ds_cnts.mesh_id = m.id
		left outer join ( 
			select mesh_id,
				d_max_clients,
                tot_tx_bytes,
                tot_rx_bytes,
                tot_bytes
                from (
					select n.mesh_id as mesh_id, 
						count(distinct ns.mac) as d_max_clients, 
						sum(ns.tx_bytes) as tot_tx_bytes, 
						sum(ns.rx_bytes) as tot_rx_bytes, 
						sum(ns.tx_bytes + ns.rx_bytes) as tot_bytes 
						from node_stations ns 
						inner join nodes n on n.id = ns.node_id 
						where (UNIX_TIMESTAMP(ns.modified) between v_modified and v_modified_top)
					UNION ALL
					select n1.mesh_id as mesh_id, 
						count(distinct arns.mac) as d_max_clients, 
						sum(arns.tx_bytes) as tot_tx_bytes, 
						sum(arns.rx_bytes) as tot_rx_bytes, 
						sum(arns.tx_bytes + arns.rx_bytes) as tot_bytes 
						from ar_node_stations arns 
						inner join nodes n1 on n1.id = arns.node_id 
						where (UNIX_TIMESTAMP(arns.modified) between v_modified and v_modified_top)
				) as nsaru_cnts
				group by mesh_id
		) as dt_cnts on dt_cnts.mesh_id = m.id 

		group by m.id,m.name,m.tree_tag_id;
	 
	
	DECLARE mesh_uptime_cursor CURSOR FOR 
		select 
			mesh_id,
			node_state,
            sum(beg_remove_secs) as beg_rem_secs,
            sum(end_add_secs) as end_add_secs,
            sum(up_seconds) as m_up_secs,
			sum(down_seconds) as m_dwn_secs
		from (
			select n.mesh_id as mesh_id,
				nuh.node_id as node_id,
				nuh.node_state, 
				case 
					when UNIX_TIMESTAMP(nuh.state_datetime) < v_modified then 
						v_modified - UNIX_TIMESTAMP(nuh.state_datetime)  
					else 
						0 
				end as beg_remove_secs, 
				case 
					when UNIX_TIMESTAMP(nuh.modified) > v_modified_top AND UNIX_TIMESTAMP(nuh.created) < v_modified_top then 
						UNIX_TIMESTAMP(nuh.modified) - v_modified_top
					else 
						0 
				end as end_add_secs, 
				case  
					when node_state = 1 then UNIX_TIMESTAMP(nuh.report_datetime) - UNIX_TIMESTAMP(nuh.created) 
					else 0 
				end as up_seconds, 
				case  
					when node_state = 0 then UNIX_TIMESTAMP(nuh.modified) - UNIX_TIMESTAMP(nuh.state_datetime) 
					else 0 
				end as down_seconds 
			from node_uptm_histories nuh 
			inner join nodes n on n.id = nuh.node_id 
			left outer join node_settings n_set on n_set.mesh_id = n.mesh_id
			where  UNIX_TIMESTAMP(nuh.report_datetime) > v_modified 
					  and (n.last_contact is not null AND UNIX_TIMESTAMP(n.last_contact) > v_modified)
					  and n.mesh_id is not null
        ) as uptm
		group by mesh_id,node_state
        order by mesh_id asc;	
	
	
	DECLARE CONTINUE HANDLER 
			FOR NOT FOUND SET v_finished = 1;
			
	
	
	set mesh_cnt = 0;
	set ins_err_cnt = 0;
	set err_update_cnt = 0;

	
	truncate rolling_last_sixty_days;
	
	
	OPEN all_meshes_cursor;
	 
	get_meshes: LOOP
	 
		FETCH all_meshes_cursor INTO 
			v_mesh_id,
			v_mesh_name,
			v_tree_tag_id,
			v_tot_clients,
			v_tot_tx_bytes,
			v_tot_rx_bytes,
			v_tot_bytes,
			v_tot_nodes,
			v_tot_lv_nodes,
			v_tot_lv_nodes_down,
			v_tot_nodes_down,
			v_tot_nodes_up,
			v_dual_radios,
			v_single_radios;
	 
		IF v_finished = 1 THEN 
			LEAVE get_meshes; 
		END IF;
		
		mesh_update_block: begin
			
			DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
				SET ins_err_cnt = ins_err_cnt + 1; 				
			INSERT INTO `rd`.`rolling_last_sixty_days` (
				`mesh_id`,
				`tree_tag_id`,
				`mesh_name`,
				`tot_clients`,
				`tot_tx_bytes`,
				`tot_rx_bytes`,
				`tot_bytes`,
				`tot_nodes`,
				`tot_lv_nodes`,
				`tot_lv_nodes_down`,
				`tot_nodes_down`,
				`tot_nodes_up`,
				`dual_radios`,
				`single_radios`
			) VALUES (
				v_mesh_id,
				v_tree_tag_id,
				v_mesh_name,
				v_tot_clients,
				v_tot_tx_bytes,
				v_tot_rx_bytes,
				v_tot_bytes,
				v_tot_nodes,
				v_tot_lv_nodes,
				v_tot_lv_nodes_down,
				v_tot_nodes_down,
				v_tot_nodes_up,
				v_dual_radios,
				v_single_radios
			);
		END mesh_update_block;
		
		set mesh_cnt = mesh_cnt + 1;
	END LOOP get_meshes;
	 
	CLOSE all_meshes_cursor;
	
	
	SET v_finished = 0;
	set v_last_mesh_id = 0;
	
	OPEN mesh_uptime_cursor;
	 
	get_mesh_uptime: LOOP
	 
		FETCH mesh_uptime_cursor INTO 
			v_mesh_id,
			v_node_state,
			v_beg_remove_secs,
			v_end_add_secs,
			v_up_seconds,
			v_down_seconds;
	
		IF v_finished = 1 THEN 
			LEAVE get_mesh_uptime;
		END IF;
		
		uptime_update_block: begin
			DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
				SET err_update_cnt = err_update_cnt + 1;
			
			IF v_mesh_id != v_last_mesh_id then
				
				UPDATE `rd`.`rolling_last_sixty_days`
					SET
						`nup_beg_remove_secs` = v_nup_beg_remove_secs,
						`nup_end_add_secs` = v_nup_end_add_secs,
						`nup_up_seconds` = v_nup_up_seconds,
						`nup_down_seconds` = v_nup_down_seconds,
						`ndwn_beg_remove_secs` = v_ndwn_beg_remove_secs,
						`ndwn_end_add_secs` = v_ndwn_end_add_secs,
						`ndwn_up_seconds` = v_ndwn_up_seconds,
						`ndwn_down_seconds` = v_ndwn_down_seconds
				WHERE `mesh_id` = v_last_mesh_id;
				
				set v_last_mesh_id = v_mesh_id;
				set v_nup_beg_remove_secs = 0;
				set v_nup_end_add_secs = 0;
				set v_nup_up_seconds = 0;
				set v_nup_down_seconds = 0;
				set v_ndwn_beg_remove_secs = 0;
				set v_ndwn_end_add_secs = 0;
				set v_ndwn_up_seconds = 0;
				set v_ndwn_down_seconds = 0;
				IF v_node_state = 1 then
					set v_nup_beg_remove_secs = v_beg_remove_secs;
					set v_nup_end_add_secs = v_end_add_secs;
					set v_nup_up_seconds = v_up_seconds;
					set v_nup_down_seconds = v_down_seconds;				
				ELSE
					set v_ndwn_beg_remove_secs = v_beg_remove_secs;
					set v_ndwn_end_add_secs = v_end_add_secs;
					set v_ndwn_up_seconds = v_up_seconds;
					set v_ndwn_down_seconds = v_down_seconds;
				END IF;
			ELSE
				
				IF v_node_state = 1 then
					set v_nup_beg_remove_secs = v_beg_remove_secs;
					set v_nup_end_add_secs = v_end_add_secs;
					set v_nup_up_seconds = v_up_seconds;
					set v_nup_down_seconds = v_down_seconds;				
				ELSE
					set v_ndwn_beg_remove_secs = v_beg_remove_secs;
					set v_ndwn_end_add_secs = v_end_add_secs;
					set v_ndwn_up_seconds = v_up_seconds;
					set v_ndwn_down_seconds = v_down_seconds;
				END IF;
			END IF;
			
		END uptime_update_block; 
	END LOOP get_mesh_uptime;
	
	CLOSE mesh_uptime_cursor;
 
END meshes_block ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_update_rolling_last_thirty_days` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_rolling_last_thirty_days`(in in_date_time varchar(255),in in_date varchar(255), in dead_seconds integer, OUT mesh_cnt integer, OUT ins_err_cnt integer, out err_update_cnt integer)
meshes_block: BEGIN
 
	DECLARE v_finished INTEGER DEFAULT 0;							
	DECLARE v_seconds INTEGER DEFAULT ((60*60)*24)*31;					
	
	DECLARE v_modified INTEGER DEFAULT UNIX_TIMESTAMP(in_date_time)-v_seconds;	
	DECLARE v_modified_top INTEGER DEFAULT UNIX_TIMESTAMP(in_date_time);
	
	DECLARE v_mesh_id INTEGER;
	DECLARE v_mesh_name varchar(255);
	DECLARE v_tree_tag_id INTEGER;
	DECLARE v_tot_clients bigint(20) default 0;
	DECLARE v_tot_tx_bytes bigint(20) default 0;
	DECLARE v_tot_rx_bytes bigint(20) default 0;
	DECLARE v_tot_bytes bigint(20) default 0;
	DECLARE v_tot_nodes bigint(20) default 0;
	DECLARE v_tot_lv_nodes bigint(20) default 0;
	DECLARE v_tot_lv_nodes_down bigint(20) default 0;
	DECLARE v_tot_nodes_down bigint(20) default 0;
	DECLARE v_tot_nodes_up bigint(20) default 0;
	DECLARE v_dual_radios bigint(20) default 0;
	DECLARE v_single_radios bigint(20) default 0;
	
	DECLARE v_now DATETIME default now();
	
	
	DECLARE v_the_date DATE default DATE_SUB(in_date, INTERVAL 31 DAY);
	DECLARE v_the_date_top DATE default DATE_SUB(in_date, INTERVAL 1 DAY);
	
	DECLARE v_last_mesh_id INTEGER DEFAULT 0;						
	DECLARE v_node_state INTEGER DEFAULT 0;
	DECLARE v_beg_remove_secs FLOAT(14,2) default 0;
	DECLARE v_end_add_secs FLOAT(14,2) default 0;
	DECLARE v_up_seconds FLOAT(14,2) default 0;
	DECLARE v_down_seconds FLOAT(14,2) default 0;
	
	DECLARE v_nup_beg_remove_secs FLOAT(14,2) default 0;
	DECLARE v_nup_end_add_secs FLOAT(14,2) default 0;
	DECLARE v_nup_up_seconds FLOAT(14,2) default 0;
	DECLARE v_nup_down_seconds FLOAT(14,2) default 0;
	DECLARE v_ndwn_beg_remove_secs FLOAT(14,2) default 0;
	DECLARE v_ndwn_end_add_secs FLOAT(14,2) default 0;
	DECLARE v_ndwn_up_seconds FLOAT(14,2) default 0;
	DECLARE v_ndwn_down_seconds FLOAT(14,2) default 0;
		
	
	DECLARE all_meshes_cursor CURSOR FOR 
		select m.id as mesh_id, 
			m.name as mesh_name, 
			m.tree_tag_id, 
			ifnull(dt_cnts.d_max_clients,0) as tot_clients, 
			ifnull(dt_cnts.tot_tx_bytes,0) as tot_tx_bytes, 
			ifnull(dt_cnts.tot_rx_bytes,0) as tot_rx_bytes, 
			ifnull(dt_cnts.tot_bytes,0) as tot_bytes,
			ifnull(ds_cnts.d_max_nodes,0) as tot_nodes, 
			ifnull(ds_cnts.d_max_lv_nodes,0) as tot_lv_nodes, 
			ifnull(ds_cnts.d_max_lv_nodes_down,0) as tot_lv_nodes_down, 
			ifnull(ds_cnts.d_max_nodes_down,0) as tot_nodes_down, 
			ifnull(ds_cnts.d_max_nodes_up,0) as tot_nodes_up, 
			ifnull(ds_cnts.d_max_dual_radios,0) as dual_radios, 
			ifnull(ds_cnts.d_max_single_radios,0) as single_radios  
		from meshes as m 
		left outer join (
			select mesh_id,
					d_max_nodes,
					d_max_lv_nodes,
					d_max_lv_nodes_down,
					d_max_nodes_down,
					d_max_nodes_up,
					d_max_dual_radios,
					d_max_single_radios
				from (
					 select mesh_id,
						
						max(max_nodes) as d_max_nodes,
						max(max_lv_nodes) as d_max_lv_nodes,
						max(max_lv_nodes_down) as d_max_lv_nodes_down,
						max(max_nodes_down) as d_max_nodes_down,
						max(max_nodes_up) as d_max_nodes_up,
						max(max_dual_radios) as d_max_dual_radios,
						max(max_single_radios) as d_max_single_radios
					from mesh_daily_summaries
					where the_date between v_the_date and v_the_date_top
					 UNION ALL 
					select mesh_id,
						
						max(max_nodes) as d_max_nodes,
						max(max_lv_nodes) as d_max_lv_nodes,
						max(max_lv_nodes_down) as d_max_lv_nodes_down,
						max(max_nodes_down) as d_max_nodes_down,
						max(max_nodes_up) as d_max_nodes_up,
						max(max_dual_radios) as d_max_dual_radios,
						max(max_single_radios) as d_max_single_radios
					from ar_mesh_daily_summaries
					where the_date between v_the_date and v_the_date_top
				) as mdsaru_cnts
				group by mesh_id
			) as ds_cnts on ds_cnts.mesh_id = m.id
		left outer join ( 
			select mesh_id,
				d_max_clients,
                tot_tx_bytes,
                tot_rx_bytes,
                tot_bytes
                from (
					select n.mesh_id as mesh_id, 
						count(distinct ns.mac) as d_max_clients, 
						sum(ns.tx_bytes) as tot_tx_bytes, 
						sum(ns.rx_bytes) as tot_rx_bytes, 
						sum(ns.tx_bytes + ns.rx_bytes) as tot_bytes 
						from node_stations ns 
						inner join nodes n on n.id = ns.node_id 
						where (UNIX_TIMESTAMP(ns.modified) between v_modified and v_modified_top)
					UNION ALL
					select n1.mesh_id as mesh_id, 
						count(distinct arns.mac) as d_max_clients, 
						sum(arns.tx_bytes) as tot_tx_bytes, 
						sum(arns.rx_bytes) as tot_rx_bytes, 
						sum(arns.tx_bytes + arns.rx_bytes) as tot_bytes 
						from ar_node_stations arns 
						inner join nodes n1 on n1.id = arns.node_id 
						where (UNIX_TIMESTAMP(arns.modified) between v_modified and v_modified_top)
				) as nsaru_cnts
				group by mesh_id
		) as dt_cnts on dt_cnts.mesh_id = m.id 

		group by m.id,m.name,m.tree_tag_id;
	 
	
	DECLARE mesh_uptime_cursor CURSOR FOR 
		select 
			mesh_id,
			node_state,
            sum(beg_remove_secs) as beg_rem_secs,
            sum(end_add_secs) as end_add_secs,
            sum(up_seconds) as m_up_secs,
			sum(down_seconds) as m_dwn_secs
		from (
			select n.mesh_id as mesh_id,
				nuh.node_id as node_id,
				nuh.node_state, 
				case 
					when UNIX_TIMESTAMP(nuh.state_datetime) < v_modified then 
						v_modified - UNIX_TIMESTAMP(nuh.state_datetime)  
					else 
						0 
				end as beg_remove_secs, 
				case 
					when UNIX_TIMESTAMP(nuh.modified) > v_modified_top AND UNIX_TIMESTAMP(nuh.created) < v_modified_top then 
						UNIX_TIMESTAMP(nuh.modified) - v_modified_top
					else 
						0 
				end as end_add_secs, 
				case  
					when node_state = 1 then UNIX_TIMESTAMP(nuh.report_datetime) - UNIX_TIMESTAMP(nuh.created) 
					else 0 
				end as up_seconds, 
				case  
					when node_state = 0 then UNIX_TIMESTAMP(nuh.modified) - UNIX_TIMESTAMP(nuh.state_datetime) 
					else 0 
				end as down_seconds 
			from node_uptm_histories nuh 
			inner join nodes n on n.id = nuh.node_id 
			left outer join node_settings n_set on n_set.mesh_id = n.mesh_id
			where  UNIX_TIMESTAMP(nuh.report_datetime) > v_modified 
					  and (n.last_contact is not null AND UNIX_TIMESTAMP(n.last_contact) > v_modified)
					  and n.mesh_id is not null
        ) as uptm
		group by mesh_id,node_state
        order by mesh_id asc;	
	
	
	DECLARE CONTINUE HANDLER 
			FOR NOT FOUND SET v_finished = 1;
			
	
	
	set mesh_cnt = 0;
	set ins_err_cnt = 0;
	set err_update_cnt = 0;

	
	truncate rolling_last_thirty_days;
	
	
	OPEN all_meshes_cursor;
	 
	get_meshes: LOOP
	 
		FETCH all_meshes_cursor INTO 
			v_mesh_id,
			v_mesh_name,
			v_tree_tag_id,
			v_tot_clients,
			v_tot_tx_bytes,
			v_tot_rx_bytes,
			v_tot_bytes,
			v_tot_nodes,
			v_tot_lv_nodes,
			v_tot_lv_nodes_down,
			v_tot_nodes_down,
			v_tot_nodes_up,
			v_dual_radios,
			v_single_radios;
	 
		IF v_finished = 1 THEN 
			LEAVE get_meshes; 
		END IF;
		
		mesh_update_block: begin
			
			DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
				SET ins_err_cnt = ins_err_cnt + 1; 				
			INSERT INTO `rd`.`rolling_last_thirty_days` (
				`mesh_id`,
				`tree_tag_id`,
				`mesh_name`,
				`tot_clients`,
				`tot_tx_bytes`,
				`tot_rx_bytes`,
				`tot_bytes`,
				`tot_nodes`,
				`tot_lv_nodes`,
				`tot_lv_nodes_down`,
				`tot_nodes_down`,
				`tot_nodes_up`,
				`dual_radios`,
				`single_radios`
			) VALUES (
				v_mesh_id,
				v_tree_tag_id,
				v_mesh_name,
				v_tot_clients,
				v_tot_tx_bytes,
				v_tot_rx_bytes,
				v_tot_bytes,
				v_tot_nodes,
				v_tot_lv_nodes,
				v_tot_lv_nodes_down,
				v_tot_nodes_down,
				v_tot_nodes_up,
				v_dual_radios,
				v_single_radios
			);
		END mesh_update_block;
		
		set mesh_cnt = mesh_cnt + 1;
	END LOOP get_meshes;
	 
	CLOSE all_meshes_cursor;
	
	
	SET v_finished = 0;
	set v_last_mesh_id = 0;
	
	OPEN mesh_uptime_cursor;
	 
	get_mesh_uptime: LOOP
	 
		FETCH mesh_uptime_cursor INTO 
			v_mesh_id,
			v_node_state,
			v_beg_remove_secs,
			v_end_add_secs,
			v_up_seconds,
			v_down_seconds;
	
		IF v_finished = 1 THEN 
			LEAVE get_mesh_uptime;
		END IF;
		
		uptime_update_block: begin
			DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
				SET err_update_cnt = err_update_cnt + 1;
			
			IF v_mesh_id != v_last_mesh_id then
				
				UPDATE `rd`.`rolling_last_thirty_days`
					SET
						`nup_beg_remove_secs` = v_nup_beg_remove_secs,
						`nup_end_add_secs` = v_nup_end_add_secs,
						`nup_up_seconds` = v_nup_up_seconds,
						`nup_down_seconds` = v_nup_down_seconds,
						`ndwn_beg_remove_secs` = v_ndwn_beg_remove_secs,
						`ndwn_end_add_secs` = v_ndwn_end_add_secs,
						`ndwn_up_seconds` = v_ndwn_up_seconds,
						`ndwn_down_seconds` = v_ndwn_down_seconds
				WHERE `mesh_id` = v_last_mesh_id;
				
				set v_last_mesh_id = v_mesh_id;
				set v_nup_beg_remove_secs = 0;
				set v_nup_end_add_secs = 0;
				set v_nup_up_seconds = 0;
				set v_nup_down_seconds = 0;
				set v_ndwn_beg_remove_secs = 0;
				set v_ndwn_end_add_secs = 0;
				set v_ndwn_up_seconds = 0;
				set v_ndwn_down_seconds = 0;
				IF v_node_state = 1 then
					set v_nup_beg_remove_secs = v_beg_remove_secs;
					set v_nup_end_add_secs = v_end_add_secs;
					set v_nup_up_seconds = v_up_seconds;
					set v_nup_down_seconds = v_down_seconds;				
				ELSE
					set v_ndwn_beg_remove_secs = v_beg_remove_secs;
					set v_ndwn_end_add_secs = v_end_add_secs;
					set v_ndwn_up_seconds = v_up_seconds;
					set v_ndwn_down_seconds = v_down_seconds;
				END IF;
			ELSE
				
				IF v_node_state = 1 then
					set v_nup_beg_remove_secs = v_beg_remove_secs;
					set v_nup_end_add_secs = v_end_add_secs;
					set v_nup_up_seconds = v_up_seconds;
					set v_nup_down_seconds = v_down_seconds;				
				ELSE
					set v_ndwn_beg_remove_secs = v_beg_remove_secs;
					set v_ndwn_end_add_secs = v_end_add_secs;
					set v_ndwn_up_seconds = v_up_seconds;
					set v_ndwn_down_seconds = v_down_seconds;
				END IF;
			END IF;
			
		END uptime_update_block; 
	END LOOP get_mesh_uptime;
	
	CLOSE mesh_uptime_cursor;
 
END meshes_block ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `view_notifications`
--

/*!50001 DROP TABLE IF EXISTS `view_notifications`*/;
/*!50001 DROP VIEW IF EXISTS `view_notifications`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `view_notifications` AS select `a`.`id` AS `id`,`a`.`object_id` AS `object_id`,`a`.`object_name` AS `object_name`,`a`.`user_id` AS `user_id`,`a`.`object_type` AS `object_type`,case when `a`.`object_type` = 'nodes' then 'Mesh Node' when `a`.`object_type` = 'aps' then 'Access Point' else `a`.`object_type` end AS `related_type`,`a`.`parent_id` AS `parent_id`,`a`.`parent_name` AS `parent_name`,`a`.`severity` AS `severity`,`a`.`is_resolved` AS `is_resolved`,`a`.`notification_datetime` AS `notification_datetime`,`a`.`notification_type` AS `notification_type`,`a`.`notification_code` AS `notification_code`,`a`.`short_description` AS `short_description`,`a`.`description` AS `description`,`a`.`available_to_siblings` AS `available_to_siblings`,`a`.`created` AS `created`,`a`.`modified` AS `modified` from (select `ntf`.`id` AS `id`,`n`.`id` AS `object_id`,`n`.`name` AS `object_name`,`ntf`.`item_table` AS `object_type`,`nm`.`user_id` AS `user_id`,`nm`.`id` AS `parent_id`,`nm`.`name` AS `parent_name`,`ntf`.`severity` AS `severity`,`ntf`.`is_resolved` AS `is_resolved`,`ntf`.`notification_datetime` AS `notification_datetime`,`ntf`.`notification_type` AS `notification_type`,`ntf`.`notification_code` AS `notification_code`,`ntf`.`short_description` AS `short_description`,`ntf`.`description` AS `description`,`nm`.`available_to_siblings` AS `available_to_siblings`,`ntf`.`created` AS `created`,`ntf`.`modified` AS `modified` from ((`rd`.`notifications` `ntf` join `rd`.`nodes` `n` on(`n`.`id` = `ntf`.`item_id` and `ntf`.`item_table` = 'nodes')) join `rd`.`meshes` `nm` on(`nm`.`id` = `n`.`mesh_id`)) union select `ntf`.`id` AS `id`,`apd`.`id` AS `object_id`,`apd`.`name` AS `object_name`,`ntf`.`item_table` AS `object_type`,`app`.`user_id` AS `user_id`,`app`.`id` AS `parent_id`,`app`.`name` AS `parent_name`,`ntf`.`severity` AS `severity`,`ntf`.`is_resolved` AS `is_resolved`,`ntf`.`notification_datetime` AS `notification_datetime`,`ntf`.`notification_type` AS `notification_type`,`ntf`.`notification_code` AS `notification_code`,`ntf`.`short_description` AS `short_description`,`ntf`.`description` AS `description`,`app`.`available_to_siblings` AS `available_to_siblings`,`ntf`.`created` AS `created`,`ntf`.`modified` AS `modified` from ((`rd`.`notifications` `ntf` join `rd`.`aps` `apd` on(`apd`.`id` = `ntf`.`item_id` and `ntf`.`item_table` = 'aps')) join `rd`.`ap_profiles` `app` on(`app`.`id` = `apd`.`ap_profile_id`)) union select `ntf`.`id` AS `id`,`m`.`id` AS `object_id`,`m`.`name` AS `object_name`,`ntf`.`item_table` AS `object_type`,`m`.`user_id` AS `user_id`,NULL AS `parent_id`,'' AS `parent_name`,`ntf`.`severity` AS `severity`,`ntf`.`is_resolved` AS `is_resolved`,`ntf`.`notification_datetime` AS `notification_datetime`,`ntf`.`notification_type` AS `notification_type`,`ntf`.`notification_code` AS `notification_code`,`ntf`.`short_description` AS `short_description`,`ntf`.`description` AS `description`,`m`.`available_to_siblings` AS `available_to_siblings`,`ntf`.`created` AS `created`,`ntf`.`modified` AS `modified` from (`rd`.`notifications` `ntf` join `rd`.`meshes` `m` on(`m`.`id` = `ntf`.`item_id` and `ntf`.`item_table` = 'meshes')) union select `ntf`.`id` AS `id`,`ap`.`id` AS `object_id`,`ap`.`name` AS `object_name`,`ntf`.`item_table` AS `object_type`,`ap`.`user_id` AS `user_id`,NULL AS `parent_id`,'' AS `parent_name`,`ntf`.`severity` AS `severity`,`ntf`.`is_resolved` AS `is_resolved`,`ntf`.`notification_datetime` AS `notification_datetime`,`ntf`.`notification_type` AS `notification_type`,`ntf`.`notification_code` AS `notification_code`,`ntf`.`short_description` AS `short_description`,`ntf`.`description` AS `description`,`ap`.`available_to_siblings` AS `available_to_siblings`,`ntf`.`created` AS `created`,`ntf`.`modified` AS `modified` from (`rd`.`notifications` `ntf` join `rd`.`ap_profiles` `ap` on(`ap`.`id` = `ntf`.`item_id` and `ntf`.`item_table` = 'ap_profiles'))) `a` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-01-07 14:35:58
