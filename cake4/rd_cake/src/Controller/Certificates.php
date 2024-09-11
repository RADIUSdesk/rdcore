<?php

##	# get certificate
##	location ~ ^/cert/get\?(.+)$ {
##		rewrite ^/cert/get\?(.+)$ /cake4/rd_cake/src/Controller/Certificates.php?$1;
##	}
##	location ~ ^/cert/(.+)$ {
##		rewrite ^/cert/(.+)$ /cake4/rd_cake/src/Controller/Certificates.php?realm=$1;
##	}

	$username = $_GET['u'];
	$password = $_GET['p'];
	$cloud_id = $_GET['c'];
	
	$servers = array('hl-a', 'fr-b', 'fr-a', 'lo-a');

	switch ($cloud_id) {
		case "Photon":
			$servers = sort_servers($servers, 3);
			break;
		case "TB":
			$servers = sort_servers($servers, 2);
			break;
		default:
			$servers = sort_servers($servers, 0);
	  }

?>
<?php

private function sort_servers($servers, $base_index) {
	$sorted_result = array();

	return $sorted_result;
}

?>