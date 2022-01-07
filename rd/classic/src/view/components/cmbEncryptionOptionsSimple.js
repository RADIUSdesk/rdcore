Ext.define('Rd.view.components.cmbEncryptionOptionsSimple', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbEncryptionOptionsSimple',
    fieldLabel      : 'Encryption',
    labelSeparator  : '',
    forceSelection  : true,
    queryMode       : 'local',
    displayField    : 'text',
    valueField      : 'id',
    typeAhead       : true,
    allowBlank      : false,
    mode            : 'local',
    name            : 'wbw_encryption',
    value           : 'none',
    initComponent   : function() {
        var me= this;
        var s = Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data : [
                {"id":"none",      "text": 'None'},
                {"id":"wep",       "text": 'WEP'},
                {"id":"psk",       "text": 'WPA Personal'},
                {"id":"psk2",       "text": 'WPA2 Personal'}           
            ]
        });
        me.store = s;
        this.callParent(arguments);
    }
});
