Ext.define('Rd.view.meshes.winMeshEditMacBlock', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winMeshEditMacBlock',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Block MAC Address',
    width       : 500,
   // height      : 370,
    height      : 350,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnBan,
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
					xtype		: 'radiogroup',
					columns		: 2,
					fieldLabel  : 'Scope',
					vertical	: false,
					items		: [
						{ boxLabel: 'Cloud Wide', name: 'scope', inputValue: 'cloud_wide' },
						{ boxLabel: 'Mesh Only',  name: 'scope', inputValue: 'network_only', checked: true}
					]
				},
                {
                    xtype       : 'checkbox',      
                    boxLabel    : 'Remove Block',
                    name        : 'remove_block',
                    inputValue  : 'remove_block',
                    itemId      : 'chkRemoveBlock',
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
