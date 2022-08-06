Ext.define('Rd.view.aps.pnlAccessPointDetail', {
   extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlAccessPointDetail',
    border      : false,
    plain       : true,
    title       : 'More Info',
    collapsible : true,
    collapsed   : true,
    width       : 300,
    layout      : 'fit',
    initComponent: function() {
        var me      = this;
        me.callParent(arguments);
    },
    items       : [ 
        {
            layout  : 'fit',
            xtype   : 'tabpanel',
            margins : '0 0 0 0',
            plain   : true,
            tabPosition: 'bottom',
            border  : false,
            items   :  [
                {
                    title       : "Connected",
                    html        : "bla"
                },
                { 
                    title       : "Device health",
                    html        : "Nee"
                }      
            ]
        }       
    ]
});
