Ext.define('Rd.view.components.cmbCountries', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbCountries',
    fieldLabel      : 'Country',
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    editable        : true,
    forceSelection  : true,
    mode            : 'local',
    name            : 'country',
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
                    url     : '/cake3/rd_cake/utilities/countries-index.json',
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
