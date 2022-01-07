Ext.define('Rd.view.radiusClient.cmbRequestType', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbRequestType',
    fieldLabel      : i18n('sRequest_type'),
    labelSeparator  : '',
    forceSelection  : true,
    queryMode       : 'local',
    displayField    : 'text',
    valueField      : 'id',
    typeAhead       : true,
    allowBlank      : false,
    mode            : 'local',
    name            : 'request_type',
    labelClsExtra   : 'lblRdReq',
    initComponent   : function() {
        var me= this;
        var s = Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data : [
                {"id":"auth",       "text": i18n("sAuthentication")}
            ]
        });
        me.store = s;
        this.callParent(arguments);
    }
});
