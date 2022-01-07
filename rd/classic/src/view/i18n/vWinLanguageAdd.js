Ext.define('Rd.view.i18n.vWinLanguageAdd', {
    extend:     'Ext.window.Window',
    alias :     'widget.addLanguageW',
    closable:   true,
    draggable:  false,
    resizable:  false,
    title:      i18n('sAdd_Language'),
    width:      380,
    height:     420,
    plain:      true,
    border:     false,
    layout:     'card',
    iconCls:    'add',
    glyph: Rd.config.icnAdd,
    defaults: {
            border: false
    },
    requires: [
        'Ext.layout.container.Card',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Ext.form.FieldContainer',
        'Ext.form.field.Radio',
        'Rd.view.components.vCmbCountries'
    ],
     initComponent: function() {
        var me = this;
        var scrnIntro       = me.mkScrnIntro();
        var scrnNewCountry  = me.mkScrnNewCountry();
        var scrnNewLanguage = me.mkScrnNewLanguage();
        this.items = [
            scrnIntro,
            scrnNewCountry,
            scrnNewLanguage
        ];
        this.callParent(arguments);
    },
    //____ INTRO SCREEN ____

    mkScrnIntro: function(){

        //There are four itemId's of interest
        //scrnIntro         -> The panel displaying the screen
        //btnIntroNext      -> We neet to determine which radio item was selected when this one is clicked
        //radioNewReg       -> New registration
        //radioPassword     -> Password retrieval

        //First a panel which we'll add the instructions to 
        var pnlMsg = Ext.create('Ext.container.Container',{
            border: false,
            baseCls: 'regMsg',
            html: i18n("sSelect_an_existing_country_to_add_a_language_to_fs")+" "+i18n('sAlternatively_choose_to_create_a_new_country_fs'),
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
                {   xtype: 'vCmbCountries'
                },
                {
                    xtype      : 'fieldcontainer',
                    defaultType: 'checkboxfield',
                    defaults: {
                        flex: 1
                    },
                    layout: 'vbox',
                    items: [
                        {
                            boxLabel  : i18n('sCreate_new_country'),
                            name      : 'chkNewCountry',
                            inputValue: '1',
                            itemId    : 'chkNewCountry',
                            checked   : true
                        }
                    ]
                }
            ],
            buttons: [
                    {
                        itemId: 'btnIntroNext',
                        text: i18n('sNext'),
                        scale: 'large',
                        iconCls: 'b-next',
                        glyph: Rd.config.icnNext,
                        margin: '0 20 40 0'
                    }
                ]
        });

        //We pack the two and add a next button
        var pnl =  Ext.create('Ext.panel.Panel',{
            layout: 'vbox',
            border: false,
            itemId: 'scrnIntro',
            items: [
                pnlMsg,
                pnlFrm
            ] 
        });
        return pnl;
    },

    //______ 

    mkScrnNewCountry: function(){

        //There are four itemId's of interest
        //scrnNewCountry     -> The panel displaying the screen
        //btnNewCountryNext  -> Will be active when the correct email is supplied
        //btnNewCountryPrev  -> Go back to the Intro secreen

        //First a panel which we'll add the instructions to 
        var pnlMsg = Ext.create('Ext.container.Container',{
            border: false,
            baseCls: 'regMsg',
            html: i18n("sSupply_the_following_detail_please"),
            width: '100%'
        });

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
                    fieldLabel: i18n('sCountry_name'),
                    itemId: 'inpNewCountry',
                    allowBlank: false,
                    emptyText: 'country name',
                    blankText: i18n("sSpecify_a_valid_name_please"),
                    textValid: true, //start with it as valid to allow the blankText to show
                    validator: function(){
                        return this.textValid;  //this.text.Valid will return either true or the error message which is supplied by the 'change' listener 
                    }
                },
                {
                    name: 'iso_code',
                    fieldLabel: i18n('sISO_code'),
                    itemId: 'inpNewIso',
                    allowBlank: false,
                    emptyText: i18n('seg_ZA_or_DE'),
                    blankText: i18n("sSpecify_a_valid_iso_country_code"),
                    maskRe : /[a-z]/i,
                    minLength : 2, 
                    maxLength : 2,
                    fieldStyle: 'text-transform:uppercase',
                    textValid: true, //start with it as valid to allow the blankText to show
                    validator: function(){
                        return this.textValid;  //this.text.Valid will return either true or the error message which is supplied by the 'change' listener 
                    }
                },
                {
                    xtype: 'filefield',
                    name: 'icon',
                    fieldLabel: i18n('sFlag_icon'),
                    allowBlank: false,
                    buttonText: i18n('sSelect_Icon')+'...'
                }
            ],
            buttons: [
                     {
                        itemId:     'btnNewCountryPrev',
                        text:       i18n('sPrev'),
                        scale:      'large',
                        iconCls:    'b-prev',
                        glyph: Rd.config.icnBack,
                        margin: '0 20 40 0'
                    },
                     {
                        itemId:     'btnNewCountryNext',
                        text:       i18n('sNext'),
                        formBind:   true,
                        scale:      'large',
                        iconCls:    'b-next',
                        glyph: Rd.config.icnNext,
                        margin: '0 20 40 0'
                    }
                ]
        });

        //We pack the two and add a next button
        var pnl =  Ext.create('Ext.panel.Panel',{
            itemId: 'scrnNewCountry',
            layout: 'vbox',
            border: false,
            items: [
                pnlMsg,
                pnlFrm
            ] 
        });
        return pnl;
    },

     mkScrnNewLanguage: function(){

        //There are four itemId's of interest
        //scrnNewLanguage     -> The panel displaying the screen
        //btnNewLanguageNext  -> Will be active when the correct email is supplied
        //btnNewLanguagePrev  -> Go back to the Intro secreen

        //First a panel which we'll add the instructions to 
        var pnlMsg = Ext.create('Ext.container.Container',{
            border: false,
            baseCls: 'regMsg',
            html: i18n("sSupply_the_following_detail_please"),
            width: '100%'
        });

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
                        itemId:     'btnNewLanguagePrev',
                        text:       i18n('sPrev'),
                        scale:      'large',
                        iconCls:    'b-prev',
                        glyph: Rd.config.icnBack
                    },
                     {
                        itemId:     'btnNewLanguageNext',
                        text:       i18n('sNext'),
                        formBind:   true,
                        scale:      'large',
                        iconCls:    'b-next',
                        glyph: Rd.config.icnNext
                    }
                ]
        });
        //We pack the two and add a next button
        var pnl =  Ext.create('Ext.panel.Panel',{
            itemId: 'scrnNewLanguage',
            layout: 'vbox',
            border: false,
            items: [
                pnlMsg,
                pnlFrm
            ] 
        });
        return pnl;
    }
});
