Ext.define('Rd.view.components.cmbRealm', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbRealm',
    fieldLabel      : i18n('sRealm'),
    labelSeparator  : '',
    store           : 'sRealms',
    forceSelection  : true,
    queryMode       : 'remote',
    valueField      : 'id',
    displayField    : 'name',
    typeAhead       : true,
    allowBlank      : false,
    mode            : 'local',
    name            : 'realm_id',
    labelClsExtra   : 'lblRd',
    allOption       : false,
    initComponent: function() {
        var me  = this;
        var s   = Ext.create('Ext.data.Store', {
            model: 'Rd.model.mRealm',
            proxy: {
                type            : 'ajax',
                format          : 'json',
                batchActions    : true, 
                url             : '/cake4/rd_cake/realms/index-cloud.json',
                reader: {
                    type            : 'json',
                    rootProperty    : 'items',
                    messageProperty : 'message'
                }
            },
            autoLoad : true
        });
        
        s.getProxy().setExtraParam('all_option',me.allOption);        
        me.store = s;
        this.callParent(arguments);
    }
});
