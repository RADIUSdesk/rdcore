Ext.define('Rd.view.aps.winApAttachAp', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winApAttachAp',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Attach Device to Profile',
    width       : 400,
    height      : 450,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnAttach,
    autoShow    : false,
    defaults: {
            border: false
    },
    requires: [
        'Ext.tab.Panel',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Rd.view.aps.cmbApHardwareModels'
    ],
     initComponent: function() {
        var me 		= this; 	
        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'fit',
            defaults: {
                anchor: '100%'
            },
            itemId:     'scrnData',
            autoScroll: true,
            fieldDefaults: {
                msgTarget       : 'under',
                labelClsExtra   : 'lblRd',
                labelAlign      : 'left',
                labelSeparator  : '',
                labelWidth      : Rd.config.labelWidth,
                maxWidth        : Rd.config.maxWidth, 
                margin          : Rd.config.fieldMargin
            },
            defaultType: 'textfield',
            buttons : [
                {
                    itemId: 'saveAttach',
                    text: i18n("sOK"),
                    scale: 'large',
                    formBind: true,
                    glyph   : Rd.config.icnYes,
                    margin  : Rd.config.buttonMargin
                }
            ],
            items: [

				{
                    xtype   : 'tabpanel',
                    layout  : 'fit',
                    xtype   : 'tabpanel',
                    margins : '0 0 0 0',
                    plain   : false,
                    tabPosition: 'bottom',
                    border  : false,
                    items   : [
                        { 
                            'title'     : 'Basic',
                            'layout'    : 'anchor',
                            glyph       : Rd.config.icnStar,
                            itemId      : 'tabRequired',
                            defaults    : {
                                anchor: '100%'
                            },
                            autoScroll:true,
                            items       : [
                                {
						            itemId  	: 'rem_unknown', //This post value indicates it is an Attach event..
						            xtype   	: 'textfield',
						            name    	: "rem_unknown",
						            hidden  	: true,
						            value   	: 'rem_unknown'
						        },
							//	cmb,
						        {
						            xtype       : 'textfield',
						            fieldLabel  : i18n("sMAC_address"),
						            name        : "mac",
						            allowBlank  : false,
						            blankText   : i18n("sSupply_a_value"),
						            labelClsExtra: 'lblRdReq',
						            vtype       : 'MacAddress',
						            fieldStyle  : 'text-transform:lowercase',
						            value       : me.mac
						        },
						        {
						            xtype       : 'textfield',
						            fieldLabel  : i18n("sName"),
						            name        : "name",
						            allowBlank  : false,
						            blankText   : i18n("sSupply_a_value"),
						            labelClsExtra: 'lblRdReq'
						        },
						        {
						            xtype       : 'textfield',
						            fieldLabel  : i18n("sDescription"),
						            name        : "description",
						            allowBlank  : true,
						            labelClsExtra: 'lblRd'
						        },
						        {
						            xtype           : 'cmbApHardwareModels',
						            labelClsExtra   : 'lblRdReq',
						            allowBlank      : false 
						        }     
                            ]
                        }
                    ]
                }                      
            ]
        });
        me.items = frmData;
        me.callParent(arguments);
    }
});
