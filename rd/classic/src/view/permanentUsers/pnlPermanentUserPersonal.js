Ext.define('Rd.view.permanentUsers.pnlPermanentUserPersonal', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlPermanentUserPersonal',
    autoScroll	: true,
    plain       : true,
    frame       : false,
    layout      : {
        type    : 'vbox',
        pack    : 'start',
        align   : 'stretch'
    },
    margin      : 5,  
    ap_id       : null,
    fieldDefaults: {
        msgTarget       : 'under',
        labelAlign      : 'left',
        labelSeparator  : '',
        labelWidth      : Rd.config.labelWidth+20,
        margin          : Rd.config.fieldMargin,
        labelClsExtra   : 'lblRdReq'
    },
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
           
        var cntRequired  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sName'),
                    name        : "name",
                    allowBlank  :true
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sSurname'),
                    name        : "surname",
                    allowBlank  :true
                },
                { 
                    xtype       : 'cmbLanguages', 
                    width       : 350, 
                    fieldLabel  : i18n('sLanguage'),  
                    name        : 'language',
                    value       : me.selLanguage,
                    allowBlank  : false,
                    labelClsExtra: 'lblRd' 
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sPhone'),
                    name        : "phone",
                    allowBlank  :true
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : i18n('s_email'),
                    name        : "email",
                    allowBlank  :true
                },
                {
                    xtype       : 'textareafield',
                    grow        : true,
                    name        : 'address',
                    fieldLabel  : i18n('sAddress'),
                    anchor      : '100%'
                }
            ]
        }
              
        me.items = [
            {
                xtype       : 'panel',
                title       : "Personal Information",
                glyph       : Rd.config.icnUser,
                ui          : 'panel-green',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntRequired				
            }
        ];    
        me.callParent(arguments);
    }
});
