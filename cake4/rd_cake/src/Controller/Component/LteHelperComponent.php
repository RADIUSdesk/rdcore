<?php
//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: A component that helps with certain parts of LTE reporting
//---- Date: 12-11-2022
//------------------------------------------------------------

namespace App\Controller\Component;
use Cake\Controller\Component;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

class LteHelperComponent extends Component {

	protected $target_mid_l		= 20;
	protected $target_mid_u		= 50;
	
	protected $target_good_l	= 50;
	protected $target_good_u	= 90;

	//=RSSI=
	protected $lte_rssi_edge    = -85;
	 
	protected $lte_rssi_mid_l   = -85;
	protected $lte_rssi_mid_u   = -75;
	
    protected $lte_rssi_good_l  = -75;
	protected $lte_rssi_good_u  = -65;
	
	protected $lte_rssi_excel   = -65; 
	
	//=RSRP (Power)
	protected $lte_rsrp_edge    = -100;
	 
	protected $lte_rsrp_mid_l   = -100;
	protected $lte_rsrp_mid_u   = -90;
	
    protected $lte_rsrp_good_l  = -90;
	protected $lte_rsrp_good_u  = -80;
	
	protected $lte_rsrp_excel   = -80;
	
	//=RSRQ (Quality)
	protected $lte_rsrq_edge    = -20;
	 
	protected $lte_rsrq_mid_l   = -20;
	protected $lte_rsrq_mid_u   = -15;
	
    protected $lte_rsrq_good_l  = -15;
	protected $lte_rsrq_good_u  = -10;
	
	protected $lte_rsrq_excel   = -10;
	
	//=SNR (Signal To Noise)
	protected $lte_snr_edge    	= 0;
	 
	protected $lte_snr_mid_l   = 0;
	protected $lte_snr_mid_u   = 13;
	
    protected $lte_snr_good_l  = 13;
	protected $lte_snr_good_u  = 20;
	
	protected $lte_snr_excel   = 20;
	
	 
	public function getMobileProvider($i){
        Configure::load('MESHdesk'); 
        $m_providers   = Configure::read('MESHdesk.mobile_providers'); //Read the defaults
        $mcc = $i->{'qmi_mcc'};
        $mnc = $i->{'qmi_mnc'};                  
        foreach($m_providers as $p){
        	if(($p['mnc'] == $mnc)&&($p['mcc'] == $mcc)){
        		$i->{'qmi_provider_name'} 		= $p['name'];
        		$i->{'qmi_provider_country'} 	= $p['country'];
        		$i->{'qmi_provider_logo'} 		= '/cake4/rd_cake/img/mobile_providers/'.$p['logo'];
        		break;	
        	}                  
        }                      
    }
    
    public function getRssiGui($i){
    
    	if($i->{'qmi_rssi'}){
        
        	//Assume LTE default type                	
            if ($i->{'qmi_rssi'} < $this->lte_rssi_edge) {
                $rssi_bar = 0.2;
                $rssi_human = 'Cell Edge';
            }
                           
            if (($i->{'qmi_rssi'} >= $this->lte_rssi_mid_l)&($i->{'qmi_rssi'} <= $this->lte_rssi_mid_u)) {
                $source_LOWER_limit = $this->lte_rssi_mid_l;
				$source_UPPER_limit = $this->lte_rssi_mid_u;

				$source_range 		= $source_UPPER_limit - $source_LOWER_limit;          
				$measured_signal 	= $i->{'qmi_rssi'};  

				$measured_signal_offset = $measured_signal - $source_LOWER_limit;
                                
				$target_LOWER_limit = $this->target_mid_l;
				$target_UPPER_limit = $this->target_mid_u;

				$target_range = $target_UPPER_limit - $target_LOWER_limit;
				$target_signal = $target_LOWER_limit +($measured_signal_offset /  $source_range) * $target_range;
                $rssi_bar = round(($target_signal/100),1);
                $rssi_human = 'Mid Cell';
         	}
                               
            if (($i->{'qmi_rssi'} >= $this->lte_rssi_good_l)&($i->{'qmi_rssi'} <= $this->lte_rssi_good_u)) {
                $source_LOWER_limit = $this->lte_rssi_good_l;
				$source_UPPER_limit = $this->lte_rssi_good_u;

				$source_range 		= $source_UPPER_limit - $source_LOWER_limit;          
				$measured_signal 	= $i->{'qmi_rssi'};  

				$measured_signal_offset = $measured_signal - $source_LOWER_limit;
                                
				$target_LOWER_limit = $this->target_good_l;
				$target_UPPER_limit = $this->target_good_u;

				$target_range = $target_UPPER_limit - $target_LOWER_limit;
				$target_signal = $target_LOWER_limit +($measured_signal_offset /  $source_range) * $target_range;
                $rssi_bar = round(($target_signal/100),1);
                $rssi_human = 'Good';
         	}
         			         	  
            if ($i->{'qmi_rssi'} > $this->lte_rssi_excel) {
                $rssi_bar = 1;
                $rssi_human = 'Excellent';
            }
            $i->{'qmi_rssi_bar'} = $rssi_bar;
            $i->{'qmi_rssi_human'} = $rssi_human;
                                                               
        }
        
    }
    
