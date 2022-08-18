<?php

class VoucherPdf extends TCPDF {

    var $Logo           = 'img/realms/logo.jpg';       //Default Logo
    var $Title          = 'Set The Title';
    var $Language       = 'en';

	//We specify a max hight and max width for the logo - beyond that we force a scale
	var $logo_max_x_px	= 800;
	var $logo_max_y_px	= 100;
	var $px_to_mm		= 3.8;

	var $incl_logo		= true;
	var $incl_title		= true;

	var $padding		= 10;
	var $t_and_c_start	= false;

	var $OutputInstr	= array(); //Dummy value - will be set just after instantiation

	//Global style to use for QR
	var	$QrStyle		= array(
			'border' 		=> 2,
			'vpadding' 		=> 'auto',
			'hpadding' 		=> 'auto',
			'fgcolor' 		=> array(0,0,0),
			'bgcolor' 		=> false, //array(255,255,255)
			'module_width' 	=> 1, // width of a single module in points
			'module_height' => 1 // height of a single module in points
	);

	public function Header() {

		$this->_setBasics();

		//The Header will depending on what is enabled or disabled 
		//call various things to insert on the page if specified

		//We start with the Logo
		if($this->incl_logo){
			////$this->_doLogo();
		}

		//Do they need the date?
		if($this->OutputInstr['date']){
			$this->_doDate();
		}

		//Do they need the title?
		if($this->incl_title){
			$this->_doTitle();
		}

		//What about social media
		if($this->OutputInstr['social_media']){
			$this->_doSocialMedia();
		}

		if($this->OutputInstr['realm_detail']){
			$this->_doRealmDetail();
		}

		if($this->OutputInstr['t_and_c']){
			$this->_doTC();
		}
		
	}

	// Page footer
    public function Footer() {
        // Position at 15 mm from bottom
        $this->SetY(-15);
        // Set font
        $this->SetFont('helvetica', 'I', 8);

        // Page number
		$pn = $this->getAliasNumPage();
		$np = $this->getAliasNbPages();
        $this->Cell(0, 10, 'Page '.$pn.'/'.$np, 0, false, 'C', 0, '', 0, false, 'T', 'M');
    }

	private function _doLogo(){

		//Get the pixel size of the image
		list($width, $height, $type, $attr) = getimagesize(WWW_ROOT.$this->Logo);

		if($width > $this->logo_max_x_px){ //If it is to wide - we make it less wide
		
			//Scale if ceiling is hit
			if($height > $this->logo_max_y_px){
				$h		= $this->logo_max_y_px / $this->px_to_mm;
				$w		= 0;
			}else{
				$h 		= 0;
				$w 		= $this->logo_max_x_px / $this->px_to_mm;
			}

		}elseif($height > $this->logo_max_y_px){ //If it is to high - we make it less high

			//Scale if ceiling is hit
			if($width > $this->logo_max_x_px){
				$w		= $this->logo_max_x_px / $this->px_to_mm;
				$h		= 0;
			}else{
				$w 		= 0;
				$h		= $this->logo_max_y_px / $this->px_to_mm;
			}

		}else{ //it fits both sides - Normal size here
			$this->setImageScale(1.53);
			$w		= 0;
			$h		= 0;
		}

		// Image($file, $x='', $y='', $w=0, $h=0, $type='', $link='', $align='', $resize=false, $dpi=300, $palign='',
		// $ismask=false, $imgmask=false, $border=0, $fitbox=false, $hidden=false, $fitonpage=false)
		$this->Image(WWW_ROOT.$this->Logo, 0, 4, $w, $h, '', false, 'N', true, 300, 'C', false, false, 0, false, false, false);
	}

	private function _setBasics(){
		$this->SetDrawColor(180,180,180);
        $this->SetTextColor(50,50,50);
        $this->SetLineWidth(0.1);
	}

