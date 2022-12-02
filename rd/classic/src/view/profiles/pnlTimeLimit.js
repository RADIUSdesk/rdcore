Ext.define('Rd.view.profiles.pnlTimeLimit', {
    extend      : 'Ext.panel.Panel',
    glyph       : Rd.config.icnTime,
    alias       : 'widget.pnlTimeLimit',
    requires    : [
        'Rd.view.profiles.vcTimeLimit',
        'Rd.view.components.rdSliderTime'
    ],
    controller  : 'vcTimeLimit',
    layout      : { type: 'vbox'},
    //layout      : { type: 'vbox', align: 'center' },
    title       : "TIME LIMIT",
    initComponent: function(){
        var me      = this;
        var w_sec   = 350;
        var w_rd    = 68;
        me.width    = 550;
        me.padding  = 5;
        me.labelWidth = 60,
        me.items    = [
			{
			    xtype       : 'sldrToggle',
			    fieldLabel  : 'Enabled',
			    userCls     : 'sldrDark',
			    name        : 'time_limit_enabled',
			    itemId      : 'time_limit_enabled',
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
			            xtype       : 'rdSliderTime',
			            sliderName  : 'time',
			            fieldLabel  : "Amount",
                        minValue    : 1,
                        maxValue    : 120
			        },
			        {
                        xtype       : 'radiogroup',
                        fieldLabel  : 'Reset',
                        labelWidth  : me.labelWidth,
                        itemId      : 'rgrpTimeReset',
                        columns     : 3,
                        vertical    : false,
                        width       : me.width,
                        items       : [
                            {
                                boxLabel  : 'Daily',
                                name      : 'time_reset',
                                inputValue: 'daily',
                                margin    : '0 15 0 0',
                                checked   : true
                            }, 
                            {
                                boxLabel  : 'Weekly',
                                name      : 'time_reset',
                                inputValue: 'weekly',
                                margin    : '0 0 0 15'
                            },
                            {
                                boxLabel  : 'Monthly',
                                name      : 'time_reset',
                                inputValue: 'monthly',
                                margin    : '0 0 0 15'
                            },
                            {
                                boxLabel  : 'Never',
                                name      : 'time_reset',
                                inputValue: 'never',
                                margin    : '0 15 0 0'   
                            },
                            {
                                boxLabel  : 'Top-Up',
                                name      : 'time_reset',
                                inputValue: 'top_up',
                                margin    : '0 0 0 15'   
                            }
                        ],
                        listeners   : {
					        change  : 'rgrpTimeResetChange'
				        }
                    },
                    {
                        xtype       : 'panel',
                        itemId      : 'pnlTimeTopUp',
                        hidden      : true,
                        bodyStyle   : 'background: #fff1b3',
                        html        : "<h3 style='text-align:center;color:#876f01'>Top-Up Amount is Per User</h3>",
                        width       : me.width-30,
                        margin      : 10
                    },
                    {
                        xtype       : 'radiogroup',
                        fieldLabel  : 'Type',
                        labelWidth  : me.labelWidth,
                        itemId      : 'rgrpTimeCap',
                        columns     : 2,
                        vertical    : false,
                        items       : [
                            {
                                boxLabel  : 'Hard',
                                name      : 'time_cap',
                                inputValue: 'hard',
                                margin    : '0 15 0 0',
                                checked   : true
                            }, 
                            {
                                boxLabel  : 'Soft',
                                name      : 'time_cap',
                                inputValue: 'soft',
                                margin    : '0 0 0 15'
                            }
                        ]
                    },
                    {
                        xtype       : 'checkbox',
                        itemId      : 'chkTimeMac',
                        boxLabel    : 'Apply Limit Per Device (For Click-To-Connect)',
                        name        : 'time_limit_mac',
                        margin      : '0 0 0 15'
                    }
                ]
            }
        ];       
        this.callParent(arguments);
    }
});
