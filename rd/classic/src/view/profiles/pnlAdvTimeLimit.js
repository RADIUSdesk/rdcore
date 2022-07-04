Ext.define('Rd.view.profiles.pnlAdvTimeLimit', {
    extend      : 'Ext.panel.Panel',
    glyph       : Rd.config.icnTime,
    alias       : 'widget.pnlAdvTimeLimit',
    requires    : [
        'Rd.view.profiles.vcAdvTimeLimit',
        'Rd.view.components.rdSlider'
    ],
    controller  : 'vcAdvTimeLimit',
    layout      : { type: 'vbox'},
    //layout      : { type: 'vbox', align: 'center' },
    title       : "ADVANCED TIME LIMIT",
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
			    name        : 'adv_time_limit_enabled',
			    itemId      : 'adv_time_limit_enabled',
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
			            sliderName  : 'adv_time_amount',
			            fieldLabel  : "Amount",
                        minValue    : 1,
                        maxValue    : 120
			        },
                    {
                        xtype       : 'radiogroup',
                        fieldLabel  : 'Units',
                        itemId      : 'rgrpTimeUnit',
                        columns     : 3,
                        vertical    : false,
                        items       : [
                            {
                                boxLabel  : 'Minutes',
                                name      : 'adv_time_unit',
                                inputValue: 'min',
                                margin    : '0 15 0 0',
                                checked   : true
                            }, 
                            {
                                boxLabel  : 'Hours',
                                name      : 'adv_time_unit',
                                inputValue: 'hour',
                                margin    : '0 0 0 0'
                            }
                        ]
                    },
                    {
			            xtype       : 'rdSlider',
			            itemId      : 'sldrTimePerDay',
			            sliderName  : 'adv_time_per_day',
			            fieldLabel  : "Sessions/Day",
			            minValue    : 1,
                        maxValue    : 10
			        },
			        {
			            xtype       : 'rdSlider',
			            itemId      : 'sldrTimePerMonth',
			            sliderName  : 'adv_time_per_month',
			            fieldLabel  : "Sessions/Month",
			            minValue    : 1,
                        maxValue    : 120
			        }
                ]
            }
        ];       
        this.callParent(arguments);
    }
});
