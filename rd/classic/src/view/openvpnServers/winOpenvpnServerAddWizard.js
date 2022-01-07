Ext.define('Rd.view.openvpnServers.winOpenvpnServerAddWizard', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winOpenvpnServerAddWizard',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'New OpenVPN Server',
    width       : 450,
    height      : 500,
    plain       : true,
    border      : false,
    layout      : 'card',
    glyph       : Rd.config.icnAdd,
    autoShow    : false,
    defaults    : {
            border: false
    },
    no_tree     : false, //If the user has no children we don't bother giving them a branchless tree
    user_id     : '',
    owner       : '',
    startScreen : 'scrnApTree', //Default start screen
    requires    : [
        'Ext.layout.container.Card',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Ext.form.FieldContainer'
    ],
    initComponent: function() {
        var me = this;
        var scrnApTree      = me.mkScrnApTree();
        var scrnData        = me.mkScrnData();
        me.items = [
            scrnApTree,
            scrnData
        ];  
        this.callParent(arguments);
        me.getLayout().setActiveItem(me.startScreen);
    },

    //____ AccessProviders tree SCREEN ____
    mkScrnApTree: function(){
        var pnlTree = Ext.create('Rd.view.components.pnlAccessProvidersTree',{
            itemId: 'scrnApTree'
        });
        return pnlTree;
    },

    //_______ Data for Openvpn Servers  _______
    mkScrnData: function(){


        var me      = this;
        var buttons = [
                {
                    itemId: 'btnDataPrev',
                    text: i18n('sPrev'),
                    scale: 'large',
                    iconCls: 'b-prev',
                    glyph: Rd.config.icnBack,
                    margin: '0 20 40 0'
                },
                {
                    itemId: 'btnDataNext',
                    text: i18n('sNext'),
                    scale: 'large',
                    iconCls: 'b-next',
                    glyph: Rd.config.icnNext,
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
                    glyph: Rd.config.icnNext,
                    formBind: true,
                    margin: '0 20 40 0'
                }
            ];
        }

        var frmData = Ext.create('Ext.form.Panel',{
            border      : false,
            layout      : 'fit',
            itemId      : 'scrnData',
            fieldDefaults: {
                msgTarget       : 'under',
                labelClsExtra   : 'lblRd',
                labelAlign      : 'left',
                labelSeparator  : '',
                labelWidth      : Rd.config.labelWidth,
                maxWidth        : Rd.config.maxWidth, 
                margin          : Rd.config.fieldMargin
            },
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
                                    itemId  : 'user_id',
                                    xtype   : 'textfield',
                                    name    : "user_id",
                                    hidden  : true,
                                    value   : me.user_id
                                },
                                {
                                    xtype   : 'textfield',
                                    name    : "id",
                                    hidden  : true
                                }, 
                                {
                                    itemId      : 'owner',
                                    xtype       : 'displayfield',
                                    fieldLabel  : i18n('sOwner'),
                                    value       : me.owner,
                                    labelClsExtra: 'lblRdReq'
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
                            title       : 'VPN Basic',
                            layout      : 'anchor',
                            itemId      : 'tabVpnBasic',
                            autoScroll  : true,
                            defaults    : {
                                anchor: '100%'
                            },
                            items       :[
                                {
                                    xtype       : 'combobox',
                                    fieldLabel  : 'Local/Remote',
                                    value       : 'local',
                                    name        : 'local_remote',
                                    displayField: 'name', 
                                    editable    : false, 
                                    queryMode   : 'local', 
                                    valueField  : 'id',
                                    labelClsExtra: 'lblRdReq',
                                    store: { 
                                        fields: ['id', 'name'], 
                                 
                                        data: [ 
                                            {id: 'local',   name: 'Local'}, 
                                            {id: 'remote',  name: 'Remote'} 
                                        ] 
                                    }
                                },
                                {
                                    xtype       : 'combobox',
                                    name        : 'protocol',
                                    value       : 'udp',
                                    fieldLabel  : 'Protocol', 
                                    displayField: 'name', 
                                    editable    : false, 
                                    queryMode   : 'local', 
                                    valueField  : 'id', 
                                    labelClsExtra: 'lblRdReq',
                                    store: { 
                                        fields: ['id', 'name'], 
                                 
                                        data: [ 
                                            {id: 'udp',   name: 'UDP'}, 
                                            {id: 'tcp',   name: 'TCP'} 
                                        ] 
                                    }
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sIP_Address'),
                                    name        : "ip_address",
                                    allowBlank  : false,
                                    vtype       : 'IPAddress',
                                    blankText   : i18n('sSupply_a_value'),
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    xtype       : 'numberfield',
                                    name        : 'port',
                                    fieldLabel  : 'Port',
                                    value       : 1194,
                                    maxValue    : 64000,
                                    minValue    : 1025,
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    xtype       : 'combobox',
                                    name        : 'config_preset',
                                    value       : 'default',
                                    fieldLabel  : 'Config Preset', 
                                    displayField: 'name', 
                                    editable    : false, 
                                    queryMode   : 'local', 
                                    valueField  : 'id',
                                    labelClsExtra: 'lblRdReq', 
                                    store: { 
                                        fields: ['id', 'name'], 
                                        data: [ 
                                            {id: 'default',   name: 'Default'}
                                        ] 
                                    }
                                }        
                            ]
                        },
                        { 
                                title       : 'VPN IPs',
                                layout      : 'anchor',
                                itemId      : 'tabVpnIp',
                                autoScroll  : true,
                                defaults    : {
                                    anchor: '100%'
                                },
                                items       :[
                                    {
                                        xtype       : 'textfield',
                                        fieldLabel  : 'Gateway IP',
                                        name        : "vpn_gateway_address",
                                        allowBlank  : false,
                                        vtype       : 'IPAddress',
                                        blankText   : i18n('sSupply_a_value'),
                                        labelClsExtra: 'lblRdReq'
                                    },
                                    {
                                        xtype       : 'textfield',
                                        fieldLabel  : 'Bridge Start IP',
                                        name        : "vpn_bridge_start_address",
                                        allowBlank  : false,
                                        vtype       : 'IPAddress',
                                        blankText   : i18n('sSupply_a_value'),
                                        labelClsExtra: 'lblRdReq'
                                    },
                                    {
                                        xtype       : 'textfield',
                                        fieldLabel  : 'Bridge Mask',
                                        name        : "vpn_mask",
                                        allowBlank  : false,
                                        vtype       : 'IPAddress',
                                        blankText   : i18n('sSupply_a_value'),
                                        labelClsExtra: 'lblRdReq'
                                    }    
                                ]
                        },
                        { 
                                title       : 'Certs etc',
                                layout      : 'anchor',
                                itemId      : 'tabVpnCerts',
                                autoScroll  : true,
                                defaults    : {
                                    anchor: '100%'
                                },
                                items       :[
                                    {
                                        xtype       : 'textareafield',
                                        grow        : true,
                                        fieldLabel  : 'ca.crt',
                                        name        : 'ca_crt',
                                        anchor      : '100%',
                                        allowBlank  : false,
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
                                    }
                                ]
                        }
                    ]
                }              
            ],
            buttons     : buttons    
        });
        return frmData;
    }   
});
