Ext.define('Rd.view.dynamicDetails.pnlDynamicDetailMobileApp', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlDynamicDetailMobileApp',
    autoScroll	: true,
    plain       : true,
    frame       : false,
    layout      : {
        type    : 'vbox',
        pack    : 'start',
        align   : 'stretch'
    },
    margin      : 5,
    dynamic_detail_id: null,
    defaults    : {
            border: false
    },
    fieldDefaults: {
        msgTarget       : 'under',
        labelAlign      : 'left',
        labelSeparator  : '',
        labelWidth      : Rd.config.labelWidth+20,
        margin          : Rd.config.fieldMargin,
        labelClsExtra   : 'lblRdReq'
    },
    requires: [
        'Ext.form.field.Text',
        'Rd.view.dynamicDetails.vcDynamicDetailMobileApp'
    ],
    controller  : 'vcDynamicDetailMobileApp',
    listeners   : {
        activate : 'onViewActivate'
    },
    url: '/cake3/rd_cake/dynamic-detail-translations/get-pnl-content.json',
    buttons : [
        {
            itemId  : 'save',
            text    : 'SAVE',
            scale   : 'large',
            formBind: true,
            glyph   : Rd.config.icnYes,
            margin  : Rd.config.buttonMargin,
            ui      : 'button-teal'
        }
    ],
    initComponent: function(){

        var me      = this;
        var w_prim  = 550;
        var w_sec   = 350;
        var w_chk   = 200; 
      
                
        var cntTop  = {
            xtype       : 'container',
            items       : [              
                
                {
	                xtype       : 'checkbox',
	                fieldLabel  : 'Mobile App Only',
	                name        : "mobile_only",
	                width       : w_prim,
	                itemId      : 'chkMobileOnly'
                },
                {
                    xtype           : 'htmleditor',
                    fieldLabel      : 'Non-Mobile Description',
                    width           : '99%',
                    height          : 250,
                    name            : "content",
                    labelClsExtra   : 'lblRdReq',
                    allowBlank      : false
                }       
            ]
        };      
        me.items = [
            {
                xtype       : 'panel',
                title       : "General",
                glyph       : Rd.config.icnGears, 
                ui          : 'panel-blue',
                layout      : 'fit',
                items       : cntTop,
                bodyPadding : 10
            }, 
            {
                xtype       : 'panel',
                title       : "Android Application Settings",
                glyph       : Rd.config.icnAndroid, 
                ui          : 'panel-green',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : [
                    {
		                xtype       : 'checkbox',
		                fieldLabel  : 'Include',
		                name        : "android_enable",
		                itemId      : 'chkAndroidEnable',
		                width       : w_prim
	                },                   
                    {
			            xtype       : 'textfield',
			            fieldLabel  : 'href',
			            name        : "android_href",
			            itemId      : "txtAndroidHref",
			            emptyText   : 'Example: intent://scan/#Intent;scheme=zxing;package=com.google.zxing.client.android;end',
			            value       : 'intent://scan/#Intent;scheme=zxing;package=com.google.zxing.client.android;end',
			            allowBlank  : false,
			            blankText   : i18n("sSupply_a_value"),
			            width       : w_prim,
			            disabled    : true
		            },
		            {
			            xtype       : 'textfield',
			            fieldLabel  : 'Link Text',
			            name        : "android_text",
			            value       : "Install / Lanuch App",
			            itemId      : "txtAndroidLink",
			            allowBlank  : false,
			            blankText   : i18n("sSupply_a_value"),
			            width       : w_prim,
			            disabled    : true
		            },
		            {
                        xtype           : 'htmleditor',
                        fieldLabel      : 'Description',
                        width           : '99%',
                        height          : 250,
                        name            : "android_content",
                        itemId          : 'editAndroidContent',
                        labelClsExtra   : 'lblRdReq',
                        allowBlank      : false,
                        disabled        : true
                    }  
                ]
            },
            {
                xtype       : 'panel',
                title       : "Apple Application Settings",
                glyph       : Rd.config.icnApple, 
                ui          : 'panel-green',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : [
                    {
		                xtype       : 'checkbox',
		                fieldLabel  : 'Include',
		                name        : "apple_enable",
		                itemId      : 'chkAppleEnable',
		                width       : w_prim
	                 },
                     {
			            xtype       : 'textfield',
			            fieldLabel  : 'href',
			            name        : "apple_href",
			            itemId      : "txtAppleHref",
			            allowBlank  : false,
			            blankText   : i18n("sSupply_a_value"),
			            width       : w_prim,
			            disabled    : true
		            },
		            {
			            xtype       : 'textfield',
			            fieldLabel  : 'Link Text',
			            name        : "apple_text",
			            value       : "Install / Lanuch App",
			            itemId      : "txtAppleLink",
			            allowBlank  : false,
			            blankText   : i18n("sSupply_a_value"),
			            width       : w_prim,
			            disabled    : true
		            },
		            {
                        xtype           : 'htmleditor',
                        fieldLabel      : 'Description',
                        width           : '99%',
                        height          : 250,
                        name            : "apple_content",
                        itemId          : 'editAppleContent',
                        labelClsExtra   : 'lblRdReq',
                        allowBlank      : false,
                        disabled        : true
                    }                     
                ]
            }
        ]; 
        
        me.buttons = [
            {
                itemId  : 'save',
                text    : 'SAVE',
                scale   : 'large',
                formBind: true,
                glyph   : Rd.config.icnYes,
                margin  : Rd.config.buttonMargin,
                ui      : 'button-teal'
            }
        ];
                    
        me.callParent(arguments);
    }
});
