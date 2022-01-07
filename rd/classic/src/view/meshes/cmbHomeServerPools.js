Ext.define('Rd.view.meshes.cmbHomeServerPools', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbHomeServerPools',
    fieldLabel      : 'RADIUS Proxy',
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    allowBlank      : false,
    editable        : false,
    mode            : 'local',
    itemId          : 'xwf_radiuslocationname',
    name            : 'xwf_radiuslocationname',
    labelClsExtra   : 'lblRd',
    initComponent: function(){
        var me      = this;
        var s       = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            proxy: {
                type    : 'ajax',
                format  : 'json',
                url     : '/cake3/rd_cake/home-server-pools/index.json',
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
