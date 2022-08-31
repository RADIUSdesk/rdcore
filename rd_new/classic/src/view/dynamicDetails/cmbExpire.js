Ext.define('Rd.view.dynamicDetails.cmbExpire', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbExpire',
    fieldLabel      : 'Follow Up',
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    editable        : false,
    mode            : 'local',
    name            : 'prelogin_expire',
    multiSelect     : false,
    labelClsExtra   : 'lblRd',
    allowBlank      : false,
    excludeCustom   : false,
    value           : 0,
    initComponent   : function(){
       var me      = this;   
       var reSupply = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data : [
                {"id":0,  "name":"Never"},
                {"id":1,  "name":"Every Day"},
                {"id":7,  "name":"Every Week"},
                {"id":30, "name":"Every Month"},
                {"id":90, "name":"Every 3 Months"}
            ]
        });
        me.store = reSupply;
        me.callParent(arguments);
    }
});
