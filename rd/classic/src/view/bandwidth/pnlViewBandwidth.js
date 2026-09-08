Ext.define('Rd.view.bandwidth.pnlViewBandwidth', {
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlViewBandwidth',
    plain       : true,
    frame       : false,
    layout      : {
        type    : 'vbox',
        pack    : 'start',
        align   : 'stretch'
    },
    requires    : [
        'Rd.view.bandwidth.vcViewBandwidth',
        'Rd.view.bandwidth.cmbBandwidthInterfaces'
        
    ],
    dev_mode        : false,
    dev_id          : false,
    controller      : 'vcViewBandwidth',
    initComponent   : function(){
    
        var me 	    = this;
        var scale   = 'small';
        var dd      = Ext.getApplication().getDashboardData();
        var m       = 5;
        var p       = 5;
        
        me.timezone_id = dd.user.timezone_id;
        
         // Model-less store; convert string -> number, keep nulls as null
        function intOrNull(v){ return (v===null || v===undefined || v==='') ? null : parseInt(v,10); }
        function floatOrNull(v){ return (v===null || v===undefined || v==='') ? null : parseFloat(v); }
        
               
        Ext.create('Ext.data.Store', {
            storeId : 'strBandwidthTrafficPie',
            fields  :[ 
          //      {name: 'id',            type: 'int'},
                {name: 'mac',           type: 'string'},
                {name: 'data_in',       type: 'int'},
                {name: 'data_out',      type: 'int'},
                {name: 'data_total',    type: 'int'}
            ]
        });
        
        Ext.create('Ext.data.Store', {
            storeId : 'strBandwidthProtocolPie',
            fields  :[ 
                {name: 'id',            type: 'int'},
                {name: 'layer7',        type: 'string'},
                {name: 'data_in',       type: 'int'},
                {name: 'data_out',      type: 'int'},
                {name: 'data_total',    type: 'int'}
            ]
        });
        
        Ext.create('Ext.data.Store', {
            storeId : 'strBandwidthClientProtocol',
            fields  :[ 
               // {name: 'id',            type: 'int'},
                {name: 'layer7',        type: 'string'},
                {name: 'data_in',       type: 'int'},
                {name: 'data_out',      type: 'int'},
                {name: 'data_total',    type: 'int'}
            ]
        });
        
        Ext.create('Ext.data.Store', {
            storeId : 'strBandwidthProtocolClient',
            fields  :[ 
                //{name: 'id',            type: 'int'},
                {name: 'mac',           type: 'string'},
                {name: 'data_in',       type: 'int'},
                {name: 'data_out',      type: 'int'},
                {name: 'data_total',    type: 'int'}
            ]
        });
                     
        var store = Ext.create('Ext.data.Store', {
            fields: [
                { name: 'time_unit', type: 'string' },
                { name: 'requests_acct', convert: intOrNull },
                { name: 'requests_coa',  convert: intOrNull },
                { name: 'requests_auth', convert: intOrNull },
                { name: 'avg_rtt_acct',  convert: floatOrNull },
                { name: 'avg_rtt_coa',   convert: floatOrNull },
                { name: 'avg_rtt_auth',  convert: floatOrNull },
                { name: 'id', type: 'int' }
            ],
            data: []         
        });
                
        var chart_traffic = {
            xtype   : 'panel',
            itemId  : 'pnlTraffic',
            layout  : 'fit',
            flex    : 2,
            items: [{
                xtype   : 'cartesian',
                itemId  : 'barTraffic',
                store   : store,
                insetPadding: 20,
                animation: true,
             //   legend: { docked: 'bottom' },
                interactions: ['itemhighlight'],
                axes: [{
                    type: 'category',
                    position: 'bottom',
                    fields: ['time_unit'],
                    label : Rd.config.rdGraphLabel,
                    grid: true
                }, {
                    type: 'numeric',
                    position: 'left',
                    grid: true,
                    minimum: 0,
                    label  : Rd.config.rdGraphLabel,
                    fields : ['data_in', 'data_out'],
                    renderer    : function(axis, label, layoutContext) {
                        return Ext.ux.bytesToHuman(label);
                    }
                }],
                series: [
                    {
                        type    : 'bar',
                        title   : [ 'Data In', 'Data out' ],
                        xField  : 'time_unit',
                        yField  : ['data_in', 'data_out'],
                        stacked : true,
                        colors  : Rd.config.rdGraphBarColors, // Custom color set
                        style   : {
                            opacity: 0.80
                        },
                        highlight: {
                            fillStyle: 'yellow'
                        },
                        tooltip: {
                            renderer: function (tooltip, record, item) {
                                var di = Ext.ux.bytesToHuman(record.get("data_in"));
                                var dout = Ext.ux.bytesToHuman(record.get("data_out"));
                                tooltip.setHtml("Data in <b>"+di+"</b><br>Data out <b>"+dout+"</b>");    
                                
                            }
                        }
                    }
                ]
            }]
        }
        
       
        me.tbar  = [{   
            xtype   : 'buttongroup',
            border  :  false,
            bodyBorder: false,
            frame   : false,
            items   : [
                { 
                    xtype   : 'splitbutton',
                    glyph   : Rd.config.icnReload ,
                    scale   : scale, 
                    itemId  : 'reload',
                    tooltip : i18n('sReload'),
                    menu    : {
                        items: [
                            '<b class="menu-title">Reload every:</b>',
                            {'text': '30 seconds',  'itemId': 'mnuRefresh30s','group': 'refresh','checked': false },
                            {'text': '1 minute',    'itemId': 'mnuRefresh1m', 'group': 'refresh','checked': false },
                            {'text': '5 minutes',   'itemId': 'mnuRefresh5m', 'group': 'refresh','checked': false },
                            {'text':'Stop auto reload','itemId':'mnuRefreshCancel', 'group': 'refresh', 'checked':true}
                        ]
                    }
                },
                { 
                    xtype       : 'tbseparator'
                }, 
                {
                    xtype       : 'cmbBandwidthInterfaces',
                    allOption   : true,
                    width       : 220,
                    margin      : '0 0 0 0',
                    itemId      : 'cmbBandwidthInterfaces',
                    value       : -1,
                    dev_mode    : me.dev_mode,
                    dev_id      : me.dev_id
                },
                { 
                    xtype       : 'tbseparator'
                }, 
                {
                    text        : '1 Hour',
                    scale       : scale,
                    enableToggle: true,
                    toggleGroup : 'range',
                    allowDepress: false,
                    value       : 'hour',
                    pressed     : true,
                    listeners   : {
                        click: 'onClickHourButton'
                    }
                }, 
                {
                    text        : '24 Hours',
                    scale       : scale,
                    enableToggle: true,
                    toggleGroup: 'range',
                    allowDepress: false,
                    value       : 'day',
                    listeners   : {
                       click: 'onClickDayButton'
                    }
                }, 
                {
                    text        : '7 Days',
                    scale       : scale,
                    enableToggle: true,
                    toggleGroup: 'range',
                    allowDepress: false,
                    value       : 'week',
                    listeners   : {
                        click: 'onClickWeekButton'
                    }
                },
                { 
                    xtype       : 'tbseparator'
                }, 
                {
                    tooltip     : 'Traffic',
                    glyph       : Rd.config.icnCar,
                    scale       : scale,
                    enableToggle: true,
                    toggleGroup : 'traf_prot',
                    allowDepress: false,
                    value       : 'traffic',
                    pressed     : true,
                    itemId      : 'btnTraffic',
                    listeners   : {
                        click: 'onClickTrafficButton'
                    }
                }, 
                {
                    tooltip     : 'Protocols',
                    glyph       : Rd.config.icnListUl,
                    scale       : scale,
                    enableToggle: true,
                    toggleGroup: 'traf_prot',
                    allowDepress: false,
                    value       : 'protocols',
                    itemId      : 'btnProtocols',
                    listeners   : {
                       click: 'onClickProtocolsButton'
                    }
               },
               { 
                    xtype       : 'tbseparator',
                    itemId      : 'sepBack',
                    hidden      : true
               },
               {
                    tooltip     : 'BACK',
                    glyph       : Rd.config.icnBack,
                    scale       : scale,
                    ui          : 'button-metal',
                    hidden      : true,
                    itemId      : 'btnBack'
                }, 
            ]
        }];
        
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
                        title   : 'Summary',
                        ui      : 'panel-blue',
                        border  : true,
                        margin  : m,
                        padding : p,
                        flex    : 1,
                        layout  : 'fit',
                        itemId  : 'pnlSummary', // keep if you already use it
                        // reference: 'dailyTotal', // uncomment if you prefer lookupReference()
                        bodyPadding: 8,
                        tpl: new Ext.XTemplate(
                            '<div style="display:grid;grid-template-columns:repeat(1,minmax(0,1fr));gap:12px;text-align:center;">',
                                '<div style="padding:12px;border-radius:12px;background:rgba(0,0,0,0.06);color:#29465b;">',                                   
                                    '<div style="font-size:22px;font-weight:700;">',
                                    '<tpl if="graph_item==\'ap_device\'">',
                                        "<i class='fa fa-tablet'></i> ",
                                    '</tpl>',
                                    '<tpl if="graph_item==\'ap_protocol\'">',
                                        "<i class='fa fa-list'></i> ",
                                    '</tpl>',
                                        '{graph_name}',
                                    '</div>',                                    
                                '</div>',
                            '</div><br>',                         
                            '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;text-align:center;">',
                            
                                 '<div style="padding:12px;border-radius:12px;background:rgba(0,0,0,0.03);color:#29465b;">',
                                    '<div style="font-size:12px;text-transform:uppercase;opacity:.7;">Clients<br><br></div>',
                                    '<div style="font-size:24px;font-weight:800;letter-spacing:.3px;">{client_count}</div>',
                                '</div>',
                                '<div style="padding:12px;border-radius:12px;background:rgba(0,0,0,0.03);color:#29465b;">',
                                    '<div style="font-size:12px;text-transform:uppercase;opacity:.7;">Protocols<br><br></div>',
                                    '<div style="font-size:24px;font-weight:800;">{proto_count}</div>',
                                '</div>',

                                '<div style="padding:12px;border-radius:12px;background:rgba(0,0,0,0.03);color:#29465b;">',
                                    '<div style="font-size:12px;text-transform:uppercase;opacity:.7;"><i class="fa fa-database"></i> Data Total<br><br></div>',
                                    '<div style="font-size:24px;font-weight:800;letter-spacing:.3px;">{[Ext.ux.bytesToHuman(values.data_total)]}</div>',
                                    '<div style="font-size:10px;font-weight:400;color:grey">{[this.fmtNum(values.packets_total)]} packets</div>',
                                '</div>',
                                '<div style="padding:12px;border-radius:12px;background:rgba(0,0,0,0.03);color:#29465b;">',
                                    '<div style="font-size:12px;text-transform:uppercase;opacity:.7;"><i class="fa fa-database"></i> Data In / Data Out<br><br></div>',
                                    '<div style="font-size:24px;font-weight:800;">{[Ext.ux.bytesToHuman(values.data_in)]} / {[Ext.ux.bytesToHuman(values.data_out)]}</div>',
                                    '<div style="font-size:10px;font-weight:400;color:grey">{[this.fmtNum(values.packets_in)]} packets / {[this.fmtNum(values.packets_out)]} packets</div>',
                                '</div>',                              
                                                                
                            '</div>',
                       
                            {
                                fmtDate: function (d) {
                                    // accepts Date or ISO string
                                    if (d) return d;
                                    if (!d) return '—';                                 
                                },
                                fmtNum: function (n) {
                                    n = parseFloat(n || 0);
                                    return Ext.util.Format.number(n, '0,0');
                                },
                                fmtMs: function (sec) {
                                    var s = parseFloat(sec || 0);
                                    return Ext.util.Format.number(s, '0.00000'); // 5 decimals
                                },
                                frmtSpanSimple: function (v) {
                                     if (v.timespan) return v.timespan;
                                     if (!v.timespan) return '—';
                                },
                                fmtSpan: function (v) {
                                    // Prefer explicit text if provided
                                    if (v.timespan) return v.timespan;

                                    // Otherwise build from start/end
                                    var start = v.start ? (Ext.isDate(v.start) ? v.start : new Date(v.start)) : null;
                                    var end   = v.end   ? (Ext.isDate(v.end)   ? v.end   : new Date(v.end))   : null;
                                    if (!start || !end) return '—';

                                    var diffMs = Math.max(0, end - start),
                                        mins   = Math.round(diffMs / 60000),
                                        days   = Math.floor(mins / 1440),
                                        hours  = Math.floor((mins % 1440) / 60),
                                        mrem   = mins % 60;

                                    var range = Ext.Date.format(start, 'D H:i') + ' – ' + Ext.Date.format(end, 'D H:i');
                                    var human = [];
                                    if (days)  human.push(days + 'd');
                                    if (hours) human.push(hours + 'h');
                                    if (mrem)  human.push(mrem + 'm');
                                    if (!human.length) human.push('0m');
                                    return range + ' (' + human.join(' ') + ')';
                                }
                            }
                        ),
                        data: {
                            // Example structure; update dynamically (see below)
                             //date: '2025-08-20',
                             //start: '2025-08-20 00:00:00',
                             //end:   '2025-09-20 14:59:59',
                             //requests: 186432,
                             //avg_rtt: 0.00631 // seconds
                        }
                    },                  
                    {
                        flex            : 1,
                        title           : 'Client Ratio',
                        ui              : 'panel-blue',
                        border          : true,
                        margin          : m,
                        padding         : p,
                        itemId          : 'plrTraffic',
                        xtype           : 'polar',
                        innerPadding    : 10,
                        interactions    : ['rotate', 'itemhighlight'],
                        store           : Ext.data.StoreManager.lookup('strBandwidthTrafficPie'),
                        series: {
                           type         : 'pie',                     
                           highlight    : true,
                           angleField   : 'data_total',
                           label        : {
                               field    : 'mac',
                               display  : 'rotate'
                           },
                           donut        : 20,    
                           tooltip : {
                                trackMouse: true,
                                renderer: function (tooltip, record, item) {
                                    tooltip.setHtml(
                                        "<h2>"+record.get('mac')+"</h2><h3>"+Ext.ux.bytesToHuman(record.get('data_total'))+"</h3>"                                                                           
                                    );
                                }
                            }    
                        },
                        data    : {
                        }
                    }, 
                    {
                        flex            : 1,
                        title           : 'Protocol Ratio',
                        ui              : 'panel-blue',
                        border          : true,
                        margin          : m,
                        padding         : p,
                        itemId          : 'plrProtocol',
                        hidden          : true,
                        xtype           : 'polar',
                        innerPadding    : 10,
                        interactions    : ['rotate', 'itemhighlight'],
                        store           : Ext.data.StoreManager.lookup('strBandwidthProtocolPie'),
                        series: {
                           type         : 'pie',                     
                           highlight    : true,
                           angleField   : 'data_total',
                           label        : {
                               field    : 'layer7',
                               display  : 'rotate'
                           },
                           donut        : 20,    
                           tooltip : {
                                trackMouse: true,
                                renderer: function (tooltip, record, item) {
                                    tooltip.setHtml(
                                        "<h2>"+record.get('layer7')+"</h2><h3>"+Ext.ux.bytesToHuman(record.get('data_total'))+"</h3>"                                                                           
                                    );
                                }
                            }    
                        },
                        data    : {
                        }
                    },                     
                    {
                        xtype   : 'grid',
                        margin  : m,
                        padding : p,
                        title   : 'Clients',
                        ui      : 'panel-blue',
                        itemId  : 'gridTraffic',
                        border  : true,       
                        store   : Ext.data.StoreManager.lookup('strBandwidthTrafficPie'),
                        emptyText: 'No Clients For This Timespan',
                        columns: [
                            { text: 'Mac',  dataIndex: 'mac', flex: 1},
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
                    },
                    {
                        xtype   : 'grid',
                        margin  : m,
                        padding : p,
                        title   : 'Protocols',
                        ui      : 'panel-blue',
                        itemId  : 'gridProtocol',
                        hidden  : true,
                        border  : true,       
                        store   : Ext.data.StoreManager.lookup('strBandwidthProtocolPie'),
                        emptyText: 'No Clients For This Timespan',
                        columns: [
                            { text: 'Layer7',  dataIndex: 'layer7', flex: 1},
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
                    chart_traffic,
                    {
                        xtype   : 'grid',
                        margin  : m,
                        padding : p,
                        flex    : 1,
                        hidden  : true,
                        title   : "Client's Protocols",
                        ui      : 'panel-blue',
                        itemId  : 'gridClientProtocol',
                        hidden  : true,
                        border  : true,
                        store   : Ext.data.StoreManager.lookup('strBandwidthClientProtocol'),
                        emptyText: 'No Protocols For This Timespan',
                        tools   : [
                             {
                                tooltip : 'Clear Filter',
                                itemId  : 'toolClearFilterClientProtocol',
                                glyph   : Rd.config.icnFilter,
                                hidden  : true
                            }
                        ],
                        columns: [
                            { text: 'Layer7',  dataIndex: 'layer7', flex: 1},
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
                    },
                    {
                        xtype   : 'grid',
                        margin  : m,
                        padding : p,
                        flex    : 1,
                        hidden  : true,
                        title   : "Protocol's Clients",
                        ui      : 'panel-blue',
                        itemId  : 'gridProtocolClient',
                        hidden  : true,
                        border  : true,
                        store   : Ext.data.StoreManager.lookup('strBandwidthProtocolClient'),
                        emptyText: 'No Clients For This Timespan',
                        tools   : [
                             {
                                tooltip : 'Clear Filter',
                                itemId  : 'toolClearFilterProtocolClient',
                                glyph   : Rd.config.icnFilter,
                                hidden  : true
                            }
                        ],
                        columns: [
                            { text: 'Mac',  dataIndex: 'mac', flex: 1},
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

