Ext.define('Rd.view.accel.pnlAccel', {
    extend	: 'Ext.tab.Panel',
    alias	: 'widget.pnlAccel',
    border	: false,
    plain	: true,
    cls     : 'subTab',
    requires: [
        'Rd.view.accel.gridAccelServers',
    //    'Rd.view.accel.gridAccelClients',
   //     'Rd.view.accel.gridAccelArrivals'
    ],
    initComponent: function(){
        var me      = this;
        me.items = [
        {   
            title   : 'Servers',
            xtype   : 'gridAccelServers'
        },
        { 
            title   : 'Profiles',
           // xtype   : 'pnlSettingsMqtt'
        },
        { 
            title   : 'New Arrivals',
           // xtype   : 'pnlSettingsEmail'
        }          
    ]; 
        me.callParent(arguments);
    }
});
