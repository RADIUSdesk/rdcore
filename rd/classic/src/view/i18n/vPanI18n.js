Ext.define('Rd.view.i18n.vPanI18n', {
    extend: 'Ext.tab.Panel',
    alias : 'widget.i18nP',
    defaults: {
        layout: 'fit'
    },
    items: [ 
        {
            title       : i18n('sJavascript_Phrases'),
            'itemId'    : 'JsPhrases',
            'xtype'     : 'gridJavascriptPhrases'
        },{
            title       : i18n('sPHP_Phrases'),
            'itemId'    : 'PhpPhrases',
            'xtype'     : 'gridPhpPhrases'
        }
    ],
    initComponent: function() {
        this.callParent(arguments);
    }
});
