Ext.define('Rd.view.i18n.vWinLanguageDel', {
    extend:     'Ext.window.Window',
    alias :     'widget.delLanguageW',
    closable:   true,
    draggable:  false,
    resizable:  false,
    title:      i18n('sDelete_language'),
    width:      380,
    height:     300,
    plain:      true,
    border:     false,
    layout:     'vbox',
    bodyCls:    'bodyCls',
    iconCls:    'delete',
    glyph: Rd.config.icnDelete,
    requires: [
        'Rd.view.components.vCmbJustLanguages'
    ],
    items: [
        {   xtype: 'panel',
            border: false,
            baseCls: 'regMsg',
            html: i18n("sSelect_the_language_to_delete_fs")+' '+i18n("sMake_sure_you_know_what_you_are_doing_fs"),
            width: '100%'
        },
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
                    msgTarget: 'under',
                    labelClsExtra: 'lblRd',
                    labelAlign: 'top',
                    labelSeparator: '',
                    margin: 15
            },
            items: [
                {   xtype: 'cmbJustLanguages', name: 'id'
                }
            ],
            buttons: [
                    {
                        itemId: 'btnLanguageDelNext',
                        text: i18n('sNext'),
                        scale: 'large',
                        iconCls: 'b-next',
                        glyph: Rd.config.icnNext,
                        margin: '0 20 40 0',
                        formBind: true
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
