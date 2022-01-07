Ext.define('Rd.view.dynamicDetails.winDynamicLanguageAdd', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winDynamicLanguageAdd',
    closable    : true,
    title       : i18n('sAdd_Language'),
    width       : 380,
    height      : 420,
    plain       : true,
    border      : false,
    layout      : 'card',
    glyph       : Rd.config.icnAdd,
    defaults: {
            border: false
    },
    requires: [
        'Ext.layout.container.Card',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Ext.form.FieldContainer',
        'Ext.form.field.Radio'
    ],
     initComponent: function() {
        var me = this;
        var scrnNewLanguage = me.mkScrnNewLanguage();
        this.items = [
            scrnNewLanguage
        ];
        this.callParent(arguments);
    },
    
    mkScrnNewLanguage: function(){

        //A form which allows the user supply their email address
        var pnlFrm = Ext.create('Ext.form.Panel',{
            border: false,
            layout: 'anchor',
            width: '100%',
            flex: 1,
            overflowY: 'auto',
            bodyPadding: 10,
            defaults: {
                    anchor: '100%'
            },
            fieldDefaults: {
                    msgTarget: 'under',
                    labelClsExtra: 'lblRd',
                    labelAlign: 'top',
                    labelSeparator: '',
                    margin: 15
            },
            defaultType: 'textfield',
            items: [
                {
                    name: 'name',
                    fieldLabel: i18n('sLanguage'),
                    itemId: 'inpNewCountry',
                    allowBlank: false,
                    emptyText: i18n('sLanguage'),
                    blankText: i18n("sSpecify_a_valid_name_please"),
                    textValid: true, 
                    validator: function(){
                        return this.textValid;  
                    }
                },
                {
                    name: 'iso_code',
                    fieldLabel: i18n('sISO_code'),
                    itemId: 'inpNewIso',
                    allowBlank: false,
                    emptyText: i18n('seg_pt_or_de'),
                    blankText: i18n("sSpecify_a_valid_iso_language_code"),
                    maskRe : /[a-z]/i,
                    minLength : 2, 
                    maxLength : 2,
                    fieldStyle: 'text-transform:lowercase',
                    textValid: true, 
                    validator: function(){
                        return this.textValid;  
                    }
                },
                {
                    xtype     : 'checkbox',      
                    boxLabel  : i18n('sRight_to_left'),
                    name      : 'rtl',
                    inputValue: 'rtl',
                    checked   : false
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

        return pnlFrm;
    }
});
