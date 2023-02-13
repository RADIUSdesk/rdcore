Ext.define('Rd.view.aps.winAccessPointAddEntry', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winAccessPointAddEntry',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'New Access Point SSID',
    width       : 600,
    height      : 500,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnAdd,
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
            xtype       : 'frmWifiEntryPoint',
            apProfileId : me.apProfileId,
            mode	    : 'add'
        };
        me.callParent(arguments);
    }
});
