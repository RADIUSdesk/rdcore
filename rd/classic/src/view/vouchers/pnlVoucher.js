Ext.define('Rd.view.vouchers.pnlVoucher', {
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlVoucher',
    layout      : {
        type    : 'vbox',
        align   : 'stretch'
    },
    v_id	: null,
    v_name	: null,
    record	: null, //We will supply each instance with a reference to the selected record.
    controller  : 'vcVoucher',
    requires: [
        'Rd.view.vouchers.pnlVoucherBasic',
        'Rd.view.components.cntNavigation',
        'Rd.view.vouchers.vcVoucher'
    ],
    initComponent: function(){
        var me      = this;
         me.items = [ 
            {
                xtype   : 'cntNavigation',
                margin  : 0,
                padding : 5,
                url     : '/cake4/rd_cake/vouchers/nav-voucher-edit.json'
            },
            {
                xtype   : 'container',
                layout  : 'card',
                itemId  : 'crdVoucher',
                flex    : 1,
                items   : [
                    {   
                        itemId  : 'tabBasicInfo',
                        xtype   : 'pnlVoucherBasic',
                        record  : me.record  
                    },
                    { 
                        itemId  : 'tabPrivateAttributes',
                        layout  : 'fit',
                        xtype   : 'gridVoucherPrivate',  
                        username: me.v_name
                    },
                    { 
                        itemId  : 'tabAcctData', 
                        layout  : 'fit',
                        xtype   : 'gridVoucherRadaccts',
                        username: me.v_name
                    }           
                ]
            }
        ]; 
        me.callParent(arguments);
    }
});
