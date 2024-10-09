Ext.define('Rd.view.multiWanProfiles.winMultiWanProfileEdit', {
    extend:     'Ext.window.Window',
    alias :     'widget.winMultiWanProfileEdit',
    closable:   true,
    draggable:  true,
    resizable:  true,
    title       : 'Edit MultiWan Profile',
    width       : 550,
    height      : 500,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnEdit,
    autoShow    : false,
    defaults    : {
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
                labelWidth      : 160,
                margin          : Rd.config.fieldMargin
            },
            defaultType: 'textfield',
             buttons: [
                {
                    itemId      : 'btnSave',
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
                    xtype       : 'textfield',
                    name        : 'id',
                    hidden      : true,
                    value		: me.record.get('id')
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sName'),
                    name        : "name",
                    allowBlank  : false,
                    blankText   : i18n('sSupply_a_value'),
                    labelClsExtra: 'lblRdReq',
                    value		: me.record.get('name')
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel    : 'System Wide',
                    name        : 'for_system',
                    inputValue  : 'for_system',
                    boxLabelCls	: 'boxLabelRd', 
                    hidden      : hide_system,
                    disabled    : hide_system,
                    value		: me.record.get('for_system')
                }
            ]
        });
        me.items = frmData;  
	    me.callParent(arguments);
        
    }
});
