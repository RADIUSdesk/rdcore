Ext.define('Rd.view.components.cmbTimezones', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbTimezones',
    fieldLabel      : 'Timezone',
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    editable        : true,
    forceSelection  : true,
    mode            : 'local',
    name            : 'timezone',
    multiSelect     : false,
    labelClsExtra   : 'lblRd',
    allowBlank      : false,
    typeAhead       : true,
    typeAheadDelay  : 100,
    minChars        : 2,
    queryMode       : 'local',
    lastQuery       : '',
    initComponent: function(){
        var me      = this;
        var s       = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            proxy: {
                    type    : 'ajax',
                    format  : 'json',
                    batchActions: true, 
                    url     : '/cake3/rd_cake/utilities/timezones-index.json',
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
