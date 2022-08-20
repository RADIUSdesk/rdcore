<?php


class LabelPdf extends TCPDF {

    // make these properties public due to
    // CRM-5880
    public $averyName  = '';       // Name of format
    public $marginLeft = 0;        // Left margin of labels
    public $marginTop  = 0;        // Top margin of labels
    public $xSpace     = 0;        // Horizontal space between 2 labels
    public $ySpace     = 0;        // Vertical space between 2 labels
    public $xNumber    = 0;        // Number of labels horizontally
    public $yNumber    = 0;        // Number of labels vertically
    public $width      = 0;        // Width of label
    public $height     = 0;        // Height of label
    public $charSize   = 10;       // Character size
    public $lineHeight = 10;       // Default line height
    public $metric     = 'mm';     // Type of metric for labels.. Will help to calculate good values
    public $metricDoc  = 'mm';     // Type of metric for the document
    public $fontName   = 'FreeSans'; // Name of the font
    public $countX     = 0;
    public $countY     = 0;

    var $Logo          = 'img/realms/logo.jpg';       //Default Logo
    
    // Listing of labels size
    protected  $averyLabels =
        array (
               '5160' => array('name' => '5160', 'paper-size' => 'letter', 'metric' => 'mm',
                               'lMargin' => 4.7625, 'tMargin' => 12.7, 'NX' => 3, 'NY' => 10,
                               'SpaceX' => 3.96875, 'SpaceY' => 0, 'width' => 65.875, 'height' => 25.4,
                               'font-size' => 8),
               '5161' => array('name' => '5161', 'paper-size' => 'letter', 'metric' => 'mm',  
                               'lMargin' => 0.967, 'tMargin' => 10.7, 'NX' => 2, 'NY' => 10, 
                               'SpaceX' => 3.967, 'SpaceY' => 0, 'width' => 101.6,
                               'height' => 25.4, 'font-size' => 8),
               '5162' => array('name' => '5162', 'paper-size' => 'letter', 'metric' => 'mm', 
                               'lMargin' => 0.97, 'tMargin' => 20.224, 'NX' => 2, 'NY' => 7, 
                               'SpaceX' => 4.762, 'SpaceY' => 0, 'width' => 100.807, 
                               'height' => 35.72, 'font-size' => 8),
               '5163' => array('name' => '5163', 'paper-size' => 'letter', 'metric' => 'mm',
                               'lMargin' => 1.762,'tMargin' => 10.7, 'NX' => 2,
                               'NY' => 5, 'SpaceX' => 3.175, 'SpaceY' => 0, 'width' => 101.6,
                               'height' => 50.8, 'font-size' => 8),
               '5164' => array('name' => '5164', 'paper-size' => 'letter', 'metric' => 'in',
                               'lMargin' => 0.148, 'tMargin' => 0.5, 'NX' => 2, 'NY' => 3, 
                               'SpaceX' => 0.2031, 'SpaceY' => 0, 'width' => 4.0, 'height' => 3.33,
                               'font-size' => 12),
               '8600' => array('name' => '8600', 'paper-size' => 'letter', 'metric' => 'mm',
                               'lMargin' => 7.1, 'tMargin' => 19, 'NX' => 3, 'NY' => 10,
                               'SpaceX' => 9.5, 'SpaceY' => 3.1, 'width' => 66.6,
                               'height' => 25.4, 'font-size' => 8),
               'L7160' => array('name' => 'L7160', 'paper-size' => 'A4', 'metric' => 'mm', 'lMargin' => 11, //lMargin was 6
                               // 'tMargin' => 15.1, 'NX' => 3, 'NY' => 7, 'SpaceX' => 2.5, 'SpaceY' => 0,
                                'tMargin' => 19.1, 'NX' => 3, 'NY' => 7, 'SpaceX' => 2.5, 'SpaceY' => 0,
                                'width' => 63.5, 'height' => 38.1, 'font-size' => 9),
               'L7161' => array('name' => 'L7161', 'paper-size' => 'A4', 'metric' => 'mm', 'lMargin' => 6,
                                'tMargin' => 9, 'NX' => 3, 'NY' => 6, 'SpaceX'=> 5, 'SpaceY' => 2,
                                'width' => 63.5, 'height' => 46.6, 'font-size' => 9),
               'L7163' => array('name' => 'L7163', 'paper-size' => 'A4', 'metric' => 'mm', 'lMargin' => 5,
                                'tMargin' => 15, 'NX' => 2, 'NY' => 7, 'SpaceX' => 2.5, 'SpaceY' => 0,
                                'width' => 99.1, 'height' => 38.1, 'font-size' => 9)
               );
   
