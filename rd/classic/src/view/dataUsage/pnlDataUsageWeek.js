Ext.define('Rd.view.dataUsage.pnlDataUsageWeek', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlDataUsageWeek',
    ui      : 'light',
    title   : "Week",
    headerPosition: 'right',
    height  : 550,
    margin  : 0,
    padding : 0,
    border  : true,
    layout: {
        type    : 'vbox',
        align   : 'stretch'
    },
    requires	: [
        'Ext.data.Store',
        'Ext.data.BufferedStore'       
    ],
    initComponent: function() {
        var me      = this; 
        var m       = 5;
        var p       = 5;
        Ext.create('Ext.data.Store', {
            storeId : 'weekStore',
            fields  :[ 
                {name: 'id',            type: 'int'},
                {name: 'username',      type: 'string'},
                {name: 'mac',           type: 'string'},
                {name: 'data_in',       type: 'int'},
                {name: 'data_out',      type: 'int'},
                {name: 'data_total',    type: 'int'}
            ]
        });
       
        Ext.create('Ext.data.BufferedStore', {
            storeId : 'weekMacStore',
            extend  : 'Ext.data.Store',
            fields  :[ 
                {name: 'id',            type: 'int'},
                {name: 'username',      type: 'string'},
                {name: 'type',          type: 'string'},
                {name: 'mac',           type: 'string'},
                {name: 'vendor',        type: 'string'},
                {name: 'data_in',       type: 'int'},
                {name: 'data_out',      type: 'int'},
                {name: 'data_total',    type: 'int'}
            ],
            //To make it load AJAXly from the server specify the follown 3 attributes
            buffered        : true,
            leadingBufferZone: 10, 
            pageSize        : 10,
            remoteSort  : true,
            remoteFilter: true,
            proxy: {
                    type    : 'ajax',
                    format  : 'json',
                    url     : '/cake3/rd_cake/data-usages/macs_for_user.json',
                    reader: {
                        type			: 'json',
                        rootProperty    : 'items',
                        messageProperty	: 'message',
                        totalProperty	: 'totalCount' 
                    },
                    simpleSortMode: true 
            },
            listeners: {
                'metachange' : function(store,meta,options) {
                    var title = "Devices";
                    if(meta.totalCount == 1){
                        title = meta.totalCount+" Device"    
                    }
                    
                    if(meta.totalCount > 1){
                        title = meta.totalCount+" Devices"    
                    }
                    me.down('#gridMacs').setTitle(title);
                }
            },
            autoLoad: true
        });
        
        me.items = [
            {
                xtype   : 'panel',
                flex    : 1,
                border  : false,
                layout: {
                    type    : 'hbox',
                    align   : 'stretch'
                },
                items : [
                    {
                        xtype   : 'panel',
                        margin  : m,
                        padding : p,
                        flex    : 1,
                        bodyCls : 'pnlInfo',
                        layout  : 'fit',
                        border  : true,
                        ui      : 'light',
                        itemId  : 'weeklyTotal',
                        tpl     : new Ext.XTemplate(
                            '<div class="divInfo">',
                            '<h1 style="font-size:250%;font-weight:lighter;">{data_total}</h1>',       
                            '<p style="color: #000000; font-size:110%;">',
                                '<span class="grpUp"><i class="fa fa-arrow-circle-down"></i></span> In: {data_in}',
                                '&nbsp;&nbsp;&nbsp;&nbsp;',
                                '<span class="grpDown"><i class="fa fa-arrow-circle-up"></i></span> Out: {data_out}',
                            '</p>',
                            '</div>'
                        ),
                        data    : {
                        }/*,
                        bbar    : ['->',{ 
                            xtype   : 'button',    
                            scale   : 'large',  
                            text    : 'See More..',
                            glyph   : Rd.config.icnView,
                            itemId  : 'btnSeeMore'
                        }]*/
                    },
                    {
                        xtype   : 'pnlDataUsageUserDetail',
                        margin  : m,
                        padding : p,
                        hidden  : true,
                        flex    : 1  
                    },
                    {
                        flex            : 1,
                        margin          : 0,
                        padding         : 0,
                        border          : false,
                        itemId          : 'plrWeekly',
                        xtype           : 'polar',
                        innerPadding    : 10,
                        interactions    : ['rotate', 'itemhighlight'],
                        store           : Ext.data.StoreManager.lookup('weekStore'),
                        series          : {
                           type         : 'pie',
                          
                           highlight    : true,
                           angleField   : 'data_total',
                           label        : {
                               field    : 'name',
                               display  : 'rotate'
                           },
                           donut        : 10,    
                           tooltip      : {
                                trackMouse: true,
                                renderer: function (tooltip, record, item) {
                                    tooltip.setHtml(
                                        "<h2>"+record.get('username')+"</h2><h3>"+Ext.ux.bytesToHuman(record.get('data_total'))+"</h3>"
                                    );
                                }
                            }    
                        }
                    },
                    {
                        xtype   : 'grid',
                        margin  : m,
                        padding : p,
                        ui      : 'light',
                        title   : 'Top 10 Users For The Week',
                        glyph   : Rd.config.icnUser,
                        itemId  : 'gridTopTenDaily',
                        border  : true,       
                        store   : Ext.data.StoreManager.lookup('weekStore'),
                        emptyText: 'No Users For This Week',
                        columns: [
                            { text: 'Username',  dataIndex: 'username', flex: 1},
                            { text: 'MAC Address',  dataIndex: 'mac', flex: 1, hidden: true},
                            { text: 'Data In',   dataIndex: 'data_in',  hidden: true, renderer: function(value){
                                    return Ext.ux.bytesToHuman(value)              
                                } 
                            },
                            { text: 'Data Out',  dataIndex: 'data_out', hidden: true,renderer: function(value){
                                    return Ext.ux.bytesToHuman(value)              
                                } 
                            },
                            { text: 'Data Total',dataIndex: 'data_total',tdCls: 'gridMain',renderer: function(value){
                                    return Ext.ux.bytesToHuman(value)              
                                } 
                            }
                        ],
                        flex: 1
                    }
                ]
            },
            {
                xtype   : 'panel',
                flex    : 1,
                border  : false,
                layout: {
                    type    : 'hbox',
                    align   : 'stretch'
                },
                items   : [
                    {
                        xtype   : 'pnlDataUsageGraph',
                        flex    : 2,
                        margin  : 0,
                        padding : 0,
                        layout  : 'fit',
                        border  : false   
                    },
                    {
                        xtype   : 'grid',
                        itemId  : 'gridMacs',
                        margin  : m,
                        padding : p,
                        ui      : 'light',
                        title   : 'Devices',
                        glyph   : Rd.config.icnDevice,
                        border  : true,
                        hidden  : true,       
                        store   : Ext.data.StoreManager.lookup('weekMacStore'),
                        emptyText: 'No Devices For This Week',
                        bufferedRenderer : true,
                        columns: [
                            { 
                                text        : 'MAC Address',  
                                dataIndex   : 'mac',
                                flex        : 1,
                                xtype       : 'templatecolumn', 
                                tpl         : new Ext.XTemplate(
                                    "<tpl if='(!Ext.isEmpty(vendor))'>",
                                        "{mac}<span style='color:grey;'> ({vendor})</span>",
                                    '<tpl else>',
                                        '{mac}',
                                    '</tpl>'
                                )     
                            },
                            { text: 'Data In',   dataIndex: 'data_in',  hidden: true, renderer: function(value){
                                    return Ext.ux.bytesToHuman(value)              
                                } 
                            },
                            { text: 'Data Out',  dataIndex: 'data_out', hidden: true,renderer: function(value){
                                    return Ext.ux.bytesToHuman(value)              
                                } 
                            },
                            { text: 'Data Total',dataIndex: 'data_total',tdCls: 'gridMain',renderer: function(value){
                                    return Ext.ux.bytesToHuman(value)              
                                } 
                            }
                        ],
                        flex: 1
                    }
                ]
            }
        ];
        me.callParent(arguments);
    }
});
