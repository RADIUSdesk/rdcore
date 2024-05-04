Ext.define('Rd.view.privatePsks.winPrivatePskEdit', {
    extend:     'Ext.window.Window',
    alias :     'widget.winPrivatePskEdit',
    closable:   true,
    draggable:  true,
    resizable:  true,
    title:      'Edit PSK',
    width:      500,
    height:     500,
    plain:      true,
    border:     false,
    layout:     'fit',
    glyph: Rd.config.icnEdit,
    autoShow:   false,
    defaults: {
            border: false
    },
    root	: false,
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
                labelWidth      : Rd.config.labelWidth,
                margin          : Rd.config.fieldMargin
            },
            defaultType: 'textfield',
            buttons : [
                {
                    itemId: 'btnSave',
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
                    xtype       : 'textfield',
                    name        : 'id',
                    hidden      : true
                },
                {
                    xtype       : 'textfield',
                    name        : 'private_psk_id',
                    hidden      : true
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'PPSK Group',
                    name        : "ppsk_name",
                    allowBlank  : false,
                    blankText   : i18n('sSupply_a_value'),
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'textfield',
                    name        : 'name',
                    fieldLabel  : 'PSK',
                    minLength   : 8,
                    allowBlank  : false,
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'textfield',
                    name        : 'comment',
                    fieldLabel  : 'Comment'
                },             
                {
                    xtype       : 'numberfield',
                    fieldLabel  : 'VLAN Nr(Optional)',
                    maxValue    : 4094,
                    minValue    : 1,
                    name        : 'vlan',
                    value       : '',
                    hideTrigger : true
                },
                {
                    name        : 'mac',
                    fieldLabel  : 'MAC (Optional)',
                    blankText   : 'Specify A MAC Address',
					vtype       : 'MacColon',
					fieldStyle  : 'text-transform:uppercase'
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel    : 'Active',
                    name        : 'active',
                    inputValue  : 'active',
                    cls         : 'lblRd'
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