    /**
     * Constructor 
     *
     * @param $format type of label ($_AveryValues)
     * @param unit type of unit used we can define your label properties in inches by setting metric to 'in'
     *
     * @access public
     */

   function __construct ($format, $unit='mm',$posX=1, $posY=1) {
       if (is_array($format)) {
           // Custom format
           $tFormat = $format;
       } else {
           // Avery format
           $tFormat = $this->averyLabels[$format];
       }
       
       parent::__construct('P', $tFormat['metric'], $tFormat['paper-size']);
       $this->SetFormat($tFormat);
       //$this->SetFontName('FreeSans'); //uncomment this to use non-default font
       $this->SetMargins(0,0);
       $this->SetAutoPageBreak(false);
       
       $this->metricDoc = $unit;
       $this->countX = $posX-2;
       $this->countY = $posY-1;

   }
    
   /*
    * function to convert units (in to mm, mm to in)
    *
    */ 
    function ConvertMetric ($value, $src, $dest) {
        if ($src != $dest) {
            $tab['in'] = 39.37008;
            $tab['mm'] = 1000;
            return $value * $tab[$dest] / $tab[$src];
        } else {
            return $value;
        }
    }
    /*
     * function to Give the height for a char size given.
     */
    function GetHeightChars($pt) {
        // Array matching character sizes and line heights
        $tableHauteurChars = array(6 => 2, 7 => 2.5, 8 => 3, 9 => 4, 10 => 5, 11 => 6, 12 => 7, 13 => 8, 14 => 9, 15 => 10);
        if (in_array($pt, array_keys($tableHauteurChars))) {
            return $tableHauteurChars[$pt];
        } else {
            return 100; // There is a prob..
        }
    }
    /*
     * function to convert units (in to mm, mm to in)
     * $format Type of $averyName
     */ 
    function SetFormat($format) {
        $this->metric     = $format['metric'];
        $this->averyName  = $format['name'];
        $this->marginLeft = $this->ConvertMetric ($format['lMargin'], $this->metric, $this->metricDoc);
        $this->marginTop  = $this->ConvertMetric ($format['tMargin'], $this->metric, $this->metricDoc);
        $this->xSpace     = $this->ConvertMetric ($format['SpaceX'], $this->metric, $this->metricDoc);
        $this->ySpace     = $this->ConvertMetric ($format['SpaceY'], $this->metric, $this->metricDoc);
        $this->xNumber    = $format['NX'];
        $this->yNumber    = $format['NY'];
        $this->width      = $this->ConvertMetric ($format['width'], $this->metric, $this->metricDoc);
        $this->height     = $this->ConvertMetric ($format['height'], $this->metric, $this->metricDoc);
        $this->LabelSetFontSize($format['font-size']);
    }
    /*
     * function to set the character size
     * $pt weight of character
     */
    function LabelSetFontSize($pt) {
        if ($pt > 3) {
            $this->charSize = $pt;
            $this->lineHeight = $this->GetHeightChars($pt);
            $this->SetFontSize($this->charSize);
        }
    }
    /*
     * Method to change font name
     *
     * $fontname name of font 
     */
    function SetFontName($fontname) {
        if ($fontname != '') {
            $this->fontName = $fontname;
            $this->SetFont($this->fontName);
        }
    }

    function Header(){

    }

