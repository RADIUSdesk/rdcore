Ext.define('Rd.view.clouds.pnlCloudEdit', {
    extend	: 'Ext.tab.Panel',
    alias	: 'widget.pnlCloudEdit',
    border	: false,
    plain	: true,
    cls     : 'subTab',
    requires: [
        'Rd.view.settings.pnlSettingsEmail',
        'Rd.view.settings.pnlSettingsSms',
        'Rd.view.clouds.pnlCloudDetail',
    ],
    initComponent: function(){
        var me      = this;     
        me.items = [
         { 
            title   : 'Detail',
            xtype   : 'pnlCloudDetail',
            cloud_id: me.cloud_id
        },
        { 
            title   : 'Email',
            xtype   : 'pnlSettingsEmail',
            cloud_id: me.cloud_id
        },
        { 
            title   : 'SMS Provider 1',
            xtype   : 'pnlSettingsSms',
            nr      : 1,
            cloud_id: me.cloud_id

        },
        { 
            title   : 'SMS Provider 2',
            xtype   : 'pnlSettingsSms',
            nr      : 2,
            cloud_id: me.cloud_id
        }            
    ]; 
        me.callParent(arguments);
    }
});
