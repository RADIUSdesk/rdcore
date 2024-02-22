Ext.define('Rd.view.homeServerPools.pnlHomeServer', {
    extend      : 'Ext.panel.Panel',
    glyph       : Rd.config.icnDotCircleO,
    alias       : 'widget.pnlHomeServer',
    requires    : [
        'Rd.view.homeServerPools.vcHomeServer'
    ],
    radio_nr    : 0,
    controller  : 'vcHomeServer',
    layout      : 'anchor',
    autoScroll  : true,
    defaults    : {
        anchor  : '100%'
    },
    fieldDefaults: {
        msgTarget       : 'under',
        labelClsExtra   : 'lblRd',
        labelAlign      : 'left',
        labelSeparator  : '',
        margin          : 15
    },
    initComponent: function(){
        var me      = this;
        var w_sec   = 350;
        var w_rd    = 68;
        me.width    = 550;
        me.padding  = 5;
        
        var store_hs_type = Ext.create('Ext.data.Store', {
            fields: ['id', 'Name'],
            data : [
                {"id":"auth+acct",      "name":"AUTH+ACCT (Default)"},
                {"id":"auth",   "name":"AUTH"},
                {"id":"acct",   "name":"ACCT"},
                {"id":"coa",    "name":"COA"}
            ]
        });      
        
        var home_server_nr    = "hs_"+me.home_server_nr;
         
        me.items    = [
            {
			    xtype           : 'hiddenfield',
			    name            : home_server_nr+'_id'
			},
			{
                xtype           : 'combobox',
                fieldLabel      : 'Type',
                store           : store_hs_type,
                queryMode       : 'local',
                name            : home_server_nr+'_type',
                displayField    : 'name',
                valueField      : 'id',
                value           : 'auth+acct'
            },		
	        {
                xtype       	: 'textfield',
                fieldLabel  	: 'IP Address',
                name        	: home_server_nr+'_ipaddr',
                allowBlank  	: false,
                blankText   	: i18n('sSupply_a_value'),
                labelClsExtra	: 'lblRdReq',
			    vtype			: 'IPAddress'
            },
            {
                xtype       	: 'textfield',
                fieldLabel  	: 'Port',
                name        	: home_server_nr+'_port',
                value           : 1812,
                allowBlank  	: false,
                blankText   	: i18n('sSupply_a_value'),
                labelClsExtra	: 'lblRdReq',
			    vtype			: 'Numeric'
            },
            {
                xtype       	: 'textfield',
                fieldLabel  	: 'Secret',
                name        	: home_server_nr+'_secret',
                allowBlank  	: false,
                blankText   	: i18n('sSupply_a_value'),
                labelClsExtra	: 'lblRdReq'
            },
            {
	            xtype           : 'numberfield',
	            name            : home_server_nr+'_response_window',
	            fieldLabel      : 'Response Window',
	            value           : 20,
	            maxValue        : 60,
	            minValue        : 5
	        },
	        {
	            xtype           : 'numberfield',
	            anchor          : '100%',
	            name            : home_server_nr+'_zombie_period',
	            fieldLabel      : 'Zombie Period',
	            value           : 40,
	            maxValue        : 120,
	            minValue        : 20
	        },
	        {
	            xtype           : 'numberfield',
	            anchor          : '100%',
	            name            : home_server_nr+'_revive_interval',
	            fieldLabel      : 'Revive Interval',
	            value           : 120,
	            maxValue        : 3600,
	            minValue        : 60
	        },
	        {
                xtype           : 'checkbox',      
                fieldLabel      : 'Accept COA',
                name            : home_server_nr+'_accept_coa',
                inputValue      : true,
                value           : true
            }
        ];       
        this.callParent(arguments);
    }
});
