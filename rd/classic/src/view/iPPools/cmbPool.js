Ext.define('Rd.view.iPPools.cmbPool', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbPool',
    fieldLabel      : 'Pool',
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    allowBlank      : false,
    editable        : false,
    mode            : 'local',
    itemId          : 'name',
    name            : 'name',
    value           : '',
    labelClsExtra   : 'lblRdReq',
    initComponent: function(){
        var me      = this;
        var s       = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            proxy: {
                    type    : 'ajax',
                    format  : 'json',
                    batchActions: true, 
                    url     : '/cake3/rd_cake/ip-pools/list_of_pools.json',
                    reader: {
                        type: 'json',
                        rootProperty: 'items',
                        messageProperty: 'message'
                    }
            },
            autoLoad: true
        });
        me.store = s;
        me.callParent(arguments);
    }
});
