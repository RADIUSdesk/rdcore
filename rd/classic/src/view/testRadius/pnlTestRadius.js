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
				    name		: 'radius_ip'
				}, 
				{
				    xtype		:'textfield',
				    fieldLabel	: 'Port',
				    anchor		: '-5',
				    name		: 'port'
				},
				{
				    xtype		:'textfield',
				    fieldLabel	: 'Secret',
				    anchor		: '-5',
				    name		: 'secret'
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
		    	{
				    xtype		: 'textfield',
				    fieldLabel	: 'Auth Method',
				    anchor		: '-5',
				    name		: 'auth_method'
				}, 
				{
				    xtype		:'textfield',
				    fieldLabel	: 'Username',
				    anchor		: '-5',
				    name		: 'username'
				},
				{
				    xtype		:'textfield',
				    fieldLabel	: 'Password',
				    anchor		: '-5',
				    name		: 'password'
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
				    xtype		: 'textfield',
				    fieldLabel	: 'NAS-Identifier',
				    anchor		: '-5',
				    name		: 'nas_identifier'
				}, 
				{
				    xtype		:'textfield',
				    fieldLabel	: 'Called-Station-Id',
				    anchor		: '-5',
				    name		: 'called_station_id'
				}	    
		    ]
		},
		{
			xtype		: 'panel',
			bodyStyle   : 'background: #f0f0f5',
			//height		: 200,
			html		: '<h1>Gooihom</h1>'
		}
		];
                              
        me.callParent(arguments);
    }
});
