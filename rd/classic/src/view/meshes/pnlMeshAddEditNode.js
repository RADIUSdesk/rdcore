Ext.define('Rd.view.meshes.pnlMeshAddEditNode', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlMeshAddEditNode',
    title       : 'Edit Node',
    autoScroll	: true,
    plain       : true,
    layout      : 'vbox',
    //Some defaults
    meshId      : '',
	meshName	: '',
	nodeId      : 0,
    defaults    : {
            border: false
    },
    fieldDefaults: {
        msgTarget       : 'under',
        labelAlign      : 'left',
        labelSeparator  : '',
        labelWidth      : Rd.config.labelWidth,
        //labelWidth      : 200,
        margin          : Rd.config.fieldMargin,
        labelClsExtra   : 'lblRdReq'
    },
    requires: [
        'Ext.form.field.Text',
        'Rd.view.meshes.cmbHardwareOptions',
		'Rd.view.components.cmbMesh',
        'Rd.view.components.cmbFiveGigChannels',
        'Rd.view.components.cmbTwoGigChannels',
        'Rd.view.components.sldrToggle',
        'Rd.view.meshes.vcMeshNodeGeneric',
        'Rd.view.meshes.pnlNodeRadioDetail',
        'Rd.view.meshes.tagStaticEntries',
        'Rd.view.components.cmbEncryptionOptionsSimple',
        'Rd.view.components.cmbInternetConnection',
        'Rd.view.components.cmbQmiAuth'
    ],
    controller  : 'vcMeshNodeGeneric',
    listeners       : {
        show : 'loadBasicSettings' //Trigger a load of the settings (This is only on the initial load)
    },
    initComponent: function() {
         var me 	        = this;     
         var w_prim         = 550;
         var w_sec          = 350;
         var hide_multiple  = true;          
		// Are we creating a new one or editing an existing one?
		var saveItemId = (me.nodeId == 0) ? 'addsave' : 'editsave';

		var cmb = Ext.create('Rd.view.components.cmbMesh',
	        { 
	            itemId          : 'mesh_id',
	            width           : w_prim,

	            listeners       : {
                        change : 'onCmbMeshChange'
                }  
	        });
		
		cmb.getStore().load();
		if (me.meshId != '') {
			cmb.setValue(me.meshId);//Show it
		}
		
		
		if(saveItemId == 'addsave'){
		    me.glyph        = Rd.config.icnAdd;
		    hide_multiple   = false;
		}
		
		if(saveItemId == 'editsave'){
		    me.glyph = Rd.config.icnEdit
		}
		
		me.buttons = [
            {
                itemId  : saveItemId,
                text    : 'SAVE',
                scale   : 'large',
                formBind: true,
                glyph   : Rd.config.icnYes,
                margin  : Rd.config.buttonMargin,
                ui      : 'button-teal'
            }
        ];
                      
        var pnlWanStatic = {
            xtype   : 'panel',
            itemId  : 'pnlWanStatic',
            hidden  : true,
            disabled: true,
            bodyStyle   : 'background: #e0ebeb',
            items   : [
                {
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sIP_Address'),
                    name        : 'wan_static_ipaddr',
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRdReq',
                    width       : w_prim,
                    vtype       : 'IPAddress'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Netmask',
                    name        : 'wan_static_netmask',
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRdReq',
                    width       : w_prim,
                    vtype       : 'IPAddress'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Gateway',
                    name        : 'wan_static_gateway',
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRdReq',
                    width       : w_prim,
                    vtype       : 'IPAddress'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'DNS Primary',
                    name        : 'wan_static_dns_1',
                    allowBlank  : true,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRd',
                    width       : w_prim,
                    vtype       : 'IPAddress'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'DNS Secondary',
                    name        : 'wan_static_dns_2',
                    allowBlank  : true,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRd',
                    width       : w_prim,
                    vtype       : 'IPAddress'
                }
            ]
        };
        
        var pnlWanPppoe = {
            xtype   : 'panel',
            itemId  : 'pnlWanPppoe',
            hidden  : true,
            disabled: true,
            bodyStyle   : 'background: #e0ebeb',
            items   : [
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Username',
                    name        : 'wan_pppoe_username',
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRdReq',
                    width       : w_prim
                },
                {
                    xtype       : 'rdPasswordfield',
                    rdName      : 'wan_pppoe_password',
                    rdLabel     : 'Password',
                    enabled     : true,
                    width       : w_prim
                }, 
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'DNS Primary',
                    name        : 'wan_pppoe_dns_1',
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRd',
                    width       : w_prim,
                    vtype       : 'IPAddress'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'DNS Secondary',
                    name        : 'wan_pppoe_dns_2',
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRd',
                    width       : w_prim,
                    vtype       : 'IPAddress'
                },
                {
			        xtype       : 'textfield',
			        fieldLabel  : 'My Own MAC',
			        name        : 'wan_pppoe_mac',
			        blankText   : i18n("sSupply_a_value"),
			        vtype       : 'MacAddress',
			        labelClsExtra: 'lblRd',
			        fieldStyle  : 'text-transform:uppercase',
			        width       : w_prim
		        },
                {
			        xtype       : 'textfield',
			        fieldLabel  : 'MTU',
			        name        : 'wan_pppoe_mtu',
			        blankText   : i18n("sSupply_a_value"),
			        vtype       : 'Numeric',
			        labelClsExtra: 'lblRd',
			        width       : w_prim
		        }       
            ]
        };
        
        var cntWbW = {
            xtype   : 'panel',
            itemId  : 'cntWbW',
            hidden  : true,
            disabled: true,
            bodyStyle   : 'background: #e0ebeb',
            items   : [
                {
                    fieldLabel  : 'SSID',
                    name        : 'wbw_ssid',
                    maxLength   : 31,
                    allowBlank  : false,
                    regex       : /^[\w\-\s]+$/,
                    regexText   : "Only words allowed",
                    emptyText   : 'Specify a value to continue',
                    width       : w_prim,
                    xtype       : 'textfield'
                }, 
                { 
                    xtype       : 'cmbEncryptionOptionsSimple',
                    allowBlank  : false,
                    name        : 'wbw_encryption',
                    width       : w_prim,
                    listeners       : {
						    change : 'onCmbEncryptionOptionsChangeWbw'
				    }  
                },
                {
                    fieldLabel  : 'Passphrase',
                    name        : 'wbw_key',
                    itemId      : 'wbw_key',
                    allowBlank  : false,
                    xtype       : 'textfield',
                    width       : w_prim,
                    minLength   : 8,
                    hidden      : true,
                    disabled    : true
                },
                {
                    xtype       : 'radiogroup',
                    fieldLabel  : 'Radio',
                    itemId      : 'rgrpWbWradio',
                    columns     : 3,
                    vertical    : false,
                    items       : [                        
                        {
                            boxLabel  : 'Radio0',
                            name      : 'wbw_device',
                            inputValue: 'radio0',
                            itemId    : 'wbw_radio_0',
                            margin    : '0 15 0 0',
                            checked   : true
                        }, 
                        {
                            boxLabel  : 'Radio1',
                            name      : 'wbw_device',
                            inputValue: 'radio1',
                            itemId    : 'wbw_radio_1',
                            margin    : '0 0 0 15'
                        },
                        { 
                            boxLabel  : 'Radio2',
                            name      : 'wbw_device',
                            inputValue: 'radio2',
                            itemId    : 'wbw_radio_2',
                            margin    : '0 0 0 15'
                        }    
                    ]
                }
            ]
        };
              
        var pnlWifiStatic = {
            xtype   : 'panel',
            itemId  : 'pnlWifiStatic',
            hidden  : true,
            disabled: true,
            bodyStyle   : 'background: #e0ebeb',
            items   : [
                {
                    fieldLabel  : 'SSID',
                    name        : 'wifi_static_ssid',
                    maxLength   : 31,
                    allowBlank  : false,
                    regex       : /^[\w\-\s]+$/,
                    regexText   : "Only words allowed",
                    emptyText   : 'Specify a value to continue',
                    width       : w_prim,
                    xtype       : 'textfield'
                }, 
                { 
                    xtype       : 'cmbEncryptionOptionsSimple',
                    allowBlank  : false,
                    name        : 'wifi_static_encryption',
                    width       : w_prim,
                    listeners       : {
						    change : 'onCmbEncryptionOptionsChangeStatic'
				    }  
                },
                {
                    fieldLabel  : 'Passphrase',
                    name        : 'wifi_static_key',
                    itemId      : 'wifi_static_key',
                    allowBlank  : false,
                    xtype       : 'textfield',
                    width       : w_prim,
                    minLength   : 8,
                    hidden      : true,
                    disabled    : true
                },
                {
                    xtype       : 'radiogroup',
                    fieldLabel  : 'Radio',
                    itemId      : 'rgrpWifiStaticRadio',
                    columns     : 3,
                    vertical    : false,
                    items       : [
                        {
                            boxLabel  : 'Radio0',
                            name      : 'wifi_static_device',
                            inputValue: 'radio0',
                            itemId    : 'wifi_static_radio_0',
                            margin    : '0 15 0 0',
                            checked   : true
                        }, 
                        {
                            boxLabel  : 'Radio1',
                            name      : 'wifi_static_device',
                            inputValue: 'radio1',
                            itemId    : 'wifi_static_radio_1',
                            margin    : '0 0 0 15'
                        },
                        { 
                            boxLabel  : 'Radio2',
                            name      : 'wifi_static_device',
                            inputValue: 'radio2',
                            itemId    : 'wifi_static_radio_2',
                            margin    : '0 0 0 15'
                        }    
                    ]
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sIP_Address'),
                    name        : 'wifi_static_ipaddr',
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRdReq',
                    width       : w_prim,
                    vtype       : 'IPAddress'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Netmask',
                    name        : 'wifi_static_netmask',
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRdReq',
                    width       : w_prim,
                    vtype       : 'IPAddress'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Gateway',
                    name        : 'wifi_static_gateway',
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRdReq',
                    width       : w_prim,
                    vtype       : 'IPAddress'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'DNS Primary',
                    name        : 'wifi_static_dns_1',
                    allowBlank  : true,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRd',
                    width       : w_prim,
                    vtype       : 'IPAddress'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'DNS Secondary',
                    name        : 'wifi_static_dns_2',
                    allowBlank  : true,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRd',
                    width       : w_prim,
                    vtype       : 'IPAddress'
                }
            ]
        };
        
        var pnlWifiPppoe = {
            xtype   : 'panel',
            itemId  : 'pnlWifiPppoe',
            hidden  : true,
            disabled: true,
            bodyStyle   : 'background: #e0ebeb',
            items   : [
                {
                    fieldLabel  : 'SSID',
                    name        : 'wifi_pppoe_ssid',
                    maxLength   : 31,
                    allowBlank  : false,
                    regex       : /^[\w\-\s]+$/,
                    regexText   : "Only words allowed",
                    emptyText   : 'Specify a value to continue',
                    width       : w_prim,
                    xtype       : 'textfield'
                }, 
                { 
                    xtype       : 'cmbEncryptionOptionsSimple',
                    allowBlank  : false,
                    name        : 'wifi_pppoe_encryption',
                    width       : w_prim,
                    listeners       : {
						    change : 'onCmbEncryptionOptionsChangePppoe'
				    }  
                },
                {
                    fieldLabel  : 'Passphrase',
                    name        : 'wifi_pppoe_key',
                    itemId      : 'wifi_pppoe_key',                 
                    allowBlank  : false,
                    xtype       : 'textfield',
                    width       : w_prim,
                    minLength   : 8,
                    hidden      : true,
                    disabled    : true
                },
                {
                    xtype       : 'radiogroup',
                    fieldLabel  : 'Radio',
                    itemId      : 'rgrpWifiPppoeRadio',
                    columns     : 3,
                    vertical    : false,
                    items       : [
                        {
                            boxLabel  : 'Radio0',
                            name      : 'wifi_pppoe_device',
                            inputValue: 'radio0',
                            itemId    : 'wifi_pppoe_radio_0',
                            margin    : '0 15 0 0',
                            checked   : true
                        }, 
                        {
                            boxLabel  : 'Radio1',
                            name      : 'wifi_pppoe_device',
                            inputValue: 'radio1',
                            itemId    : 'wifi_pppoe_radio_1',
                            margin    : '0 0 0 15'
                        },
                        { 
                            boxLabel  : 'Radio2',
                            name      : 'wifi_pppoe_device',
                            inputValue: 'radio2',
                            itemId    : 'wifi_pppoe_radio_2',
                            margin    : '0 0 0 15'
                        }    
                    ]
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Username',
                    name        : 'wifi_pppoe_username',
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRdReq',
                    width       : w_prim
                },
                {
                    xtype       : 'rdPasswordfield',
                    rdName      : 'wifi_pppoe_password',
                    rdLabel     : 'Password',
                    enabled     : true,
                    width       : w_prim
                }, 
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'DNS Primary',
                    name        : 'wifi_pppoe_dns_1',
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRd',
                    width       : w_prim,
                    vtype       : 'IPAddress'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'DNS Secondary',
                    name        : 'wifi_pppoe_dns_2',
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRd',
                    width       : w_prim,
                    vtype       : 'IPAddress'
                },
                {
			        xtype       : 'textfield',
			        fieldLabel  : 'My Own MAC',
			        name        : 'wifi_pppoe_mac',
			        blankText   : i18n("sSupply_a_value"),
			        vtype       : 'MacAddress',
			        labelClsExtra: 'lblRd',
			        fieldStyle  : 'text-transform:uppercase',
			        width       : w_prim
		        },
                {
			        xtype       : 'textfield',
			        fieldLabel  : 'MTU',
			        name        : 'wifi_pppoe_mtu',
			        blankText   : i18n("sSupply_a_value"),
			        vtype       : 'Numeric',
			        labelClsExtra: 'lblRd',
			        width       : w_prim
		        }       
            ]
        };
        
        var pnlQmi = {
            xtype   : 'panel',
            itemId  : 'pnlQmi',
            hidden  : true,
            disabled: true,
            bodyStyle   : 'background: #e0ebeb',
            items   : [               
                { 
                    xtype       : 'cmbQmiAuth',
                    allowBlank  : false,
                    name        : 'qmi_auth',
                    width       : w_prim,
                    listeners       : {
						    change : 'onCmbQmiOptionsChange'
				    }  
                },       
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Username',
                    name        : 'qmi_username',
                    itemId      : 'qmi_username',
                    hidden      : true,
                    disabled    : true,
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRdReq',
                    width       : w_prim
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Password',
                    name        : 'qmi_password',
                    itemId      : 'qmi_password',
                    hidden      : true,
                    disabled    : true,
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRdReq',
                    width       : w_prim
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'APN',
                    name        : 'qmi_apn',
                    labelClsExtra: 'lblRd',
                    width       : w_prim
                }, 
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Pincode',
                    name        : 'qmi_pincode',
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRd',
                    width       : w_prim
                }
            ]
        };
                
        var cntRebootController = {
            xtype   : 'panel',
            itemId  : 'cntRebootController',
            hidden  : true,
            disabled: true,
            bodyStyle   : 'background: #e0ebeb',
            items   : [
                 {
                    xtype       : 'numberfield',
                    name        : 'controller_reboot_time',
                    itemId      : 'controller_reboot_time',
                    fieldLabel  : 'Reboot trigger time',
                    value       : 600,
                    maxValue    : 3600,
                    minValue    : 240,
                    width       : w_prim
                }    
            ]
        };
        
        var cntDailyReboot = {
            xtype   : 'panel',
            itemId  : 'cntDailyReboot',
            hidden  : true,
            disabled: true,
            bodyStyle   : 'background: #e0ebeb',
            items   : [
                {
                    xtype       : 'timefield',
                    name        : 'reboot_at',
                    fieldLabel  : 'Reboot At',
                    minValue    : '00:00',
                    maxValue    : '23:30',
                    value       : '00:00',
                    increment   : 30,
                    width       : w_prim
                }
            ]
        };
        
        var cntTop = {
            xtype       : 'container',
            items       : [              
                {
				    xtype       : 'checkbox',      
				    fieldLabel  : 'Add Multiple',
				    itemId      : 'chkMultiple',
				    hidden      : hide_multiple
			    },
                {
				    itemId      : 'node_id',
				    xtype       : 'textfield',
				    name        : "id",
				    hidden      : true,
				    value       : me.nodeId
			    },
			    cmb,
                {
			        xtype       : 'textfield',
			        fieldLabel  : i18n("sName"),
			        name        : "name",
			        allowBlank  : false,
			        blankText   : i18n("sSupply_a_value"),
			        width       : w_prim
		        },
		        {
			        xtype       : 'textfield',
			        fieldLabel  : i18n("sDescription"),
			        name        : "description",
			        allowBlank  : true,
			        labelClsExtra   : 'lblRd',
			        width       : w_prim
		        },
		        {
		        	xtype       : 'cmbHardwareOptions',
				    width       : w_prim,
				    allowBlank  : false,
				    listeners       : {
						    change : 'onCmbHardwareOptionsChange'
				    }   
			    },
			    {
				    xtype       : 'textfield',
				    fieldLabel  : i18n("sMAC_address"),
				    name        : "mac",
				    allowBlank  : false,
				    blankText   : i18n("sSupply_a_value"),
				    vtype       : 'MacAddress',
				    fieldStyle  : 'text-transform:uppercase',
				    width       : w_prim,
				    value       : me.mac
			    },
			    {
	                xtype       : 'tagStaticEntries',
	                meshId      : me.meshId,
	                labelClsExtra : 'lblRd',
	                width       : w_prim
	            },
	            {
	                xtype       : 'cmbInternetConnection',
	                itemId      : 'cmbInternetConnection',
	                width       : w_prim,
	                listeners   : {
			            change : 'onCmbInternetConnectionChange'
				    }   			                
	            },
	            pnlWanStatic,
	            pnlWanPppoe,
	            cntWbW,
	            pnlWifiStatic,
	            pnlWifiPppoe,
	            pnlQmi, 
                {
                    xtype     : 'checkbox',
                    boxLabel  : 'Reboot When Controller Can\'t Be Reached',
                    name      : 'chk_no_controller',
                    itemId    : 'chkNoInternet',
                    fieldLabel: 'Controller Reboot',
                    listeners : {
                        change: 'onChkNoControllerChange'
                    }
                },      
                cntRebootController,
                /*{
                    xtype       : 'checkboxgroup',
                    itemId      : 'check_periodic_reboot',
                    fieldLabel  : 'Daily Reboot',
                    columns     : 1,
                    vertical    : false,
                    items       : [
                        {
                            name      : 'chk_daily_reboot',
                            itemId    : 'chkDailyReboot',
                            margin    : '0 15 0 0',
                            listeners : {
                                change: 'onChkDailyRebootChange' 
                            }
                        }       
                    ]
                },
                cntDailyReboot,*/
                {
                    xtype       : 'checkbox',      
                    fieldLabel  : 'Apply Schedule',
                    name        : 'enable_schedules',
                    inputValue  : '1',
		            itemId		: 'chkEnableSchedules',
                    checked     : false,
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype   : 'panel',
                    itemId  : 'cntSchedule',
                    hidden  : true,
                    disabled: true,
                    bodyStyle   : 'background: #e0ebeb',
                    items   : [
                         {
                            xtype       : 'cmbSchedule',
                            labelClsExtra: 'lblRdReq',
                            width       : w_prim
                        }    
                    ]
                },    
                {
                    xtype       : 'checkbox',
                    name        : 'enable_alerts',
                    boxLabel    : 'Enable Alerts',
                    fieldLabel  : 'Alerts'
                },      
                {
                    xtype       : 'checkbox',
                    name        : 'enable_overviews',
                    fieldLabel  : 'Overviews',
                    boxLabel    : 'Include In Overviews'
                } 
            ]
        };
        
		me.items = [
            {
                xtype       : 'panel',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyStyle   : 'background: #f0f0f5',
                bodyPadding : 10,
                items       : cntTop
            },         
            {
                xtype       : 'panel',
                bodyStyle   : 'background:#f6f6ee',
                layout      : {
                        type    : 'vbox',
                        pack    : 'start',
                        align   : 'middle'
                },
                bodyPadding : 10,
                items       : [
                     {
                        xtype       : 'container',
                        html        : '<h1><span style="color:grey;font-weight:700; font-size: smaller;">RADIOS</span><h1>'
                    },
                    {
                        xtype       : 'container',
                        layout      : {
                            type    : 'hbox',
                            pack    : 'center',
                            align   : 'stretchmax'
                        },
                        items       : [
                            {
                                xtype       : 'pnlNodeRadioDetail',
                                itemId      : 'pnlRadioR0',
                                radio_nr    : 0,
                                hidden      : true,
                                flex        : 1,
                                ui          : 'panel-green'
                            },
                            {
                                xtype       : 'pnlNodeRadioDetail',
                                itemId      : 'pnlRadioR1',
                                radio_nr    : 1,
                                hidden      : true,
                                flex        : 1,
                                ui          : 'panel-green'
                            }
                        ]
                    },
                    {
                        xtype       : 'container',
                        layout      : 'hbox',
                        items       : [
                            {
                                xtype       : 'pnlNodeRadioDetail',
                                itemId      : 'pnlRadioR2',
                                radio_nr    : 2,
                                hidden      : true,
                                flex        : 1,
                                ui          : 'panel-green'
                            }
                        ]
                    }
                ],
                height      : 1400
            }            
        ];     
        me.callParent(arguments);
    }
});
