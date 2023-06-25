Ext.define('Rd.view.profileComponents.vcProfileComponentEntry', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcProfileComponentEntry',
    control: {
    	'cmbVendor': {
            change	: 'cmbVendorChange'
        }
    },
    init    : function() {
    
    },
    cmbVendorChange: function(cmb){
        var me 		= this;
        var value   = cmb.getValue();
        var attr    = me.getView().down('cmbAttribute');
        attr.getStore().getProxy().setExtraParam('vendor',value);
        attr.getStore().load();   
    }  
});
