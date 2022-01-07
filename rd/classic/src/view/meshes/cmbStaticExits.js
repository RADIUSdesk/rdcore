Ext.define('Rd.view.meshes.cmbStaticExits', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbStaticExits',
    fieldLabel      : i18n('sStatic_exit_points'),
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    allowBlank      : true,
    editable        : false,
    mode            : 'local',
    itemId          : 'static_exits',
    name            : 'static_exits[]',
    labelClsExtra   : 'lblRd',
    meshId          : '' ,
    nodeId          : '',
	multiSelect     : true,
    initComponent: function(){
        var me      = this;
        var s       = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            proxy: {
                type    : 'ajax',
                format  : 'json',
                batchActions: true, 
                extraParams: { 'mesh_id' : me.meshId, 'node_id' : me.nodeId }, 
                url     : '/cake3/rd_cake/meshes/static_exit_options.json',
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
