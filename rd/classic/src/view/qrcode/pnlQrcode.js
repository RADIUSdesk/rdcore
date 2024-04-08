Ext.define('Rd.view.qrcode.pnlQrcode', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlQrcode',
    autoScroll	: true,
    plain       : false,
    frame       : true,
    layout      : {
        type    : 'vbox',
        pack    : 'start',
        align   : 'stretch'
    },
    margin      : 5,
    fieldDefaults: {
        msgTarget       : 'under',
        labelAlign      : 'left',
        labelSeparator  : '',
        labelWidth      : Rd.config.labelWidth,
        margin          : Rd.config.fieldMargin,
        labelClsExtra   : 'lblRdReq',
        defaultType     : 'textfield'
    },
    buttons : [
        {
            itemId  : 'pdf',
            text    : 'PDF Out',
            scale   : 'large',
            formBind: true,
            glyph   : Rd.config.icnPdf,
            margin  : Rd.config.buttonMargin,
            ui      : 'button-teal'
        },
     /*   {
            itemId  : 'svg',
            text    : 'SVG Out',
            scale   : 'large',
            formBind: true,
            glyph   : Rd.config.icnQrcode,
            margin  : Rd.config.buttonMargin,
            ui      : 'button-teal'
        },
        {
            itemId  : 'png',
            text    : 'PNG Out',
            scale   : 'large',
            formBind: true,
            glyph   : Rd.config.icnQrcode,
            margin  : Rd.config.buttonMargin,
            ui      : 'button-teal'
        }*/
    ],
    requires: [
        'Rd.view.qrcode.vcQrcode'
    ],
    controller  : 'vcQrcode',
    initComponent: function(){
        var me 	 = this;
        
                
		me.items = [{
			xtype		: 'panel',
			layout      : {
				type    : 'hbox',
				pack    : 'start',
				align   : 'stretch'
			},		
		    items: [
				{
				    xtype		: 'textfield',
				    fieldLabel	: 'Network Name',
				    anchor		: '-5',
				    name		: 'ssid',
				    allowBlank  : false,
				    emptyText   : 'SSID',
				    value       : 'Sub-Eynsham-909'
				}, 
				 {
                    xtype       : 'checkbox',      
                    boxLabel    : 'Hidden',
                    name        : 'hidden',
                    boxLabelCls	: 'boxLabelRd'
                }
		    ]
		}, 
		{
			xtype		: 'panel',
			layout      : {
				type    : 'hbox',
				pack    : 'start',
				align   : 'stretch'
			},	
		    items: [
				{
				    xtype		: 'textfield',
				    itemId      : 'txtKey',
				    fieldLabel	: 'Password / Key',
				    disabled    : true,
				    anchor		: '-5',
				    name		: 'key',
				    allowBlank  : false,
				    minLength   : 8,
				    value       : '11223344'
				}	    
		    ]
		},
		{
			xtype		: 'panel',
			layout      : {
				type    : 'hbox',
				pack    : 'start',
				align   : 'stretch'
			},	
		    items: [
		    	{
                    xtype       : 'radiogroup',
                    fieldLabel  : 'Encryption',
                    itemId      : 'rgrpEncryption',
                    columns     : 3,
                    vertical    : true,
                    //width       : 400,
                    items: [
                        { boxLabel: 'None',     name: 'encryption', inputValue: 'none', checked: true, width: 100,margin: 0, },
                        { boxLabel: 'WEP',      name: 'encryption', inputValue: 'wep' , width: 100, margin : 0  },
                        { boxLabel: 'WPA/WPA2', name: 'encryption', inputValue: 'wpa' , width: 100, margin : 0  }
                    ]
                }
		    ]
		},
		{
			xtype		: 'panel',
			itemId		: 'pnlResult',
			bodyStyle   : 'background: #fff',
			flex		: 1,
			tpl			: new Ext.XTemplate(
                "<div style='background-color:white; padding:5px;'>",
                    '{output}',
                "</div>"
            ),
            autoScroll  :true,
            data		: {}
        }
		];
                              
        me.callParent(arguments);
    }
});
