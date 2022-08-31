Ext.define('Rd.view.profiles.pnlFup', {
    extend      : 'Ext.panel.Panel',
    glyph       : 'xf2b5@FontAwesome',
    alias       : 'widget.pnlFup',
    requires    : [
        'Rd.view.profiles.vcFup',
        'Rd.view.components.rdSlider'
    ],
    controller  : 'vcFup',
    layout      : { type: 'vbox'},
    title       : "FUP",
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
			        
                ]
            }
        ];       
        this.callParent(arguments);
    }
});
