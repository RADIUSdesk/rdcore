Ext.define('Rd.controller.cPrivatePsks', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl){
    
        var me = this;      
        if (me.populated) {
            return; 
        }      
        pnl.add({
            xtype   : 'gridPrivatePsks',
            padding : Rd.config.gridSlim,
            border  : false,
            plain	: true
        }); 
        pnl.on({activate : me.gridActivate,scope: me});  
        me.populated = true; 
            
    },
    views:  [
    	'privatePsks.gridPrivatePsks'
    ],
    stores  : ['sPrivatePsks'],
    models  : ['mPrivatePsk'],
    gridActivate: function(p){     
        var g = p.down('grid');
        g.getStore().load();
    }
});
