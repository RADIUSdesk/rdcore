Ext.define('Rd.view.components.cmbPermanentUser', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbPermanentUser',
    fieldLabel      : i18n('sOwner'),
    labelSeparator  : '',
    forceSelection  : true, //We disable this to allow manual setting of fields
    queryMode       : 'remote',
    valueField      : 'id',
    displayField    : 'username',
    typeAhead       : true,
    allowBlank      : false,
    queryMode       : 'remote',
    mode            : 'remote',
    name            : 'user_id',
    pageSize        : 1, // The value of the number is ignore -- it is essentially coerced to a boolean, and if true, the paging toolbar is displayed.
    labelClsExtra: 'lblRd',
    initComponent: function() {
        var me= this;
        var s = Ext.create('Ext.data.Store', {
            model       : 'Rd.model.mPermanentUser',
            buffered    : false,
            remoteSort  : true,
            proxy       : {
                type    : 'ajax',
                format  : 'json',
                batchActions: true, 
                url     : '/cake3/rd_cake/permanent-users/index.json',
                reader  : {
                    type            : 'json',
                    rootProperty    : 'items',
                    messageProperty : 'message',
                    totalProperty   : 'totalCount' //Required for dynamic paging
                },
                simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
            },
            listeners: {
                load: function(store, records, successful, operation) {
                    if(!successful){ 
                        var error = operation.getError();
                        Ext.ux.Toaster.msg(
                            'Warning',
                            error,
                            Ext.ux.Constants.clsWarn,
                            Ext.ux.Constants.msgWarn
                        );
                    }
                }
            },
            autoLoad    : false
        });
        me.store = s;
        this.callParent(arguments);
    }
});
