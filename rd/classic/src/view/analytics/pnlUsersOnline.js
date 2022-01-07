Ext.define('Rd.view.analytics.pnlUsersOnline', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.pnlUsersOnline',
    scrollable: true,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },


    initComponent: function () {
        var me = this;

        me.dockedItems = [{
            xtype: 'toolbar',
            dock: 'top',
            cls: 'subTab', //Make darker -> Maybe grey
            frame: true,
            border: true,
            items: [
                {
                    xtype: 'button',
                    glyph: Rd.config.icnReload,
                    scale: 'small',
                    itemId: 'reload',
                    tooltip: i18n('sReload')
                },
                {
                    xtype: 'cmbRealm'
                },
                {
                    xtype: 'button',
                    scale: 'small',
                    itemId: 'btnShowRealm',
                    text: 'Show Realm Data',
                    hidden: true
                },
                '|',
                {
                    xtype: 'button',
                    glyph: Rd.config.icnBack,
                    text: '',
                    itemId: 'back'

                },
                {
                    xtype: 'button',
                    glyph: Rd.config.icnNext,
                    text: '',
                    itemId: 'forward'

                }

            ]
        }
        ];

        me.items = [
            {
                xtype: 'analytics.pnlDataUsageDay'                         

            }

        ];

        me.callParent(arguments);
    }
});

