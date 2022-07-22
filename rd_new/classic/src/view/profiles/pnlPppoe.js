Ext.define('Rd.view.profiles.pnlPppoe', {
    extend      : 'Ext.panel.Panel',
    glyph       : Rd.config.icnSpeed,
    alias       : 'widget.pnlPppoe',
    requires    : [
        'Rd.view.profiles.vcPppoe',
        'Rd.view.components.rdSlider'
    ],
    controller  : 'vcPppoe',
    layout      : { type: 'vbox'},
    title       : "PPPoE LIMITS",
    initComponent: function(){
        var me      = this;
        var w_sec   = 350;
        var w_rd    = 68;
        me.width    = 550;
        me.padding  = 5;
        me.items    = [
			{
			    xtype       : 'sldrToggle',
			    fieldLabel  : 'Enabled',
			    userCls     : 'sldrDark',
			    name        : 'pppoe_enabled',
			    itemId      : 'pppoe_enabled',
			    value       : 1,
			    listeners   : {
					change  : 'sldrToggleChange'
				}
			},
			{ 
			    xtype       : 'container',
			    itemId      : 'cntDetail',
			    items       : [
			        {
			            xtype       : 'rdSlider',
			            sliderName  : 'pppoe_upload_amount',
			            fieldLabel  : "<i class='fa fa-arrow-up'></i> Up Amount"
			        },
                    {
                        xtype       : 'radiogroup',
                        fieldLabel  : "<i class='fa fa-arrow-up'></i> Up Unit",
                        itemId      : 'rgrpSpeedUploadUnit',
                        columns     : 2,
                        vertical    : false,
                        items       : [
                            {
                                boxLabel  : 'Kb/s',
                                name      : 'pppoe_upload_unit',
                                inputValue: 'kbps',
                                margin    : '0 15 0 0',
                                checked   : true
                            }, 
                            {
                                boxLabel  : 'Mb/s',
                                name      : 'pppoe_upload_unit',
                                inputValue: 'mbps',
                                margin    : '0 0 0 0'
                            }
                        ]
                    },
                    {
			            xtype       : 'rdSlider',
			            sliderName  : 'pppoe_download_amount',
			            fieldLabel  : "<i class='fa fa-arrow-down'></i> Down Amount",
			        },
                    {
                        xtype       : 'radiogroup',
                        fieldLabel  : "<i class='fa fa-arrow-down'></i> Down Unit",
                        itemId      : 'rgrpSpeedDownloadUnit',
                        columns     : 2,
                        vertical    : false,
                        items       : [
                            {
                                boxLabel  : 'Kb/s',
                                name      : 'pppoe_download_unit',
                                inputValue: 'kbps',
                                margin    : '0 15 0 0',
                                checked   : true
                            }, 
                            {
                                boxLabel  : 'Mb/s',
                                name      : 'pppoe_download_unit',
                                inputValue: 'mbps',
                                margin    : '0 0 0 0'
                            }
                        ]
                    },
                    {
                        xtype       : 'checkbox',
                        itemId      : 'chkBurstEnable',
                        fieldLabel  : 'Enable Bursting',
                        name        : 'pppoe_bursting_on',
                        margin      : '0 0 0 15'
                    },
                    {
                        xtype       : 'numberfield',
                        fieldLabel  : 'Burst Limit(%)',
                        value       : 100,
                        maxValue    : 1,
                        minValue    : 200,
                        name        : 'pppoe_burst_limit',
                        hideTrigger : true,
                        disabled    : true
                    },
                    {
                        xtype       : 'numberfield',
                        fieldLabel  : 'Burst Time (Seconds)',
                        value       : 100,
                        maxValue    : 1,
                        minValue    : 600,
                        name        : 'pppoe_burst_time',
                        hideTrigger : true,
                        disabled    : true
                    },
                    {
                        xtype       : 'numberfield',
                        fieldLabel  : 'Burst Threshold(%)',
                        value       : 100,
                        maxValue    : 1,
                        minValue    : 200,
                        name        : 'pppoe_burst_threshold',
                        hideTrigger : true,
                        disabled    : true
                    }
                ]
            }
        ];       
        this.callParent(arguments);
    }
});
