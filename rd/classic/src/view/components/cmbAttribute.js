Ext.define('Rd.view.components.cmbAttribute', {
    extend: 'Ext.form.ComboBox',
    alias : 'widget.cmbAttribute',
    fieldLabel: i18n('sAttribute'),
    labelSeparator: '',
    queryMode: 'local',
    valueField: 'id',
    displayField: 'name',
    typeAhead: true,
    allowBlank: false,
    mode: 'local',
    labelWidth : 60,
    labelClsExtra: 'lblRd',
    requires: [
        'Rd.store.sAttributes'
    ],
    initComponent: function() {
    	var me = this;
  		var s = Ext.create('Rd.store.sAttributes', {});            
        me.setStore(s);
        this.callParent(arguments);
    }
});
