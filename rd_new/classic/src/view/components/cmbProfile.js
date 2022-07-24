Ext.define('Rd.view.components.cmbProfile', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbProfile',
    fieldLabel      : i18n('sProfile'),
    labelSeparator  : '',
    forceSelection  : true,
    queryMode       : 'remote',
    valueField      : 'id',
    displayField    : 'name',
    typeAhead       : true,
    allowBlank      : false,
    mode            : 'local',
    name            : 'profile_id',
    labelClsExtra   : 'lblRd',
    extraParam      : false,
    initComponent   : function() {
        var me= this;
        var s = Ext.create('Ext.data.Store', {
        model: 'Rd.model.mProfile',
        proxy: {
                type    : 'ajax',
                format  : 'json',
                batchActions: true, 
                url     : '/cake3/rd_cake/profiles/index-ap.json',
                reader: {
                    type            : 'json',
                    rootProperty    : 'items',
                    messageProperty : 'message'
                }
            },
            autoLoad    : false
        });

        if(me.extraParam){
        	s.getProxy().setExtraParam('ap_id',me.extraParam);
        }

        me.store = s;
        this.callParent(arguments);
    }
});
