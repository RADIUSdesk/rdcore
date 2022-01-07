Ext.define('Rd.view.predefinedCommands.winPredefinedCommandEdit', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winPredefinedCommandEdit',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Edit Predefined Command',
    width       : 550,
    height      : 370,
    plain       : true,
    border      : false,
    layout      : 'fit',
    iconCls     : 'edit',
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
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'radiogroup',
                    fieldLabel  : 'Action',
                    columns     : 2,
                    vertical    : false,
                    labelClsExtra: 'lblRdReq',
                    items       : [
                        {
                            boxLabel  : 'Execute',
                            name      : 'action',
                            inputValue: 'execute',
                            margin    : '0 15 0 0'
                        }, 
                        {
                            boxLabel  : 'Execute & Reply',
                            name      : 'action',
                            inputValue: 'execute_and_reply',
                            margin    : '0 0 0 15'
                        }
                    ]
                }, 
                {
				    xtype       : 'panel',
                    layout      : 'hbox',
                    bodyStyle   : 'background: #b5b5b5',
                    padding     : '0 0 0 0',
                    margin      : 0,
                    items       : [
                        {
                            xtype       : 'textfield',
                            margin      : 15,
                            fieldLabel  : i18n('sCommand'),
                            name        : 'command',
                            allowBlank  : false,
                            blankText   : i18n('sSupply_a_value'),
                            labelClsExtra: 'lblRdReq',
                            flex        : 1
                        }
                    ]
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel    : i18n('sAlso_show_to_sub_providers'),
                    name        : 'available_to_siblings',
                    inputValue  : 'available_to_siblings',
                    itemId      : 'a_to_s',
                    checked     : false,
                    cls         : 'lblRd'
                }
            ]
        });
        me.items = frmData;
		frmData.loadRecord(me.record);
        me.callParent(arguments);
    }
});
