Ext.define('Rd.view.permanentUsers.winPermanentUserAdd', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winPermanentUserAdd',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : i18n('sNew_permanent_user'),
    width       : 500,
    height      : 550,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnAdd,
    autoShow    :   false,
    defaults    : {
        border: false
    },
    no_tree	    : false, //If the user has no children we don't bother giving them a branchless tree
    user_id	    : '',
    owner	    : '',
    startScreen : 'scrnApTree', //Default start screen
    selLanguage : null,
    requires    : [
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Rd.view.components.vCmbLanguages',
        'Rd.view.components.btnDataNext',
    ],
    initComponent: function() {
        var me = this;
        var scrnData        = me.mkScrnData();
        me.items = [
            scrnData
        ];
        me.callParent(arguments);
    },

    mkScrnData: function(){
        var me      = this;
        //Set default values for from and to:
        var dtFrom  = new Date();
        var dtTo    = new Date();
        dtTo.setYear(dtTo.getFullYear() + 1);

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
                    cls     : 'subTab',
                    border  : false,
                    items   : [
                        { 
                            'title'     : i18n('sBasic_info'), 
                            'layout'    : 'anchor',
                            defaults    : {
                                anchor: '100%'
                            },
                            autoScroll  : true,
                            items       : [
                                {
                                    xtype       : 'checkbox',      
                                    boxLabel    : 'Create multiple users',
                                    name        : 'multiple',
                                    inputValue  : 'multiple',
                                    checked     : false,
                                    cls         : 'lblRd',
                                    itemId      : 'multiple'
                                },
                                {
                                    xtype       : 'displayfield',
                                    fieldLabel  : 'Cloud',
                                    value       : me.cloudName,
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sUsername'),
                                    name        : "username",
                                    allowBlank  : false,
                                    blankText   : i18n('sSupply_a_value'),
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sPassword'),
                                    name        : "password",
                                    allowBlank  : false,
                                    blankText   : i18n('sSupply_a_value'),
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    xtype       : 'cmbRealm',
                                    allowBlank  : false,
                                    labelClsExtra: 'lblRdReq',
									itemId      : 'realm',
									extraParam  : me.user_id
                                },
                                {
                                    xtype       : 'cmbProfile',
                                    allowBlank  : false,
                                    labelClsExtra: 'lblRdReq',
                                    itemId      : 'profile',
									extraParam  : me.user_id
                                },
                                {
                                    xtype       : 'cmbCap',
                                    allowBlank  : false,
                                    labelClsExtra: 'lblRdReq',
                                    hidden      : true,
                                    value       : 'hard',
                                    fieldLabel  : i18n('sCap_type_for_data'),
                                    itemId      : 'cmbDataCap',
                                    name        : 'data_cap_type'
                                },
                                {
                                    xtype       : 'cmbCap',
                                    allowBlank  : false,
                                    labelClsExtra: 'lblRdReq',
                                    hidden      : true,
                                    value       : 'hard',
                                    fieldLabel  : i18n('sCap_type_for_time'),
                                    itemId      : 'cmbTimeCap',
                                    name        : 'time_cap_type'
                                }
                            ]
                        },
                        { 
                            'title' : i18n('sPersonal_info'),
                            'layout'    : 'anchor',
                            defaults    : {
                                anchor: '100%'
                            },
                            items: [
                                {
                                    xtype: 'textfield',
                                    fieldLabel: i18n('sName'),
                                    name : "name",
                                    allowBlank:true
                                },
                                {
                                    xtype: 'textfield',
                                    fieldLabel: i18n('sSurname'),
                                    name : "surname",
                                    allowBlank:true
                                },
                                { 
                                    xtype       : 'cmbLanguages', 
                                    width       : 350, 
                                    fieldLabel  : i18n('sLanguage'),  
                                    name        : 'language',
                                    value       : me.selLanguage,
                                    allowBlank  : false,
                                    labelClsExtra: 'lblRd' 
                                },
                                {
                                    xtype: 'textfield',
                                    fieldLabel: i18n('sPhone'),
                                    name : "phone",
                                    allowBlank:true
                                },
                                {
                                    xtype: 'textfield',
                                    fieldLabel: i18n('s_email'),
                                    name : "email",
                                    allowBlank:true
                                },
                                {
                                    xtype     : 'textareafield',
                                    grow      : true,
                                    name      : 'address',
                                    fieldLabel: i18n('sAddress'),
                                    anchor    : '100%'
                                }
                            ]
                        },
                        { 
                            'title' : i18n('sActivate_and_Expire'),
                            'layout'    : 'anchor',
                            defaults    : {
                                anchor: '100%'
                            },
                            items       : [
                                {
                                    xtype       : 'checkbox',      
                                    boxLabel    : i18n('sActivate'),
                                    name        : 'active',
                                    inputValue  : 'active',
                                    checked     : true,
                                    cls         : 'lblRd'
                                },
                                {
                                    xtype       : 'checkbox',      
                                    boxLabel    : i18n('sAlways_active'),
                                    name        : 'always_active',
                                    inputValue  : 'always_active',
                                    itemId      : 'always_active',
                                    checked     : true,
                                    cls         : 'lblRd'
                                },
                                {
                                    xtype: 'datefield',
                                    fieldLabel: i18n('sFrom'),
                                    name: 'from_date',
                                    itemId      : 'from_date',
                                    minValue: new Date(),  // limited to the current date or after
                                    hidden      : true,
                                    disabled    : true,
                                    value       : dtFrom
                                },
                                {
                                    xtype: 'datefield',
                                    fieldLabel: i18n('sTo'),
                                    name: 'to_date',
                                    itemId      : 'to_date',
                                    minValue: new Date(),  // limited to the current date or after
                                    hidden      : true,
                                    disabled    : true,
                                    value       : dtTo
                                }
                            ]
                        },
						{ 
                            'title' : 'Optional fields',
                            'layout'    : 'anchor',
                            defaults    : {
                                anchor: '100%'
                            },
                            items       : [
								{
                                    xtype		: 'textfield',
                                    fieldLabel	: 'Static IP',
                                    name 		: "static_ip",
                                    allowBlank	:true
                                },
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
						        },
								{
                                    xtype       : 'checkbox',      
                                    boxLabel    : 'Auto-add device after authentication',
                                    name        : 'auto_add',
                                    inputValue  : 'auto_add',
                                    checked     : false,
                                    cls         : 'lblRd',
                                    itemId      : 'auto_add'
                                }  
                            ]   
                        }
                    ]
                }
                
            ],
            buttons:  [
                { xtype : 'btnDataNext' }
            ]
        });
        return frmData;
    }   
});
