Ext.define('Rd.view.dynamicDetails.winDynamicLanguageDel', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winDynamicLanguageDel',
    closable    : true,
    title       : i18n('sDelete_language'),
    width       : 400,
    height      : 250,
    plain       : true,
    border      : false,
    layout      : 'card',
    glyph       : Rd.config.icnDelete, 
    requires    : [
        'Rd.view.dynamicDetails.cmbDynamicLanguages'
    ],
    items: [
        {   
            xtype: 'form',
            border: false,
            layout: 'anchor',
            width: '100%',
            flex: 1,
            defaults: {
                    anchor: '100%'
            },
            fieldDefaults: {
                msgTarget       : 'under',
                labelClsExtra   : 'lblRd',
                labelAlign      : 'top',
                labelSeparator  : '',
                margin          : 15
            },
            items: [
                {
                    xtype       : 'cmbDynamicLanguages',
                    listeners       : {
				        change : 'onCmbDynamicLanguagesChange'
				    }  
                },
                {
                    xtype           : 'textfield',
                    name            : "id",
                    hidden          : true
                }
            ],
            buttons: [
                {
                    itemId      : 'save',
                    formBind    : true,
                    text        : 'DELETE',
                    scale       : 'large',
                    glyph       : Rd.config.icnDelete,
                    margin      : Rd.config.buttonMargin,
                    ui          : 'button-teal'
                }
            ]
        }
    ],
    defaults: {
            border: false
    },   
    initComponent: function() {
        var me = this;
        this.callParent(arguments);
    }
});
