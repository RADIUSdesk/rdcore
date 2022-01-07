Ext.define('Rd.view.aps.winApEditMacAlias', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winApEditMacAlias',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Alias for MAC Address',
    width       : 500,
   // height      : 370,
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
                    xtype       : 'displayfield',
                    value       : me.mac+' ('+me.vendor+')',
                    fieldCls    : 'blue_round'
                },
                {
                    name        : 'alias',
                    fieldLabel  : 'Alias',
                    allowBlank  : false,
                    value       : me.alias,
                    blankText   : 'Specify An Unique Alias',
                    itemId      : 'txtAlias',
                    margin      : Rd.config.fieldMargin +5
                },
               /* {
                    xtype       : 'checkbox',      
                    boxLabel    : i18n('sAlso_show_to_sub_providers'),
                    name        : 'available_to_siblings',
                    inputValue  : 'available_to_siblings',
                    itemId      : 'chkAtoS',
                    checked     : false,
                    cls         : 'lblRd',
                    margin      : Rd.config.fieldMargin +5
                },*/
                {
                    xtype       : 'checkbox',      
                    boxLabel    : 'Remove Alias',
                    name        : 'remove_alias',
                    inputValue  : 'remove_alias',
                    itemId      : 'chkRemoveAlias',
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
