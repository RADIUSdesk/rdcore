Ext.define('Rd.view.nas.cmbNasTypes', {
    extend: 'Ext.form.ComboBox',
    alias : 'widget.cmbNasTypes',
    fieldLabel: i18n('sType'),
    labelSeparator: '',
    store: 'sNasTypes',
    queryMode: 'local',
    valueField: 'id',
    displayField: 'name',
    allowBlank: false,
    editable: false,
    mode: 'local',
    itemId: 'type',
    name: 'type',
    labelClsExtra: 'lblRd',
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    }
});
