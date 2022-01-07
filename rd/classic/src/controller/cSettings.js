Ext.define('Rd.controller.cSettings', {
    extend: 'Ext.app.Controller',
    views: [
        'settings.pnlSettings',
        'settings.cmbMapPrefs'
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
        //pnl.on({activate    : me.onViewActivate,scope: me});
        pnl.on({afterlayout : me.onViewActivate,scope: me});
        me.populated = true;
    },
    onViewActivate: function(pnl){
        var me = this;
        pnl.down('form').load({
            url     : me.getUrlView(),
            method  : 'GET',
            failure : function(form, action) {
                Ext.Msg.alert(action.response.statusText, action.response.responseText);
            }
        });   
    }       
});
