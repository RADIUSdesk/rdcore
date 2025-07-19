Ext.define('Rd.view.realms.cntRealmNaiRealms', {
    extend      : 'Ext.container.Container',
    alias       : 'widget.cntRealmNaiRealms',
    layout      : 'hbox',
    margin      : 0,
    mode        : 'add',
    count       : 1,
    nai_name    : '',
    initComponent: function(){
        var me      = this;
        var name    = 'nai_realm_'+me.mode+'_'+me.count;
        me.items = [
            {
                xtype       : 'textfield',
                emptyText   : 'Nai Realm',
                name        : name,
                value       : me.nai_name,
                allowBlank  : false,
                margin      : 10,
                width       : 480
            },
            {   
                xtype       : 'button',
                margin      : '10 0 0 0',
                tooltip     : 'Delete Nai Realm',
                glyph       : Rd.config.icnDelete,
                listeners   : {
                    click  : 'btnDelNaiRealm'
                }
            } 
        ];

        me.callParent(arguments);
    }
});

