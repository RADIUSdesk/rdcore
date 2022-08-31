Ext.define('Rd.view.hardwares.pnlRadioDetail', {
    extend      : 'Ext.panel.Panel',
    glyph       : Rd.config.icnWifi,
    alias       : 'widget.pnlRadioDetail',
    requires    : [
        'Rd.view.hardwares.vcRadioDetail'
    ],
    radio_nr    : 0,
    controller  : 'vcRadioDetail',
    layout      : 'vbox',
    initComponent: function(){
        var me      = this;
        var w_sec   = 350;
        me.width    = 550;
        me.padding  = 5;    
        var w_rb    = 75;
        
        var radio_nr    = "radio_"+me.radio_nr;
         
        me.items    = [
			{
			    xtype       : 'sldrToggle',
			    fieldLabel  : 'Enabled',
			    userCls     : 'sldrDark',
			    name        : radio_nr +'_enabled',
			    itemId      : radio_nr +'_enabled',
			    value       : 1,
			    listeners   : {
					change  : 'sldrToggleChange'
				}
			},
			{
			    xtype       : 'hiddenfield',
			    name        : radio_nr +'_disabled',
			    itemId      : radio_nr +'_disabled'
			},
			{ 
			    xtype       : 'container',
			    itemId      : 'cntDetail',
			    items       : [
			        {
                        xtype       : 'radiogroup',
                        itemId      : radio_nr+'_radio_band',
                        fieldLabel  : 'Frequency',
                        columns     : 2,
                        vertical    : false,
                        items       : [
                            {
                                boxLabel  : '2.4G',

                                name      : radio_nr +'_band',
                                inputValue: '2g',
                                margin    : '0 0 0 0',
                                width     : w_rb,
                                checked   : true
                            }, 
                            {
                                boxLabel  : '5G',
                                name      : radio_nr +'_band',
                                inputValue: '5g',
                                margin    : '0 0 0 0',
                                width     : w_rb
                            }
                        ],
                        listeners   : {
					        change  : 'rgrpFreqChange'
				        }
                    },
                    {
                        xtype       : 'radiogroup',
                        fieldLabel  : 'Mode',
                        itemId      : 'rgrpMode',
                        columns     : 5,
                        vertical    : false,
                        items       : [
                            {
                                boxLabel  : 'A',
                                name      : radio_nr +'_mode',
                                itemId    : 'radio_mode_a',
                                inputValue: 'a',
                                margin    : '0 0 0 0',
                                hidden    : true,
                                width     : w_rb
                            },
                            {
                                boxLabel  : 'G',
                                name      : radio_nr +'_mode',
                                itemId    : 'radio_mode_g',
                                inputValue: 'g',
                                margin    : '0 0 0 0',
                                width     : w_rb
                            },
                            {
                                boxLabel  : 'N',
                                name      : radio_nr +'_mode',
                                itemId    : 'radio_mode_n',
                                inputValue: 'n',
                                margin    : '0 0 0 0',
                                checked   : true,
                                width     : w_rb
                            },
                            { 
                                boxLabel  : 'AC',
                                name      : radio_nr +'_mode',
                                itemId    : 'radio_mode_ac',
                                inputValue: 'ac',
                                margin    : '0 0 0 0',
                                hidden    : true,
                                width     : w_rb
                            },
                            { 
                                boxLabel  : 'AX',
                                name      : radio_nr +'_mode',
                                itemId    : 'radio_mode_ax',
                                inputValue: 'ax',
                                margin    : '0 0 0 0',
                                width     : w_rb
                            }
                        ],
                        listeners   : {
					        change  : 'rgrpModeChange'
				        }
                    },
			        {
                        xtype       : 'radiogroup',
                        fieldLabel  : 'Width',
                        itemId      : 'rgrpWidth',
                        columns     : 4,
                        vertical    : false,
                        items       : [
                            {
                                boxLabel  : '20MHz',
                                name      : radio_nr +'_width',
                                itemId    : 'radio_width_20',
                                inputValue: '20',
                                margin    : '0 0 0 0',
                                width     : w_rb,
                                checked   : true
                            }, 
                            {
                                boxLabel  : '40MHz',
                                name      : radio_nr +'_width',
                                itemId    : 'radio_width_40',
                                inputValue: '40',
                                margin    : '0 0 0 0',
                                width     : w_rb
                            },
                            { 
                                boxLabel  : '80MHz',
                                name      : radio_nr +'_width',
                                itemId    : 'radio_width_80',
                                inputValue: '80',
                                hidden    : true,
                                margin    : '0 0 0 0',
                                width     : w_rb
                            },
                            {
                                boxLabel  : '160MHz',
                                name      : radio_nr +'_width',
                                itemId    : 'radio_width_160',
                                inputValue: '160',
                                hidden    : true,
                                margin    : '0 0 0 0',
                                width     : w_rb
                            }
                        ]
                    },
                    {
			            xtype       : 'container',
                        layout      : 'hbox',
                        width       : w_sec+15,
                        items       : [
                            {
                                xtype       : 'displayfield',
                                width       : 180,
                                margin      : '15 0 0 15',
                                padding     : 0,
                                fieldLabel  : 'TX Power(dBm)',
                                value       : 0
                            },
                            {
			                    xtype       : 'sliderfield',
                                name        : radio_nr +'_txpower',
                                userCls     : 'sldrDark',
                                itemId      : 'sldrPower',
                                width       : 150,
                                increment   : 1,
                                minValue    : 0,
                                maxValue    : 30,
                                listeners   : {
					                change  : 'sldrPowerChange'
				                }
                            }
                        ]
                    },
                    {
                        xtype       : 'checkbox',
                        boxLabel    : 'Include Beacon Interval',
                        name        : radio_nr +'_include_beacon_int',
                        inputValue  : radio_nr +'_include_beacon_int',
                        margin      : '0 0 0 15',
                        listeners   : {
			                change  : 'OnChkIncludeBeaconIntervalChange'
		                }
                    },
                    {
			            xtype       : 'numberfield',
			            anchor      : '100%',
			            name        : radio_nr +'_beacon_int',
			            itemId      : 'nfBeaconInterval',
			            fieldLabel  : 'Beacon Interval',
			            value       : 100,
			            hidden      : true,
			            disabled    : true,
			            maxValue    : 65535,
			            minValue    : 15
			        },
			        {
                        xtype       : 'checkbox',
                        boxLabel    : 'Include Distance',
                        name        : radio_nr +'_include_distance',
                        inputValue  : radio_nr +'_include_distance',
                        margin      : '0 0 0 15',
                        listeners   : {
			                change  : 'OnChkIncludeDistanceChange'
		                }
                    },
                    {
			            xtype       : 'numberfield',
			            anchor      : '100%',
			            name        : radio_nr +'_distance',
			            itemId      : 'nfDistance',
			            hidden      : true,
			            disabled    : true,
			            fieldLabel  : 'Distance',
			            value       : 300,
			            maxValue    : 3000,
			            minValue    : 1
			        },
                    {
                        xtype       : 'textareafield',
                        grow        : true,
                        fieldLabel  : 'HT Capabilities',
                        name        : radio_nr +'_ht_capab',
                        allowBlank  : true,
                        width       : 400,
                        labelClsExtra: 'lblRd'
                    },     
                    {
                        xtype       : 'checkboxgroup',
                        itemId      : 'check_defaults',
                        fieldLabel  : 'Defaults',
                        labelClsExtra: 'lblRd',
                        columns     : 2,
                        vertical    : false,
                        items       : [
                            {
                                boxLabel  : 'Mesh Interface',
                                width     : 120,
                                name      : radio_nr +'_mesh',
                                margin    : '0 15 0 0'
                            }, 
                            {
                                boxLabel  : 'Access Point',
                                width     : 120,
                                name      : radio_nr +'_ap',
                                margin    : '0 0 0 15'
                            },
                            {
                                boxLabel  : 'Config SSID',
                                width     : 120,
                                name      : radio_nr +'_config',
                                margin    : '0 15 0 0'
                            }
                        ]
                    }
                ]
            }
        ];       
        this.callParent(arguments);
    }
});
