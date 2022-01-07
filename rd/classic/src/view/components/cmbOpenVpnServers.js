Ext.define('Rd.view.components.cmbOpenVpnServers', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbOpenVpnServers',
    fieldLabel      : i18n('sOpenVPN_Server'),
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    allowBlank      : true,
    editable        : false,
    mode            : 'local',
    name            : 'openvpn_server_id',
    initComponent: function(){
        var me      = this;
        var s       = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            proxy: {
                type    : 'ajax',
                format  : 'json',
                batchActions: true, 
                url     : '/cake3/rd_cake/openvpn-servers/index.json',
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
