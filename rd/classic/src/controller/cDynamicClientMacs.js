Ext.define('Rd.controller.cDynamicClientMacs', {
    extend: 'Ext.app.Controller',
    actionIndex: function(tp){
        var me      = this;
        me.ui       = Rd.config.tabDevices; //This is set in the config file      
        var me      = this;  
        var tab     = tp.items.findBy(function (tab){
            return tab.getXType() === 'gridDynamicClientMacs';
        });
               
        if (!tab){
            tab = tp.insert(1,{
                xtype   : 'gridDynamicClientMacs',
                padding : Rd.config.gridPadding,
                border  : false,
                itemId  : 'tabDynamicClientMacs',
                glyph   : Rd.config.icnBus,
                title   : 'New Arrivals - Devices',
                plain	: true,
                closable: true, 
                tabConfig: {
                    ui: 'tab-blue'
                }
            });
        }      
        tp.setActiveTab(tab);
        me.populated = true;
    },
    views:  [
    	'dynamicClientMacs.gridDynamicClientMacs'
    ],
    stores: [],
    models: [],
    selectedRecord: null,
    config: {
        urlAdd          : '/cake4/rd_cake/bans/index.json',
    },
    refs: [
    	{  ref: 'tabUsers',     selector: '#tabUsers' }          
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        me.control({
           
        });
    }
});
