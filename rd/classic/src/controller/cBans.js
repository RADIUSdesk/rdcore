Ext.define('Rd.controller.cBans', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl){
        var me      	= this;       
        var id		    = 'tabBansId';
        var tabMeshes   = me.getTabMeshes();
        var newTab  = tabMeshes.items.findBy(
            function (tab){
                return tab.getItemId() === id;
            });
         
        if (!newTab){
            newTab = tabMeshes.add({
                glyph   : Rd.config.icnBan, 
                title   : 'Blocked and Speed Limited Devices',
                xtype	: 'gridBans',
                closable: true,
                layout  : 'fit',
                itemId  : id,
                border  : false
            });
        }    
        tabMeshes.setActiveTab(newTab);
    },
    views:  [
    	'bans.gridBans'
    ],
    stores: [],
    models: [],
    selectedRecord: null,
    config: {
        urlAdd          : '/cake4/rd_cake/bans/index.json',
    },
    refs: [
     //   {  ref: 'gridNas',  selector:   'gridNas'},
     //   {  ref: 'grid',     selector:   'gridNas'}
     	 {  ref: 'tabMeshes',        selector: '#tabMainNetworks' }        
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
    reload: function(){
        var me =this;
        if(me.getGrid() == undefined){   //Thw window is closed; exit
            clearInterval(me.autoReload);
            return;
        }
        me.getGrid().getSelectionModel().deselectAll(true);
        me.getGrid().getStore().load();
    },
    gridActivate: function(g){
        var me = this;
        me.getGrid().getStore().load();
    }
});
