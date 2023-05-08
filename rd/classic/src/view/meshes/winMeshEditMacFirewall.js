Ext.define('Rd.view.meshes.winMeshEditMacFirewall', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winMeshEditMacFirewall',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Apply Firewall Profile',
    width       : 480,
    height      : 300,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnFire,
    autoShow    :   false,
    defaults: {
            border: false
    },
    requires: [
    	'Rd.view.components.cmbFirewallProfile'
    ],
    initComponent: function() {
        var me      = this;
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
                //margin          : Rd.config.fieldMargin
            },
            defaultType: 'textfield',
            buttons: [
                {
                    itemId      : 'save',
                    formBind    : true,
                    text        : 'SAVE',
                    scale       : 'large',
                    glyph       : Rd.config.icnYes,
                    margin      : Rd.config.buttonMargin,
                    ui          : 'button-teal'
                }
            ],
            items: [
            	{
					xtype		: 'radiogroup',
					columns		: 2,
					fieldLabel  : 'Scope',
					labelWidth	: 150,
					vertical	: false,
					margin      : Rd.config.fieldMargin,
					items		: [
						{ boxLabel: 'Cloud Wide', name: 'scope', inputValue: 'cloud_wide' },
						{ boxLabel: 'Mesh Only',  name: 'scope', inputValue: 'network_only', checked: true}
					]
				},
				{
                	xtype		: 'cmbFirewallProfile',
                	fieldLabel	: 'Firewall Profile',
                	include_all_option : false,
                	labelWidth	: 150,
                	labelClsExtra: 'lblRdReq',
                	margin      : Rd.config.fieldMargin                             	
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel    : 'Remove Firewall',
                    name        : 'remove_firewall',
                    inputValue  : 'remove_firewall',
                    itemId      : 'chkRemoveFirewall',
                    checked     : false,
                    boxLabelCls	: 'boxLabelRd',
                    margin      : Rd.config.fieldMargin
                }
            ]
        });
        me.items = frmData; 
        me.callParent(arguments);
    }
});
