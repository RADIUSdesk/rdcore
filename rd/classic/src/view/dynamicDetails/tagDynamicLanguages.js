Ext.define('Rd.view.dynamicDetails.tagDynamicLanguages', {
    extend          : 'Ext.form.field.Tag',
    alias           : 'widget.tagDynamicLanguages',
    fieldLabel      : 'Available Languages',
    queryMode       : 'local',
    emptyText       : 'Just The Default Language',
    displayField    : 'name',
    valueField      : 'id',
    name            : 'available_languages[]',
    labelClsExtra   : 'lblRd',
    initComponent: function(){
        var me  =  this;
            
        var s   = Ext.create('Ext.data.Store', {
            fields: [
                {name: 'id',    type: 'string'},
                {name: 'name',  type: 'string'}
            ],
            proxy: {
                    type    : 'ajax',
                    format  : 'json',
                    batchActions: true, 
                    url     : '/cake3/rd_cake/dynamic-detail-translations/languages-list.json',
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