	private function _doDate(){
		$this->SetFont('dejavusans','',8);
		$this->Cell(0,0,date("F j, Y, g:i a"),0,1,'R');
	}

	private function _doTitle(){
		$this->SetFont('dejavusans','',12);
		$this->Cell(0,0,$this->Title,0,1,'C');
	}

	private function _doSocialMedia(){

		$sm = array();

		$fields = array('facebook','twitter','google_plus','youtube','linkedin');

		if($this->CurOrientation == 'P'){
			$limit = 4;
		}else{
			$limit = 5;
		}

		$count = 1;
		foreach($fields as $f){	
			if($count <= $limit){
				if($this->RealmDetail["$f"] != ''){
					$count++;
					$url = $this->RealmDetail["$f"];
					array_push($sm,array('name' 	=> "$f", 		'url' => "$url"));
				}
			}
		}

		//Find out how many there are
		$sm_items = count($sm);

		if($sm_items == 0){
			$this->OutputInstr['social_media'] = false; //There is nothing so it should be false for subsequent spacings
			return;
		}

		$page_width 	= $this->w;
		$section		= $page_width / $sm_items;
		$padding		= 10;
		$y_start		= 44;
		$width			= 35;

		$height         = 17;               //Hight of borders
        $radius         = 2.5;              //Radius of corners

		$x_start = $padding;
		foreach($sm as $s){
			$this->RoundedRect($x_start,$y_start,$width,$height,$radius,'1111','',
            array('width' => 0.1, 'cap' => 'butt', 'join' => 'miter', 'dash' => 0, 'color' => array(122, 122, 143)),array());

			$this->Image(WWW_ROOT."img/social_media/".$s['name'].'.png', $x_start+$radius, $y_start+1, 10,10, '', false, '', true, 300, '', false, false, 0, false, false, false);

			$this->write2DBarcode($s['url'], 'QRCODE,L', $x_start+$width-$radius-15, $y_start+1, 15, 15, $this->QrStyle, 'N');

			//Increase the offset
			$x_start = $x_start + $section;
		}

	}

