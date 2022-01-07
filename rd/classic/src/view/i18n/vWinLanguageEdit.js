Ext.define('Rd.view.i18n.vWinLanguageEdit', {
    extend:     'Ext.window.Window',
    alias :     'widget.vWinLanguageEdit',
    closable:   true,
    draggable:  false,
    resizable:  false,
    title:      i18n('sEdit_Languages'),
    width:      380,
    height:     380,
    plain:      true,
    border:     false,
    layout:     'card',
    iconCls:    'edit',
    glyph: Rd.config.icnEdit,
    defaults: {
            border: false
    },
    requires: [
        'Ext.layout.container.Card',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Rd.view.components.vCmbJustLanguages'
    ],
     initComponent: function() {
        var me = this;
        var scrnLanguageEdit  = me.mkScrnLanguageEdit();
        var scrnLanguageEditDo= me.mkScrnLanguageEditDo();
        this.items = [
            scrnLanguageEdit,
            scrnLanguageEditDo
        ];
        this.callParent(arguments);
    },

    //____
    mkScrnLanguageEdit: function(){
        //itemId's of interest
        //scrnLanguageEdit 
        //btnLanguageNextNext

        //First a panel which we'll add the instructions to 
        var pnlMsg = Ext.create('Ext.container.Container',{
            border: false,
            baseCls: 'regMsg',
            html: i18n("sSelect_a_language_to_edit"),
            width: '100%'
        });

        //A form which allows the user to select
        var pnlFrm = Ext.create('Ext.form.Panel',{
            border: false,
            layout: 'anchor',
            width: '100%',
            flex: 1,
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
                   xtype: 'cmbJustLanguages'
                }
            ],
            buttons: [
                    {
                        itemId: 'btnLanguageEditNext',
                        text:   i18n('sNext'),
                        scale:  'large',
                        formBind:true,
                        margin: '0 20 40 0',
                        iconCls:'b-next',
                        glyph: Rd.config.icnNext
                    }
                ]
        });

        //We pack the two and add a next button
        var pnl =  Ext.create('Ext.panel.Panel',{
            layout: 'vbox',
            border: false,
            itemId: 'scrnLanguageEdit',
            items: [
                pnlMsg,
                pnlFrm
            ] 
        });
        return pnl;
    },

    //____
    mkScrnLanguageEditDo: function(){
        //itemId's of interest
        //scrnEditKeyDo 
        //btnEditKeyDoPrev      
        //btnEditKeyDoNext 

       //First a panel which we'll add the instructions to 
        var pnlMsg = Ext.create('Ext.container.Container',{
            border: false,
            baseCls: 'regMsg',
            html: i18n("sSupply_the_following_detail_please"),
            width: '100%'
        });

        //A form which allows the user to select
        var pnlFrm = Ext.create('Ext.form.Panel',{
            border: false,
            layout: 'anchor',
            width: '100%',
            flex: 1,
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
                    textValid: true,
                    maskRe : /[a-z]/i,
                    minLength : 2, 
                    maxLength : 2,
                    fieldStyle: 'text-transform:lowercase',
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
                        itemId:     'btnLanguageEditDoPrev',
                        text:       i18n('sPrev'),
                        scale:      'large',
                        iconCls:    'b-prev',
                        glyph: Rd.config.icnBack,
                        margin:     '0 20 40 0'
                    },
                    {
                        itemId:     'btnLanguageEditDoNext',
                        text:       i18n('sNext'),
                        scale:      'large',
                        formBind:   true,
                        iconCls:    'b-next',
                        glyph: Rd.config.icnNext,
                        action:     'save',
                        margin:     '0 20 40 0'
                    }
                ]
        });

        //We pack the two and add a next button
        var pnl =  Ext.create('Ext.panel.Panel',{
            layout: 'vbox',
            border: false,
            itemId: 'scrnLanguageEditDo',
            items: [
                pnlMsg,
                pnlFrm
            ] 
        });
        return pnl;
    }
});
