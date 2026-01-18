Ext.define('Rd.view.aps.pnlApViewVpnGraph', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlApViewVpnGraph',
    border  : false,
    layout  : {
        type    : 'vbox',         
        align   : 'stretch'
    },
    initComponent: function(){
    
        var me      = this; 
        var m       = 5;
        var p       = 5; 
           
       var sPie = Ext.create('Ext.data.Store', {
            fields: [
                { name: 'category', type: 'string' },
                { name: 'count',    type: 'int' }
            ]
        });
              
        var sLine = Ext.create('Ext.data.Store', {
            fields: [
                { name: 'rx_bytes', type: 'int' },
                { name: 'tx_bytes', type: 'int' },
                { name: 'id', type: 'int' },
                { name: 'slot_start_txt', type: 'string' },
                { name: 'time_unit', type: 'string' },
            ],
            data: [{
                
            }]
        });
        
        var sSessions = Ext.create('Ext.data.Store', {
            fields: [            
                { name: 'id', type: 'int' },
                { name: 'ap_vpn_connection_id', type: 'int' },
                { name: 'starttime', type: 'date' },
                { name: 'stoptime', type: 'date' },
                { name: 'sessiontime', type: 'int' },
                { name: 'rx_bytes', type: 'int' },
                { name: 'tx_bytes', type: 'int' },
            ],
            data: [{
                
            }]
        });        
        
        var crtPackets = Ext.create('Ext.chart.CartesianChart', {
            store: sLine,
            itemId  : 'crtPackets',
            margin  : m,
            padding : p,
            flex    : 2,
            interactions: ['itemhighlight'],
            axes: [
                {
                    type    : 'category',
                    position: 'bottom',
                    fields  : ['time_unit'],
                    label   : Rd.config.rdGraphLabel,
                    grid    : true
                }, 
                {
                    type    : 'numeric',
                    position: 'left',
                    grid    : true,
                    minimum: 0,
                    label  : Rd.config.rdGraphLabel,
                    fields : ['tx_bytes', 'rx_bytes'],
                    renderer    : function(axis, label, layoutContext) {
                        return Ext.ux.bytesToHuman(label);
                    }
                }
            ],
            series: [
                {
                    type    : 'bar',
                    title   : [ 'Data In', 'Data out' ],
                    xField  : 'time_unit',
                    yField  : ['tx_bytes', 'rx_bytes'],
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
                            var di = Ext.ux.bytesToHuman(record.get("rx_bytes"));
                            var dout = Ext.ux.bytesToHuman(record.get("tx_bytes"));
                            tooltip.setHtml("Data in <b>"+di+"</b><br>Data out <b>"+dout+"</b>");    
                            
                        }
                    }
                }
            ]
        });
                      
        me.items = [
            {
                ui      : 'panel-blue',
                collapsible : true,
                border  : true,
                title   : 'Sessions',
                flex    : 1,
                margin  : 5, 
                xtype   : 'grid',
                itemId  : 'gridSessions',     
                store   : sSessions,
                emptyText: 'No Sessions For This Timespan',
                columns: [
                    { 
                        text        : 'Start',  
                        dataIndex   : 'starttime',                      
                        flex        : 1,
                        xtype       : 'datecolumn',
                        format      : 'D d M Y H:i:s'                  
                    },
                    { 
                        text        : 'Stop',
                        dataIndex   : 'stoptime',
                        flex        : 1,
                        xtype       : 'datecolumn',
                        format      : 'D d M Y H:i:s',
                        renderer    : function(value,metaData, record){
                            var open    = record.get('open_session');
                            var stale   = record.get('stale_session');
                            if(open){
                                if(stale){
                                   return "<span class='rd-badge rd-badge--amber'>Last Seen "+record.get('last_contact_in_words')+'</span>';  
                                }else{                                    
                                   return "<span class='rd-badge rd-badge--green'>Last Seen "+record.get('last_contact_in_words')+'</span>';
                                }
                            }else{
                                return Ext.Date.format(value, 'D d M Y H:i:s');
                            }
                        }            
                    },            
                    { text: 'Session',dataIndex: 'sessiontime', flex: 1, renderer : function(value){
                            return Ext.ux.secondsToHuman(value);            
                        }
                    },
                    { text: 'Data In',    dataIndex: 'rx_bytes', flex: 1, renderer: function(value){
                            return Ext.ux.bytesToHuman(value)              
                        } 
                    },
                    { text: 'Data Out',  dataIndex: 'tx_bytes', flex: 1, renderer: function(value){
                            return Ext.ux.bytesToHuman(value)              
                        } 
                    }
                ]              
           },
           {
                xtype   : 'panel',
                ui      : 'panel-blue',
                collapsible : true,
                flex    : 1,
                border  : true,
                title   : 'Data Usage',
                margin  : 5,
                layout: {
                    type    : 'hbox',
                    align   : 'stretch'
                },
                items : [
                    {
                        flex            : 1,
                        xtype           : 'polar',
                        store           : sPie,
                        insetPadding    : 50,
                        innerPadding    : 20,
                        itemId          : 'plrPackets',
                        interactions    : ['rotate', 'itemhighlight'],
                        series          : [{
                            type        : 'pie',
                            angleField  : 'count',
                            label: {
                                field       : 'category',
                                display     : 'rotate',
                                contrast    : true,
                                font        : '18px Arial'
                            },
                            highlight   : true,
                            colors      : Rd.config.rdGraphBarColors, // Custom color set
                            tooltip     : {
                                trackMouse: true,
                                renderer: function(tooltip, record, item) {
                                    tooltip.setHtml(record.get('category') + ': ' + Ext.ux.bytesToHuman(record.get('count')));
                                }
                            }
                        }]                    
                    },
                    crtPackets
                ]
            }
            
        ];       
        
        me.callParent(arguments);
    }
});
