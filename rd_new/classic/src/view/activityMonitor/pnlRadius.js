Ext.define('Rd.view.activityMonitor.pnlRadius', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlRadius',
    border  : false,
    layout: {
        type    : 'hbox',
        align   : 'stretch'
    },
    tbar: [      
        { xtype: 'button',  iconCls: 'b-reload', glyph: Rd.config.icnReload,   scale: 'large', itemId: 'reload',tooltip: i18n('sReload'),
            menu: {
                items   : [
                        '<b class="menu-title">'+i18n('sReload_every')+'</b>',             
                        { text:  i18n('s30_seconds'),   itemId:  'mnuRefresh30s', group:'refresh',checked:false},
                        { text:  i18n('s1_minute'),     itemId:  'mnuRefresh1m',  group:'refresh',checked:false},
                        { text:  i18n('s5_minutes'),    itemId:  'mnuRefresh5m',  group:'refresh',checked:false},
                        { text:  i18n('sStop_auto_reload'),  itemId:  'mnuRefreshCancel',  group:'refresh',checked:true}
                       
                        ]
            }
        },
        { xtype: 'cmbNas', allowBlank: true, width: 400 }
    ],
    bbar: [
        {   xtype: 'component', itemId: 'status',   tpl: 'Status: {mesg}',   style: 'margin-right:5px', cls: 'lblYfi' }
    ],
    requires: ['Rd.view.components.chrtBasicPie'],
    authBasicStore    : null,
    authDetailStore   : null,
    initComponent: function(){
        var me      = this;

       // var auth_basic  = me.auth_basic();
       // var auth_detail = me.auth_detail();
       // var acct_detail = me.acct_detail();

        me.items = [{
                xtype: 'panel',
                title: i18n('sAuthentication'),
                autoScroll: true,
                flex: 2,
                layout: {
                    type    : 'hbox'
                },
                collapsible: true,
                collapseDirection: 'left',
              //  items: [ auth_basic, auth_detail ]
            },{
                xtype: 'panel',
                title: i18n('sAccounting'),
                autoScroll: true,
                flex: 1,
                layout: {
                    type    : 'hbox'
                },
                collapsible: true,
                collapseDirection: 'right',
               // items: [ acct_detail ]
            }
        ];
        me.callParent(arguments);
    },

    auth_basic: function(){
        var me = this;

        me.authBasicStore = Ext.create('Ext.data.JsonStore', {
            fields: ['name', 'data']     
        });

        var auth_basic_chart = Ext.create('Rd.view.components.chrtBasicPie', { store: me.authBasicStore });
        return auth_basic_chart;
    },
    auth_detail: function(){
        var me = this;
        me.authDetailStore = Ext.create('Ext.data.JsonStore', {
            fields: ['name', 'data']     
        });
        var auth_detail_chart = Ext.create('Rd.view.components.chrtBasicPie', { store: me.authDetailStore });
        return auth_detail_chart;
    },

    acct_detail: function(){
        var me = this;
        me.acctDetailStore = Ext.create('Ext.data.JsonStore', {
            fields: ['name', 'data']     
        });
        var acct_basic_chart = Ext.create('Rd.view.components.chrtBasicPie', { store: me.acctDetailStore });
        return acct_basic_chart;
    }
});

