Ext.define('Rd.controller.cPrivatePsks', {
    extend: 'Ext.app.Controller',
   actionIndex: function(pnl){
        var me      = this;
        var itemId  = 'gridPrivatePsksId';
        var item    = pnl.down('#'+itemId);
        if(!item){
            pnl.add({ 
                itemId  : itemId,
                xtype  : 'gridPrivatePsks',
                border : false,
                plain  : true,
                padding : Rd.config.gridSlim,
            });
            pnl.on({activate : me.reload,scope: me});
        }
    },
    refs    : [
        {  ref: 'grid',  selector: 'gridPrivatePsks'}       
    ],
    views   :  [
    	'privatePsks.gridPrivatePsks'
    ],
    stores  : ['sPrivatePsks'],
    models  : ['mPrivatePsk'],
    reload: function(){
        var me =this;
        me.getGrid().getSelectionModel().deselectAll(true);
        me.getGrid().getStore().load();
    }
});
