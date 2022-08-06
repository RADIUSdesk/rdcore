Ext.define('Rd.view.aps.winApUnknownModeChange', {
    extend		: 'Ext.window.Window',
    alias 		: 'widget.winApUnknownModeChange',
    title 		: 'Change Device Mode',
    layout		: 'fit',
    autoShow	: false,
    width		: 450,
    height		: 200,
    glyph		: Rd.config.icnSpanner,
	unknownNodeId   : '',
    new_mode  : '',
    initComponent: function() {
        var me  = this;
        me.items = [
            {
                xtype: 'form',
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
                    labelWidth      : Rd.config.labelWidth,
                    margin          : Rd.config.fieldMargin,
                    labelClsExtra   : 'lblRdReq'    
                },
                defaultType: 'textfield',
                items: [
                     {
			            itemId  	: 'unknown_node_id',
			            xtype   	: 'textfield',
			            name    	: "id",
			            hidden  	: true,
			            value   	: me.unknownNodeId
			        },
			        {
                        xtype       : 'radiogroup',
                        fieldLabel  : 'Mode',
                        columns     : 2,
                        vertical    : false,
                        items       : [
                            {
                                boxLabel  : 'Mesh',
                                name      : 'new_mode',
                                inputValue: 'mesh',
                                margin    : '0 15 0 0',
                                checked   : true
                            }, 
                            {
                                boxLabel  : 'Access Point',
                                name      : 'new_mode',
                                inputValue: 'ap',
                                margin    : '0 0 0 15',
                                checked   : false,
                                disabled  : true
                            }
                        ]
                    } 
                ],
                buttons: [    
                    {
                        itemId  : 'save',
                        text    : i18n('sOK'),
                        scale   : 'large',
                        formBind: true,
                        glyph   : Rd.config.icnYes,
                        margin  : Rd.config.buttonMargin,
                        ui      : 'button-teal'
                    }
                ]
            }
        ];
        this.callParent(arguments);
    }
});