    // Print a label
    function Add_Label($label_detail) {

        $img_space = 10;
        //$img_space = 5;

        $this->countX++;
        if ($this->countX == $this->xNumber) {
            // Row full, we start a new one
            $this->countX=0;
            $this->countY++;
            if ($this->countY == $this->yNumber) {
                // End of page reached, we start a new one
                $this->countY=0;
                $this->AddPage();
            }
        }

        $_PosX = $this->marginLeft + $this->countX*($this->width+$this->xSpace);
        $_PosY = $this->marginTop + $this->countY*($this->height+$this->ySpace);

       // print("Positions X $_PosX Y $_PosY <br>\n");
        $this->SetXY($_PosX, $_PosY);
      //  

        $this->LabelSetFontSize('10');
        $this->Cell($this->width-$this->marginLeft, 5, iconv('UTF-8', 'windows-1252',gettext('Internet Access Voucher')), 0, 2, "C");

        //Get the X position
        $x_after_heading = $this->GetX();
        $y_after_heading = $this->GetY();

       // $this->Image(WWW_ROOT.DS.$this->Logo,null,null,8);
        //$this->Image(WWW_ROOT.DS.$this->Logo,($_PosX-$img_space),$_PosY+5,25,8,'','','');
        /*
        TCPDF::Image	(	 	$file,
             	$x = '',
             	$y = '',
             	$w = 0,
             	$h = 0,
             	$type = '',
             	$link = '',
             	$align = '',
             	$resize = false,
             	$dpi = 300,
             	$palign = '',
             	$ismask = false,
             	$imgmask = false,
             	$border = 0,
             	$fitbox = false,
             	$hidden = false,
             	$fitonpage = false,
             	$alt = false,
             	$altimgs = array() 
            )		
        */
        
        if($this->OutputInstr['logo_or_qr'] == 'logo'){
            $this->Image(WWW_ROOT.$this->Logo,($_PosX),$_PosY+5,10,0,'','','',true);
        }

       // $this->Set_Font_Size('6');
        //Set the location to start the details
        $this->SetXY($x_after_heading+$img_space, $y_after_heading);
        
        $detail_width   = $this->width-$this->marginLeft-$img_space;
        $field_width    = $detail_width / 2;

		if($label_detail['username'] == $label_detail['password']){
        	$this->_add_pair($field_width,
				array(
					'key'		=> iconv('UTF-8', 'windows-1252',gettext('Voucher')), 
					'value'     => iconv('UTF-8', 'windows-1252',$label_detail['username'])
				),
				false
			);
		}else{
			$this->_add_pair($field_width,
				array(
					'key'		=> iconv('UTF-8', 'windows-1252',gettext('Username')), 
					'value'     => iconv('UTF-8', 'windows-1252',$label_detail['username'])
				),
				false
			);

        	$this->_add_pair($field_width,
				array(
					'key'		=> iconv('UTF-8', 'windows-1252',gettext('Password')),
					'value'     => iconv('UTF-8', 'windows-1252',$label_detail['password'])
				),
				false
			);
		}

        $this->_add_pair($field_width,array('key'=> iconv('UTF-8', 'windows-1252',gettext('Profile')),  'value'     => iconv('UTF-8', 'windows-1252',$label_detail['profile'])));

        //Disgard the entries that does not feature a days from first login...
        if($label_detail['days_valid'] != ''){
            $valid_for = $this->_friendly_valid_for($label_detail['days_valid']);
            $this->_add_pair(
                    $field_width,
                    array(
                        'key'       => iconv('UTF-8', 'windows-1252',gettext('Valid for')),
                        'value'     => iconv('UTF-8', 'windows-1252',$valid_for)
                    )
            );
        }

       if($label_detail['expiration'] != ''){
            $this->_add_pair(
                $field_width,
                array(
                    'key'           => iconv('UTF-8', 'windows-1252',gettext('Expiry date')),
                    'value'         => iconv('UTF-8', 'windows-1252',$label_detail['expiration'])));
        }

        if($label_detail['extra_value'] != ''){
            $this->_add_pair(
                $field_width,
                array(
                    'key'           => iconv('UTF-8', 'windows-1252',$label_detail['extra_name']),
                    'value'         => iconv('UTF-8', 'windows-1252',$label_detail['extra_value'])));
        }
    }


