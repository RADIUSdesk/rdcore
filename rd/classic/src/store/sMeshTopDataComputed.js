
Ext.define('Rd.store.sMeshTopDataComputed', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mMeshTopData',
	storeId		: 'sMeshTopDataComputed',
    pageSize    : 10,
    remoteSort  : false,
    remoteFilter: true,
	
	data: []

	
});
