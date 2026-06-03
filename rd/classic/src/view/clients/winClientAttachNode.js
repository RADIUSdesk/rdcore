Ext.define('Rd.view.clients.winClientAttachNode', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winClientAttachNode',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Attach Nodes',
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
        'Rd.view.clients.tagClientNodes'
    ],
    initComponent: function() {
        var me      = this;
        
        //Set the combo
        var tagClientNodes = Ext.create('Rd.view.clients.tagClientNodes',{
            labelClsExtra   : 'lblRdReq'
        });
 
        tagClientNodes.getStore().getProxy().setExtraParam('client_id',me.clientId);
        tagClientNodes.getStore().load();
                          
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
                labelWidth		: 80
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
                tagClientNodes,
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
