Ext.define('AmpConf.view.login.cntLogin', {
    extend      : 'Ext.Container',
    xtype       : 'cntLogin',
    controller  : 'vcLogin',
    cls: 'auth-login',

    layout: {
        type: 'vbox',
        align: 'center',
        pack: 'center'
    },

    items: [{
        cls: 'auth-header',
        html:
            '<span class="logo x-fa fa-'+AmpConf.config.title_fa+'"></span>'+
            '<div class="title">'+AmpConf.config.title+'</div>'+
            '<div class="caption">'+AmpConf.config.sub_title+'</div>'
    }, {
        xtype: 'formpanel',
        reference: 'form',
        layout: 'vbox',
        ui: 'auth',
        
        items: [
            {
                xtype: 'tabpanel',
                height: 150,
                items: [
                    {
                        title: 'User',
                        padding: 10,
                        items: [
                            {
                                xtype: 'textfield',
                                name: 'username',
                                placeholder: 'Username'
                            }
                        ]
                    },
                    {
                        title: 'Voucher',
                        padding: 10,
                        items: [
                            {
                                xtype       : 'textfield',
                                name        : 'voucher',
                                placeholder : 'Vouchername'
                            }
                        ]
                    }
                ]
            },
            {
                xtype       : 'button',
                reference   : 'button',
                text        : 'CHECK USAGE',
                iconAlign   : 'right',
                iconCls     : 'x-fa fa-angle-right',
                handler     : 'onLoginTap',
                ui          : 'action',
                disabled    : true
            } 
          /*  {
                xtype: 'textfield',
                name: 'username',
                placeholder: 'Username',
                required: true
            }, {
                xtype: 'passwordfield',
                name: 'password',
                placeholder: 'Password',
                required: true
            },
            {
                xtype       : 'button',
                reference   : 'button',
                text        : 'LOG IN',
                iconAlign   : 'right',
                iconCls     : 'x-fa fa-angle-right',
                handler     : 'onLoginTap',
                ui          : 'action',
                disabled    : true
            } */
        ]
    }, {
        cls: 'auth-footer',
        html:
            '<div>'+AmpConf.config.motto+'</div>'+
            '<a href="'+AmpConf.config.website+'" target="_blank">'+
                '<span class="logo x-fa fa-globe"></span>'+
                '<span class="label">'+AmpConf.config.website_text+'</span>'+
            '</a>'
    }]
});
