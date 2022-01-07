Ext.define('Rd.view.aps.cmbAccessPointEntryPointReports', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbAccessPointEntryPointReports',
    fieldLabel      : 'SSID',
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    editable        : false,
    mode            : 'local',
    name            : 'entry_point_id',
    labelClsExtra   : 'lblRdReq',
    allowBlank      : true,
    apId            : '',
    initComponent: function(){
        var me      = this;   
        var s       = Ext.create('Ext.data.Store', {
            fields: [
                {name: 'id',    type: 'int'},
                {name: 'name',  type: 'string'}
            ],
            proxy: {
                    type    : 'ajax',
                    format  : 'json',
                    url     : '/cake3/rd_cake/ap-reports/view_entry_points.json',
                    extraParams : {
                        ap_id : me.apId
                    },
                    reader: {
                        type            : 'json',
                        rootProperty    : 'items',
                        messageProperty : 'message'
                    }
            },
            autoLoad: true
        });
        me.store = s;
        me.setValue(0);
        me.callParent(arguments);
    }
});
