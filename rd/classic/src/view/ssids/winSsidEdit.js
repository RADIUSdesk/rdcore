Ext.define('Rd.view.ssids.winSsidEdit', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winSsidEdit',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Edit SSID',
    width       : 400,
    height      : 400,
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
                    xtype       : 'textfield',
                    fieldLabel  : 'Extra name',
                    name        : "extra_name",
                    allowBlank  : true,
                    blankText   : i18n('sSupply_a_value'),
                    labelClsExtra: 'lblRd'
                },
				{
                    xtype       : 'textfield',
                    fieldLabel  : 'Extra value',
                    name        : "extra_value",
                    allowBlank  : true,
                    blankText   : i18n('sSupply_a_value'),
                    labelClsExtra: 'lblRd'
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
