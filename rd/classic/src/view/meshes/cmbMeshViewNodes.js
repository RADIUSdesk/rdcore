Ext.define('Rd.view.meshes.cmbMeshViewNodes', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbMeshViewNodes',
    fieldLabel      : 'Node',
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    editable        : false,
    mode            : 'local',
    name            : 'node_id',
    multiSelect     : false,
    allowBlank      : false,
    value           : -1,
    meshId          : null,  
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
                    extraParams     : {'mesh_id' : me.meshId },
                    url     : '/cake3/rd_cake/meshes/mesh-nodes-view.json',
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
