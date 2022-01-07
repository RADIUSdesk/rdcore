Ext.define('Rd.view.components.cmbMesh', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbMesh',
    fieldLabel      : 'Mesh',
    labelSeparator  : '',
    forceSelection  : true,
    queryMode       : 'remote',
    valueField      : 'id',
    displayField    : 'name',
    typeAhead       : true,
    allowBlank      : false,
    name            : 'mesh_id',
    labelClsExtra   : 'lblRd',
    extraParam      : false,
    queryMode       : 'remote',
    mode            : 'remote',
    pageSize        : 1, // The value of the number is ignore -- it is essentially coerced to a boolean, and if true, the paging toolbar is displayed. 
    initComponent   : function() {
        var me= this;
        var s = Ext.create('Ext.data.Store', {
        fields: ['id', 'name'],
        proxy: {
                type    : 'ajax',
                format  : 'json',
                batchActions: true, 
                url     : '/cake3/rd_cake/meshes/index.json',
                reader: {
                    type            : 'json',
                    rootProperty    : 'items',
                    messageProperty : 'message',
                    totalProperty   : 'totalCount' //Required for dynamic paging
                }
            },
            autoLoad    : false
        });
        if(me.extraParam){
        	s.getProxy().setExtraParam('ap_id',me.extraParam);
        }
        me.store = s;
        this.callParent(arguments);
    }
});
