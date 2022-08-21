Ext.define('Rd.controller.cUnknownNodes', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl,itemId){
        pnl.add({ 
            title  : 'Unknown', 
            xtype  : 'gridUnknownNodes',
            border : false,
            plain  : true,
            glyph  : Rd.config.icnQuestion,
            tabConfig   : {
                ui : 'tab-brown'
            }   
        });    
    },
    views:  [
        'unknownNodes.gridUnknownNodes',
        'unknownNodes.winUnknownRedirect'
    ],
    stores: ['sUnknownNodes'],
    models: ['mUnknownNode'],
    selectedRecord: null,
    refs: [
        {  ref: 'grid',  selector: 'gridUnknownNodes'}       
    ],
    gridActivate: function(g){
        var me = this;
        var grid = g.down('grid');
        if(grid){
            grid.getStore().reload();
        }else{
            g.getStore().reload();
        }        
    }
});
