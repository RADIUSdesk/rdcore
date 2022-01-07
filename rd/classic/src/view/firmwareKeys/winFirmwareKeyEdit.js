Ext.define('Rd.view.firmwareKeys.winFirmwareKeyEdit', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winFirmwareKeyEdit',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Edit Firmware Key',
    width       : 500,
    height      : 300,
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
                    fieldLabel  : i18n('sKey'),
                    name        : "token_key",
                    readOnly    : true
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel    : i18n('sAlso_show_to_sub_providers'),
                    name        : 'available_to_siblings',
                    inputValue  : 'available_to_siblings',
                    itemId      : 'a_to_s',
                    checked     : false,
                    cls         : 'lblRd'
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel    : i18n('sActive'),
                    name        : 'active',
                    inputValue  : 'active',
                    itemId      : 'active',
                    checked     : true,
                    cls         : 'lblRd'
                }
            ]
        });
        me.items = frmData;

		frmData.loadRecord(me.record);
        me.callParent(arguments);
    }
});
