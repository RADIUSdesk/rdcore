Ext.define('Rd.view.clients.winClientAttachPermanentUser', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winClientAttachPermanentUser',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Attach Permanent Users',
    width       : 500,
    height      : 300,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnAttach,
    autoShow    : false,
    clientId    : '',
    cloudName   : '',
    defaults: {
            border: false
    },
    requires: [
        'Rd.view.components.btnCommon',
        'Rd.view.clients.tagClientPermanentUsers'
    ],
    initComponent: function() {
        var me      = this;
        
        //Set the combo
        var tagClientPermanentUsers = Ext.create('Rd.view.clients.tagClientPermanentUsers',{
            labelClsExtra   : 'lblRdReq'
        });
 
        tagClientPermanentUsers.getStore().getProxy().setExtraParam('client_id',me.clientId);
        tagClientPermanentUsers.getStore().load();
                          
        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'anchor',
            defaults: {
                anchor      : '100%'
            },
            fieldDefaults: {
                msgTarget       : 'under',
                labelClsExtra   : 'lblRd',
                labelAlign      : 'left',
                labelSeparator  : '',
                labelClsExtra   : 'lblRd',
                margin          : Rd.config.fieldMargin,
                labelWidth		: 120
            },
            defaultType: 'textfield',
            buttons: [{xtype: 'btnCommon'}],
            items: [
                {
                    xtype       : 'displayfield',
                    fieldLabel  : 'Cloud',
                    value       : me.cloudName,
                    labelClsExtra: 'lblRdReq'
                },
                tagClientPermanentUsers,
                {
                    name        : 'id',
                    xtype       : 'textfield',
                    hidden      : true,
                    value       : me.clientId
                }                                            
            ]
        });
        me.items = frmData; 
        me.callParent(arguments);
    }
});
