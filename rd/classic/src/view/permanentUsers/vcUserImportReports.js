Ext.define('Rd.view.permanentUsers.vcUserImportReports', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcUserImportReports',
    init    : function() {
    
    },
    control: {
        'gridUserImportReports': {
            activate : 'onPnlActivate'
        },
        'gridUserImportReports #reload': {
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
