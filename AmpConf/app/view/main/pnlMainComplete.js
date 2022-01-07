Ext.define('AmpConf.view.main.pnlMainComplete', {
    extend  : 'Ext.Panel',
    xtype   : 'pnlMainComplete',
    title   : 'Action Completed',
    controller  : 'vcMain',
    layout  : {
        type    : 'vbox',
        align   : 'center',
        pack    : 'center'
    },
    items: [
        {
            xtype   : 'container',
            padding     : 10,
            margin      : 10,
            html    : ['The device is now attached to the network.<br>\
                Within the next 5 minutes the device will reboot and reconfigure itself to reflect the settings of the chosen network<br>' 
            ]
            
        }
    ]
});
