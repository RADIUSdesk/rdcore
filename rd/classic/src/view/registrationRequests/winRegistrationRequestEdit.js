Ext.define('Rd.view.registrationRequests.winRegistrationRequestEdit', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winRegistrationRequestEdit',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Edit Registration Request',
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
        
        var state = Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data : [
                {"id":"not_allocated",  "text": "Not Allocated"},
                {"id":"allocated", 		"text": "Allocated"},
				{"id":"email_sent",     "text": "Email Sent"},
				{"id":"regstation_completed",    "text": "Regstation Completed"},
				{"id":"expired",        "text": "Expired"},
            ]
        });
        
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
                    fieldLabel  : 'Email',
                    name        : "email",
                    allowBlank  : false,
                    blankText   : i18n('sSupply_a_value'),
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'combobox',
                    fieldLabel  : 'State',
                    store       : state
                }
            ]
        });
        me.items = frmData;

		frmData.loadRecord(me.record);
        me.callParent(arguments);
    }
});
