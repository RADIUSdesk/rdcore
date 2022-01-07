Ext.define('Rd.view.logViewer.winRadiusInfo', {
    extend:     'Ext.window.Window',
    alias :     'widget.winRadiusInfo',
    closable:   true,
    draggable:  true,
    resizable:  false,
    title:      i18n('sFreeRADIUS_info'),
    width:      380,
    height:     380,
    plain:      true,
    border:     false,
    layout:     'fit',
    iconCls:    'infoWin',
    glyph: Rd.config.icnInfo,
    defaults: {
            border: false
    },
    requires: [
     
    ],
    initComponent: function() {
        var me = this;


        //Grid for clients
        var sClients  =Ext.create('Ext.data.Store', {
            storeId:'frClientsStore',
            fields:['name'],
            data:{'items': me.info.clients},
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    root: 'items'
                }
            }
        });

        var gClients = Ext.create('Ext.grid.Panel', {
            title: i18n('sClients'),
            store: Ext.data.StoreManager.lookup('frClientsStore'),
            columns: [
                {xtype: 'rownumberer'},
                { text: i18n('sName'),  dataIndex: 'name',flex: 1 }
            ],
            bbar: [
                {   xtype: 'component', itemId: 'count',   tpl: i18n('sResult_count_{count}'),   style: 'margin-right:5px', cls: 'lblYfi' }
            ]
        });

        var count   = sClients.getTotalCount();
        gClients.down('#count').update({count: count});

        //Grid for modules
        var sModules  =Ext.create('Ext.data.Store', {
            storeId:'frModulesStore',
            fields:['name'],
            data:{'items': me.info.modules},
            proxy: {
                type: 'memory',
                reader: {
                    type            : 'json',
                    rootProperty    : 'items'
                }
            }
        });

        var gModules = Ext.create('Ext.grid.Panel', {
            title: i18n('sModules'),
            store: Ext.data.StoreManager.lookup('frModulesStore'),
            columns: [
                {xtype: 'rownumberer'},
                { text: i18n('sName'),  dataIndex: 'name',flex: 1 }
            ],
            bbar: [
                {   xtype: 'component', itemId: 'count',   tpl: i18n('sResult_count_{count}'),   style: 'margin-right:5px', cls: 'lblYfi' }
            ]
        });

        var count   = sModules.getTotalCount();
        gModules.down('#count').update({count: count});

          
        me.items = { 
            xtype   : 'tabpanel',
            margins : '0 0 0 0',
            border  : false,
            plain   : true,
            cls     : 'subTab',
            items   : [
                { 
                    'title' : i18n('sGeneral'), 
                    xtype   : 'panel',
                    tpl     : new Ext.XTemplate(
                                "<tpl>",
                                    "<div style='padding:5px; margin: 5px;'>",
                                        "<div class=\"lblYfi\">"+i18n('sUptime')+"</div><div class=\"txtGrey\">{uptime}</div>",
                                        "<div class=\"lblYfi\">"+i18n('sVersion')+"</div><div class=\"txtGrey\">{version}</div>",
                                    "</div>",
                                "</tpl>"
                    ),
                    data: { uptime: me.info.uptime, version: me.info.version }
                },
                gClients,
                gModules
            ]
        };
        this.callParent(arguments);
    }

});
