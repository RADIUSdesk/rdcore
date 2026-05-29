Ext.define('Rd.view.auditLogs.vcAuditLogs', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcAuditLogs',
    init    : function() {
    
    },
    config: {
        urlAdd      : '/cake4/rd_cake/audit-logs/add.json'
    },
    control: {
        'gridAuditLogs #reload': {
            click   : 'reload'
        },
        'gridAuditLogs #reload menuitem[group=refresh]'   : {
            click   : 'reloadOptionClick'
        }
    },
    reload: function(){
        var me      = this;
        me.getView().getStore().load();
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
    },
    onViewActivate: function(pnl){
        var me = this;
        me.reload();   
    }
});
