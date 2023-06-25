Ext.define('Rd.view.components.cmbVendor', {
    extend: 'Ext.form.ComboBox',
    alias : 'widget.cmbVendor',
    fieldLabel: i18n('sVendor'),
    labelSeparator: '',
   // store: 'sVendors',
    queryMode: 'local',
    valueField: 'id',
    displayField: 'name',
    typeAhead: true,
    allowBlank: false,
    mode: 'local',
    labelWidth : 60,
    labelClsExtra: 'lblRd',
    requires: [
        'Rd.store.sVendors'
    ],
    initComponent: function() {
    	var me = this;
  		var s = Ext.create('Rd.store.sVendors', {});            
        me.setStore(s);
        this.callParent(arguments);
    }
});
