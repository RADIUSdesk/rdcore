Ext.define('Rd.view.aps.tagApProfileStaticEntries', {
    extend          : 'Ext.form.field.Tag',
    alias           : 'widget.tagApProfileStaticEntries',
    fieldLabel      : i18n('sStatic_entry_points'),
    queryMode       : 'local',
    emptyText       : 'Select Static Entry Points',
    displayField    : 'name',
    valueField      : 'id',
    labelClsExtra   : 'lblRd',
    itemId          : 'static_entries',
    name            : 'static_entries[]',
    apProfileId     : '' ,
    initComponent: function(){
        var me      = this;
        var s       = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            proxy: {
                type    : 'ajax',
                format  : 'json',
                batchActions: true,
                url     : '/cake4/rd_cake/ap-profiles/static_entry_options.json',
                reader: {
                    type: 'json',
                    rootProperty: 'items',
                    messageProperty: 'message'
                }
            },
            autoLoad: false
        });
        me.store = s;
        me.callParent(arguments);
    }
});
