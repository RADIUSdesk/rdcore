Ext.define('Rd.view.dynamicDetails.cmbDynamicTransKeys', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbDynamicTransKeys',
    fieldLabel      : 'Key',
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    editable        : false,
    mode            : 'local',
    name            : 'dynamic_detail_trans_key_id',
    multiSelect     : false,
    allowBlank      : false,
    
    initComponent: function(){
        var me      = this;
        var s       = Ext.create('Ext.data.Store', {
            fields: [
                {name: 'id',    type: 'string'},
                {name: 'name',  type: 'string'}
            ],
            proxy: {
                    type            : 'ajax',
                    format          : 'json',
                    batchActions    : true,
                    extraParams     : { 'dynamic_detail_id' : -1 },
                    url     : '/cake3/rd_cake/dynamic-detail-translations/keys-list.json',
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
