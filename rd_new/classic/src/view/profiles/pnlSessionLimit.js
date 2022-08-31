Ext.define('Rd.view.profiles.pnlSessionLimit', {
    extend      : 'Ext.panel.Panel',
    glyph       : Rd.config.icnListOl,
    alias       : 'widget.pnlSessionLimit',
    requires    : [
        'Rd.view.profiles.vcSessionLimit',
        'Rd.view.components.rdSlider'
    ],
    controller  : 'vcSessionLimit',
    layout      : { type: 'vbox'},
    title       : "LIMIT SESSIONS",
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
			    name        : 'session_limit_enabled',
			    itemId      : 'session_limit_enabled',
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
			            sliderName  : 'session_limit',
			            fieldLabel  : "Amount",
                        minValue    : 1,
                        maxValue    : 120
			        }			        
                ]
            }
        ];       
        this.callParent(arguments);
    }
});
