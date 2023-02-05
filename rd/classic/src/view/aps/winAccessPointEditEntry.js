Ext.define('Rd.view.aps.winAccessPointEditEntry', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winAccessPointEditEntry',
    glyph       : Rd.config.icnEdit,
    title       : 'Edit Access Point SSID',
    closable    : true,
    draggable   : true,
    resizable   : true,
    width       : 600,
    height      : 500,
    plain       : true,
    border      : false,
    layout      : 'fit',
    autoShow    : false,
    defaults    : {
            border: false
    },
    requires    : [
        'Rd.view.components.frmWifiEntryPoint'
    ],
    initComponent: function() {
        var me      = this;
        me.items    = {
            xtype       : 'frmWifiEntryPoint'
        };
        me.callParent(arguments);
    }
});
