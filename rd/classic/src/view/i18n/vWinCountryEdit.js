Ext.define('Rd.view.i18n.vWinCountryEdit', {
    extend:     'Ext.window.Window',
    alias :     'widget.vWinCountryEdit',
    closable:   true,
    draggable:  false,
    resizable:  false,
    title:      i18n('sEdit_Countries'),
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
        'Rd.view.components.vCmbCountries'
    ],
     initComponent: function() {
        var me = this;
        var scrnCountryEdit  = me.mkScrnCountryEdit();
        var scrnCountryEditDo= me.mkScrnCountryEditDo();
        this.items = [
            scrnCountryEdit,
            scrnCountryEditDo
        ];
        this.callParent(arguments);
    },
    mkScrnCountryEdit: function(){
        var pnlMsg = Ext.create('Ext.container.Container',{
            border: false,
            baseCls: 'regMsg',
            html: i18n("sSelect_a_country_to_edit"),
            width: '100%'
        });
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
                   xtype: 'vCmbCountries'
                }
            ],
            buttons: [
                    {
                        itemId: 'btnCountryEditNext',
                        text:   i18n('sNext'),
                        scale:  'large',
                        formBind:true,
                        margin: '0 20 40 0',
                        glyph: Rd.config.icnNext,
                        iconCls:'b-next'
                    }
                ]
        });
        var pnl =  Ext.create('Ext.panel.Panel',{
            layout: 'vbox',
            border: false,
            itemId: 'scrnCountryEdit',
            items: [
                pnlMsg,
                pnlFrm
            ] 
        });
        return pnl;
    },
    mkScrnCountryEditDo: function(){

        var pnlMsg = Ext.create('Ext.container.Container',{
            border: false,
            baseCls: 'regMsg',
            html: i18n("sSupply_the_following_detail_please"),
            width: '100%'
        });
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
                    fieldLabel: i18n('sCountry_name'),
                    itemId: 'inpNewCountry',
                    allowBlank: false,
                    emptyText: i18n('sCountry_name'),
                    blankText: i18n('sSpecify_a_valid_name_please')
                },
                {
                    name: 'iso_code',
                    fieldLabel: i18n('sISO_code'),
                    itemId: 'inpNewIso',
                    allowBlank: false,
                    emptyText: i18n('seg_ZA_or_DE'),
                    blankText: i18n('sSpecify_a_valid_iso_country_code'),
                    maskRe : /[a-z]/i,
                    minLength : 2, 
                    maxLength : 2,
                    fieldStyle: 'text-transform:uppercase'
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
                        itemId:     'btnCountryEditDoPrev',
                        text:       i18n('sPrev'),
                        scale:      'large',
                        iconCls:    'b-prev',
                        glyph: Rd.config.icnBack,
                        margin:     '0 20 40 0'
                    },
                    {
                        itemId:     'btnCountryEditDoNext',
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

        var pnl =  Ext.create('Ext.panel.Panel',{
            layout: 'vbox',
            border: false,
            itemId: 'scrnCountryEditDo',
            items: [
                pnlMsg,
                pnlFrm
            ] 
        });
        return pnl;
    }
});
