Ext.define('Rd.view.components.cmbSessionLimit', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbSessionLimit',
    fieldLabel      : 'Active devices limit',
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    allowBlank      : false,
    editable        : false,
    mode            : 'local',
    value           : 0,
    name            : 'session_limit',
    initComponent: function() {
        var me = this;
        var s = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            proxy: {
                    type    : 'ajax',
                    format  : 'json',
                    batchActions: true, 
                    url     : '/cake4/rd_cake/utilities/session-limits.json',
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
