Ext.define('Rd.view.meshes.cmbMeshAddMapNodes', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbMeshAddMapNodes',
    fieldLabel      : 'Available',
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    editable        : false,
    mode            : 'local',
    itemId          : 'entry_points',
    name            : 'entry_points[]',
    multiSelect     : false,
    labelClsExtra   : 'lblRdReq',
    allowBlank      : false,
	meshId			: '',
    initComponent: function(){
        var me      = this;
        var s       = Ext.create('Ext.data.Store', {
            fields	: ['id', 'name'],
            proxy	: {
                    type    : 'ajax',
                    format  : 'json',
                    batchActions: true,
					extraParams : {
						mesh_id : me.meshId
					},
                    url     : '/cake3/rd_cake/meshes/nodes_avail_for_map.json',
                    reader: {
                        type            : 'json',
                        rootProperty            : 'items',
                        messageProperty : 'message'
                    }
            },
            autoLoad: true
        });
		
        me.store = s;
        me.callParent(arguments);
    }
});
