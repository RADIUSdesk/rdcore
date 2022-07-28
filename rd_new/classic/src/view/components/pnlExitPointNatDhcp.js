Ext.define('Rd.view.components.pnlExitPointNatDhcp', {
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlExitPointNatDhcp',
    requires    : [
    ],
    w_prim      : 540,
    auto_chk    : false,
    initComponent: function() {
        var me          = this;
        var w_prim      = me.w_prim;    
        var auto_chk    = me.auto_chk;
        
        me.items    = [
            {
                xtype       : 'radiogroup',
                name        : 'rb_nat_config',
                itemId      : 'rgrpNatDhpcConfig',
                layout      : {
                    type    : 'hbox',
                    pack    : 'center',
                    align   : 'stretchmax'
                },
                listeners   : {
		            change  : me.onRgrpNatDhpcConfigChange
		        },
                items: [
                    { boxLabel: 'Automatic',name: 'nat_config', inputValue: 'auto',  width: 250, checked: auto_chk },
                    { boxLabel: 'Specific', name: 'nat_config', inputValue: 'manual',width: 250}
                ]
            },
            {
                xtype       : 'panel',
                bodyStyle   : 'background: #e0ebeb',
                hidden      : true,
                itemId      : 'pnlNatDhcpDetail',
                disabled    : true,
                items       : [
                    {
                        itemId      : 'txtIpaddr',
                        xtype       : 'textfield',
                        fieldLabel  : i18n('sIP_Address'),
                        name        : 'nat_ipaddr',
                        allowBlank  : false,
                        blankText   : i18n("sSupply_a_value"),
                        labelClsExtra: 'lblRdReq',
                        vtype       : 'IPAddress',
                        value       : '10.222.100.1',
                        width       : w_prim
                    },
                    {
                        itemId      : 'txtNetmask',
                        xtype       : 'textfield',
                        fieldLabel  : 'Netmask',
                        name        : 'nat_netmask',
                        allowBlank  : false,
                        blankText   : i18n("sSupply_a_value"),
                        labelClsExtra: 'lblRdReq',
                        vtype       : 'IPAddress',
                        value       : '255.255.255.0',
                        width       : w_prim
                    },
                    {
                        itemId      : 'txtNetmask',
                        xtype       : 'textfield',
                        fieldLabel  : 'Netmask',
                        name        : 'nat_netmask',
                        allowBlank  : false,
                        blankText   : i18n("sSupply_a_value"),
                        labelClsExtra: 'lblRdReq',
                        vtype       : 'IPAddress',
                        value       : '255.255.255.0',
                        width       : w_prim
                    },
                    {
                        xtype       : 'checkbox',
                        fieldLabel  : 'Disable',
                        name        : 'nat_ignore',
                        inputValue  : "1",
                        margin      : '0 0 0 15',
                        labelClsExtra: 'lblRdReq',
                        listeners   : {
                            change  : me.onChkNatIgnoreChange
                        }
                    },
                    {
	                    xtype       : 'numberfield',
	                    itemId      : 'nmbrStart',
	                    name        : 'nat_pool_start',
	                    fieldLabel  : 'Start Of Pool',
	                    value       : 100,
	                    maxValue    : 253,
	                    minValue    : 1,
	                    width       : w_prim,
	                    labelClsExtra: 'lblRdReq',
	                },
	                {
	                    xtype       : 'numberfield',
	                    itemId      : 'nmbrEnd',
	                    name        : 'nat_pool_limit',
	                    fieldLabel  : 'End Of Pool',
	                    value       : 200,
	                    maxValue    : 254,
	                    minValue    : 2,
	                    width       : w_prim,
	                    labelClsExtra: 'lblRdReq',
	                },
	                {
	                    xtype       : 'numberfield',
	                    itemId      : 'nmbrLease',
                        name        : 'nat_leasetime',
                        fieldLabel  : 'Lease Time (Hours)',
	                    value       : 12,
	                    maxValue    : 100,
	                    minValue    : 1,
	                    width       : w_prim,
	                    labelClsExtra: 'lblRdReq',
	                },
                    {
                        itemId      : 'txtDns1',
                        xtype       : 'textfield',
                        itemId      : 'txtNatDns1',
                        fieldLabel  : 'DNS Primary',
                        name        : 'nat_dns_1',
                        allowBlank  : true,
                        blankText   : i18n("sSupply_a_value"),
                        labelClsExtra: 'lblRd',
                        vtype       : 'IPAddress',
                        width       : w_prim
                    },
                    {
                        itemId      : 'txtDns2',
                        xtype       : 'textfield',
                        itemId      : 'txtNatDns2',
                        fieldLabel  : 'DNS Secondary',
                        name        : 'nat_dns_2',
                        allowBlank  : true,
                        blankText   : i18n("sSupply_a_value"),
                        labelClsExtra: 'lblRd',
                        vtype       : 'IPAddress',
                        width       : w_prim
                    }
                ]
            }     
        ];
        me.callParent(arguments);
    },
    onRgrpNatDhpcConfigChange : function(grp){
	    var me          = this; 
	    var pnl         = grp.up('panel');
        var dhcpDetail  = pnl.down('#pnlNatDhcpDetail');  
        if(grp.getValue().nat_config == 'manual'){ 
            dhcpDetail.setHidden(false);
            dhcpDetail.setDisabled(false);                    
        }else{
            dhcpDetail.setHidden(true);
            dhcpDetail.setDisabled(true);                        
        }
	},
	onChkNatIgnoreChange : function(chk){
	    var me      = this;
	    var pnl     = chk.up('panel');
        var dis     = false;
        
        if(chk.getValue()){
            dis = true;
        }  
        
        pnl.down('#nmbrStart').setDisabled(dis);
        pnl.down('#nmbrEnd').setDisabled(dis);          
        pnl.down('#nmbrLease').setDisabled(dis);
        pnl.down('#txtNatDns1').setDisabled(dis);
        pnl.down('#txtNatDns2').setDisabled(dis);
	}
});
