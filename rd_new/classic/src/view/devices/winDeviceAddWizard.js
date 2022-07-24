Ext.define('Rd.view.devices.winDeviceAddWizard', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winDeviceAddWizard',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : i18n('sNew_device'),
    width       : 500,
    height      : 460,
    plain       : true,
    border      : false,
    layout      : 'card',
    glyph       : Rd.config.icnAdd,
    autoShow    :   false,
    defaults    : {
            border: false
    },
    owner       : '',
    startScreen : 'scrnData', //Default start screen
    selLanguage : null,
    requires: [
        'Ext.layout.container.Card',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Rd.view.components.btnDataPrev',
        'Rd.view.components.btnDataNext'
    ],
    initComponent: function() {
        var me = this;
        var scrnData        = me.mkScrnData();
        me.items = [
            scrnData
        ];
        me.callParent(arguments);
        me.getLayout().setActiveItem(me.startScreen);  
    },
    //_______ Data for device user  _______
    mkScrnData: function(){
        var me      = this;
        //Set default values for from and to:
        var dtFrom  = new Date();
        var dtTo    = new Date();
        dtTo.setYear(dtTo.getFullYear() + 1);
        var buttons = [
            { xtype : 'btnDataPrev' },
            { xtype : 'btnDataNext' }
        ];

        if(me.no_tree == true){
            var buttons = [
                { xtype : 'btnDataNext' }
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
                margin: 15,
				labelWidth: Rd.config.labelWidth
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
                            items       : [
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sMAC_address'),
                                    name        : "name",
                                    allowBlank  : false,
                                    blankText   : i18n('sSupply_a_value'),
                                    labelClsExtra: 'lblRdReq',
                                    vtype       : 'MacAddress',
                                    fieldStyle  : 'text-transform:lowercase'
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sDescription'),
                                    name        : "description",
                                    allowBlank  : false,
                                    blankText   : i18n('sSupply_a_value'),
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    xtype       : 'cmbPermanentUser',
                                    allowBlank  : false,
                                    labelClsExtra: 'lblRdReq',
                                    itemId      : 'owner',
									name		: 'permanent_user_id'
                                },
                                {
                                    xtype       : 'cmbProfile',
                                    allowBlank  : false,
                                    labelClsExtra: 'lblRdReq',
                                    itemId      : 'profile'
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
                        }
                    ]
                }
                
            ],
            buttons: buttons
        });
        return frmData;
    }   
});
