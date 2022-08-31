Ext.define('Rd.view.components.cmbQmiAuth', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbQmiAuth',
    fieldLabel      : 'Authenticate',
    labelSeparator  : '',
    forceSelection  : true,
    queryMode       : 'local',
    displayField    : 'text',
    valueField      : 'id',
    typeAhead       : true,
    allowBlank      : false,
    mode            : 'local',
    name            : 'qmi_auth',
    labelClsExtra   : 'lblRd',
    value           : 'none',
    initComponent   : function() {
        var me= this;
        var s = Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data : [
                {'id':'none',   'text': 'None'},
                {'id':'pap',    'text': 'PAP'},
                {'id':'chap',   'text': 'CHAP'},
                {'id':'both',   'text': 'Both'}
            ]
        });
        me.store = s;
        this.callParent(arguments);
    }
});
