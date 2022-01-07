Ext.define('Rd.controller.cApOverview', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl){

        var me = this;   
        if (me.populated) {
            return; 
        }     
        pnl.add({
            xtype   : 'panel',
            border  : true,
            itemId  : 'tabApOverview',
            plain   : true
        });
        me.populated = true;
    },

    views:  [
    ],
    stores: [],
    models: [],
    selectedRecord: null,
    config: {
        urlUsageForRealm    : '/cake3/rd_cake/data-usages/usage_for_realm.json',
        username            : false,
        type                : 'realm' //default is realm
    },
    refs: [
        
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        me.control({
          
        });
    },
    appClose:   function(){
        var me          = this;
        me.populated    = false;
    }
});
