Ext.define('Rd.view.components.cmbVendor', {
    extend: 'Ext.form.ComboBox',
    alias : 'widget.cmbVendor',
    fieldLabel: i18n('sVendor'),
    labelSeparator: '',
    store: 'sVendors',
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
