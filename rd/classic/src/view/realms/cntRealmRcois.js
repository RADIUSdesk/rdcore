Ext.define('Rd.view.realms.cntRealmRcois', {
    extend  : 'Ext.container.Container',
    alias   : 'widget.cntRealmRcois',
    layout  : 'hbox',
    margin  : 0,
    mode    : 'add',
    count   : 1,
    rcoi_name   : '',
    rcoi_id     : '',
    initComponent: function(){
        var me      = this;
        me.items = [
            {
                xtype       : 'textfield',
                emptyText   : 'Name',
                value       : me.rcoi_name,
                allowBlank  : false,
                name        : 'rcoi_name_'+me.mode+'_'+me.count,
                margin      : 10,
            },
            {
                xtype       : 'textfield',
                emptyText   : 'Organization ID (RCIO)',
                value       : me.rcoi_id,
                allowBlank  : false,
                name        : 'rcoi_id_'+me.mode+'_'+me.count,
                width       : 290,
                margin      : 10,
            }, 
            {   
                xtype       : 'button',
                margin      : '10 0 0 0',
                tooltip     : 'Delete RCOI',
                glyph       : Rd.config.icnDelete,
                listeners   : {
                    click  : 'btnDelRcoi'
                }
            } 
        ];

        me.callParent(arguments);
    }
});

