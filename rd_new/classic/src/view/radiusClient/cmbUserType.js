Ext.define('Rd.view.radiusClient.cmbUserType', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbUserType',
    fieldLabel      : i18n('sUser_type'),
    labelSeparator  : '',
    forceSelection  : true,
    queryMode       : 'local',
    displayField    : 'text',
    valueField      : 'id',
    typeAhead       : true,
    allowBlank      : false,
    mode            : 'local',
    name            : 'user_type',
    labelClsExtra   : 'lblRdReq',
    initComponent   : function() {
        var me= this;
        var s = Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data : [
                {"id":"voucher",      "text": i18n("sVoucher")},
                {"id":"permanent",    "text": i18n("sPermanent_user")},
                {"id":"device",       "text": i18n("sDevice")}
            ]
        });
        me.store = s;
        this.callParent(arguments);
    }
});
