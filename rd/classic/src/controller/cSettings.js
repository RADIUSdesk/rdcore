Ext.define('Rd.controller.cSettings', {
    extend: 'Ext.app.Controller',
    views: [
        'settings.pnlSettings'
    ],
    config: {
        urlView  : '/cake3/rd_cake/settings/view.json'
    }, 
    init: function () {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
    },
    actionIndex: function (pnl) {
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
