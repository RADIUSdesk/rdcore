Ext.define('AmpConf.view.info.vcInfo', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcInfo',
    init    : function() {
        this.callParent(arguments);
    },
    onBackTap: function() {
        var me      = this;
        me.fireEvent('logout');   
    }
});
