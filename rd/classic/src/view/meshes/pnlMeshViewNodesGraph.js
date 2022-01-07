Ext.define('Rd.view.meshes.pnlMeshViewNodesGraph', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlMeshViewNodesGraph',
    border  : false,
    layout: {
        type    : 'vbox',
        align   : 'stretch'
    },
    requires: [
    ],
    height  : 550,
    initComponent: function(){
    
        var me      = this; 
        var m       = 5;
        var p       = 5;   
        var s       = Ext.create('Ext.data.Store', {
            fields  :[ 
                {name: 'id',            type: 'int'},
                {name: 'mac',           type: 'string'},
                {name: 'vendor',        type: 'string'},
                {name: 'data_in',       type: 'int'},
                {name: 'data_out',      type: 'int'},
                {name: 'data_total',    type: 'int'}
            ]
        });      
        
        //var theme = Ext.create('Ext.chart.theme.Custom', {});
                
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
                        itemId  : 'total',
                        tpl     : new Ext.XTemplate(
                            '<div class="divInfo">', 
                                '<div>',
                                    '<span><i class="fa fa-wifi"></i>  Sub909</span>',
                                '</div>',  
                                '<h1 style="font-size:270%;font-weight:lighter;">{data_total}</h1>',       
                                '<p style="color: #000000; font-size:140%;">',
                                    '<span class="grpUp"><i class="fa fa-arrow-circle-down"></i></span> In: {data_in}',
                                    '&nbsp;&nbsp;&nbsp;&nbsp;',
                                    '<span class="grpDown"><i class="fa fa-arrow-circle-up"></i></span> Out: {data_out}',
                                '</p>',
                            '</div>'
                        ),
                        data    : {
                        }
                    },
                    {
                        flex            : 1,
                        margin          : m,
                        padding         : p,
                        border          : false,
                        itemId          : 'plrTopTen',
                        xtype           : 'polar',
                        innerPadding    : 10,
                        interactions    : ['rotate', 'itemhighlight'],
                        store           : s,
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
                                        "<h2>"+record.get('mac')+"</h2><h3>"+Ext.ux.bytesToHuman(record.get('data_total'))+"</h3>"                           
                                    );
                                }
                            }    
                        }
                    },
                    {
                        xtype   : 'grid',
                        tools   : [
                            {
                                tooltip : 'Create Alias',
                                itemId  : 'toolAlias',
                                glyph   : Rd.config.icnEdit
                            }
                        ],
                        margin  : m,
                        padding : p,
                        ui      : 'light',
                        title   : 'Top 10 Users',
                        glyph   : Rd.config.icnUser,
                        itemId  : 'gridTopTen',
                        border  : true,       
                        store   : s,
                        emptyText: 'No Devices',
                        columns: [
                            { text: 'MAC Address',  dataIndex: 'mac', flex: 1, hidden: false},
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
                        flex            : 1,
                        margin          : m,
                        padding         : p,
                        border          : false,
                        itemId          : 'plrTopTen2',
                        xtype           : 'polar',
                        innerPadding    : 10,
                        interactions    : ['rotate', 'itemhighlight'],
                        store           : s,
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
                                        "<h2>"+record.get('mac')+"</h2><h3>"+Ext.ux.bytesToHuman(record.get('data_total'))+"</h3>"                           
                                    );
                                }
                            }    
                        }
                    }
                ]
            }
        ];       
        
        me.callParent(arguments);
    }
});
