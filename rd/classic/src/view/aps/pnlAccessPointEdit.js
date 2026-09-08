Ext.define('Rd.view.aps.pnlAccessPointEdit', {
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlAccessPointEdit',
    layout      : {
        type    : 'vbox',
        align   : 'stretch'
    },
    ap_profile_id   : undefined,
    controller  : 'vcAccessPointEdit',
    requires    : [
        'Rd.view.aps.vcAccessPointEdit'        
    ],
    initComponent: function() {
        var me      = this;  
        
        me.items = [ 
            {
                xtype   : 'cntNavigation',
                margin  : 0,
                padding : 5,
                url     : '/cake4/rd_cake/aps/nav-access-point-edit.json'
            },
            {
                xtype   : 'container',
                layout  : 'card',
                itemId  : 'crdAccessPointEdit',
                flex    : 1,
                items   : [
                    {
                        itemId      : 'tabApGeneral',
                        xtype       : 'pnlApGeneral',
                        apProfileId : me.ap_profile_id
                    },
                    {
                        itemId      : 'tabEntryPoints',
                        xtype       : 'gridAccessPointEntries',
                        apProfileId : me.ap_profile_id,
                        padding     : Rd.config.gridSlim
                    },
                    {
                        itemId      : 'tabExitPoints',
                        xtype       : 'gridAccessPointExits',
                        apProfileId : me.ap_profile_id,
                        padding     : Rd.config.gridSlim
                    },
                    {
                        itemId      : 'tabAccessPointCommonSettings',
                        xtype       : 'pnlAccessPointCommonSettings',
                        apProfileId : me.ap_profile_id 
                    },
                    {
                        itemId      : 'tabAccessPointAps',
                        xtype       : 'gridAccessPointAps',
                        apProfileId : me.ap_profile_id,
                        padding     : Rd.config.gridSlim    
                    }
                ]
            }
        ];
        
        me.callParent(arguments);
    }
});
