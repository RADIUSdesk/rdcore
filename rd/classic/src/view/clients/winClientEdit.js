Ext.define('Rd.view.clients.winClientEdit', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winClientEdit',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Edit Client',
    width       : 450,
    height      : 350,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnEdit,
    autoShow    :   false,
    defaults: {
            border: false
    },
    requires: [
    ],
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
                    name        : 'username',
                    xtype       : 'textfield',
                    fieldLabel  : 'Username (email)',
                    allowBlank  : false,
                    blankText   : 'Specify an email address',
                    margin      : Rd.config.fieldMargin +5,
                    labelClsExtra   : 'lblRdReq'
                },
                {
                    name        : 'password',
                    xtype       : 'textfield',
                    fieldLabel  : 'Password',
                    allowBlank  : false,
                    blankText   : 'Specify a password',
                    margin      : Rd.config.fieldMargin +5,
                    labelClsExtra   : 'lblRdReq'
                },    
                {
                    name        : 'id',
                    xtype       : 'textfield',
                    hidden      : true
                }    
            ]
        });
        me.items = frmData;    
        me.callParent(arguments);     
        frmData.loadRecord(me.sr);
    }
});
