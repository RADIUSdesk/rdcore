Ext.define('Rd.view.iPPools.winIpPoolEdit', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winIpPoolEdit',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Edit IP Pool entry',
    width       : 500,
    height      : 400,
    plain       : true,
    border      : false,
    layout      : 'fit',
    iconCls     : 'edit',
    glyph       : Rd.config.icnEdit,
    autoShow    : false,
    poolId      : '',
    defaults: {
            border: false
    },
    requires: [
        'Ext.tab.Panel',
        'Ext.form.Panel',
        'Ext.form.field.Text'
    ],
    initComponent: function() {
        var me 		= this; 

        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'anchor',
            autoScroll: true,
            defaults: {
                anchor: '100%'
            },
            fieldDefaults: {
                msgTarget       : 'under',
                labelClsExtra   : 'lblRd',
                labelAlign      : 'left',
                labelSeparator  : '',
                labelClsExtra   : 'lblRd',
                labelWidth      : Rd.config.labelWidth,
                //maxWidth        : Rd.config.maxWidth, 
                margin          : Rd.config.fieldMargin
            },
            defaultType: 'textfield',
            buttons : [
                {
                    itemId: 'save',
                    text: i18n('sOK'),
                    scale: 'large',
                    iconCls: 'b-btn_ok',
                    glyph   : Rd.config.icnYes,
                    formBind: true,
                    margin: Rd.config.buttonMargin
                }
            ],
            items: [
				{
                    xtype   		: 'textfield',
                    name    		: "id",
                    hidden  		: true,
                    value   		: me.poolId
                },
				{
                    xtype   		: 'textfield',
                    name    		: "framedipaddress",
                    hidden  		: true,
                    value   		: me.record.get('framedipaddress')
                },
				{
                    xtype       	: 'displayfield',
                    fieldLabel  	: 'IP Address',
                    value       	: me.record.get('framedipaddress'),
                    labelClsExtra	: 'lblRdReq'
                },
				{
                    xtype       	: 'textfield',
                    fieldLabel  	: 'Client MAC',
                    name        	: 'callingstationid',
                    allowBlank  	: true,
                    blankText   	: i18n('sSupply_a_value'),
                    labelClsExtra	: 'lblRd',
					vtype			: 'MacAddress',
					value			: me.record.get('callingstationid')
                },
				{
                    xtype       	: 'cmbPermanentUser',
                    allowBlank  	: true,
                    labelClsExtra	: 'lblRd',
                    itemId      	: 'permanent_user_id',
                    fieldLabel  	: 'Permanent user',
                    name        	: 'permanent_user_id'
                    
                },
				{
					xtype       	: 'checkbox',      
					fieldLabel  	: i18n('sActive'),
					name        	: 'active',
                    inputValue  	: 'active',
                    checked     	: me.record.get('active'),
                    cls             : 'lblRd'
				},
				{
					xtype       	: 'checkbox',      
					fieldLabel  	: 'Clean other fields',
					name        	: 'clean_up',
                    inputValue  	: 'clean_up',
                    checked     	: true,
                    cls             : 'lblRd'
				}
            ]
        });
        me.items = frmData;
        me.callParent(arguments);
    }
});
