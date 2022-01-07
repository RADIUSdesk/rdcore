Ext.define('Rd.view.registration.vcRegister', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcRegister',
    init: function() {
    
    }, 
	onTxEmailChange: function (txfld, newValue, oldValue, eOpts) {
		var me = this,
			pnl = txfld.up('panel');
			
		var btn_get_code = pnl.down('#btnCode');
			
		if(newValue == ''){
			btn_get_code.setDisabled ( true );
		} else {
			btn_get_code.setDisabled ( false );
		}
			
	},
	onTxCodeChange: function (txfld, newValue, oldValue, eOpts) {
		var me = this,
			pnl = txfld.up('panel');
			
		var btn_register = pnl.down('#btnRegister'),
			btn_get_code = pnl.down('#btnCode'),
			fld_txEmail = pnl.down('#txEmail'),
			txEmailValue = fld_txEmail.getValue();
			
		if(newValue != '' && txEmailValue !='' ){
			btn_register.setDisabled ( false );
			btn_get_code.setDisabled ( true );
		} else if(newValue == '' && txEmailValue !=''){
			btn_register.setDisabled ( true );
			btn_get_code.setDisabled ( false );
		} else {
			btn_register.setDisabled ( true );
			btn_get_code.setDisabled ( true );
		}
			
	}
	
});
