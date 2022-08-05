Ext.define('Rd.controller.cMeshGrid', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl){
        var me = this;   
        if (me.populated) {
            return; 
        }     
        pnl.add({
            xtype   : 'pnlMeshGrid',
            border  : true,
            itemId  : 'tabMeshGrid',
            plain   : true
        });
        me.populated = true;
    },
    actionOverviewIndex: function(tabtree_id,name){
        var me          = this;
        var id		    = 'tabMeshGrid'+ tabtree_id;
		var tpOverview  = Ext.first('#tpOverview');
        var newTab      = tpOverview.items.findBy(
            function (tab){
                return tab.getItemId() === id;
            });   
        if (!newTab){
            newTab = tpOverview.add({
                glyph   : Rd.config.icnMesh, 
                title   : name,
                closable: true,
                layout  : 'fit',
                xtype   : 'pnlMeshGrid',
                itemId  : id,
                tree_tag_id : tabtree_id
            });
        }    
        tpOverview.setActiveTab(newTab);    
    },
    views:  [
        'meshOverview.pnlMeshGrid',
		'meshOverview.gridMeshOverview'
    ],
    stores      : [
		'sMeshOverview'
	],
    models      : [
        'mMeshOverview'
    ],
    selectedRecord: null,
    config: {
        urlUsageForRealm    : '/cake3/rd_cake/data-usages/usage_for_realm.json',
        username            : false,
        type                : 'realm' //default is realm
    },
    refs: [
         {  ref: 'grid',         selector: 'gridMeshOverview'}   
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        me.control({
            'pnlMeshGrid' : {
                destroy   :      me.appClose   
            },
            'pnlMeshGrid #reload': {
                click:      me.reload
            },
            'pnlMeshGrid #reload menuitem[group=refresh]'   : {
                click:      me.reloadOptionClick
            }
        });
    },
    appClose:   function(){
        var me          = this;
        me.populated    = false;
    },
    reload: function(){
        var me =this;
        me.getGrid().getSelectionModel().deselectAll(true);
        me.getGrid().getStore().load();
    },
    reloadOptionClick: function(menu_item){
        var me      = this;
        var n       = menu_item.getItemId();
        var b       = menu_item.up('button'); 
        var interval= 30000; //default
        clearInterval(me.autoReload);   //Always clear
        b.setGlyph(Rd.config.icnTime);

        if(n == 'mnuRefreshCancel'){
            b.setGlyph(Rd.config.icnReload);
            return;
        }
        
        if(n == 'mnuRefresh1m'){
           interval = 60000
        }

        if(n == 'mnuRefresh5m'){
           interval = 360000
        }
        me.autoReload = setInterval(function(){        
            me.reload();
        },  interval);  
    }
    
    
});
