Ext.define('Rd.view.realms.cmbRealmVlans', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbRealmVlans',
    fieldLabel      : 'VLAN',
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'vlan',
    allowBlank      : true,
    editable        : false,
    mode            : 'local',
    name            : 'realm_vlan_id',
    value           : 0,
    initComponent: function(){
        var me      = this;
        var s       = Ext.create('Ext.data.Store', {
            fields: ['id', 'vlan'],
            proxy: {
                type    : 'ajax',
                format  : 'json',
                batchActions: true,
                extraParams : {
                    realm_id : me.realm_id   
                },
                url     : '/cake4/rd_cake/realm-vlans/cmb-index.json',
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
