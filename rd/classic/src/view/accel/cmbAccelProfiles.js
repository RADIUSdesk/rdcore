Ext.define('Rd.view.accel.cmbAccelProfiles', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbAccelProfiles',
    fieldLabel      : 'Server Profile',
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    allowBlank      : false,
    editable        : false,
    mode            : 'local',
    name            : 'accel_profile_id',
    labelClsExtra   : 'lblRdReq',
    initComponent: function(){
        var me      = this;
        var s       = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            proxy: {
                    type    : 'ajax',
                    format  : 'json',
                    batchActions: true, 
                    url     : '/cake4/rd_cake/accel-profiles/index.json',
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
