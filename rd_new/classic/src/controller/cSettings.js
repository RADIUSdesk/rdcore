Ext.define('Rd.controller.cSettings', {
    extend: 'Ext.app.Controller',
    views: [
        'settings.pnlSettings'
    ],
    config: {
        urlView  : '/cake4/rd_cake/settings/view.json'
    }, 
    init: function () {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
    },
    actionIndex: function(pnl,itemId){
        var me      = this;
        var item    = pnl.down('#'+itemId);
        var added   = false;
        if(!item){
            pnl.add({ 
                itemId  : itemId,
                xtype   : 'pnlSettings',
	            border  : false,
	            plain   : true,
                padding : '0 5 0 5',
            });
            added = true;
        }
        return added;      
    },
    actionIndexZ: function (pnl) {
        var me = this;
        if (me.populated) {
            return; 
        } 
        pnl.add({
            xtype   : 'pnlSettings',
            border  : false,
            itemId  : 'tabSettings',
            plain   : true
        });
        me.populated = true;
    }
});