	private function _doRealmDetail(){

		$d = $this->RealmDetail;
        
        $font_type_1    = 'dejavusans';
        $font_type_2    = 'dejavusans';
        $font_encode    = 'windows-1252';
        $font_format_b  = 'B';
        $font_format_i  = '';
       
        //===== 2 x Borders =======
        //We start by placing two rounded borders which within we will place the realm info.

		$page_width 	= $this->w;
		$section		= $page_width / 2;
		$padding		= 10;

        $x_start        = $padding;   		
        $x_txt          = $x_start+5;

        $x_start_mid    = $section+$padding;   //Middle of page start position
        $x_mid_txt      = $x_start_mid+5;

		if($this->OutputInstr['social_media']){
			$y_start        = 65;               //Start Y position of the borders
		}else{
			$y_start        = 44;               //Start Y position of the borders
		}

        
        $y_txt          = $y_start+2;
        $width          = 90;               //How wide the borders will be
        $height         = 35;               //Hight of borders
        $radius         = 2.5;              //Radius of corners

        $cell_width     = 100;
        $cell_outline   = 0;     

        //Border starts left side of page
        $this->RoundedRect($x_start,$y_start,$width,$height,$radius,'1111','',
            array('width' => 0.2, 'cap' => 'butt', 'join' => 'miter', 'dash' => 0, 'color' => array(122, 122, 143)),array());

        //Border starts in middle of page
        $this->RoundedRect($x_start_mid,$y_start,$width,$height,$radius,'1111','',
            array('width' => 0.2, 'cap' => 'butt', 'join' => 'miter', 'dash' => 0, 'color' => array(122, 122, 143)),array());

        
        //=== LEFT Side =====
        //AP Name
        $this->SetXY($x_txt,$y_txt); //Position the start place
        $this->SetFont($font_type_1,$font_format_b,12);
        $this->Cell($cell_width, 5,$d['name'],$cell_outline,2);  //Name of AP

        //AP Address
        $this->SetFont($font_type_1,$font_format_b,10);
        $this->Cell($cell_width,4,__("Address"),$cell_outline,2);
        $this->SetFont($font_type_2,'',8);
        $address = $d['street_no']." ".$d['street']."\n".$d['town_suburb']."\n".$d['city']."\n".$d["country"]."\nLat ".$d["lat"]."\n"."Lng ".$d["lon"];
        $this->MultiCell($cell_width,3,$address,$cell_outline,2);

        //=== RIGHT Side ===
        //Contact Detail
        $this->SetXY( $x_mid_txt, $y_txt );
        $this->SetFont($font_type_1,$font_format_b,8);
        $this->Cell($cell_width,4,__('Contact Detail'),$cell_outline,2);
        //url
        if($d['url'] != ''){
            $this->SetFont($font_type_2,$font_format_i,8);
           // $this->SetTextColor(0,0,255);
            $this->Cell($cell_width,3,$d['url'],$cell_outline,2);
        }
        //email
        if($d['email'] != ''){
            $this->SetFont($font_type_2,$font_format_i,8);
          //  $this->SetTextColor(0,0,255);
            $this->Cell($cell_width,3,$d['email'],$cell_outline,2);
        }

        $this->SetTextColor(0);

        //phone
        if($d['phone'] != ''){
            $this->SetFont($font_type_2,$font_format_i,8);
            $this->Cell($cell_width,3,$d['phone'].' ('.__('phone').')',$cell_outline,2);
        }

        //cell
        if($d['fax'] != ''){
            $this->SetFont($font_type_2,$font_format_i,8);
            $this->Cell($cell_width,3,$d['fax'].' ('.__('fax').')',$cell_outline,2);
        }

         //fax
        if($d['cell'] != ''){
            $this->SetFont($font_type_2,$font_format_i,8);
            $this->Cell($cell_width,3,$d['fax'].' ('.__('cell').')',$cell_outline,2);
        }

		$this->write2DBarcode($d['url'], 'QRCODE,L', $x_mid_txt+60, $y_start+10, 20, 20, $this->QrStyle, 'N');
	}

	private function  _doTC(){

		$font_type_1    = 'dejavusans';
        $font_type_2    = 'dejavusans';
        $font_encode    = 'windows-1252';
        $font_format_b  = 'B';
        $font_format_i  = '';
		$this->SetFont($font_type_2,$font_format_i,8);

		//if($this->RealmDetail['t_c_title'] != ''){
		//	$t_and_c_formatted = "<h2>".$this->RealmDetail['t_c_title']."</h2><ul>";
		//}else{
		//	$t_and_c_formatted = "<ul>";
		//}

		//$t_c['content']	= explode("\n", $this->RealmDetail['t_c_content']);
		//$content_rows	= count($t_c['content']);

		//if($content_rows == 0){
		//	$this->OutputInstr['t_and_c'] = false; //There is nothing so it should be false for subsequent spacings
		//	return;
		//}

		$h 	= $this->h;
		$y	= $h-26-($content_rows*4);

		$this->t_and_c_start = $y;

		$this->SetXY( 10, $y);

		foreach($t_c['content'] as $i){
			if($i != ''){
				$t_and_c_formatted = $t_and_c_formatted."<li>".$i."</li>";
			}
		}

		$t_and_c_formatted = $t_and_c_formatted.'</ul>';

		// output the HTML content
		$this->writeHTML($t_and_c_formatted, true, false, true, false, '');

	}

	  //This will loop throug the vouchers, creating them
    function addVouchers($vouchers)
    {
        //Initial positioning
		$this->x_start = $this->padding;
		$this->_determine_y_start();

        foreach($vouchers as $i){

		//	print_r($i);
            $this->_addVoucher($i);
        }
    }

