Ext.define('Rd.view.topUps.vcTopUpTransactions', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcTopUpTransactions',
    init    : function() {
    
    },
    config: {
         urlRedirectNode : '/cake4/rd_cake/nodes/redirect_unknown.json'
    },
    control: {
        'gridTopUpTransactions': {
            activate : 'onPnlActivate'
        },
        'gridTopUpTransactions #reload': {
            click :  'reload'
        },
		/*'gridUnknownNodes #delete': {
            click: 'delUnknownNode'
        }*/
    },
    onPnlActivate: function(pnl){
        var me = this;
        me.reload();
    },
    reload: function(){
        var me      = this;
        me.getView().getSelectionModel().deselectAll(true);
        me.getView().getStore().load();
    }
});
