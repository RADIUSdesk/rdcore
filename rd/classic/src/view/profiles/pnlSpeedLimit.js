Ext.define('Rd.view.profiles.pnlSpeedLimit', {
    extend      : 'Ext.panel.Panel',
    glyph       : Rd.config.icnSpeed,
    alias       : 'widget.pnlSpeedLimit',
    requires    : [
        'Rd.view.profiles.vcSpeedLimit',
        'Rd.view.components.rdSliderSpeed'
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
			            xtype       : 'rdSliderSpeed',
			            sliderName  : 'speed_upload',
			            fieldLabel  : "<i class='fa fa-arrow-up'></i> Up"
			        },
                    {
			            xtype       : 'rdSliderSpeed',
			            sliderName  : 'speed_download',
			            fieldLabel  : "<i class='fa fa-arrow-down'></i> Down",
			        }
                ]
            }
        ];       
        this.callParent(arguments);
    }
});
