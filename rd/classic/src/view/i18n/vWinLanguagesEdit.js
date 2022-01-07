Ext.define('Rd.view.i18n.vWinLanguagesEdit', {
    extend:     'Ext.window.Window',
    alias :     'widget.editLanguagesW',
    closable:   true,
    draggable:  false,
    resizable:  false,
    title:      'Edit Languages',
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
        var scrnEditLanguage  = me.mkScrnEditLanguage();
        var scrnEditLanguageDo= me.mkScrnEditLanguageDo();
        this.items = [
            scrnEditLanguage,
            scrnEditLanguageDo
        ];
        this.callParent(arguments);
    },

    //____
    mkScrnEditLanguage: function(){
        //itemId's of interest
        //scrnEditLanguage 
        //btnEditLanguageNext

        //First a panel which we'll add the instructions to 
        var pnlMsg = Ext.create('Ext.container.Container',{
            border: false,
            baseCls: 'regMsg',
            html: "Select a language to edit",
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
                        itemId: 'btnEditLanguageNext',
                        text:   'Next',
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
            itemId: 'scrnEditLanguage',
            items: [
                pnlMsg,
                pnlFrm
            ] 
        });
        return pnl;
    },

    //____
    mkScrnEditLanguageDo: function(){
        //itemId's of interest
        //scrnEditKeyDo 
        //btnEditKeyDoPrev      
        //btnEditKeyDoNext 

       //First a panel which we'll add the instructions to 
        var pnlMsg = Ext.create('Ext.container.Container',{
            border: false,
            baseCls: 'regMsg',
            html: "Supply the following detail please",
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
                    fieldLabel: 'Language name',
                    itemId: 'inpNewCountry',
                    allowBlank: false,
                    emptyText: 'language name',
                    blankText:"Specify a valid name for the language",
                    textValid: true, 
                    validator: function(){
                        return this.textValid;  
                    }
                },
                {
                    name: 'iso_code',
                    fieldLabel: 'ISO code',
                    itemId: 'inpNewIso',
                    allowBlank: false,
                    emptyText: 'eg pt or de',
                    blankText:"Specify a valid iso language code",
                    textValid: true, 
                    validator: function(){
                        return this.textValid;  
                    }
                }
            ],
            buttons: [
                    {
                        itemId:     'btnEditLanguageDoPrev',
                        text:       'Prev',
                        scale:      'large',
                        iconCls:    'b-prev',
                        glyph: Rd.config.icnBack,
                        margin:     '0 20 40 0'
                    },
                    {
                        itemId:     'btnEditLanguageDoNext',
                        text:       'Next',
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
            itemId: 'scrnEditLanguageDo',
            items: [
                pnlMsg,
                pnlFrm
            ] 
        });
        return pnl;
    }
});
