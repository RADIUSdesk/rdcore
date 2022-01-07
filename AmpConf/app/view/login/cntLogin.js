Ext.define('AmpConf.view.login.cntLogin', {
    extend      : 'Ext.Container',
    xtype       : 'cntLogin',
    controller  : 'vcLogin',
    layout      : {
        type        : 'vbox',
        align       : 'center',
        pack        : 'center'
    },
    requires: [
        'Ext.field.Password'
    ],

    items       : [
        {
            xtype       : 'formpanel',
            reference   : 'form',
            width       : 256,
            height      : 230,
            layout      : 'vbox',
     //       title       : 'AUTHENTICATE PLEASE',
     //       border      : true,
            defaults: {
                errorTarget : 'under',
                margin      : 5
            },

            items   : [{
                xtype       : 'textfield',
                name        : 'username',
                placeholder : 'Username',
                required    : true
            }, {
                xtype       : 'passwordfield',
                name        : 'password',
                placeholder : 'Password',
                required    : true 
            }
        ],
        buttons : [  
            {
                xtype       : 'button',
                reference   : 'btnInfo',
                text        : 'Info',
                iconAlign   : 'right',
                iconCls     : 'x-fa fa-info',
                handler     : 'onInfoTap',
                ui          : 'normal'
            },
            '->',
             {
                xtype       : 'button',
                reference   : 'button',
                text        : 'LOG IN',
                iconAlign   : 'right',
                iconCls     : 'x-fa fa-angle-right',
                handler     : 'onLoginTap',
                ui          : 'action',
                disabled    : true
            }
        ]
    }]
});