    //Voucher detail window
    private function _addVoucher($voucher)
    {

		$columns = 2;
		if($this->CurOrientation == 'L'){
			$columns = 3;
		}
       
		$page_width 	= $this->w;
		$section		= $page_width / $columns;
		$padding		= 10;
		$width			= 80;

		$height         = 30;               //Hight of borders
        $radius         = 2.5;              //Radius of corners

		$font_type      = 'dejavusans';
        $font_encode    = 'windows-1252';
        $font_format_b  = 'B';
        $font_format_i  = '';

		$text_size      = 8;    //Up this value to increase the text inside the voucher
        $cell_height    = 4;    //Up this value to increase the space between the lines in the voucher

        $this->RoundedRect($this->x_start,$this->y_start,$width,$height,$radius,'1111','',
            array('width' => 0.2, 'cap' => 'butt', 'join' => 'miter', 'dash' => 0, 'color' => array(122, 122, 143)),array());

		$this->SetXY( $this->x_start,$this->y_start);
        $this->SetFont( $font_type, $font_format_b, 10);
		$this->SetTextColor(157,157,167);
        $this->Cell($width,5, $this->Title, 0, 2, "C");
		$this->SetTextColor(0,0,0);

		if($voucher['username'] == $voucher['password']){	//Assume single field

			$this->SetX($this->x_start+2);
			$this->SetFont( 'dejavusans','', 11);
			$this->Cell(20,$cell_height, __("Voucher"), 0, 0, "L");

			$this->SetFont( 'dejavusans', $font_format_b, 11);
			$this->Cell(30,$cell_height, $voucher['username'], 0, 2, "L");

		}else{
			$this->SetX($this->x_start+2);
			$this->SetFont( 'dejavusans','', 8);
			$this->Cell(22,$cell_height, __("Username"), 0, 0, "L");

			$this->SetFont( 'dejavusans', $font_format_b, 8);
			$this->Cell(30,$cell_height, $voucher['username'], 0, 2, "L");

			//--Password----
			$this->SetFont( 'dejavusans', '', 8);
			$this->SetX($this->x_start+2);
			$this->Cell(22,$cell_height,__("Password"), 0, 0, "L");

			$this->SetFont('dejavusans', $font_format_b, 8);
			$this->Cell(30,$cell_height, $voucher['password'], 0, 2, "L");
		}

		if($this->OutputInstr['profile_detail']){
			//Profile
			$this->SetTextColor(157,157,167);
			$this->SetFont( $font_type, $font_format_i, $text_size);
			$this->SetX($this->x_start+2);
			$this->Cell(20,$cell_height,__("Profile") , 0, 0, "L");

			$this->SetFont( $font_type, $font_format_b, $text_size);
			$this->Cell(30,$cell_height, $voucher['profile'], 0, 2, "L");

			//---Duration---
			//Do not print the days_valid if it is not specified....
			if($voucher['days_valid'] != ''){

				$this->SetFont( $font_type, $font_format_i, $text_size);
				$this->SetX($this->x_start+2);
				$this->Cell(20,$cell_height,__("Valid for") , 0, 0, "L");

				$this->SetFont( $font_type, $font_format_b, $text_size);
				$this->Cell(30,$cell_height, $voucher['days_valid'], 0, 2, "L");
			}

			//---Expiry Date---
			if($voucher['expiration'] != ''){
				$this->SetFont( $font_type, $font_format_i, $text_size);
				$this->SetX($this->x_start+2);
				$this->Cell(20,$cell_height,__("Expiry date") , 0, 0, "L");

				$this->SetFont( $font_type, $font_format_b, $text_size);
				$this->Cell(30,$cell_height, $voucher['expiration'], 0, 2, "L");
			}
			//Reset again
			$this->SetTextColor(0,0,0);
		}

		if($voucher['username'] == $voucher['password']){	//Assume single field
			//Only for the passphrases
			if($this->OutputInstr['q_r']){
				$this->write2DBarcode(
					$voucher['username'], 
					'QRCODE,L', 
					$this->x_start+58, 
					$this->y_start+7, 20, 20, $this->QrStyle, 'N');
			}
		}

		if(($this->x_start+$width+$this->padding+10) < ($this->w)){
			$this->x_start	= $this->x_start + $section;
		}else{
			$this->x_start = $this->padding;
			$this->y_start = $this->y_start + 40;

			if(($this->t_and_c_start)&&(($this->y_start+$height+3) > $this->t_and_c_start)){
				//New page pappie
				$this->AddPage();
				$this->x_start = $this->padding;
				$this->_determine_y_start();
			}else{
				if(($this->y_start+$height+10) > $this->h){ //Up the space he a bit 
					$this->AddPage();
					$this->x_start = $this->padding;
					$this->_determine_y_start();
				}
			}
		}

    }

