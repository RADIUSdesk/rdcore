Ext.define('Rd.view.vouchers.winVoucherCsvImport', {
    extend		: 'Ext.window.Window',
    alias 		: 'widget.winVoucherCsvImport',
    closable	: true,
    draggable	: true,
    resizable	: false,
    title		: 'Add from CSV Import',
    width		: 450,
    height		: 500,
    plain		: true,
    border		: false,
    layout		: 'card',
    iconCls		: 'add',
    glyph   	: Rd.config.icnAdd,
    autoShow	: false,
    apId    	: false,
	singleField : true,
    defaults	: {
            border	: false
    },
    no_tree 	: false, //If the user has no children we don't bother giving them a branchless tree
    user_id 	: '',
    owner   	: '',
    startScreen	: 'scrnApTree', //Default start screen
    requires	: [
        'Ext.layout.container.Card',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Rd.view.components.pnlAccessProvidersTree'
    ],
    initComponent: function() {
        var me = this;
        var scrnApTree      = me.mkScrnApTree();
        var scrnData        = me.mkScrnData();
        me.items = [
            scrnApTree,
            scrnData
        ];
        me.callParent(arguments);
        me.getLayout().setActiveItem(me.startScreen);  
    },

    //____ AccessProviders tree SCREEN ____
    mkScrnApTree: function(){
        //A form which allows the user to select
        var pnlTree = Ext.create('Rd.view.components.pnlAccessProvidersTree',{
            itemId: 'scrnApTree'
        });
        return pnlTree;
    },

    //_______ Data for voucher  _______
    mkScrnData: function(){

        var me      = this;

        //Set default values for from and to:
        var dtTo    = new Date();
        dtTo.setYear(dtTo.getFullYear() + 1);

        var buttons = [
                {
                    itemId: 'btnDataPrev',
                    text: i18n('sPrev'),
                    scale: 'large',
                    iconCls: 'b-prev',
                    glyph   : Rd.config.icnBack,
                    margin: '0 20 40 0'
                },
                {
                    itemId: 'btnDataNext',
                    text: i18n('sNext'),
                    scale: 'large',
                    iconCls: 'b-next',
                    glyph   : Rd.config.icnNext,
                    formBind: true,
                    margin: '0 20 40 0'
                }
            ];

        if(me.no_tree == true){
            var buttons = [
                {
                    itemId: 'btnDataNext',
                    text: i18n('sNext'),
                    scale: 'large',
                    iconCls: 'b-next',
                    glyph   : Rd.config.icnNext,
                    formBind: true,
                    margin: '0 20 40 0'
                }
            ];
        }

        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'fit',
            itemId:     'scrnData',
            autoScroll: true,
            fieldDefaults: {
                msgTarget: 'under',
                labelClsExtra: 'lblRd',
                labelAlign: 'left',
                labelSeparator: '',
                labelWidth: 150,
                margin: 15
            },
            defaultType: 'textfield',
            items:[
               {
                    xtype   : 'tabpanel',
                    layout  : 'fit',
                    xtype   : 'tabpanel',
                    margins : '0 0 0 0',
                    plain   : true,
                    tabPosition: 'bottom',
                    border  : false,
                    cls     : 'subTab',
                    items   : [
                        { 
                            'title'     : i18n('sBasic_info'), 
                            'layout'    : 'anchor',
                            defaults    : {
                                anchor: '100%'
                            },
                            items       : [
                                {
                                    itemId  : 'user_id',
                                    xtype   : 'textfield',
                                    name    : "user_id",
                                    hidden  : true,
                                    value   : me.user_id
                                },
                                {
                                    itemId      : 'owner',
                                    xtype       : 'displayfield',
                                    fieldLabel  : i18n('sOwner'),
                                    value       : me.owner,
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    xtype       : 'cmbRealm',
                                    allowBlank  : false,
                                    labelClsExtra: 'lblRdReq',
                                    itemId      : 'realm',
                                    extraParam  : me.apId
                                },
                                {
                                    xtype       : 'cmbProfile',
                                    allowBlank  : false,
                                    labelClsExtra: 'lblRdReq',
                                    itemId      : 'profile',
                                    extraParam  : me.apId
                                },
                                {
                                    xtype       : 'textfield',
                                    name        : 'batch',
                                    fieldLabel  : i18n('sBatch_name'),
                                    allowBlank  : false,
                                    labelClsExtra: 'lblRdReq',
                                    itemId      : 'batch'
                                },
                                {
                                    xtype       : 'filefield',
                                    itemId      : 'csv_file',
                                    emptyText   : 'Select CSV File..',
                                    fieldLabel  : 'CSV List',
                                    allowBlank  : false,
                                    name        : 'csv_file',
                                    buttonText  : '',
                                    buttonConfig: {
                                        iconCls     : 'upload-icon',
                                        glyph       : Rd.config.icnFolder
                                    },
                                    regex       : /^.*\.(csv|CSV)$/,
                                    regexText   : 'Only CSV files allowed',
                                    labelClsExtra: 'lblRdReq'
                                }
                            ]
                        },
                        { 
                            'title' : i18n('sActivate_and_Expire'),
                            'layout'    : 'anchor',
                            autoScroll  :true,
                            defaults    : {
                                anchor: '100%'
                            },
                            items       : [
                                {
                                    xtype       : 'checkbox',      
                                    fieldLabel  : i18n('sActivate_upon_first_login'),
                                    name        : 'activate_on_login',
                                    inputValue  : 'activate_on_login',
                                    itemId      : 'activate_on_login',
                                    checked     : false,
                                    boxLabelCls : 'lblRdCheck'
                                },
                                {
                                    xtype       : 'numberfield',
                                    name        : 'days_valid',
                                    fieldLabel  : i18n('sDays_available_after_first_login'),
                                    value       : 0,
                                    maxValue    : 90,
                                    minValue    : 0,
                                    itemId      : 'days_valid',
                                    hidden      : true,
                                    disabled    : true
                                },
                                {
                                    xtype       : 'numberfield',
                                    name        : 'hours_valid',
                                    fieldLabel  : 'Hours',
                                    labelAlign  : 'right',
                                    value       : 0,
                                    maxValue    : 23,
                                    minValue    : 0,
                                    itemId      : 'hours_valid',
                                    hidden      : true,
                                    disabled    : true
                                },
                                {
                                    xtype       : 'numberfield',
                                    name        : 'minutes_valid',
                                    fieldLabel  : 'Minutes',
                                    labelAlign  : 'right',
                                    value       : 0,
                                    maxValue    : 59,
                                    minValue    : 0,
                                    itemId      : 'minutes_valid',
                                    hidden      : true,
                                    disabled    : true
                                },
                                {
                                    xtype       : 'checkbox',      
                                    fieldLabel  : i18n('sNever_expire'),
                                    name        : 'never_expire',
                                    inputValue  : 'never_expire',
                                    itemId      : 'never_expire',
                                    checked     : true,
                                    boxLabelCls : 'lblRdCheck'
                                },
                                {
                                    xtype       : 'datefield',
                                    fieldLabel  : i18n('sExpire'),
                                    name        : 'expire',
                                    itemId      : 'expire',
                                    minValue    : new Date(),  // limited to the current date or after
                                    disabled    : true,
                                    value       : dtTo
                                }
                            ]
                        },
                        { 
                            'title' : 'Extra field',
                            'layout'    : 'anchor',
                            defaults    : {
                                anchor: '100%'
                            },
                            items: [
                                {
                                    xtype       : 'textfield',
                                    name        : 'extra_name',
                                    fieldLabel  : 'Extra field name',
                                    allowBlank  : true,
                                    labelClsExtra: 'lblRd'
                                },
                                {
                                    xtype       : 'textfield',
                                    name        : 'extra_value',
                                    fieldLabel  : 'Extra field value',
                                    allowBlank  : true,
                                    labelClsExtra: 'lblRd'
                                }
                            ]
                        },
                        { 
                            'title' : 'e-Mail',
                            'layout'    : 'anchor',
                            defaults    : {
                                anchor: '100%'
                            },
                            items: [
                                {
                                    xtype       : 'textfield',
                                    name        : 'email_title',
                                    fieldLabel  : 'Title',
                                    allowBlank  : true
                                },
                                {
                                    xtype       : 'textareafield',
                                    grow        : true,
                                    name        : 'email_message',
                                    allowBlank  : true,
                                    fieldLabel  : 'Message'
                                }
                            ]
                        }
                    ]
                }              
            ],
            buttons: buttons
        });
        return frmData;
    }   
});
