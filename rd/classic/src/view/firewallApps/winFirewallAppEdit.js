Ext.define('Rd.view.firewallApps.winFirewallAppEdit', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winFirewallAppEdit',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Edit Firewall App',
    width		: 500,
    height		: 420,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnEdit,
    autoShow    : false,
    record      : '',
    defaults: {
            border: false
    },
    requires: [
        'Ext.form.Panel',
        'Ext.form.field.Text'
    ],
    root		: false,
    initComponent: function() {
        var me 		= this; 
        
        var hide_system = true;
        if(me.root){
            hide_system = false;
        } 
        
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
                    itemId  : 'id',
                    xtype   : 'textfield',
                    name    : "id",
                    hidden  : true
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sName'),
                    name        : "name",
                    allowBlank  : false,
                    blankText   : i18n('sSupply_a_value'),
                    labelClsExtra: 'lblRdReq',
                    maxLength	: 16,
                    maskRe		: /[^\s]/                  
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'FA Code',
                    name        : 'fa_code',
                    allowBlank  : false,
                    blankText   : i18n('sSupply_a_value'),
                    value		: '&#xf085;',
                    labelClsExtra: 'lblRdReq'
                },
                {
        			xtype     	: 'textareafield',
					grow      	: true,
					name      	: 'elements',
					allowBlank  : false,
					fieldLabel	: 'Elements',
					labelClsExtra: 'lblRdReq'
				},
				{
                    xtype       : 'textfield',
                    fieldLabel  : 'Comment',
                    name        : 'comment',
                    blankText   : i18n('sSupply_a_value')
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel    : 'System Wide',
                    name        : 'for_system',
                    inputValue  : 'for_system',
                    cls         : 'lblRd',
                    hidden      : hide_system,
                    disabled    : hide_system,
                    value		: me.record.get('for_system')
                }
            ]
        });
        me.items = frmData;
		frmData.loadRecord(me.record);
        me.callParent(arguments);
    }
});
