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
        me.width    = 750;
        me.padding  = '0 0 10 0';
        me.items    = [
			{
			    xtype       : 'sldrToggle',
			    fieldLabel  : 'Enabled',
			    userCls     : 'sldrDark',
			    name        : 'fup_enabled',
			    itemId      : 'fup_enabled',
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
			            sliderName  : 'fup_upload',
			            fieldLabel  : "<i class='fa fa-arrow-up'></i> Up"
			        },
                    {
			            xtype       : 'rdSliderSpeed',
			            sliderName  : 'fup_download',
			            fieldLabel  : "<i class='fa fa-arrow-down'></i> Down",
			        },
                    {
                        xtype       : 'checkbox',
                        itemId      : 'chkBurstEnable',
                        fieldLabel  : 'Enable Bursting',
                        name        : 'fup_bursting_on',
                        margin      : '0 0 0 15'
                    },
                    {
                        xtype       : 'numberfield',
                        fieldLabel  : 'Burst Limit(%)',
                        value       : 100,
                        maxValue    : 200,
                        minValue    : 1,
                        name        : 'fup_burst_limit',
                        hideTrigger : true,
                        disabled    : true,
                        itemId      : 'nrFupBurstLimit'
                    },
                    {
                        xtype       : 'numberfield',
                        fieldLabel  : 'Burst Time (Seconds)',
                        value       : 100,
                        maxValue    : 600,
                        minValue    : 1,
                        name        : 'fup_burst_time',
                        hideTrigger : true,
                        disabled    : true,
                        itemId      : 'nrFupBurstTime'
                    },
                    {
                        xtype       : 'numberfield',
                        fieldLabel  : 'Burst Threshold(%)',
                        value       : 100,
                        maxValue    : 200,
                        minValue    : 1,
                        name        : 'fup_burst_threshold',
                        hideTrigger : true,
                        disabled    : true,
                        itemId      : 'nrFupBurstThreshold'
                    },
                    {
			            xtype       : 'textfield',
			            fieldLabel  : 'IP Pool (Optional)',
			            name        : 'fup_ip_pool',
			            allowBlank  : true,
			            blankText   : i18n("sSupply_a_value")
		            },
		            {
                        xtype       : 'numberfield',
                        fieldLabel  : 'VLAN Nr(Optional)',
                        maxValue    : 4094,
                        minValue    : 1,
                        name        : 'fup_vlan',
                        hideTrigger : true
                    },
                    {
                        xtype       : 'cmbSessionLimit',
                        labelClsExtra: 'lblRd'
                    }
                ]
            }
        ];       
        this.callParent(arguments);
    }
});
