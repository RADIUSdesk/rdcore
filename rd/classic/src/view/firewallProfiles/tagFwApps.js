Ext.define('Rd.view.firewallProfiles.tagFwApps', {
    extend          : 'Ext.form.field.Tag',
    alias           : 'widget.tagFwApps',
    queryMode       : 'local',
    fieldLabel      : 'Selected Apps',
    emptyText       : '-No Apps Selected Yet-',
    displayField    : 'name',
    valueField      : 'id',
    name            : 'apps[]',
    displayField	: 'description',
	labelTpl		: '{name}',
    allowBlank		: false,
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
                    batchActions: true, 
                    url     : '/cake4/rd_cake/firewall-profiles/index-apps.json',
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
