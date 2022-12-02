Ext.define('Rd.view.profiles.pnlPppoe', {
    extend      : 'Ext.panel.Panel',
    glyph       : Rd.config.icnSpeed,
    alias       : 'widget.pnlPppoe',
    requires    : [
        'Rd.view.profiles.vcPppoe',
        'Rd.view.components.rdSliderSpeed'
    ],
    controller  : 'vcPppoe',
    layout      : { type: 'vbox'},
    title       : "SPEED LIMITS",
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
			            xtype       : 'rdSliderSpeed',
			            sliderName  : 'pppoe_upload',
			            fieldLabel  : "<i class='fa fa-arrow-up'></i> Up"
			        },
                    {
			            xtype       : 'rdSliderSpeed',
			            sliderName  : 'pppoe_download',
			            fieldLabel  : "<i class='fa fa-arrow-down'></i> Down",
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
