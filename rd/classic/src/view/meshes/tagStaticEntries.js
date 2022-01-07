Ext.define('Rd.view.meshes.tagStaticEntries', {
    extend          : 'Ext.form.field.Tag',
    alias           : 'widget.tagStaticEntries',
    fieldLabel      : i18n('sStatic_entry_points'),
    queryMode       : 'local',
    emptyText       : 'Select Static Entry Points',
    displayField    : 'name',
    valueField      : 'id',
    labelClsExtra   : 'lblRd',
    itemId          : 'static_entries',
    name            : 'static_entries[]',
    meshId          : '' ,
    initComponent: function(){
        var me      = this;
        var s       = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            proxy: {
                type    : 'ajax',
                format  : 'json',
                batchActions: true,
               // extraParams: { 'mesh_id' : me.meshId}, 
                url     : '/cake3/rd_cake/meshes/static_entry_options.json',
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
