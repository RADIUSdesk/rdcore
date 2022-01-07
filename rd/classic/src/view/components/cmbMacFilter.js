Ext.define('Rd.view.components.cmbMacFilter', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbMacFilter',
    fieldLabel      : i18n('sMacFilter'),
    labelSeparator  : '',
    forceSelection  : true,
    queryMode       : 'local',
    displayField    : 'text',
    valueField      : 'id',
    typeAhead       : true,
    allowBlank      : false,
    mode            : 'local',
    name            : 'macfilter',
    labelClsExtra   : 'lblRd',
    value           : "disable",
    initComponent   : function() {
        var me = this;
        var s = Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data : [
                {"id":"disable",    "text": i18n("sDisabled")},
                {"id":"allow",      "text": i18n("sAllow")},
                {"id":"deny",       "text": i18n("sDeny")}
            ]
        });
        
        me.store = s;
        this.callParent(arguments);
    }
});
