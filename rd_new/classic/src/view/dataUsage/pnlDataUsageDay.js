Ext.define('Rd.view.dataUsage.pnlDataUsageDay', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlDataUsageDay',
    //ui      : 'light',
    title   : "Day",
    headerPosition: 'right',
    height  : 550,
    margin  : 0,
    padding : 0,
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
            storeId : 'dayStore',
            fields  :[ 
                {name: 'id',            type: 'int'},
                {name: 'username',      type: 'string'},
                {name: 'mac',           type: 'string'},
                {name: 'data_in',       type: 'int'},
                {name: 'data_out',      type: 'int'},
                {name: 'data_total',    type: 'int'}
            ]
        });
        
         Ext.create('Ext.data.Store', {
            storeId : 'activeStore',
            fields  :[ 
                {name: 'id',                type: 'int'},
                {name: 'username',          type: 'string'},
                {name: 'callingstationid',  type: 'string'},
                {name: 'online_human',      type: 'string'},
                {name: 'online',            type: 'int'}
            ]
        });
        Ext.create('Ext.data.BufferedStore', {
            storeId : 'dayMacStore',
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
                        itemId  : 'dailyTotal',
                        tpl     : new Ext.XTemplate(
                            '<div class="divInfo">',   
                            '<h1 style="font-size:270%;font-weight:lighter;">{data_total}</h1>',       
                            '<p style="color: #000000; font-size:140%;">',
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
                        margin          : m,
                        padding         : p,
                        border          : false,
                        itemId          : 'plrDaily',
                        xtype           : 'polar',
                        innerPadding    : 10,
                        interactions    : ['rotate', 'itemhighlight'],
                        store: Ext.data.StoreManager.lookup('dayStore'),
                        series: {
                           type         : 'pie',
                          
                           highlight    : true,
                           angleField   : 'data_total',
                           label        : {
                               field    : 'name',
                               display  : 'rotate'
                           },
                           donut        : 10,    
                           tooltip : {
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
                        title   : 'Top 10 Users For The Day',
                        glyph   : Rd.config.icnUser,
                        itemId  : 'gridTopTenDaily',
                        border  : true,       
                        store   : Ext.data.StoreManager.lookup('dayStore'),
                        emptyText: 'No Users For The Day',
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
                        margin  : m,
                        padding : p,
                        layout  : 'fit',
                        border  : false
                        
                    },
                    {
                        xtype   : 'grid',
                        itemId  : 'gridActive',
                        margin  : m,
                        padding : p,
                        ui      : 'light',
                        title   : 'Active Sessions',
                        glyph   : Rd.config.icnLight,
                        border  : true,       
                        store   : Ext.data.StoreManager.lookup('activeStore'),
                        emptyText: 'No Active Sessions Now',
                        columns: [
                            { text: 'Username',     dataIndex: 'username', flex: 1 },
                            { text: 'MAC Address',  dataIndex: 'callingstationid' },
                            { 
                                text        : 'Time Online',   
                                dataIndex   : 'online',  
                                tdCls       : 'gridTree', 
                                flex        : 1,
                                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                                renderer    : function(value,metaData,record){
                                    var human_value = record.get('online_human')
                                    return "<div class=\"fieldGreen\">"+human_value+" "+i18n('sOnline')+"</div>";           
                                }
                            }
                        ],
                        flex: 1
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
                        store   : Ext.data.StoreManager.lookup('dayMacStore'),
                        emptyText: 'No Devices For This Day',
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
