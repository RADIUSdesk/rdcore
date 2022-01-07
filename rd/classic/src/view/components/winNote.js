Ext.define('Rd.view.components.winNote', {
    extend: 'Ext.window.Window',
    alias : 'widget.winNote',
    title : i18n('sNote_management'),
    layout: 'fit',
    autoShow: false,
    width:    600,
    height:   400,
    iconCls: 'note',
    glyph   : Rd.config.icnNote,
    requires: [
        'Rd.view.components.gridNote'
    ],
    noteForId   : '',
    noteForGrid : '',
    noteForName : '',
    initComponent: function() {
        var me      = this;
        me.items    = {xtype : 'gridNote',noteForId: me.noteForId, noteForGrid: me.noteForGrid}
        me.title    = i18n('sNote_management')+": "+ me.noteForName;
        this.callParent(arguments);
    }
});
