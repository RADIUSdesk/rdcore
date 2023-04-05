Ext.define('Rd.view.testRadius.pnlTestRadius', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlTestRadius',
    autoScroll	: true,
    plain       : true,
    frame       : false,
    layout      : {
        type    : 'vbox',
        pack    : 'start',
        align   : 'stretch'
    },
    margin      : 5,
    fieldDefaults: {
        msgTarget       : 'under',
        labelAlign      : 'left',
        labelSeparator  : '',
        labelWidth      : Rd.config.labelWidth,
        margin          : Rd.config.fieldMargin,
        labelClsExtra   : 'lblRdReq',
        defaultType     : 'textfield'
    },
    buttons : [
        {
            itemId  : 'test',
            text    : 'TEST',
            scale   : 'large',
            formBind: true,
            glyph   : Rd.config.icnYes,
            margin  : Rd.config.buttonMargin,
            ui      : 'button-teal'
        }
    ],
    requires: [
        'Rd.view.testRadius.vcTestRadius'
    ],
    listeners       : {
        focus  : 'onViewActivate'
    },
    controller  : 'vcTestRadius',
    initComponent: function(){
        var me 	 = this;
        
        var methods = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data : [
                {"id":"pap",           	"name":"PAP"},
                {"id":"chap",          	"name":"CHAP"},
                {"id":"ms_chap",    	"name":"MS CHAPv1"},
            	{"id":"eap_md5",    	"name":"EAP-MD5"},
            	{"id":"eap_ttls_pap",   "name":"EAP-TTLS-PAP"},
            	{"id":"eap_ttls_mschap","name":"EAP-TTLS-MS-CHAPv2"},
            	{"id":"eap_peap",		"name":"EAP-PEAP"},
            	{"id":"eap_leap",		"name":"EAP-LEAP"}
            ]
        });

        var cmbMethods = Ext.create('Ext.form.ComboBox', {
            fieldLabel      : 'Auth Method',
            store           : methods,
            queryMode       : 'local',
            displayField    : 'name',
            valueField      : 'id',
            name            : 'auth_method',
            itemId          : 'cmbType',
            labelClsExtra   : 'lblRdReq',
            allowBlank      : false,
            forceSelection  : true,
            anchor			: '-5'
        });
              
		me.items = [{
			xtype		: 'panel',
			bodyStyle   : 'background: #a2c3c3',
			layout      : {
				type    : 'hbox',
				pack    : 'start',
				align   : 'stretch'
			},		
		    items: [
				{
				    xtype		: 'textfield',
				    fieldLabel	: 'RADIUS server IP',
				    anchor		: '-5',
				    name		: 'radius_ip',
				    allowBlank  : false
				}, 
				{
				    xtype           : 'numberfield',
				    fieldLabel		: 'Port',
				    anchor			: '-5',
				    name			: 'port',
				    allowBlank  	: false,
				    value           : 1812,
				    hideTrigger     : true,
                    keyNavEnabled   : false,
                    mouseWheelEnabled: false
				},				
				{
				    xtype		:'textfield',
				    fieldLabel	: 'Secret',
				    anchor		: '-5',
				    name		: 'secret',
				    allowBlank  : false
				}
		    ]
		}, 
		{
			xtype		: 'panel',
			bodyStyle   : 'background: #e0ebeb',
			layout      : {
				type    : 'hbox',
				pack    : 'start',
				align   : 'stretch'
			},	
		    items: [
		    	cmbMethods,
				{
				    xtype		:'textfield',
				    fieldLabel	: 'Username',
				    anchor		: '-5',
				    name		: 'username',
				    allowBlank  : false
				},
				{
				    xtype		:'textfield',
				    fieldLabel	: 'Password',
				    anchor		: '-5',
				    name		: 'password',
				    allowBlank  : false
				}		    
		    ]
		},
		{
			xtype		: 'panel',
		    bodyStyle   : 'background: #eff5f5',
			layout      : {
				type    : 'hbox',
				pack    : 'start',
				align   : 'stretch'
			},	
		    items: [
		    	{
				    xtype		:'textfield',
				    fieldLabel	: 'NAS-IP-Address',
				    anchor		: '-5',
				    name		: 'nas_ip_address',
				    labelClsExtra : 'lblRd'
				},
		    	{
				    xtype		: 'textfield',
				    fieldLabel	: 'NAS-Identifier',
				    anchor		: '-5',
				    name		: 'nas_identifier',
				    labelClsExtra : 'lblRd'
				}, 
				{
				    xtype		:'textfield',
				    fieldLabel	: 'Called-Station-Id',
				    anchor		: '-5',
				    name		: 'called_station_id',
				    labelClsExtra : 'lblRd'
				}	    
		    ]
		},
		{
			xtype		: 'panel',
			itemId		: 'pnlResult',
			bodyStyle   : 'background: #fff',
			flex		: 1,
			tpl			: new Ext.XTemplate(
                "<div style='background-color:white; padding:5px;'>",
                    '{output}',
                "</div>"
            ),
            autoScroll  :true,
            data		: {}
        }
		];
                              
        me.callParent(arguments);
    }
});
