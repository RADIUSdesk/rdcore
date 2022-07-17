Ext.define('Rd.view.components.winCsvColumnSelect', {
    extend  : 'Ext.window.Window',
    alias   : 'widget.winCsvColumnSelect',
    title   : i18n('sCSV_export'),
    layout  : 'fit',
    autoShow: false,
    width   : 450,
    height  : 400,
    glyph   : Rd.config.icnCsv,
    requires: [
        'Rd.view.components.btnCommon'
    ],
    columns : [],
    initComponent: function() {
        var me = this;
        this.items = [
            {
                xtype       : 'form',
                border      : false,
                layout      : 'anchor',
                autoScroll  : true,
                defaults    : {
                    anchor: '100%'
                },
                fieldDefaults: {
                    msgTarget       : 'under',
                    labelClsExtra   : 'lblRd',
                    labelAlign      : 'left',
                    labelSeparator  : '',
                    margin          : Rd.config.fieldMargin
                },
                defaultType: 'textfield',
                items: [
                    {
                        xtype       : 'checkboxgroup',
                        columns     : 2,
                        vertical    : true,
                        items       : me.columns
                    }
                ],
                buttons: [{xtype: 'btnCommon'}]
            }
        ];
        this.callParent(arguments);
    }
});
