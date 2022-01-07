Ext.define('Rd.view.meshes.cmbMeshUpstreamList', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbMeshUpstreamList',
    fieldLabel      : 'Available',
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    editable        : false,
    mode            : 'local',
    name            : 'mesh_exit_upstream_id',
    allowBlank      : false,
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
                    url     : '/cake3/rd_cake/meshes/mesh_exit_upstream_list.json',
                    extraParams : {
                        mesh_id : me.mesh_id
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
        me.callParent(arguments);
    }
});
