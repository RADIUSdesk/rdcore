<?php
    
require_once(ROOT . DS . 'vendor' . DS . "radiusdesk" . DS . "rdpdf" . DS . "rdpdf.php");
      
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
    //Close and output PDF document
    $pdf->Output('test.pdf', 'I');
    
}else{

    $pdf = new LabelPdf($output_instr['format']);
    $pdf->setRTL($output_instr['rtl']);
    $pdf->AddPage();
    $pdf->OutputInstr = $output_instr;
    foreach(array_keys($voucher_data) as $key){
        $d = $voucher_data["$key"];
        foreach($d['vouchers'] as $v){
            $pdf->Logo = 'img/realms/'.$d['icon_file_name'];
            $pdf->Add_Label($v);
        }
    } 
    $pdf->Output('test.pdf', 'I');
}
       
//===============================
//Very important to 'reset' this
mb_internal_encoding('UTF-8');
//===============================

?>
