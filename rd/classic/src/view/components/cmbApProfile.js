Ext.define('Rd.view.components.cmbApProfile', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbApProfile',
    fieldLabel      : 'Profile',
    labelSeparator  : '',
    forceSelection  : true,
    queryMode       : 'remote',
    valueField      : 'id',
    displayField    : 'name',
    typeAhead       : true,
    allowBlank      : false,
    name            : 'ap_profile_id',
    labelClsExtra   : 'lblRd',
    extraParam      : false,
    queryMode       : 'remote',
    mode            : 'remote',
    pageSize        : 1, // The value of the number is ignore -- it is essentially coerced to a boolean, and if true, the paging toolbar is displayed. 
    initComponent   : function() {
        var me= this;
        var s = Ext.create('Ext.data.Store', {
        fields: ['id', 'name'],
        proxy: {
                type    : 'ajax',
                format  : 'json',
                url     : '/cake3/rd_cake/ap-profiles/index.json',
                reader: {
                    type            : 'json',
                    rootProperty    : 'items',
                    messageProperty : 'message',
                    totalProperty   : 'totalCount' //Required for dynamic paging
                }
            },
            autoLoad    : false
        });
        if(me.extraParam){
        	s.getProxy().setExtraParam('ap_profile_id',me.extraParam);
        }
        me.store = s;
        this.callParent(arguments);
    }
});
