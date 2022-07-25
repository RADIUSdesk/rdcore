Ext.define('Rd.view.meshes.cmbTrafficClasses', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbTrafficClasses',
    fieldLabel      : 'Traffic Class Set',
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    allowBlank      : false,
    editable        : false,
    mode            : 'local',
    itemId          : 'xwf_traffic_class_id',
    name            : 'xwf_traffic_class_id',
    labelClsExtra   : 'lblRd',
    initComponent: function(){
        var me      = this;
        var s       = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            proxy: {
                type    : 'ajax',
                format  : 'json',
                url     : '/cake3/rd_cake/traffic-classes/index.json',
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
