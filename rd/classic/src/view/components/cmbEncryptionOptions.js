Ext.define('Rd.view.components.cmbEncryptionOptions', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbEncryptionOptions',
    fieldLabel      : i18n("sEncryption"),
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    allowBlank      : false,
    editable        : false,
    mode            : 'local',
    itemId          : 'encryption',
    name            : 'encryption',
    value           : 'none',
    labelClsExtra   : 'lblRd',
    initComponent: function(){
        var me      = this;
        var s       = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            proxy: {
                    type    : 'ajax',
                    format  : 'json',
                    batchActions: true, 
                    url     : '/cake3/rd_cake/meshes/encryptionOptions.json',
                    reader: {
                        type            : 'json',
                        rootProperty    : 'items',
                        messageProperty : 'message'
                    }
            },
            autoLoad: true
        });
        me.store = s;
        me.callParent(arguments);
    }
});
