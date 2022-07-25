Ext.define('Rd.view.meshes.winMeshUnknownRedirect', {
    extend		: 'Ext.window.Window',
    alias 		: 'widget.winMeshUnknownRedirect',
    title 		: 'Redirect To Another Server',
    layout		: 'fit',
    autoShow	: false,
    width		: 450,
    height		: 300,
    glyph		: Rd.config.icnRedirect,
	unknownNodeId   : '',
    new_server  : '',
    new_server_protocol : 'https',
    initComponent: function() {
        var me  = this;
        
        var http_on     = false;
        var https_on    = true;
        
        if(me.new_server_protocol == 'http'){
            http_on     = true;
            https_on    = false;
        }
        
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
			            xtype       : 'textfield',
			            fieldLabel  : 'Server FQDN',
			            name        : "new_server",
			            allowBlank  : false,
			            blankText   : i18n('sSupply_a_value'),
                        value       : me.new_server
			        },
			        {
                        xtype       : 'radiogroup',
                        fieldLabel  : 'Server Protocol',
                        columns     : 2,
                        vertical    : false,
                        items       : [
                            {
                                boxLabel  : 'HTTP',
                                name      : 'new_server_protocol',
                                inputValue: 'http',
                                margin    : '0 15 0 0',
                                checked   : http_on
                            }, 
                            {
                                boxLabel  : 'HTTPS',
                                name      : 'new_server_protocol',
                                inputValue: 'https',
                                margin    : '0 0 0 15',
                                checked   : https_on
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
