Ext.define('Rd.view.qrcode.vcQrcode', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcQrcode',
    config	: {
        urlPdfBase : '/cake4/rd_cake/qr-code/pdf-view'
    },
    control: {
        '#pdf': {
            click   : 'pdf'
        },
        '#rgrpEncryption' : {
            change  : 'rgrpEncryptionChange' 
        }
    },
    pdf: function(btn){
    	var me 		    = this;
    	var form        = btn.up('form');
        //Get the values from the form:
		form_to_string 	= form.getForm().getValues(true);
        //Token
        var token 		= Ext.util.Cookies.get("Token"); //No token?
        var url_to_add 	= form_to_string+'&token='+token+'&';
        var urlPdf      = me.getUrlPdfBase()+'?'+url_to_add;
        window.open(urlPdf);   
    },
    rgrpEncryptionChange : function(rgrp,valObj){
		var me 		    = this;
		var pnl    	    = rgrp.up('pnlQrcode');
		if(valObj.encryption == 'none'){	
		    pnl.down('#txtKey').disable();
		}else{
		    pnl.down('#txtKey').enable();		
		}
	}
});
