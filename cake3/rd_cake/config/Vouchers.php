<?php

$config = array();

//===== Vouchers ======

//== Defaults for the export to pdf options ==
$config['voucher_dafaults']['orientation']		= 'P'; //P or L
$config['voucher_dafaults']['language']			= '4_4';
$config['voucher_dafaults']['format']			= 'a4';
$config['voucher_dafaults']['q_r']				= true; //Can actually remove this one (replaced y the next one
$config['voucher_dafaults']['logo_or_qr']		= 'logo'; //can be: logo / qr / nothing
$config['voucher_dafaults']['date']				= true;
$config['voucher_dafaults']['social_media']		= true;
$config['voucher_dafaults']['profile_detail']	= true;
$config['voucher_dafaults']['realm_detail']		= true;
$config['voucher_dafaults']['t_and_c']			= true;
$config['voucher_dafaults']['extra_fields']	    = true;

//Define Voucher format types
$config['voucher_formats'][0]     = array('name' => 'Generic A4',               'id' => 'a4',               'active' => true);
$config['voucher_formats'][1]     = array('name' => 'Generic A4 Page/Voucher',  'id' => 'a4_page',          'active' => true);
$config['voucher_formats'][2]     = array('name' => 'Avery 5160',               'id' => '5160',             'active' => true);
$config['voucher_formats'][3]     = array('name' => 'Avery 5161',               'id' => '5161',             'active' => true);
$config['voucher_formats'][4]     = array('name' => 'Avery 5162',               'id' => '5162',             'active' => true);
$config['voucher_formats'][5]     = array('name' => 'Avery 5163',               'id' => '5163',             'active' => true);
$config['voucher_formats'][6]     = array('name' => 'Avery 5164',               'id' => '5164',             'active' => false); //gives trouble
$config['voucher_formats'][7]     = array('name' => 'Avery 8600',               'id' => '8600',             'active' => true); 
$config['voucher_formats'][8]     = array('name' => 'Avery L7160',              'id' => 'L7160',            'active' => true); 
$config['voucher_formats'][9]     = array('name' => 'Avery L7161',              'id' => 'L7161',            'active' => true); 
$config['voucher_formats'][10]    = array('name' => 'Avery L7163',              'id' => 'L7163',            'active' => true); 

return $config;


?>
