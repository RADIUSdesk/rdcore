Ext.define('Rd.view.settings.pnlSettings', {
    extend	: 'Ext.tab.Panel',
    alias	: 'widget.pnlSettings',
    border	: false,
    plain	: true,
    cls     : 'subSubTab',
    requires: [
        'Rd.view.settings.pnlSettingsDefaults',
        'Rd.view.settings.pnlSettingsMqtt',
        'Rd.view.settings.pnlSettingsEmail',
        'Rd.view.settings.pnlSettingsSms'
    ],
    tabBar: {
        items: [
            { 
                xtype   : 'btnOtherBack'
            }              
       ]
    },
    initComponent: function(){
        var me      = this;
        me.items = [
        {   
            title   : 'Defaults',
            xtype   : 'pnlSettingsDefaults'
        },
        { 
            title   : 'MQTT',
            xtype   : 'pnlSettingsMqtt'
        },
        { 
            title   : 'Email',
            xtype   : 'pnlSettingsEmail'
        },
        { 
            title   : 'SMS Provider 1',
            xtype   : 'pnlSettingsSms',
            nr      : 1
        },
        { 
            title   : 'SMS Provider 2',
            xtype   : 'pnlSettingsSms',
            nr      : 2
        }            
    ]; 
        me.callParent(arguments);
    }
});
