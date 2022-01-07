Ext.define('Rd.view.components.cmbAttribute', {
    extend: 'Ext.form.ComboBox',
    alias : 'widget.cmbAttribute',
    fieldLabel: i18n('sAttribute'),
    labelSeparator: '',
    store: 'sAttributes',
    queryMode: 'local',
    valueField: 'id',
    displayField: 'name',
    typeAhead: true,
    allowBlank: false,
    mode: 'local',
    labelClsExtra: 'lblRd',
    initComponent: function() {
        this.callParent(arguments);
    }
});
