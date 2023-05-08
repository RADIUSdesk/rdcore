Ext.define('Rd.view.meshes.winMeshEditMacLimit', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winMeshEditMacLimit',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Speed Limit for MAC Address',
    width       : 550,
    height      : 430,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnSpeed,
    autoShow    :   false,
    defaults: {
            border: false
    },
    requires    : [
        'Rd.view.components.rdSliderSpeed'
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
						{ boxLabel: 'Cloud Wide', name: 'scope', inputValue: 'cloud_wide', margin: 0  },
						{ boxLabel: 'Mesh Only',  name: 'scope', inputValue: 'network_only', checked: true, margin: 0 }
					]
				},
				{
		            xtype       : 'rdSliderSpeed',
		            sliderName  : 'limit_upload',
		            fieldLabel  : "<i class='fa fa-arrow-up'></i> Up"
		        },
                {
		            xtype       : 'rdSliderSpeed',
		            sliderName  : 'limit_download',
		            fieldLabel  : "<i class='fa fa-arrow-down'></i> Down",
		        },
                {
                    xtype       : 'checkbox',      
                    boxLabel    : 'Remove Limit',
                    name        : 'remove_limit',
                    inputValue  : 'remove_limit',
                    itemId      : 'chkRemoveLimit',
                    checked     : false,
                    boxLabelCls	: 'boxLabelRd',                
                    margin      : Rd.config.fieldMargin
                }
            ]
        });
        me.items = frmData; 
        me.callParent(arguments);
    }
});
