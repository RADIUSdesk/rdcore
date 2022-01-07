Ext.define('Rd.view.trafficClasses.winTrafficClassEdit', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winTrafficClassEdit',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Edit Traffic Class Set',
    width       : 500,
    height      : 500,
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
            border      : false,
            layout      : 'fit',
            autoScroll  : true,
            fieldDefaults: {
                msgTarget       : 'under',
                labelClsExtra   : 'lblRd',
                labelAlign      : 'left',
                labelSeparator  : '',
                labelClsExtra   : 'lblRd',
                labelWidth      : 100,
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
            items       : [
                {
                    xtype   : 'tabpanel',
                    layout  : 'fit',
                    xtype   : 'tabpanel',
                    margins : '0 0 0 0',
                    plain   : false,
                    tabPosition: 'bottom',
                    border  : false,
                    items   : [
                        { 
                            'title'     : 'General',
                            'layout'    : 'anchor',
                            itemId      : 'tabGeneral',
                            autoScroll  : true,
                            defaults    : {
                                anchor: '100%'
                            },
                            items:[
                                {
                                    itemId      : 'id',
                                    xtype       : 'textfield',
                                    name        : "id",
                                    hidden      : true
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
                                    fieldLabel  : i18n('sDescription'),
                                    name        : "description",
                                    allowBlank  : true,
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
                        },
                        {
                            title       : 'Content',
                            layout      : 'anchor',
                            itemId      : 'tabContent',
                            defaults    : {
                                    anchor: '100%'
                            },
                            autoScroll  :false,
                            items       :[
                                {
                                    xtype       : 'textareafield',
                                    grow        : true,
                                    growMax     : 300,
                                    fieldLabel  : 'Config Text',
                                    name        : 'content',
                                    allowBlank  : true,
                                    labelWidth  : 100,
                                    labelClsExtra: 'lblRd'
                                 }
                            ]
                        }          
                    ]
                }              
            ]
        });
        me.items = frmData;

		frmData.loadRecord(me.record);
        me.callParent(arguments);
    }
});
