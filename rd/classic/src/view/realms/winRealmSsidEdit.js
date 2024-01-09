Ext.define('Rd.view.realms.winRealmSsidEdit', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winRealmSsidEdit',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Edit SSID',
    width       : 500,
    height      : 250,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnEdit,
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
                    name        : 'id',
                    xtype       : 'textfield',
                    hidden      : true
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
        frmData.loadRecord(me.sr);     
    }
});
