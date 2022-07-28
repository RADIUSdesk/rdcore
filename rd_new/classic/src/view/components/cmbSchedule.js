Ext.define('Rd.view.components.cmbSchedule', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbSchedule',
    fieldLabel      : 'Schedule',
    labelSeparator  : '',
    forceSelection  : true,
    queryMode       : 'remote',
    valueField      : 'id',
    displayField    : 'name',
    typeAhead       : true,
    allowBlank      : false,
    name            : 'schedule_id',
    extraParam      : false,
    queryMode       : 'remote',
    mode            : 'remote',
    pageSize        : 0, // The value of the number is ignore -- it is essentially coerced to a boolean, and if true, the paging toolbar is displayed. 
    initComponent   : function() {
        var me= this;
        var s = Ext.create('Ext.data.Store', {
        fields: ['id', 'name'],
        proxy: {
                type    : 'ajax',
                format  : 'json',
                batchActions: true, 
                url     : '/cake3/rd_cake/schedules/index-combo.json',
                reader: {
                    type            : 'json',
                    rootProperty    : 'items',
                    messageProperty : 'message',
                    totalProperty   : 'totalCount' //Required for dynamic paging
                }
            },
            autoLoad    : false
        });
        me.store = s;
        this.callParent(arguments);
    }
});
