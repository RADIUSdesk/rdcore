Ext.define('Rd.controller.cUnknownNodes', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl,itemId){
        pnl.add({ 
            title   : 'Unknown', 
            xtype   : 'gridUnknownNodes',
            border  : false,
            plain   : true,
            glyph   : Rd.config.icnQuestion,
            padding : Rd.config.gridSlim,
            tabConfig   : {
                ui : 'tab-brown'
            }   
        });    
    },
    views:  [
        'unknownNodes.gridUnknownNodes'
    ]
});
