Ext.define('Rd.view.aps.pnlAccessPointView', {
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlAccessPointView',
    layout      : {
        type    : 'vbox',
        align   : 'stretch'
    },
    ap_id       : undefined,
    apName      : undefined,
    controller  : 'vcAccessPointView',
    requires    : [
        'Rd.view.aps.pnlApViewSqm',
        'Rd.view.aps.pnlApViewWan',
        'Rd.view.aps.pnlApViewVpn',
        'Rd.view.aps.pnlApViewHardware',
        'Rd.view.bandwidth.pnlViewBandwidth',
        'Rd.view.aps.gridApViewActions', 
        'Rd.view.aps.vcAccessPointView'        
    ],
    initComponent: function() {
        var me      = this;
         me.items = [ 
            {
                xtype   : 'cntNavigation',
                margin  : 0,
                padding : 5,
                url     : '/cake4/rd_cake/aps/nav-access-point-view.json'
            },
            {
                xtype   : 'container',
                layout  : 'card',
                itemId  : 'crdAccessPointView',
                flex    : 1,
                items   : [
                    {
                        itemId  : 'tabViewBandwidth',
                        xtype   : 'pnlViewBandwidth',
                        dev_mode: 'ap',
                        dev_id  : me.ap_id
                    },
                    {
                        itemId  : 'tabApViewSqm',
                        xtype   : 'pnlApViewSqm',
                        apId    : me.ap_id
                    },
                    {
                        itemId  : 'tabApViewWan',
                        xtype   : 'pnlApViewWan',
                        apId    : me.ap_id
                    },
                    {
                        itemId  : 'tabApViewVpn',
                        xtype   : 'pnlApViewVpn',
                        apId    : me.ap_id           
                    },
		        /*    {
                        title   : 'HARDWARE',
                        itemId  : 'tabApViewHardware',
                        xtype   : 'pnlApViewHardware',
                        apId    : me.ap_id
                    },*/           
                    {
                        itemId  : 'tabApViewActions',
                        xtype   : 'gridApViewActions',
                        apId    : me.ap_id
                    }       
                ]
            }
        ]; 
        
        me.callParent(arguments);
    }
});
