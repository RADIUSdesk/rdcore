Ext.define('Rd.view.openvpnServers.winOpenvpnServerEdit', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winOpenvpnServerEdit',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Edit OpenVPN Server',
    width       : 450,
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
            ]
        });
        me.items = frmData;

		frmData.loadRecord(me.record);
        me.callParent(arguments);
    }
});
