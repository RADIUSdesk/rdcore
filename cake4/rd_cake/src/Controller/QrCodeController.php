<?php

namespace App\Controller;
use App\Controller\AppController;

use Endroid\QrCode\Color\Color;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Label\Label;
use Endroid\QrCode\Logo\Logo;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\Writer\PngWriter;
use Endroid\QrCode\Writer\ValidationException;

class QrCodeController extends AppController{
  
    public function initialize():void{  
        parent::initialize();
        $this->loadComponent('Aa');          
    }
      
    public function index(){
    
        $writer = new PngWriter();
    
        $qrCode = QrCode::create('Life is too short to be generating QR codes')
            ->setEncoding(new Encoding('UTF-8'))
            ->setErrorCorrectionLevel(ErrorCorrectionLevel::Low)
            ->setSize(300)
            ->setMargin(10)
            ->setRoundBlockSizeMode(RoundBlockSizeMode::Margin)
            ->setForegroundColor(new Color(0, 0, 0))
            ->setBackgroundColor(new Color(255, 255, 255));

        // Create generic logo
        $logo = Logo::create('/var/www/rdcore/cake4/rd_cake/webroot/img/nas/logo.png')
            ->setResizeToWidth(50)
            ->setPunchoutBackground(true)
        ;

        // Create generic label
        $label = Label::create('Label')
            ->setTextColor(new Color(255, 0, 0));

        $result  = $writer->write($qrCode, $logo, $label);
        $dataUri = $result->getDataUri();

        // Validate the result
        //$writer->validateResult($result, 'Life is too short to be generating QR codes');

    
    	$this->set(['posts' => true]);
		$this->viewBuilder()->setOption('serialize', true);
      
    }
    
     public function pdfView(){
     
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        //Build the string
        $qr_string  = $this->_wifiString();        
        $writer     = new PngWriter();  
        $qrCode     = QrCode::create($qr_string)
            ->setEncoding(new Encoding('UTF-8'))
            ->setErrorCorrectionLevel(ErrorCorrectionLevel::Low)
            ->setSize(300)
            ->setMargin(10)
            ->setRoundBlockSizeMode(RoundBlockSizeMode::Margin)
            ->setForegroundColor(new Color(0, 0, 0))
            ->setBackgroundColor(new Color(255, 255, 255));
            
        $result     = $writer->write($qrCode, null, null);
        $dataUri    = $result->getDataUri();

        $this->set('title', 'WiFi QR Code');
        $this->set('file_name', 'WiFi-QR-Code.pdf'); 
        $this->set('data', $dataUri);      	
  		$this->response = $this->response->withType('pdf');  		
    }
    
    private function _wifiString(){
       
        $req_q  = $this->request->getQuery();     
        $hidden = '';
      
        if((isset($req_q['hidden']))&&($req_q['hidden'] == 'on')){
            $hidden = 'H';
        }
        
        $type = '';
        if($req_q['encryption'] == 'wep'){
            $type = 'WEP';
        }
        if($req_q['encryption'] == 'wpa'){
            $type = 'WPA';
        }
        $key = '';
        
        if(isset($req_q['key'])){
            $key = $req_q['key'];
        }
        
        $ssid = $req_q['ssid'];               
        $w_string = "WIFI:T:$type;S:$ssid;P:$key;$hidden;";
        return $w_string;   
    }
}
