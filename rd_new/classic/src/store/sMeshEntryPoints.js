Ext.define('Rd.store.sMeshEntryPoints', {
    extend: 'Ext.data.Store',
    model: 'Rd.model.mMeshEntryPoint',
    proxy: {
            type    : 'ajax',
            format  : 'json',
            batchActions: true, 
            url     : '/cake3/rd_cake/meshes/mesh_entry_points.json',
            reader: {
                type            : 'json',
                rootProperty    : 'items',
                messageProperty : 'message'
            }
    },
    autoLoad: false
});