    public function getRsrpGui($i){
    
    	if($i->{'qmi_rsrp'}){
        
        	//Assume LTE default type                	
            if ($i->{'qmi_rsrp'} < $this->lte_rsrp_edge) {
                $rsrp_bar = 0.2;
                $rsrp_human = 'Cell Edge';
            }
                           
            if (($i->{'qmi_rsrp'} >= $this->lte_rsrp_mid_l)&($i->{'qmi_rsrp'} <= $this->lte_rsrp_mid_u)) {
                $source_LOWER_limit = $this->lte_rsrp_mid_l;
				$source_UPPER_limit = $this->lte_rsrp_mid_u;

				$source_range 		= $source_UPPER_limit - $source_LOWER_limit;          
				$measured_signal 	= $i->{'qmi_rsrp'};  

				$measured_signal_offset = $measured_signal - $source_LOWER_limit;
                                
				$target_LOWER_limit = $this->target_mid_l;
				$target_UPPER_limit = $this->target_mid_u;

				$target_range = $target_UPPER_limit - $target_LOWER_limit;
				$target_signal = $target_LOWER_limit +($measured_signal_offset /  $source_range) * $target_range;
                $rsrp_bar = round(($target_signal/100),1);
                $rsrp_human = 'Mid Cell';
         	}
                               
            if (($i->{'qmi_rsrp'} >= $this->lte_rsrp_good_l)&($i->{'qmi_rsrp'} <= $this->lte_rsrp_good_u)) {
                $source_LOWER_limit = $this->lte_rsrp_good_l;
				$source_UPPER_limit = $this->lte_rsrp_good_u;

				$source_range 		= $source_UPPER_limit - $source_LOWER_limit;          
				$measured_signal 	= $i->{'qmi_rsrp'};  

				$measured_signal_offset = $measured_signal - $source_LOWER_limit;
                                
				$target_LOWER_limit = $this->target_good_l;
				$target_UPPER_limit = $this->target_good_u;

				$target_range = $target_UPPER_limit - $target_LOWER_limit;
				$target_signal = $target_LOWER_limit +($measured_signal_offset /  $source_range) * $target_range;
                $rsrp_bar = round(($target_signal/100),1);
                $rsrp_human = 'Good';
         	}
         			         	  
            if ($i->{'qmi_rsrp'} > $this->lte_rsrp_excel) {
                $rsrp_bar = 1;
                $rsrp_human = 'Excellent';
            }
            $i->{'qmi_rsrp_bar'} = $rsrp_bar;
            $i->{'qmi_rsrp_human'} = $rsrp_human;
                                                               
        }       
    }
    
