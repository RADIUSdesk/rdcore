Ext.define('Rd.view.firewallApps.winFirewallAppAdd', {
    extend:     'Ext.window.Window',
    alias :     'widget.winFirewallAppAdd',
    closable:   true,
    draggable:  true,
    resizable:  true,
    title:      'New Firewall App',
    width:      500,
    height:     450,
    plain:      true,
    border:     false,
    layout:     'fit',
    glyph: Rd.config.icnAdd,
    autoShow:   false,
    defaults: {
            border: false
    },
    root	: false,
    initComponent: function() {
        var me          = this;
        var scrnData    = me.mkScrnData();
        me.items = [
            scrnData
        ];  
        this.callParent(arguments);
    }, 
   //_______ Data for ssids  _______
    mkScrnData: function(){
        var me      = this;
        var hide_system = true;
        if(me.root){
            hide_system = false;
        }      
        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'anchor',
            itemId:     'scrnData',
            autoScroll: true,
            defaults: {
                anchor: '100%'
            },
            fieldDefaults: {
                msgTarget: 'under',
                labelClsExtra: 'lblRd',
                labelAlign: 'left',
                labelSeparator: '',
                margin: 10
            },
            defaultType: 'textfield',
            items:[
                {
                    xtype       : 'displayfield',
                    fieldLabel  : 'Cloud',
                    value       : me.cloudName,
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sName'),
                    name        : "name",
                    allowBlank  : false,
                    blankText   : i18n('sSupply_a_value'),
                    labelClsExtra: 'lblRdReq'
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
                    disabled    : hide_system
                }
            ],
            buttons: [
                {
                    itemId: 'btnDataNext',
                    text: i18n('sNext'),
                    scale: 'large',
                    iconCls: 'b-next',
                    glyph: Rd.config.icnNext,
                    formBind: true,
                    margin: '0 20 40 0'
                }
            ]
        });
        return frmData;
    }   
});
