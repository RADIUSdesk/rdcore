Ext.define('Rd.view.aps.pnlApRadioDetail', {
    extend      : 'Ext.panel.Panel',
    glyph       : Rd.config.icnWifi,
    alias       : 'widget.pnlApRadioDetail',
    requires    : [
        'Rd.view.aps.vcApRadioDetail'
    ],
    radio_nr    : 0,
    controller  : 'vcApRadioDetail',
    layout      : 'vbox',
    initComponent: function(){
        var me      = this;
        var w_sec   = 350;
        var w_rd    = 68;
        me.width    = 550;
        me.padding  = 5;
        me.title    = "RADIO "+me.radio_nr;   
        var radio_nr= "radio"+me.radio_nr;
        var w_rb    = 75;
        
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
			    xtype       : 'hiddenfield',
			    name        : radio_nr +'_band',
			    itemId      : 'band',
			    listeners   : {
			        change  : 'onBandChange'
		        }
			},
			{
			    xtype       : 'hiddenfield',
			    name        : radio_nr +'_mode',
			    itemId      : 'mode',
			    listeners   : {
			        change  : 'onModeChange'
		        }
			},
			{ 
			    xtype       : 'container',
			    itemId      : 'cntDetail',
			    items       : [
			        {
				        xtype       : 'cmbTwoGigChannels',
				        name        : radio_nr+'_channel_two',
				        hidden		: true,
				        disabled	: true,
				        inclAuto    : true,
				        width       : w_sec,
				        itemId		: 'numRadioTwoChan'
			        },
			        {
				        xtype       : 'cmbFiveGigChannels',
				        name        : radio_nr+'_channel_five',
				        hidden		: true,
				        disabled	: true,
				        width       : w_sec,
				        itemId		: 'numRadioFiveChan'
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
                                width     : w_rb
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
                        xtype       : 'checkbox',
                        boxLabel    : 'Noscan',
                        name        : radio_nr +'_noscan',
                        margin      : '0 0 0 15'
                    },
                    {
                        xtype       : 'checkbox',
                        boxLabel    : 'Include Beacon Interval',
                        name        : radio_nr +'_include_beacon_int',
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
                    }     
                ]
            }
        ];       
        
        this.callParent(arguments);
    }
});
