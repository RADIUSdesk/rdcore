Ext.define('Rd.view.components.cmbClouds', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbClouds',
    fieldLabel      : 'Cloud',
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    forceSelection  : true,
    mode            : 'local',
    name            : 'clouds',
    multiSelect     : false,
    labelClsExtra   : 'lblRdReq',
    allowBlank      : false,
    typeAhead       : true,
    typeAheadDelay  : 100,
    minChars        : 2,
    queryMode       : 'local',
    lastQuery       : '',
    initComponent: function(){
        var me      = this;
        var s       = Ext.create('Ext.data.Store', {
            fields: [
                {name: 'id',    type: 'string'},
                {name: 'name',  type: 'string'}
            ],
            proxy: {
                    type    : 'ajax',
                    format  : 'json',
                    batchActions: true, 
                    url     : '/cake4/rd_cake/clouds/index-cmb.json',
                    reader: {
                        type            : 'json',
                        rootProperty            : 'items',
                        messageProperty : 'message'
                    }
            },
            autoLoad: true
        });
        me.store = s;
        me.callParent(arguments);
    }
});
