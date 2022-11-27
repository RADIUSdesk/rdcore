Ext.define('Rd.view.components.cmbNasTypes', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbNasTypes',
    fieldLabel      : i18n('sType'),
    labelSeparator  : '',
    store           : 'sNasTypes',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    allowBlank      : false,
    editable        : false,
    mode            : 'local',
    name            : 'type',
    labelClsExtra   : 'lblRd',
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    }
});
