<?php

	##	# get certificate
	##	location ~ ^/cert/get\?(.+)$ {
	##		rewrite ^/cert/get\?(.+)$ /cake4/rd_cake/src/Controller/Certificates.php?$1;
	##	}
	##	location ~ ^/cert/(.+)$ {
	##		rewrite ^/cert/(.+)$ /cake4/rd_cake/src/Controller/Certificates.php?realm=$1;
	##	}

	$username = $_GET['user'];
	$password = $_GET['token'];
	$realm = $_GET['realm'];
	$options = $_GET['options'];

	$ovpn_config = file_get_contents('../../resources/configs/default.ovpn');

	$servers = array('lo-a', 'fr-a', 'fr-b', 'hl-a');
	$title = 'None';

	switch ($realm) {
		case 'Amir':
		case 'Always':
		case 'RyLondon':
			$servers = sort_servers($servers, 0);
			break;
		case 'RyFrankfort':
			$servers = sort_servers($servers, 1);
			break;
		case 'RyHelsinki':
			$servers = sort_servers($servers, 3);
			break;
		case 'MehrAzar':
			$servers = sort_servers($servers, 2);
			break;
		default:
			$servers = sort_servers($servers, count($servers) - 1);
	}

	if (strpos($servers[0], 'hl-') === 0)
		$title = 'Helsinki';
	else if (strpos($servers[0], 'fr-') === 0)
		$title = 'Frankfort';
	else if (strpos($servers[0], 'lo-') === 0)
		$title = 'London';

	if ($options == 'single') {
		$servers = array($servers[0]);
	} else {
		$title .= '+';
	}

	$title = "\nsetenv FRIENDLY_NAME \"$title\"\n";
	foreach ($servers as $domain)
		$title .= "remote $domain.photon-bypass.com\n";

	# replace remote
	$ovpn_config = preg_replace("/(^|\\n)remote\s.*(\\n|$)/i", $title, $ovpn_config);

	# remove current user info
	$ovpn_config = preg_replace("/(^|\\n)auth-user-pass(\\n|$)/i", "\n", $ovpn_config);

	# remove current user info
	$ovpn_config = preg_replace("/<auth-user-pass>[^<]*<\/auth-user-pass>\\n?/i", '', $ovpn_config);

	if (!empty($password)) {
		$ovpn_config = preg_replace("/<key>/i",
			"<auth-user-pass>\n$username\n$password\n</auth-user-pass>\n<key>",
			$ovpn_config);
	} else {
		$ovpn_config = preg_replace("/<key>/i", "auth-user-pass\n<key>", $ovpn_config);
	}

	if (empty($username)) {
		$username = 'global';
	}

	header("Content-Disposition: attachment; filename=\"config-$username.ovpn\"");
	header('Content-type: application/x-openvpn-profile');

	echo $ovpn_config;

	function sort_servers($servers, $base_index) {
		$step = 1;
		$servers_count = count($servers);
		$sorted_result = array($servers[$base_index]);

		while ($base_index + $step < $servers_count || $base_index - $step >= 0) {

			if ($base_index + $step < $servers_count) array_push($sorted_result, $servers[$base_index + $step]);
			if ($base_index - $step >= 0) array_push($sorted_result, $servers[$base_index - $step]);

			$step = $step + 1;
		}

		return $sorted_result;
	}

?>
