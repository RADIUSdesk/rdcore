Ext.define('Rd.view.aps.pnlAccessPointEdit', {
    extend          : 'Ext.tab.Panel',
    alias           : 'widget.pnlAccessPointEdit',
    border          : false,
    plain           : true,
    cls             : 'subTab',
    tabPosition     : 'top',
    ap_profile_id   : undefined,
    initComponent: function() {
        var me      = this;     
        me.items    = [
            {
                title       : i18n("sGeneral"),
                itemId      : 'tabApGeneral',
                xtype       : 'pnlApGeneral',
                apProfileId : me.ap_profile_id
            },
            {
                title       :  'SSIDs',
                itemId      : 'tabEntryPoints',
                xtype       : 'gridAccessPointEntries',
                apProfileId : me.ap_profile_id
            },
            {
                title       :  i18n("sExit_points"),
                itemId      : 'tabExitPoints',
                xtype       : 'gridAccessPointExits',
                apProfileId : me.ap_profile_id
            },
            {
                title       : 'Common Settings',
                itemId      : 'tabAccessPointCommonSettings',
                xtype       : 'pnlAccessPointCommonSettings',
                apProfileId : me.ap_profile_id 
            },
             {
                title       : 'Devices',
                itemId      : 'tabAccessPointAps',
                xtype       : 'gridAccessPointAps',
                apProfileId : me.ap_profile_id    
            }
        ];
        me.callParent(arguments);
    }
});
