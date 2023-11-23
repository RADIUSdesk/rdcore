Ext.define('Rd.view.meshes.winMeshEditEntry', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winMeshEditEntry',
    title       : i18n('sEdit_mesh_entry_point'),
    glyph       : Rd.config.icnEdit,
    closable    : true,
    draggable   : true,
    resizable   : true,
    width       : 500,
    height      : 470,
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
            xtype                   : 'frmWifiEntryPoint',
            mode					: 'edit'
        };
        me.callParent(arguments);
    }
});
