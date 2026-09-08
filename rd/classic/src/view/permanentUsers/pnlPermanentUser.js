Ext.define('Rd.view.permanentUsers.pnlPermanentUser', {
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlPermanentUser',
    layout      : {
        type    : 'vbox',
        align   : 'stretch'
    },
    pu_id       : null,
    pu_name     : null,
    record      : null, //We will supply each instance with a reference to the selected record.
    controller  : 'vcPermanentUser',
    requires    : [
        'Rd.view.permanentUsers.pnlPermanentUserBasic',
        'Rd.view.permanentUsers.pnlPermanentUserPersonal',
        'Rd.view.components.cntNavigation',
        'Rd.view.permanentUsers.vcPermanentUser'
    ],
    initComponent: function(){
        var me      = this;        
         me.items = [ 
            {
                xtype   : 'cntNavigation',
                margin  : 0,
                padding : 5,
                url     : '/cake4/rd_cake/permanent-users/nav-user-edit.json'
            },
            {
                xtype   : 'container',
                layout  : 'card',
                itemId  : 'crdPermanentUser',
                flex    : 1,
                items   : [ 
                    {   
                        itemId  : 'tabBasicInfo',
                        xtype   : 'pnlPermanentUserBasic',
                        record  : me.record  
                    },
                    {   
                        itemId      : 'tabPersonalInfo',
                        xtype       : 'pnlPermanentUserPersonal',
                        selLanguage : me.selLanguage 
                    }, 
                    { 
                        layout  : 'fit',
                        xtype   : 'gridUserDevices',
                        itemId  : 'tabDevices',  
                        user_id : me.pu_id,
                        username: me.pu_name
                    },
                    { 
                        itemId  : 'tabPrivateAttributes',
                        layout  : 'fit',
                        xtype   : 'gridUserPrivate',  
                        username: me.pu_name
                    },
                    { 
                        itemId  : 'tabAuthData',
                        layout  : 'fit',
                        xtype   : 'gridUserRadpostauths',  
                        username: me.pu_name
                    },
                    { 
                        itemId  : 'tabAcctData', 
                        layout  : 'fit',
                        xtype   : 'gridUserRadaccts',
                        username: me.pu_name
                    }
                ]
            }
        ];
        me.callParent(arguments);
    }
});
