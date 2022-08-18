<?php

class xtcpdf extends TCPDF {
 
}
 
 
$pdf = new xtcpdf(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
 
// use the examples at http://tcpdf.org to create a pdf
 
$pdf->Output($file_name, 'I');

?>
