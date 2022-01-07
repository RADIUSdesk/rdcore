Ext.define('Rd.view.profiles.pnlSpeedLimit', {
    extend      : 'Ext.panel.Panel',
    glyph       : Rd.config.icnSpeed,
    alias       : 'widget.pnlSpeedLimit',
    requires    : [
        'Rd.view.profiles.vcSpeedLimit',
        'Rd.view.components.rdSlider'
    ],
    controller  : 'vcSpeedLimit',
    layout      : { type: 'vbox'},
    //layout      : { type: 'vbox', align: 'center' },
    title       : "SPEED LIMIT",
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
			    name        : 'speed_limit_enabled',
			    itemId      : 'speed_limit_enabled',
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
			            sliderName  : 'speed_upload_amount',
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
                                name      : 'speed_upload_unit',
                                inputValue: 'kbps',
                                margin    : '0 15 0 0',
                                checked   : true
                            }, 
                            {
                                boxLabel  : 'Mb/s',
                                name      : 'speed_upload_unit',
                                inputValue: 'mbps',
                                margin    : '0 0 0 0'
                            }
                        ]
                    },
                    {
			            xtype       : 'rdSlider',
			            sliderName  : 'speed_download_amount',
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
                                name      : 'speed_download_unit',
                                inputValue: 'kbps',
                                margin    : '0 15 0 0',
                                checked   : true
                            }, 
                            {
                                boxLabel  : 'Mb/s',
                                name      : 'speed_download_unit',
                                inputValue: 'mbps',
                                margin    : '0 0 0 0'
                            }
                        ]
                    }
                ]
            }
        ];       
        this.callParent(arguments);
    }
});
