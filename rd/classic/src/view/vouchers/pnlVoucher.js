Ext.define('Rd.view.vouchers.pnlVoucher', {
    extend	: 'Ext.tab.Panel',
    alias	: 'widget.pnlVoucher',
    border	: false,
    v_id	: null,
    v_name	: null,
    record	: null, //We will supply each instance with a reference to the selected record.
    plain	: true,
    cls     : 'subTab',
    requires: [
        'Rd.view.vouchers.pnlVoucherBasic'
    ],
    initComponent: function(){
        var me      = this;
        me.items = [
            {   
                title   : i18n('sBasic_info'),
                itemId  : 'tabBasicInfo',
                xtype   : 'pnlVoucherBasic',
                record  : me.record  
            },
            { 
                title   : i18n('sPrivate_attributes'),
                layout  : 'fit',
                xtype   : 'gridVoucherPrivate',  
                username: me.v_name
            }, 
		    { 
                title   : i18n('sDevices'),
                layout  : 'fit',
                xtype   : 'gridVoucherDevices',  
                username: me.v_name
            }, 
            { 
                title   : i18n('sAccounting_data'), 
                layout  : 'fit',
                xtype   : 'gridVoucherRadaccts',
                username: me.v_name
            }           
        ]; 
        me.callParent(arguments);
    }
});