	private function _determine_y_start(){

		//Where we start on the page depends on whether we included the social media and or realms info

		$this->y_start 	= 45; //No social media or Realm info
		if($this->OutputInstr['social_media']){
			$this->y_start = $this->y_start + 25;
		}

		if($this->OutputInstr['realm_detail']){
			$this->y_start = $this->y_start + 40;
		}
	}

}

if(($output_instr['format'] == 'a4')||($output_instr['format'] == 'a4_page')){

	/*We use contants which had default values:
	TCPDF::__construct 	( 	  	
			$orientation = 'P',
		  	$unit = 'mm',
		  	$format = 'A4',
		  	$unicode = true,
		  	$encoding = 'UTF-8',
		  	$diskcache = false,
		  	$pdfa = false 
	) 
	*/		

    $pdf = new VoucherPdf($output_instr['orientation'], PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
     
    // set document (meta) information
    $pdf->SetCreator(PDF_CREATOR);
    $pdf->SetAuthor('RADIUSdesk');
    $pdf->SetTitle(__('Internet Access Voucher'));
    $pdf->SetSubject(__('Internet Access Voucher'));
    $pdf->SetKeywords(__('Internet Access Voucher'));
    
    $pdf->Title = __("Internet Access Voucher"); 
    $pdf->setRTL($output_instr['rtl']);

	//We attach the output instructions to the PDF
	$pdf->OutputInstr = $output_instr;
/*
    //A4 all vouchers per realm
    if($output_instr['format'] == 'a4'){
        foreach(array_keys($voucher_data) as $key){
            $d = $voucher_data["$key"];

			//Set logo first as this will be added to header
          	$pdf->Logo 			= 'img/realms/'.$d['icon_file_name'];
			$pdf->RealmDetail	= $d;

			// add a page
            $pdf->AddPage();
			// do the vouchers
            $pdf->AddVouchers($d['vouchers']);
        } 
    }

    //A4 page per voucher
    if($output_instr['format'] == 'a4_page'){
        foreach(array_keys($voucher_data) as $key){
            $d = $voucher_data["$key"];
			//print_r($d);
            foreach($d['vouchers'] as $v){
				$pdf->RealmDetail = $d;
                //Define logo
                $pdf->Logo = 'img/realms/'.$d['icon_file_name'];
                // add a page
                $pdf->AddPage();
                $pdf->AddVouchers(array($v));
            }
        } 
    }
    */
   
  
    
    //Close and output PDF document
    $pdf->Output('test.pdf', 'I');
    
    // Reset the encoding forced from tcpdf
    mb_internal_encoding('UTF-8');
    
   
    
}else{
  /*  $pdf = new LabelPdf($output_instr['format']);
    $pdf->setRTL($output_instr['rtl']);
    $pdf->AddPage();
    foreach(array_keys($voucher_data) as $key){
        $d = $voucher_data["$key"];
        foreach($d['vouchers'] as $v){
            $pdf->Logo = 'img/realms/'.$d['icon_file_name'];
            $pdf->Add_Label($v);
        }
    } 
    $pdf->Output('test.pdf', 'I');*/
}

?>
