Ext.define('Rd.view.meshes.winMeshEditMacLimit', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winMeshEditMacLimit',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Speed Limit for MAC Address',
    width       : 500,
   // height      : 370,
    height      : 350,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnSpeed,
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
                margin          : Rd.config.fieldMargin
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
                    xtype       : 'checkbox',      
                    boxLabel    : 'Remove Limit',
                    name        : 'remove_limit',
                    inputValue  : 'remove_limit',
                    itemId      : 'chkRemoveLimit',
                    checked     : false,
                    cls         : 'lblRd',
                    margin      : Rd.config.fieldMargin +5
                }
            ]
        });
        me.items = frmData; 
        me.callParent(arguments);
    }
});
