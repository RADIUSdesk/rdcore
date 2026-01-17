Ext.define('Rd.view.freeradiusStats.pnlFreeradiusStats', {
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlFreeradiusStats',
    plain       : true,
    frame       : false,
    layout      : {
        type    : 'vbox',
        pack    : 'start',
        align   : 'stretch'
    },
    requires    : [
        'Rd.view.freeradiusStats.vcFreeradiusStats'
    ],
    controller  : 'vcFreeradiusStats',
    initComponent: function(){
    
        var me 	    = this;
        var scale   = 'small';
        var dd      = Ext.getApplication().getDashboardData();
        var m       = 5;
        var p       = 5;
        
        me.timezone_id = dd.user.timezone_id;
        
        Ext.create('Ext.data.Store', {
            storeId : 'distroStore',
            fields  :[ 
                {name: 'id',        type: 'int'},
                { name: 'objtype',  type: 'string' },
                { name: 'requests', convert: v => v == null ? 0 : parseFloat(v) }, 
                { name: 'responsetime', convert: v => v == null ? 0 : parseFloat(v) }             
            ]
        });
        
        Ext.create('Ext.data.Store', {
            storeId : 'loadStore',
            fields  :[ 
                {name: 'id',         type: 'int'},
                {name: 'hostname',   type: 'string'},
                {name: 'requests',   type: 'int'},
                { name: 'responsetime', convert: v => v == null ? 0 : parseFloat(v) } 
            ]
        });
                      
        // Model-less store; convert string -> number, keep nulls as null
        function intOrNull(v){ return (v===null || v===undefined || v==='') ? null : parseInt(v,10); }
        function floatOrNull(v){ return (v===null || v===undefined || v==='') ? null : parseFloat(v); }
        
        var store = Ext.create('Ext.data.Store', {
            fields: [
                { name: 'time_unit', type: 'string' },
                { name: 'access_requests', convert: intOrNull },
                { name: 'acct_requests', convert: intOrNull },
                { name: 'id', type: 'int' }
            ],
            data: []         
        });
        
        var chart = {
            xtype   : 'panel',
            itemId  : 'pnlRequests',
            flex    : 2,
            width: '100%',
            layout: 'fit',
            items: [{
                xtype: 'cartesian',
                reference: 'radRequestsChart',
                itemId  : 'barTotals',
                store: store,
                insetPadding: 20,
                animation: true,
                legend: { docked: 'top' },
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
                    label  : Rd.config.rdGraphLabel
                }],
                series: [{
                    type: 'bar',
                    xField: 'time_unit',
                    yField: ['access_requests','acct_requests' ],
                    title: ['Auth','Acct'],
                    stacked: false,        // grouped bars; set true for stacked
                    highlight: true,
                    colors  : Rd.config.rdGraphBarColors, // Custom color set
                    style   : { minGapWidth: 12 },
                    tooltip: {
                        trackMouse: true,
                        renderer: function (tooltip, record, item) {
                            var labelMap = {
                                requests_acct: 'Acct',
                                requests_auth: 'Auth'
                            };
                            var yField = item.field; // the specific series field for this bar
                            var val = record.get(yField);
                            tooltip.setHtml(
                                Ext.String.format(
                                    '<div><b>{0}</b> @ {1}: {2}</div>',
                                    labelMap[yField] || yField,
                                    (record.get('time_unit') || '').replace('\n', ' '),
                                    Ext.util.Format.number(val, '0,000')
                                )
                            );
                        }
                    }
                }]
            }]
        }
                          
        me.dockedItems= [
            {
                xtype   : 'toolbar',
                dock    : 'top',
                items   : [
                    {  
                        glyph   : Rd.config.icnReload,    
                        scale   : scale, 
                        itemId  : 'reload',
                        ui      : 'button-orange',   
                        tooltip: i18n('sReload')
                    },
                    '|',
                    { 
                        scale       : scale, 
                        glyph       : Rd.config.icnLeft,
                        reference   : 'btnTimeBack',
                        tooltip     : 'Go Back 1Day',
                        listeners   : {
                            click: 'onClickTimeBack'
                        }
                    },  
                    {
                        xtype       : 'datefield',
                        itemId      : 'dtDate',
                        reference   : 'dtDate',
                        name        : 'date',
                        format      : "d/m/Y",
                        value       : new Date(),
                        width       : 120
                    },
                    { 
                        scale       : scale, 
                        glyph       : Rd.config.icnRight,
                        reference   : 'btnTimeForward',
                        tooltip     : 'Go Forward 1Day',
                        disabled    : true,
                        listeners   : {
                            click: 'onClickTimeForward'
                        }
                    }, 
                    '|',
                    {
                        text        : 'Day',
                        glyph       : Rd.config.icnHourStart,
                        scale       : scale,
                        enableToggle: true,
                        toggleGroup : 'range',
                        allowDepress: false,
                        value       : 'day',
                        pressed     : true,
                        listeners   : {
                            click: 'onClickTodayButton'
                        }
                    }, 
                    {
                        text        : 'Week',
                        glyph       : Rd.config.icnHourHalf,
                        scale       : scale,
                        enableToggle: true,
                        toggleGroup: 'range',
                        allowDepress: false,
                        value       : 'week',
                        listeners   : {
                           click: 'onClickThisWeekButton'
                        }
                   }, 
                   {
                        text        : 'Month',
                        glyph       : Rd.config.icnHourEnd,
                        scale       : scale,
                        enableToggle: true,
                        toggleGroup: 'range',
                        allowDepress: false,
                        value       : 'month',
                        listeners   : {
                            click: 'onClickThisMonthButton'
                        }
                   },                  
                   { 
                        scale       : scale, 
                        glyph       : Rd.config.icnTime,
                        tooltip     : 'Timezone',
                        ui          : 'button-metal',   
                        menu        : [
                        {
                            xtype         : 'cmbTimezones', 
                            width         : 300, 
                            itemId        : 'cmbTimezone',
                            name          : 'timezone_id', 
                            labelClsExtra : 'lblRdReq',
                            labelWidth    : 100, 
                            padding       : 10,
                            margin        : 10,
                            value         : me.timezone_id,
                            listeners     : {
                                change  : function(cmb){
                                    var btn = cmb.up('button');
                                    btn.getMenu().hide();
                                    console.log(cmb.getValue());
                                }
                            }
                        }]
                    }
                ]
            }
        ];
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
                            '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;text-align:center;">',
                                '<div style="padding:12px;border-radius:12px;background:rgba(0,0,0,0.03);color:#29465b;">',
                                    '<div style="font-size:12px;text-transform:uppercase;opacity:.7;">Date<br><br></div>',
                                    '<div style="font-size:22px;font-weight:700;">{[this.fmtDate(values.date || values.start)]}</div>',
                                    '<div style="font-size:10px;font-weight:700;color:grey">{time}</div>',
                                '</div>',
                                '<div style="padding:12px;border-radius:12px;background:rgba(0,0,0,0.03);color:#29465b;">',
                                    '<div style="font-size:12px;text-transform:uppercase;opacity:.7;">Timespan<br><br></div>',
                                   // '<div style="font-size:22px;font-weight:700;">{[this.fmtSpan(values)]}</div>',
                                     '<div style="font-size:22px;font-weight:700;">{[this.frmtSpanSimple(values)]}</div>',
                                '</div>',
                                '<div style="padding:12px;border-radius:12px;background:rgba(0,0,0,0.03);color:#29465b;">',
                                    '<div style="font-size:12px;text-transform:uppercase;opacity:.7;">Access Requests<br><br></div>',
                                    '<div style="font-size:28px;font-weight:800;letter-spacing:.3px;">{[this.fmtNum(values.access_requests)]}</div>',
                                '</div>',
                                '<div style="padding:12px;border-radius:12px;background:rgba(0,0,0,0.03);color:#29465b;">',
                                    '<div style="font-size:12px;text-transform:uppercase;opacity:.7;">Acct Request<br><br></div>',
                                    '<div style="font-size:28px;font-weight:800;letter-spacing:.3px;">{[this.fmtNum(values.acct_requests)]}</div>',
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
                        flex            : 2,
                        title           : 'FreeRADIUS Instances',
                        ui              : 'panel-blue',
                        border          : true,
                        margin          : m,
                        padding         : p,
                        itemId          : 'gridInstances',
                        xtype           : 'panel',
                      //  store           : Ext.data.StoreManager.lookup('loadStore'),
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
                        flex            : 1,
                        border          : false,
                        margin          : m,
                        padding         : p,
                        itemId          : 'plrAcctAuth',
                        xtype           : 'polar',
                        innerPadding    : 10,
                        interactions    : ['rotate', 'itemhighlight'],
                        store: Ext.data.StoreManager.lookup('distroStore'),
                        series: {
                            type       : 'pie',
                            angleField : 'requests',
                            donut      : 10,
                            highlight  : true,
                            colors  : Rd.config.rdGraphBarColors, // Custom color set
                            showInLegend: true,           // use legend with the slice names
                            label: {
                                field   : 'objtype',      // use your objtype for names
                                display     : 'outside',           // keep callouts outside the pie
                                orientation : 'horizontal',    // ensure text isn't rotated on the arc
                                textAlign   : 'left',            // align wording consistently
                                calloutLine : { length: 30, width: 1 },
                                fontSize    : '14px',
                                fontFamily  : 'Roboto, Arial, sans-serif',
                                renderer: function (text, sprite, config, rendererData, index) {
                                    var store = rendererData.store,
                                        rec   = store.getAt(index),
                                        val   = parseFloat(rec.get('requests')) || 0,
                                        total = 0;

                                    store.each(function(r){
                                        total += parseFloat(r.get('requests')) || 0;
                                    });

                                    var pct = total ? (val / total) * 100 : 0;
                                    return Ext.String.format(
                                        '{0}\n{1} ({2}%)',
                                        rec.get('objtype'),
                                        Ext.util.Format.number(val, '0,000'),
                                        Ext.util.Format.number(pct, '0')
                                    ); // e.g. "Auth: 14,267 (33%)"
                                }
                            },
                            tooltip : {
                                trackMouse: true,
                                renderer: function (tooltip, record) {
                                    var val = parseFloat(record.get('requests')) || 0;
                                    tooltip.setHtml(
                                        '<div><b>' + record.get('objtype') + '</b><br/>' +
                                        Ext.util.Format.number(val, '0,000') + ' requests</div>'
                                    );
                                }
                            }
                        },
                        data    : {
                        }
                    }, 
                    chart
                ]
            }
        ];                                  
        me.callParent(arguments);
    }
});
