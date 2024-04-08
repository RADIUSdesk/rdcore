<?php

$pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
// set default font subsetting mode
$pdf->setFontSubsetting(true);
$pdf->SetFont('dejavusans', '', 14, '', true);
$pdf->AddPage();

$ssid= 'Sub-Eynsham-909';

$html = <<<EOD
<i>Scan QR Code to connect</i>
<br>
<br>
<b>Network</b> <span style="color:blue;">$ssid</span>
<br>
<b>Wi-Fi Password</b> <span style="color:blue;">11223344</span>
EOD;

// Print text using writeHTMLCell()
$pdf->writeHTMLCell(0, 0, '', '', "<img src=\"$data\" width=\"200\" height=\"200\">", 0, 1, 0, true, '', true);
$pdf->writeHTMLCell(0, 0, '', '', $html, 0, 1, 0, true, '', true);


$pdf->Output($file_name, 'I');

?>
