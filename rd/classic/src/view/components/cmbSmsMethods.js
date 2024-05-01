Ext.define('Rd.view.components.cmbSmsMethods', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbSmsMethods',
    fieldLabel      : 'SMS Method',
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    allowBlank      : false,
    editable        : false,
    mode            : 'local',
    value           : 'api', //none is the default value
    labelClsExtra   : 'lblRd',
    initComponent: function() {
        var me = this;
        var s = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            proxy: {
                    type    : 'ajax',
                    format  : 'json',
                    batchActions: true, 
                    url     : '/cake4/rd_cake/settings/sms-methods.json',
                    reader: {
                        type: 'json',
                        rootProperty: 'items',
                        messageProperty: 'message'
                    }
            },
            autoLoad: true
        });
        
        me.store = s;
        this.callParent(arguments);
    }
});
