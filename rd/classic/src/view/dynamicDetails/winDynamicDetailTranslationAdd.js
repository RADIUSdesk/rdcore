Ext.define('Rd.view.dynamicDetails.winDynamicDetailTranslationAdd', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winDynamicDetailTranslationAdd',
    closable    : true,
    title       : 'Add Phrase',
    width       : 600,
    height      : 510,
    plain       : true,
    border      : false,
    layout      : 'card',
    record      : null,
    firstTime   : true,
    glyph       : Rd.config.icnAdd,
    dynamic_detail_id : null, 
    defaults    : {
            border: false
    },
    requires: [
        'Ext.layout.container.Card',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Ext.form.FieldContainer',
        'Ext.form.field.Radio',
        'Rd.view.dynamicDetails.cmbDynamicTransKeys'
    ],
    initComponent: function() {
        var me = this;
        var scrnNewKey  = me.mkScrnNewKey();
        this.items = [
            scrnNewKey
        ];
        this.callParent(arguments);
    },
    mkScrnNewKey: function(){
        var me = this;
        //A form which allows the user to select
        var pnlFrm = Ext.create('Ext.form.Panel',{
            layout  : 'anchor',
            border  : false,
            autoScroll:true,
            frame   : false,
            defaults    : {
                anchor: '100%'
            },
            fieldDefaults: {
                msgTarget: 'under',
                labelClsExtra: 'lblRd',
                labelAlign: 'left',
                labelSeparator: '',
                margin: Rd.config.fieldMargin,
                labelWidth: Rd.config.labelWidth
            },
            defaultType: 'textfield',
            items: [
                 {
                    xtype           : 'textfield',
                    name            : "id",
                    hidden          : true,
                    itemId          : 'id'
                },
                {
                    xtype       : 'displayfield',
                    value       : 'NEW ENTRY',
                    fieldCls    : 'green_round',
                    itemId      : 'dispNew'
                },
                {
                    xtype       : 'displayfield',
                    value       : 'EXISTING ITEM',
                    fieldCls    : 'blue_round',
                    itemId      : 'dispExist',
                    hidden      : true
                },
                { fieldLabel: 'Add Multiple', name: 'multiple', inputValue: 'multiple', checked: true, itemId: 'chkMultiple',
                    xtype: 'checkbox' 
                },          
                {
                    xtype       : 'cmbDynamicDetailTransPages',
                    value       : me.dynamic_detail_id,
                    listeners   : {
				        change      : 'onCmbDynamicDetailChangeX',
				        beforerender: 'onCmbDynamicDetailBeforeShowX'
				    }
                },
                {
                    xtype       : 'cmbDynamicTransKeys',
                    listeners   : {
				        change : 'onCmbDynamicTransKeysChangeX'
				    }
                },
                {
                    xtype       : 'cmbDynamicLanguages',
                    listeners       : {
				        change : 'onCmbDynamicLanguagesChangeX'
				    }  
                },
                {
                    xtype     : 'textareafield',
                    grow      : true,
                    allowBlank: false,
                    name      : 'value',
                    fieldLabel: 'Phrase',
                    itemId    : 'txtPhrase',
                    anchor    : '100%'
                }
            ],
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
            ]
        });
        
        if(me.record){
            pnlFrm.loadRecord(me.record);
        }
        return pnlFrm;
    }
});
