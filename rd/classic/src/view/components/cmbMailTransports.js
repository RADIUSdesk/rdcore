Ext.define('Rd.view.components.cmbMailTransports', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbMailTransports',
    fieldLabel      : 'Email Transport',
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    allowBlank      : false,
    editable        : false,
    mode            : 'local',
    name            : 'email_transport',
    value           : 'smtp', //smtp is the default value
    labelClsExtra   : 'lblRd',
    initComponent: function() {
         var me = this;
        var s = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            proxy: {
                    type    : 'ajax',
                    format  : 'json',
                    batchActions: true, 
                    url     : '/cake4/rd_cake/settings/mail-transports.json',
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
