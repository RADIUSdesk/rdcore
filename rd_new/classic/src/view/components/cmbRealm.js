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
    type            : 'create',
    extraParam      : false,
    initComponent: function() {
        var me  = this;
        var url = '/cake3/rd_cake/realms/index-ap-update.json';
        if(me.type == 'create'){
            url = '/cake3/rd_cake/realms/index-ap-create.json';  
        }
        var s = Ext.create('Ext.data.Store', {
            model: 'Rd.model.mRealm',
            proxy: {
                type            : 'ajax',
                format          : 'json',
                batchActions    : true, 
                url             : url,
                reader: {
                    type            : 'json',
                    rootProperty            : 'items',
                    messageProperty : 'message'
                }
            },
            autoLoad            : false
        });

        if(me.extraParam){
            s.getProxy().setExtraParam('ap_id',me.extraParam);
        }
        me.store = s;
        this.callParent(arguments);
    }
});