    function _add_pair($field_width,$pair,$no_bold = true){
        $bold       = 'B';
        $font_size = 10;
        if($no_bold){
            $bold ='';
            $this->SetTextColor(106, 106, 106);
            $font_size = 6;
        }
        $this->SetFont('','',$font_size);
        $this->Cell($field_width, 3, $pair['key'], 0, 0, "L");
        $this->SetFont('',$bold,$font_size);
        $this->Cell($field_width, 3, $pair['value'], 0, 2, "L");
        $this->SetFont('','',6);
        $this->SetX($this->getX()-$field_width);
        $this->SetTextColor(0, 0, 0);

    }
    
   private function _friendly_valid_for($time_valid){
	    $pieces         = explode("-", $time_valid);
        $a_o_l_reply    = '';
        
        if($pieces[0] !== '0'){
            $days = 'Days';
            if($pieces[0] == 1){
                $days = 'Day';
            }
            $a_o_l_reply = $a_o_l_reply.$pieces[0].' '.gettext($days).' ';
        }
        if($pieces[1] !== '00'){         
            $hours = 'Hours';
            if($pieces[1] == '01'){
                $hours = 'Hour';
            }
            $a_o_l_reply = $a_o_l_reply.ltrim($pieces[1], '0').' '.gettext($hours).' ';
        }
        if($pieces[2] !== '00'){
            $minutes = 'Minutes';
            if($pieces[2] == '01'){
                $minutes = 'Minute';
            }
            $a_o_l_reply = $a_o_l_reply.ltrim($pieces[2], '0').' '.gettext($minutes);
        }
        return $a_o_l_reply;    
	}
    
}

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
			$this->_doLogo();
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
	
	private function _doLogoVoucher(){

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
		$this->Image(WWW_ROOT.$this->Logo, $this->x_start+58, $this->y_start+10, $w, $h, '', false, '', true, 300, '', false, false, 0, false, false, false);
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

        if(($d['url'] != '')&&($d['cell'] != '')){
            //Border starts in middle of page
            $this->RoundedRect($x_start_mid,$y_start,$width,$height,$radius,'1111','',
                array('width' => 0.2, 'cap' => 'butt', 'join' => 'miter', 'dash' => 0, 'color' => array(122, 122, 143)),array());
        }

        
        //=== LEFT Side =====
        //AP Name
        $this->SetXY($x_txt,$y_txt); //Position the start place
        $this->SetFont($font_type_1,$font_format_b,12);
        $this->Cell($cell_width, 5,$d['name'],$cell_outline,2);  //Name of AP

        //AP Address (The Address might be optional)
        if(($d['street_no'] !== '')&&($d['street'] !== '')&&($d['town_suburb']!=='')){
            $this->SetFont($font_type_1,$font_format_b,10);
            $this->Cell($cell_width,4,__("Address"),$cell_outline,2);
            $this->SetFont($font_type_2,'',8);
            $address = $d['street_no']." ".$d['street']."\n".$d['town_suburb']."\n".$d['city']."\n".$d["country"];
            if(!(($d["lat"] == 0)&&($d["lon"] == 0))){
                $address = $address."\nLat ".$d["lat"]."\n"."Lng ".$d["lon"];
            }
            $this->MultiCell($cell_width,3,$address,$cell_outline,2);
        }

        //=== RIGHT Side ===
        if(($d['url'] != '')&&($d['cell'] != '')){
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
                $this->Cell($cell_width,3,$d['cell'].' ('.__('cell').')',$cell_outline,2);
            }
            
            if($d['url'] != ''){
                $this->write2DBarcode($d['url'], 'QRCODE,L', $x_mid_txt+60, $y_start+10, 20, 20, $this->QrStyle, 'N');
            }    
        }	
	}

	private function  _doTC(){

		$font_type_1    = 'dejavusans';
        $font_type_2    = 'dejavusans';
        $font_encode    = 'windows-1252';
        $font_format_b  = 'B';
        $font_format_i  = '';
		$this->SetFont($font_type_2,$font_format_i,8);

		if($this->RealmDetail['t_c_title'] != ''){
			$t_and_c_formatted = "<h2>".$this->RealmDetail['t_c_title']."</h2><ul>";
		}else{
			$t_and_c_formatted = "<ul>";
		}

		$t_c['content']	= explode("\n", $this->RealmDetail['t_c_content']);
		$content_rows	= count($t_c['content']);

		if($content_rows == 0){
			$this->OutputInstr['t_and_c'] = false; //There is nothing so it should be false for subsequent spacings
			return;
		}

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
			$this->Cell(20,$cell_height, __("Username"), 0, 0, "L");

			$this->SetFont( 'dejavusans', $font_format_b, 8);
			$this->Cell(30,$cell_height, $voucher['username'], 0, 2, "L");

			//--Password----
			$this->SetFont( 'dejavusans', '', 8);
			$this->SetX($this->x_start+2);
			$this->Cell(20,$cell_height,__("Password"), 0, 0, "L");

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
				
				$valid_for = $this->_friendly_valid_for($voucher['days_valid']);

				$this->SetFont( $font_type, $font_format_b, $text_size);
				$this->Cell(30,$cell_height,$valid_for, 0, 2, "L");
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
		
		if($this->OutputInstr['extra_fields']){
		
		    if(($voucher['extra_name'] !== '')&&($voucher['extra_value'] !== '')){ //Only if they have a vlaue
		        $this->SetTextColor(157,157,167);
		        $this->SetFont( $font_type, $font_format_i, $text_size);
			    $this->SetX($this->x_start+2);
			    $this->Cell(20,$cell_height,$voucher['extra_name'] , 0, 0, "L");

			    $this->SetFont( $font_type, $font_format_b, $text_size);
			    $this->Cell(30,$cell_height, $voucher['extra_value'], 0, 2, "L");
			    
		        //Reset again
			    $this->SetTextColor(0,0,0);
		    }
		}

		if($voucher['username'] == $voucher['password']){	//Assume single field
			//Only for the passphrases
			if($this->OutputInstr['logo_or_qr'] == 'qr'){
				$this->write2DBarcode(
					$voucher['username'], 
					'QRCODE,L', 
					$this->x_start+58, 
					$this->y_start+7, 20, 20, $this->QrStyle, 'N');
			}
		}
		
		//Add a Logo if the person choose to add one...
		if($this->OutputInstr['logo_or_qr'] == 'logo'){
		    $this->_doLogoVoucher();
		    //$this->Image(WWW_ROOT.$this->Logo, $this->x_start+58, $this->y_start+10, 15, 15, '', false, '', true, 300, '', false, false, 0, false, false, false);	
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
	
	private function _friendly_valid_for($time_valid){
	    $pieces         = explode("-", $time_valid);
        $a_o_l_reply    = '';
        
        if($pieces[0] !== '0'){
            $days = 'Days';
            if($pieces[0] == 1){
                $days = 'Day';
            }
            $a_o_l_reply = $a_o_l_reply.$pieces[0].' '.gettext($days).' ';
        }
        if($pieces[1] !== '00'){         
            $hours = 'Hours';
            if($pieces[1] == '01'){
                $hours = 'Hour';
            }
            $a_o_l_reply = $a_o_l_reply.ltrim($pieces[1], '0').' '.gettext($hours).' ';
        }
        if($pieces[2] !== '00'){
            $minutes = 'Minutes';
            if($pieces[2] == '01'){
                $minutes = 'Minute';
            }
            $a_o_l_reply = $a_o_l_reply.ltrim($pieces[2], '0').' '.gettext($minutes);
        }
        return $a_o_l_reply;    
	}
	
}

?>
