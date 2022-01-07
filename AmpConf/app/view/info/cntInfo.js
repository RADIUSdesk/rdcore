Ext.define('AmpConf.view.info.cntInfo', {
    extend  : 'Ext.Panel',
    xtype   : 'cntInfo',
    title   : 'INFO',
    controller  : 'vcInfo',
    layout  : {
        type    : 'vbox',
        align   : 'center',
        pack    : 'center'
    },
    items       : [
        {
            xtype       : 'container',
            padding     : 10,
            margin      : 10,
            html        : [ 
                'You see this screen since the device you connected to still needs to be configured<br>\
                In order to configure the device you first need to log in with a valid username and password<br>\
                If you are not registered as an Access Provider please contact your hardware supplier for more information.'
            ]
        }    
    ],
    buttons: [
        {
            xtype       : 'button',
            reference   : 'btnBack',
            text        : 'Back',
            iconAlign   : 'right',
            iconCls     : 'x-fa fa-angle-left',
            handler     : 'onBackTap',
            ui          : 'normal'
        }
    ]
});
