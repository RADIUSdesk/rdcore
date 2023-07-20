Ext.define('Rd.view.profiles.pnlDataLimit', {
    extend      : 'Ext.panel.Panel',
    glyph       : Rd.config.icnData,
    alias       : 'widget.pnlDataLimit',
    requires    : [
        'Rd.view.profiles.vcDataLimit',
        'Rd.view.components.rdSliderData'
    ],
    controller  : 'vcDataLimit',
    layout      : 'vbox',
    title       : "DATA LIMIT",
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
			    name        : 'data_limit_enabled',
			    itemId      : 'data_limit_enabled',
			  //  value       : 0,
			    listeners   : {
					change  : 'sldrToggleChange'
				}
			},
			{ 
			    xtype       : 'container',
			    itemId      : 'cntDetail',
			    items       : [
                    {
			            xtype       : 'rdSliderData',
			            sliderName  : 'data',
			            minValue    : 1,
                        maxValue    : 999
			        },
			        {
                        xtype       : 'radiogroup',
                        fieldLabel  : 'Reset',
                        labelWidth  : me.labelWidth,
                        itemId      : 'rgrpDataReset',
                        columns     : 3,
                        vertical    : false,
                        width       : me.width,
                        items       : [
                            {
                                boxLabel  : 'Daily',
                                name      : 'data_reset',
                                inputValue: 'daily',
                                margin    : '0 15 0 0',
                                checked   : true
                            }, 
                            {
                                boxLabel  : 'Weekly',
                                name      : 'data_reset',
                                inputValue: 'weekly',
                                margin    : '0 0 0 15'
                            },
                            {
                                boxLabel  : 'Monthly',
                                name      : 'data_reset',
                                inputValue: 'monthly',
                                margin    : '0 0 0 15'
                            },
                            {
                                boxLabel  : 'Never',
                                name      : 'data_reset',
                                inputValue: 'never',
                                margin    : '0 15 0 0'   
                            },
                            {
                                boxLabel  : 'Top-Up',
                                name      : 'data_reset',
                                inputValue: 'top_up',
                                margin    : '0 0 0 15'   
                            }
                        ],
                        listeners   : {
					        change  : 'rgrpDataResetChange'
				        }
                    },
                    {
                        xtype   : 'panel',
                        itemId  : 'pnlDataTopUp',
                        hidden  : true,
                        bodyStyle   : 'background: #fff1b3',
                        html    : "<h3 style='text-align:center;color:#876f01'>Top-Up Amount is Per User</h3>",
                        width   : me.width-30,
                        margin  : 10
                    },
                    {
                        xtype       : 'radiogroup',
                        fieldLabel  : 'Type',
                        labelWidth  : me.labelWidth,
                        itemId      : 'rgrpDataCap',
                        columns     : 2,
                        vertical    : false,
                        items       : [
                            {
                                boxLabel  : 'Hard',
                                name      : 'data_cap',
                                inputValue: 'hard',
                                margin    : '0 15 0 0',
                                checked   : true
                            }, 
                            {
                                boxLabel  : 'Soft',
                                name      : 'data_cap',
                                inputValue: 'soft',
                                margin    : '0 0 0 15'
                            }
                        ]
                    },
                    {
                        xtype       : 'checkbox',
                        itemId      : 'chkDataMac',
                        boxLabel    : 'Apply Limit Per Device (For Click-To-Connect)',
                        name        : 'data_limit_mac',
                        margin      : '0 0 0 15'
                    }
                ]
            }
        ];       
        this.callParent(arguments);
    }
});
