Ext.define('Rd.view.aps.cmbApProfileUpstreamList', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbApProfileUpstreamList',
    fieldLabel      : 'Available',
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    editable        : false,
    mode            : 'local',
    name            : 'ap_profile_exit_upstream_id',
    allowBlank      : false,
    initComponent: function(){
        var me      = this;
        var s       = Ext.create('Ext.data.Store', {
            fields: [
                {name: 'id',    type: 'int'},
                {name: 'name',  type: 'string'}
            ],
            proxy: {
                    type    : 'ajax',
                    format  : 'json',
                    url     : '/cake3/rd_cake/ap-profiles/ap_profile_exit_upstream_list.json',
                    extraParams : {
                        ap_profile_id : me.ap_profile_id
                    },
                    reader: {
                        type            : 'json',
                        rootProperty    : 'items',
                        messageProperty : 'message'
                    }
            },
            autoLoad: true
        });
        me.store = s;
        me.callParent(arguments);
    }
});
