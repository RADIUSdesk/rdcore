Ext.define('Rd.controller.cWelcome', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl){
        var me = this; 
        if (me.populated) {
            return; 
        }    
        pnl.add({
            xtype   : 'pnlWelcome',
            border  : false,
            itemId  : 'tabWelcome',
            plain   : true
        });    
        me.populated = true;  
        me.control({
            'pnlWelcome #btnSetupWizard' : {
                click   : function(btn){
                    me.application.runAction('cSetupWizard','Index')
                } 
            }
        });        
    },
    views:  [
        'welcome.pnlWelcome'
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
    }
});
