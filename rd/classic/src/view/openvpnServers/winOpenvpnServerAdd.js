Ext.define('Rd.view.openvpnServers.winOpenvpnServerAdd', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winOpenvpnServerAdd',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'New OpenVPN Server',
    width       : 550,
    height      : 500,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnAdd,
    autoShow    : false,
    defaults    : {
            border: false
    },
    requires    : [
    ],
    initComponent: function() {
        var me          = this;
        var scrnData    = me.mkScrnData();
        me.items = [
            scrnData
        ];  
        this.callParent(arguments);
    },
    mkScrnData: function(){
        var me      = this;
        var hide_system = true;
        if(me.root){
            hide_system = false;
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
                margin          : Rd.config.fieldMargin,
                labelWidth      : Rd.config.labelWidth
            },
            defaultType: 'textfield',
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
                                    xtype   : 'textfield',
                                    name    : "id",
                                    hidden  : true
                                }, 
                                {
                                    xtype       : 'displayfield',
                                    fieldLabel  : 'Cloud',
                                    value       : me.cloudName,
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
                                    boxLabel    : 'System Wide',
                                    name        : 'for_system',
                                    inputValue  : 'for_system',
                                    boxLabelCls	: 'boxLabelRd', 
                                    hidden      : hide_system,
                                    disabled    : hide_system
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
                                        height      : 170,
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
            buttons: [
                {
                    itemId  : 'btnDataNext',
                    text    : i18n('sNext'),
                    scale   : 'large',
                    glyph   : Rd.config.icnNext,
                    formBind: true,
                    margin  : '0 20 40 0'
                }
            ]
        });
        return frmData;
    }   
});
