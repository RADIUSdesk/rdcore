Ext.define('Rd.view.accel.pnlAccelProfileAddEdit', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlAccelProfileAddEdit',
    autoScroll	: true,
    plain       : true,
    frame       : false,
    layout      : {
        type    : 'vbox',
        pack    : 'start',
        align   : 'stretch'
    },
    margin      : 5,  
    fieldDefaults: {
        msgTarget       : 'under',
        labelAlign      : 'left',
        labelSeparator  : '',
        labelWidth      : Rd.config.labelWidth+20,
        margin          : Rd.config.fieldMargin,
        labelClsExtra   : 'lblRdReq'
    },
    buttons : [
        {
            itemId  : 'save',
            text    : 'SAVE',
            scale   : 'large',
            formBind: true,
            glyph   : Rd.config.icnYes,
            margin  : Rd.config.buttonMargin,
            ui      : 'button-teal'
        }
    ],
    requires    : [
        'Rd.view.accel.vcAccelProfileAddEdit',
    ],
    controller  : 'vcAccelProfileAddEdit',
    initComponent: function(){
        var me = this;
        var w_prim      = 550;   
        var cntGeneral  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [            
                {
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sName'),
                    name        : "name",
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                },
                {
                    xtype       : 'cmbAccelBaseConfig'
                }     
            ]
        };
        
        var cntPpp = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
                    xtype           : 'numberfield',
                    fieldLabel      : 'LCP Echo Interval',
                    name            : "ppp_lcp-echo-interval",
                  //  value           : 20,
                    maxValue        : 1000,
                    step            : 1,
                    minValue        : 1,
                    labelClsExtra   : 'lblRdReq',
                    allowBlank      : false,
                    hideTrigger     : true,
                    keyNavEnabled   : false,
                    mouseWheelEnabled: false              
                },
                {
                    xtype           : 'numberfield',
                    fieldLabel      : 'LCP Echo Timeout',
                    name            : "ppp_lcp-echo-timeout",
                 //   value           : 120,
                    maxValue        : 1000,
                    step            : 1,
                    minValue        : 1,
                    labelClsExtra   : 'lblRdReq',
                    allowBlank      : false,
                    hideTrigger     : true,
                    keyNavEnabled   : false,
                    mouseWheelEnabled: false              
                },
                {
				    xtype           : 'numberfield',
				    fieldLabel		: 'MRU',
				    name			: 'ppp_mru',
				    allowBlank  	: false,
				    labelClsExtra   : 'lblRdReq',
				//    value           : 1400,
				    hideTrigger     : true,
                    keyNavEnabled   : false,
                    mouseWheelEnabled: false
				},
                {
				    xtype           : 'numberfield',
				    fieldLabel		: 'MTU',
				    name			: 'ppp_mtu',
				    allowBlank  	: false,
				    labelClsExtra   : 'lblRdReq',
				//    value           : 1400,
				    hideTrigger     : true,
                    keyNavEnabled   : false,
                    mouseWheelEnabled: false
				},
				{
				    xtype           : 'numberfield',
				    fieldLabel		: 'Min MTU',
				    name			: 'ppp_min-mtu',
				    allowBlank  	: false,
				    labelClsExtra   : 'lblRdReq',
				//    value           : 1280,
				    hideTrigger     : true,
                    keyNavEnabled   : false,
                    mouseWheelEnabled: false
				},					
                {
                    xtype       : 'checkbox',
                    boxLabel    : 'Verbose',
                    name        : 'ppp_verbose',
                    boxLabelCls : 'boxLabelRd'
                }
            ]  
        };
        
        var cntPppoe = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Called SID',
                    name        : "pppoe_called-sid",
                    labelClsExtra   : 'lblRdReq',
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                }, 				
                {
                    xtype       : 'checkbox',
                    boxLabel    : 'Verbose',
                    name        : 'pppoe_verbose',
                    boxLabelCls : 'boxLabelRd'
                }
            ]  
        };
        
        var cntRadiusCommon = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
				    xtype           : 'numberfield',
				    fieldLabel		: 'Accounting Interval',
				    name			: 'radius_acct-interim-interval',
				    allowBlank  	: false,
				    labelClsExtra   : 'lblRdReq',
			//	    value           : 120,
				    minValue        : 60,
				    maxValue        : 3600,
				    hideTrigger     : true,
                    keyNavEnabled   : false,
                    mouseWheelEnabled: false
				}, 				
                {
                    xtype       : 'checkbox',
                    boxLabel    : 'Verbose',
                    name        : 'radius_verbose',
                    boxLabelCls : 'boxLabelRd'
                }
            ]  
        };
        
        var cntRadiusOne = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Server IP',
                    name        : "radius1_ip",
                    labelClsExtra   : 'lblRdReq',
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                }, 
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Shared Secret',
                    name        : "radius1_secret",
                    labelClsExtra   : 'lblRdReq',
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                }, 
                {
				    xtype           : 'numberfield',
				    fieldLabel		: 'Auth Port',
				    name			: 'radius1_auth-port',
				    allowBlank  	: false,
				    labelClsExtra   : 'lblRdReq',
				    value           : 1812,
				    minValue        : 1,
				    maxValue        : 65535,
				    hideTrigger     : true,
                    keyNavEnabled   : false,
                    mouseWheelEnabled: false
				}, 
				{
				    xtype           : 'numberfield',
				    fieldLabel		: 'Acct Port',
				    name			: 'radius1_acct-port',
				    allowBlank  	: false,
				    labelClsExtra   : 'lblRdReq',
				    value           : 1812,
				    minValue        : 1,
				    maxValue        : 65535,
				    hideTrigger     : true,
                    keyNavEnabled   : false,
                    mouseWheelEnabled: false
				},
				{
				    xtype           : 'numberfield',
				    fieldLabel		: 'Request Limit',
				    name			: 'radius1_req-limit',
				    allowBlank  	: false,
				    labelClsExtra   : 'lblRdReq',
				    value           : 50,
				    minValue        : 1,
				    maxValue        : 1000,
				    hideTrigger     : true,
                    keyNavEnabled   : false,
                    mouseWheelEnabled: false
				}, 
				{
				    xtype           : 'numberfield',
				    fieldLabel		: 'Fail Timeout',
				    name			: 'radius1_fail-timeout',
				    allowBlank  	: false,
				    labelClsExtra   : 'lblRdReq',
				    value           : 0,
				    minValue        : 0,
				    maxValue        : 1000,
				    hideTrigger     : true,
                    keyNavEnabled   : false,
                    mouseWheelEnabled: false
				},
				{
				    xtype           : 'numberfield',
				    fieldLabel		: 'Max Fail',
				    name			: 'radius1_max-fail',
				    allowBlank  	: false,
				    labelClsExtra   : 'lblRdReq',
				    value           : 10,
				    minValue        : 1,
				    maxValue        : 1000,
				    hideTrigger     : true,
                    keyNavEnabled   : false,
                    mouseWheelEnabled: false
				},
				{
				    xtype           : 'numberfield',
				    fieldLabel		: 'Weight',
				    name			: 'radius1_weight',
				    allowBlank  	: false,
				    labelClsExtra   : 'lblRdReq',
				    value           : 1,
				    minValue        : 1,
				    maxValue        : 100,
				    hideTrigger     : true,
                    keyNavEnabled   : false,
                    mouseWheelEnabled: false
				}              
            ]  
        };
        
        var cntRadiusTwo = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Server IP',
                    name        : "radius2_ip",
                    labelClsExtra   : 'lblRd',
                    blankText   : i18n("sSupply_a_value"),
                }, 
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Shared Secret',
                    name        : "radius2_secret",
                    labelClsExtra   : 'lblRd',
                    blankText   : i18n("sSupply_a_value"),
                }, 
                {
				    xtype           : 'numberfield',
				    fieldLabel		: 'Auth Port',
				    name			: 'radius2_auth-port',
				    labelClsExtra   : 'lblRd',
				    value           : 1812,
				    minValue        : 1,
				    maxValue        : 65535,
				    hideTrigger     : true,
                    keyNavEnabled   : false,
                    mouseWheelEnabled: false
				}, 
				{
				    xtype           : 'numberfield',
				    fieldLabel		: 'Acct Port',
				    name			: 'radius2_acct-port',
				    labelClsExtra   : 'lblRd',
				    value           : 1813,
				    minValue        : 1,
				    maxValue        : 65535,
				    hideTrigger     : true,
                    keyNavEnabled   : false,
                    mouseWheelEnabled: false
				},
				{
				    xtype           : 'numberfield',
				    fieldLabel		: 'Request Limit',
				    name			: 'radius2_req-limit',
				    labelClsExtra   : 'lblRd',
				    value           : 50,
				    minValue        : 1,
				    maxValue        : 1000,
				    hideTrigger     : true,
                    keyNavEnabled   : false,
                    mouseWheelEnabled: false
				}, 
				{
				    xtype           : 'numberfield',
				    fieldLabel		: 'Fail Timeout',
				    name			: 'radius2_fail-timeout',
				    allowBlank  	: false,
				    labelClsExtra   : 'lblRd',
				    value           : 0,
				    minValue        : 0,
				    maxValue        : 1000,
				    hideTrigger     : true,
                    keyNavEnabled   : false,
                    mouseWheelEnabled: false
				},
				{
				    xtype           : 'numberfield',
				    fieldLabel		: 'Max Fail',
				    name			: 'radius2_max-fail',
				    allowBlank  	: false,
				    labelClsExtra   : 'lblRd',
				    value           : 10,
				    minValue        : 1,
				    maxValue        : 1000,
				    hideTrigger     : true,
                    keyNavEnabled   : false,
                    mouseWheelEnabled: false
				},
				{
				    xtype           : 'numberfield',
				    fieldLabel		: 'Weight',
				    name			: 'radius2_weight',
				    allowBlank  	: false,
				    labelClsExtra   : 'lblRd',
				    value           : 1,
				    minValue        : 1,
				    maxValue        : 100,
				    hideTrigger     : true,
                    keyNavEnabled   : false,
                    mouseWheelEnabled: false
				}              
               
            ]  
        };
              
        var cntShaper = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Vendor',
                    name        : "shaper_vendor",
                    labelClsExtra   : 'lblRdReq',
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Attribute',
                    name        : "shaper_attr",
                    labelClsExtra   : 'lblRdReq',
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                },	 				
                {
                    xtype       : 'checkbox',
                    boxLabel    : 'Verbose',
                    name        : 'shaper_verbose',
                    boxLabelCls : 'boxLabelRd'
                }
            ]  
        };
        
        var cntCli = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Password',
                    name        : "cli_password",
                    labelClsExtra   : 'lblRdReq',
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                }, 				
                {
                    xtype       : 'checkbox',
                    boxLabel    : 'Verbose',
                    name        : 'cli_verbose',
                    boxLabelCls : 'boxLabelRd'
                }
            ]  
        };
        
        var cntDns = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'DNS1',
                    name        : "dns_dns1",
                    labelClsExtra   : 'lblRdReq',
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'DNS2',
                    name        : "dns_dns2",
                    labelClsExtra   : 'lblRdReq',
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                }
            ]  
        };
        
        var cntIpPool = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Gateway IP',
                    name        : "ip-pool_gw-ip-address",
                    labelClsExtra   : 'lblRdReq',
                    allowBlank  : false
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Attribute',
                    name        : "ip-pool_attr",
                    labelClsExtra   : 'lblRdReq',
                    allowBlank  : false
                },
                {
                    xtype       : 'textareafield',
                    grow        : true,
                    fieldLabel  : 'Pools',
                    name        : 'ip-pool_pools',
                    anchor      : '100%',
                    allowBlank  : false,
                    labelClsExtra: 'lblRdReq'
                 }
            ]  
        };
        
         me.items = [
            {
                xtype       : 'panel',
                title       : 'General Settings',
                //glyph       : Rd.config.icnGears,  
                ui          : 'panel-blue',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntGeneral				
            },
            {
                xtype       : 'panel',
                title       : 'PPPoE',

                ui          : 'panel-green',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntPppoe				
            },
            {
                xtype       : 'panel',
                title       : 'PPP', 
                ui          : 'panel-green',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntPpp				
            },
            {
                xtype       : 'panel',
                title       : 'RADIUS Common', 
                ui          : 'panel-green',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntRadiusCommon				
            },
            {
                xtype       : 'panel',
                title       : 'RADIUS Server 1', 
                ui          : 'panel-green',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntRadiusOne				
            },
            {
                xtype       : 'panel',
                title       : 'RADIUS Server 2', 
                ui          : 'panel-green',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntRadiusTwo				
            },
            {
                xtype       : 'panel',
                title       : 'Shaper', 
                ui          : 'panel-green',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntShaper				
            },
            {
                xtype       : 'panel',
                title       : 'DNS', 
                ui          : 'panel-green',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntDns				
            },
            {
                xtype       : 'panel',
                title       : 'IP Pools', 
                ui          : 'panel-green',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntIpPool				
            },
            {
                xtype       : 'panel',
                title       : 'Command Line Interface', 
                ui          : 'panel-green',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntCli				
            }            
        ];    
      
        me.callParent(arguments);
    }
});
