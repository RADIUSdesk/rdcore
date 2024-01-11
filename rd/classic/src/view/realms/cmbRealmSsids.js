Ext.define('Rd.view.realms.cmbRealmSsids', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbRealmSsids',
    fieldLabel      : 'SSID',
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    allowBlank      : true,
    editable        : false,
    mode            : 'local',
    name            : 'realm_ssis_id',
    value           : 0,
    initComponent: function(){
        var me      = this;
        var s       = Ext.create('Ext.data.Store', {
            listeners: {
                load: function(store, records, successful) {
                    if(successful){
                        me.setValue(0);  
                    }
                },
                scope: this
            },
            fields: [
                {name: 'id',       type: 'int'     },
                {name: 'name',     type: 'string'  }
            ],
            proxy: {
                type    : 'ajax',
                format  : 'json',
                batchActions: true,
                extraParams : {
                    realm_id : me.realm_id   
                },
                url     : '/cake4/rd_cake/realm-ssids/cmb-index.json',
                reader  : {
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
