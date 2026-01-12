Ext.define('Rd.view.aps.cntApVpnEntry', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.cntApVpnEntry',
    requires: [
        'Rd.view.aps.vcApVpnEntry',
    ],
    controller  : 'vcApVpnEntry',
    vpn_id      : 0,
   // bodyStyle   : 'background: linear-gradient(90deg, #f5f5f5 0%, #e8e8e8 100%); border-radius: 10px;',
    bodyStyle   : 'background: linear-gradient(90deg, #f8f8f8 0%, #f0f0f0 100%); border-radius: 10px;',
    margin      : 10,
    info        : {},
    requires    : [
        'Rd.view.aps.tagApVpnExits'
    ], 
    initComponent: function(){
        var me          = this;
        var w_prim      = 550;
        var vpn_id      = me.vpn_id;
        
        var zt_ifname   = '**Not Yet Defined**';
         
        if(me.info.zt_ifname){
            zt_ifname = me.info.zt_ifname;
        }  
        
        var sVpnTypes = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data : [
                {"id":'ipsec',  "name":'IKEv2+IPsec'},
                {"id":'ovpn',   "name":'OpenVPN'},
                {"id":'wg',     "name":'Wireguard'},
                {"id":'zt',     "name":'ZeroTier'},
            ]
        });
        
        var sTlsTypes = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data : [
                {"id":'none',       "name":'No Protection'},
                {"id":'tls-auth',   "name":'tls-auth'},
                {"id":'tls-crypt',  "name":'tls-crypt'},
                {"id":'tls-crypt-v2', "name":'tls-crypt-v2 (Recommended)'},
            ]
        });
        
        me.width = w_prim + 30; 
                        
        me.items        = [
            {
                xtype   : 'container',
                layout      : {
                    type    : 'hbox',
                    pack    : 'end'
                },
                items   : [ 
                    {
                        xtype   : 'button',
                        itemId  : 'btnDelete',
                        glyph   : Rd.config.icnDelete
                    }
                ]
            },
            {
                xtype       : 'component',
                html        : 'Common settings',
                cls         : 'heading',
                margin      : '0 0 0 0',
                width       : w_prim+20
            },
          /*  {
                xtype      : 'checkbox',
                name       : vpn_id+'_enabled',
                boxLabel   : 'Enabled',
                checked    : true,
                cls        : 'x-toggle-checkbox',   // <- our custom skin
                boxLabelAlign: 'left'
            },*/
            {
                xtype       : 'textfield',
                fieldLabel  : 'Name',
                name        : vpn_id+'_name',
                allowBlank  : false,
                labelClsExtra: 'lblRdReq',
                width       : w_prim,
                value       : me.info.name
            },
            {
                fieldLabel  : 'VPN Type',
                store       : sVpnTypes,
                name        : vpn_id+'_vpn_type',
                queryMode   : 'local',
                displayField: 'name',
                valueField  : 'id',
                xtype       : 'combobox',
              //  value       : me.info.vpn_type,
                labelClsExtra: 'lblRdReq',
                itemId      : 'cmbVpnType',
                width       : w_prim,
            },
            //--IPsec--
            {
                xtype       : 'container',
                margin      : 0,
                itemId      : 'cntIpsec',
                padding     : 0,
                items       : [ 
                    {
                        xtype       : 'component',
                        html        : 'IKEv2+IPsec specific',
                        cls         : 'heading',
                        margin      : '5 0 0 0',
                        width       : w_prim+20
                    },
                    {
                        xtype       : 'textfield',
                        fieldLabel  : 'Server',
                        name        : vpn_id+'_ipsec_server',
                        allowBlank  : false,
                        labelClsExtra: 'lblRdReq',
                        width       : w_prim,
                        value       : me.info.ipsec_server
                    },
                    {
                        xtype       : 'textfield',
                        fieldLabel  : 'Server ID',
                        name        : vpn_id+'_ipsec_server_id',
                        allowBlank  : false,
                        labelClsExtra: 'lblRdReq',
                        width       : w_prim,
                        value       : me.info.ipsec_server_id
                    },            
                    {
                        xtype       : 'numberfield',
                        name        : vpn_id+'_ipsec_if_id',
                        fieldLabel  : 'Xfrm Id Nr',
                        maxValue    : 4294967295,
                        minValue    : 1,
                        labelClsExtra : 'lblRdReq',
                        width       : w_prim,
                        hideTrigger : true,
                        keyNavEnabled  : false,
                        mouseWheelEnabled	: false,
                        value       : me.info.ipsec_if_id
                    },
                    {
                        xtype       : 'textfield',
                        fieldLabel  : 'Endpoint IP',
                        name        : vpn_id+'_ipsec_xfrm_ip',
                        allowBlank  : false,
                        labelClsExtra: 'lblRdReq',
                        width       : w_prim,
                        value       : me.info.ipsec_xfrm_ip
                    },
                    {
                        xtype       : 'textfield',
                        fieldLabel  : 'Gateway IP',
                        name        : vpn_id+'_ipsec_xfrm_gw',
                        allowBlank  : false,
                        labelClsExtra: 'lblRdReq',
                        width       : w_prim,
                        value       : me.info.ipsec_xfrm_gw
                    },
                    {
                        xtype       : 'textfield',
                        fieldLabel  : 'Client ID',
                        name        : vpn_id+'_ipsec_client_id',
                        allowBlank  : false,
                        labelClsExtra: 'lblRdReq',
                        width       : w_prim,
                        value       : me.info.ipsec_client_id
                    },
                    {
                        xtype       : 'textareafield',
                        grow        : true,
                        name        : vpn_id+'_ipsec_ca',
                        fieldLabel  : 'CA',
                        anchor      : '100%',
                        width       : w_prim,
                        value       : me.info.ipsec_ca 
                    },
                    {
                        xtype       : 'textareafield',
                        grow        : true,
                        name        : vpn_id+'_ipsec_cert',
                        fieldLabel  : 'Certificate',
                        anchor      : '100%',
                        width       : w_prim,
                        value       : me.info.ipsec_cert
                    },
                    {
                        xtype       : 'textareafield',
                        grow        : true,
                        name        : vpn_id+'_ipsec_key',
                        fieldLabel  : 'Key',
                        anchor      : '100%',
                        width       : w_prim,
                        value       : me.info.ipsec_key 
                    },
                    {
                        xtype       : 'textfield',
                        fieldLabel  : 'Proposals',
                        name        : vpn_id+'_ipsec_proposals',
                        allowBlank  : false,
                        labelClsExtra: 'lblRdReq',
                        width       : w_prim,
                        value       : me.info.ipsec_proposals
                    },
                    {
                        xtype       : 'textfield',
                        fieldLabel  : 'ESP Proposals',
                        name        : vpn_id+'_ipsec_esp_proposals',
                        allowBlank  : false,
                        labelClsExtra: 'lblRdReq',
                        width       : w_prim,
                        value       : me.info.ipsec_esp_proposals
                    }
                ]
            },
            
            //--- Wireguard controls           
            {
                xtype       : 'container',
                margin      : 0,
                itemId      : 'cntWg',
                padding     : 0,
                items       : [ 
                    {
                        xtype       : 'component',
                        html        : 'Wireguard specific',
                        cls         : 'heading',
                        margin      : '5 0 0 0',
                        width       : w_prim+20
                    },           
                    {
                        xtype       : 'textfield',
                        fieldLabel  : 'Private Key',
                        name        : vpn_id+'_wg_private_key',
                        allowBlank  : false,
                        labelClsExtra: 'lblRdReq',
                        width       : w_prim,
                        itemId      : 'txtWgPrivateKey',
                        value       : me.info.wg_private_key
                    },
                    {
                        xtype       : 'textfield',
                        fieldLabel  : 'Public Key',
                        name        : vpn_id+'_wg_public_key',
                        allowBlank  : false,
                        labelClsExtra: 'lblRdReq',
                        width       : w_prim,
                        itemId      : 'txtWgPublicKey',
                        value       : me.info.wg_public_key
                    },
                    {
                        xtype       : 'textfield',
                        fieldLabel  : 'Address',
                        name        : vpn_id+'_wg_address',
                        allowBlank  : false,
                        labelClsExtra: 'lblRdReq',
                        width       : w_prim,
                        itemId      : 'txtWgAddress',
                        value       : me.info.wg_address
                    },
                    {
                        xtype       : 'textfield',
                        fieldLabel  : 'Endpoint IP',
                        name        : vpn_id+'_wg_endpoint',
                        allowBlank  : false,
                        labelClsExtra: 'lblRdReq',
                        width       : w_prim,
                        itemId      : 'txtWgEndpointIp',
                        value       : me.info.wg_endpoint
                    },
                    {
                        xtype       : 'numberfield',
                        name        : vpn_id+'_wg_port',
                        itemId      : 'nbrWgPort',
                        fieldLabel  : 'Port',
                        maxValue    : 65535,
                        minValue    : 49152,
                        labelClsExtra : 'lblRdReq',
                        width       : w_prim,
                        hideTrigger : true,
                        keyNavEnabled  : false,
                        mouseWheelEnabled	: false,
                        value       : me.info.wg_port
                    },
                ]
            },
            //--- OpenVPN -----
            {
                xtype       : 'container',
                margin      : 0,
                itemId      : 'cntOvpn',
                hidden      : true,
                padding     : 0,
                items       : [ 
                    {
                        xtype       : 'component',
                        html        : 'OpenVPN specific',
                        cls         : 'heading',
                        margin      : '5 0 0 0',
                        width       : w_prim+20
                    },
                    {
                        xtype       : 'textfield',
                        fieldLabel  : 'Server IP',
                        name        : vpn_id+'_ovpn_server',
                        allowBlank  : false,
                        labelClsExtra: 'lblRdReq',
                        width       : w_prim,
                        itemId      : 'txtOvpnServer',
                        value       : me.info.ovpn_server
                    },
                    {
                        xtype       : 'numberfield',
                        name        : vpn_id+'_ovpn_port',
                        itemId      : 'nbrOvpnPort',
                        fieldLabel  : 'Port',
                        maxValue    : 65535,
                        minValue    : 1024,
                        labelClsExtra : 'lblRdReq',
                        width       : w_prim,
                        hideTrigger : true,
                        keyNavEnabled  : false,
                        mouseWheelEnabled	: false,
                        value       : me.info.ovpn_port
                    },
                    {
                        xtype       : 'textareafield',
                        grow        : true,
                        name        : vpn_id+'_ovpn_ca',
                        fieldLabel  : 'CA',
                        anchor      : '100%',
                        width       : w_prim,
                        value       : me.info.ovpn_ca 
                    },
                    {
                        xtype       : 'textareafield',
                        grow        : true,
                        name        : vpn_id+'_ovpn_cert',
                        fieldLabel  : 'Certificate',
                        anchor      : '100%',
                        width       : w_prim,
                        value       : me.info.ovpn_cert
                    },
                    {
                        xtype       : 'textareafield',
                        grow        : true,
                        name        : vpn_id+'_ovpn_key',
                        fieldLabel  : 'Key',
                        anchor      : '100%',
                        width       : w_prim,
                        value       : me.info.ovpn_key 
                    },
                    {
                        fieldLabel  : 'Control Channel',
                        store       : sTlsTypes,
                        name        : vpn_id+'_ovpn_tls',
                        queryMode   : 'local',
                        displayField: 'name',
                        valueField  : 'id',
                        value       : 'none',
                        xtype       : 'combobox',
                        labelClsExtra: 'lblRdReq',
                        itemId      : 'cmbTlsType',
                        width       : w_prim,
                    },
                    {
                        xtype       : 'textareafield',
                        itemId      : 'txtTlsKey',
                        grow        : true,
                        hidden      : true,
                        name        : vpn_id+'_ovpn_tls_value',
                        fieldLabel  : 'TLS Key',
                        anchor      : '100%',
                        width       : w_prim,
                        value       : me.info.ovpn_key 
                    },
                ]
            },
            //--- Zerotier --
            {
                xtype       : 'container',
                margin      : 0,
                itemId      : 'cntZt',
                hidden      : true,
                padding     : 0,
                items       : [ 
                    {
                        xtype       : 'component',
                        html        : 'ZeroTier specific',
                        cls         : 'heading',
                        margin      : '5 0 0 0',
                        width       : w_prim+20
                    },
                    {
                        xtype       : 'textfield',
                        fieldLabel  : 'Network ID',
                        name        : vpn_id+'_zt_network_id',
                        allowBlank  : false,
                        labelClsExtra: 'lblRdReq',
                        width       : w_prim,
                        value       : me.info.zt_network_id
                    },
                    {
                        xtype       : 'displayfield',
                        fieldLabel  : 'Interface Name',
                        name        : vpn_id+'_zt_ifname',
                        labelClsExtra: 'lblRdReq',
                        width       : w_prim,
                        value       : zt_ifname
                    }                  
                ]
            },         
            {
                xtype       : 'component',
                html        : 'Split tunnel routing',
                cls         : 'heading',
                margin      : '5 0 0 0',
                width       : w_prim+20
            },    
            {
                xtype       : 'tagApVpnExits',
                name        : vpn_id+'_ap_vpn_exits[]',
                value       : me.info.ap_vpn_exits,
                ap_id       : me.info.ap_id,
                width       : w_prim          
            },
            {
                xtype       : 'textareafield',
                grow        : true,
                name        : vpn_id+'_ap_vpn_macs',
                fieldLabel  : 'Gateway For MAC',
                anchor      : '100%',
                width       : w_prim,
                value       : me.info.ap_vpn_macs 
            }
        ];       
        me.callParent(arguments);
        
            Ext.defer(function () {
                console.log(me.info.vpn_type);
                me.down('#cmbVpnType').setValue(me.info.vpn_type);
            }, 500);        
    }
});
