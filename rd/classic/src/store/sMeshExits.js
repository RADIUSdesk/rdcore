Ext.define('Rd.store.sMeshExits', {
    extend: 'Ext.data.Store',
    model: 'Rd.model.mMeshExit',
    proxy: {
            type    : 'ajax',
            format  : 'json',
            batchActions: true, 
            url     : '/cake3/rd_cake/meshes/mesh_exits_index.json',
            reader: {
                type            : 'json',
                rootProperty    : 'items',
                messageProperty : 'message'
            },
            api: {
                destroy  : '/cake3/rd_cake/meshes/mesh_exit_delete.json'
            }
    },
    autoLoad: false
});
