Ext.define('Rd.view.realms.winRealmSsidAdd', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winRealmSsidAdd',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Add SSID',
    width       : 500,
    height      : 300,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnAdd,
    autoShow    :   false,
    defaults: {
            border: false
    },
    initComponent: function() {
        var me      = this;
                    
        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'anchor',
            autoScroll: true,
            defaults: {
                anchor: '100%'
            },
            fieldDefaults: {
                msgTarget       : 'under',
                labelClsExtra   : 'lblRd',
                labelAlign      : 'left',
                labelSeparator  : '',
                labelClsExtra   : 'lblRd',
                margin          : Rd.config.fieldMargin,
                labelWidth		: 150
            },
            defaultType: 'textfield',
            buttons: [
                {
                    itemId      : 'save',
                    formBind    : true,
                    text        : 'SAVE',
                    scale       : 'large',
                    glyph       : Rd.config.icnYes,
                    margin      : Rd.config.buttonMargin,
                    ui          : 'button-teal'
                }
            ],
            items: [
                 {
                    name        : 'realm_id',
                    xtype       : 'textfield',
                    hidden      : true,
                    value       : me.realm_id
                },                  
                {
                    name        : 'name',
                    xtype       : 'textfield',
                    fieldLabel  : 'Name',
                    itemId      : 'txtName',
                    allowBlank  : true,
                    labelClsExtra   : 'lblRdReq'
                }   
            ]
        });
        me.items = frmData; 
        me.callParent(arguments);     
    }
});
