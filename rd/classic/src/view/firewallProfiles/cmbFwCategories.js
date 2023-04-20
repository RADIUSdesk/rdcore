Ext.define('Rd.view.firewallProfiles.cmbFwCategories', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbFwCategories',
    fieldLabel      : 'Category',
    labelSeparator  : '',
    forceSelection  : true,
    queryMode       : 'local',
    displayField    : 'text',
    valueField      : 'id',
    typeAhead       : true,
    allowBlank      : false,
    mode            : 'local',
    name            : 'category',
    value           : 'app',
    initComponent   : function() {
        var me= this;
        var s = Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data : [
                {'id':"app",      		"text": 'App'},
                {"id":"app_group",		"text": 'App Group'},
                {"id":"domain",     	"text": 'Domain Name'},
                {"id":"ip_address", 	"text": 'IP Address'},
                {"id":"region", 		"text": 'Region'},
                {"id":"internet", 		"text": 'Internet'},
                {"id":"local_network", 	"text": 'Local Network'},
                {"id":"protocol",       "text": 'Protocol'}           
            ]
        });
        me.store = s;
        this.callParent(arguments);
    }
});
