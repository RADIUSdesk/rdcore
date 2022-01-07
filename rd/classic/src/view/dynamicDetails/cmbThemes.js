Ext.define('Rd.view.dynamicDetails.cmbThemes', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbThemes',
    fieldLabel      : 'Theme',
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    editable        : false,
    mode            : 'local',
    itemId          : 'theme',
    name            : 'theme',
    value           : 'Default',
    multiSelect     : false,
    labelClsExtra   : 'lblRd',
    allowBlank      : false,
    excludeCustom   : false,
    initComponent: function(){
        var me      = this;
        var s       = Ext.create('Ext.data.Store', {
            fields  : ['id', 'name'],
            proxy   : {
                    type        : 'ajax',
                    format      : 'json',
                    batchActions: true,
                    extraParams : {
                        exclude_custom : me.excludeCustom
                    }, 
                    url         : '/cake3/rd_cake/dynamic-details/available-themes.json',
                    reader      : {
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
