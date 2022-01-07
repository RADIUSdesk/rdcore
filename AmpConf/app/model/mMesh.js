Ext.define('AmpConf.model.mMesh', {
    extend  : 'Ext.data.Model',
    fields  : [
        {name: 'id',    type: 'int'},
        {name: 'name',  type: 'string'}
    ],
    proxy   : {
        type    : 'ajax',
        url     : '/cake3/rd_cake/meshes/view.json',
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    }
});