    public function getRsrqGui($i){
    
    	if($i->{'qmi_rsrq'}){
        
        	//Assume LTE default type                	
            if ($i->{'qmi_rsrq'} < $this->lte_rsrq_edge) {
                $rsrq_bar = 0.2;
                $rsrq_human = 'Cell Edge';
            }
                           
            if (($i->{'qmi_rsrq'} >= $this->lte_rsrq_mid_l)&($i->{'qmi_rsrq'} <= $this->lte_rsrq_mid_u)) {
                $source_LOWER_limit = $this->lte_rsrq_mid_l;
				$source_UPPER_limit = $this->lte_rsrq_mid_u;

				$source_range 		= $source_UPPER_limit - $source_LOWER_limit;          
				$measured_signal 	= $i->{'qmi_rsrq'};  

				$measured_signal_offset = $measured_signal - $source_LOWER_limit;
                                
				$target_LOWER_limit = $this->target_mid_l;
				$target_UPPER_limit = $this->target_mid_u;

				$target_range = $target_UPPER_limit - $target_LOWER_limit;
				$target_signal = $target_LOWER_limit +($measured_signal_offset /  $source_range) * $target_range;
                $rsrq_bar = round(($target_signal/100),1);
                $rsrq_human = 'Mid Cell';
         	}
                               
            if (($i->{'qmi_rsrq'} >= $this->lte_rsrq_good_l)&($i->{'qmi_rsrq'} <= $this->lte_rsrq_good_u)) {
                $source_LOWER_limit = $this->lte_rsrq_good_l;
				$source_UPPER_limit = $this->lte_rsrq_good_u;

				$source_range 		= $source_UPPER_limit - $source_LOWER_limit;          
				$measured_signal 	= $i->{'qmi_rsrq'};  

				$measured_signal_offset = $measured_signal - $source_LOWER_limit;
                                
				$target_LOWER_limit = $this->target_good_l;
				$target_UPPER_limit = $this->target_good_u;

				$target_range = $target_UPPER_limit - $target_LOWER_limit;
				$target_signal = $target_LOWER_limit +($measured_signal_offset /  $source_range) * $target_range;
                $rsrq_bar = round(($target_signal/100),1);
                $rsrq_human = 'Good';
         	}
         			         	  
            if ($i->{'qmi_rsrq'} > $this->lte_rsrq_excel) {
                $rsrq_bar = 1;
                $rsrq_human = 'Excellent';
            }
            $i->{'qmi_rsrq_bar'} = $rsrq_bar;
            $i->{'qmi_rsrq_human'} = $rsrq_human;
                                                               
        }
        
    }
    
     public function getSnrGui($i){
    
    	if($i->{'qmi_snr'}){
        
        	//Assume LTE default type                	
            if ($i->{'qmi_snr'} < $this->lte_snr_edge) {
                $snr_bar = 0.2;
                $snr_human = 'Cell Edge';
            }
                           
            if (($i->{'qmi_snr'} >= $this->lte_snr_mid_l)&($i->{'qmi_snr'} <= $this->lte_snr_mid_u)) {
                $source_LOWER_limit = $this->lte_snr_mid_l;
				$source_UPPER_limit = $this->lte_snr_mid_u;

				$source_range 		= $source_UPPER_limit - $source_LOWER_limit;          
				$measured_signal 	= $i->{'qmi_snr'};  

				$measured_signal_offset = $measured_signal - $source_LOWER_limit;
                                
				$target_LOWER_limit = $this->target_mid_l;
				$target_UPPER_limit = $this->target_mid_u;

				$target_range = $target_UPPER_limit - $target_LOWER_limit;
				$target_signal = $target_LOWER_limit +($measured_signal_offset /  $source_range) * $target_range;
                $snr_bar = round(($target_signal/100),1);
                $snr_human = 'Mid Cell';
         	}
                               
            if (($i->{'qmi_snr'} >= $this->lte_snr_good_l)&($i->{'qmi_snr'} <= $this->lte_snr_good_u)) {
                $source_LOWER_limit = $this->lte_snr_good_l;
				$source_UPPER_limit = $this->lte_snr_good_u;

				$source_range 		= $source_UPPER_limit - $source_LOWER_limit;          
				$measured_signal 	= $i->{'qmi_snr'};  

				$measured_signal_offset = $measured_signal - $source_LOWER_limit;
                                
				$target_LOWER_limit = $this->target_good_l;
				$target_UPPER_limit = $this->target_good_u;

				$target_range = $target_UPPER_limit - $target_LOWER_limit;
				$target_signal = $target_LOWER_limit +($measured_signal_offset /  $source_range) * $target_range;
                $snr_bar = round(($target_signal/100),1);
                $snr_human = 'Good';
         	}
         			         	  
            if ($i->{'qmi_snr'} > $this->lte_snr_excel) {
                $snr_bar = 1;
                $snr_human = 'Excellent';
            }
            $i->{'qmi_snr_bar'} = $snr_bar;
            $i->{'qmi_snr_human'} = $snr_human;
                                                               
        }       
    }
}
