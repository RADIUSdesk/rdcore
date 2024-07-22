Ext.define('Rd.view.sqmProfiles.cmbSqmScriptOptions', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbSqmScriptOptions',
    fieldLabel      : 'Queue Setup Script',
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    allowBlank      : false,
    editable        : false,
    mode            : 'local',
    name            : 'script',
    value           : 'piece_of_cake.qos',
    labelClsExtra   : 'lblRd',
    initComponent: function(){
        var me      = this;
        var s       = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            proxy: {
                    type    : 'ajax',
                    format  : 'json',
                    batchActions: true, 
                    url     : '/cake4/rd_cake/sqm-profiles/script-options.json',
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
