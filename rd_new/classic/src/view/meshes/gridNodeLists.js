/*-----------------------------------------------------------
  File: rd/app/view/meshes/gridMeshViewNodeDetails.js
 
--------------------------------------------------------------------------- */
Ext.define('Rd.view.meshes.gridNodeLists' ,{
    extend		:'Ext.grid.Panel',
    alias 		: 'widget.gridNodeLists',
    multiSelect	: true,
    stateful	: true,
    stateId		: 'StateGridNodeLists',
    stateEvents	:['groupclick','columnhide'],
    border		: false,
    requires	: [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager'       
    ],
    viewConfig: {
        loadMask:true
    },
    urlMenu : '/cake3/rd_cake/meshes/menu_for_nodes_grid.json', //Same restrictions on the nodes will aplly here!
    plugins : 'gridfilters',  //*We specify this
    /*features: [{
        ftype               : 'grouping',
        hideGroupedHeader   : false,
        showSummaryRow      : true,
        enableGroupingMenu  : true,
        startCollapsed      : false
    }],*/
    initComponent: function(){
        var me      = this;

		me.store    = Ext.create(Rd.store.sNodeLists,{});
         
         me.bbar   =  [
            {
                 xtype       : 'pagingtoolbar',
                 store       : me.store,
                 displayInfo : true,
                 plugins     : {
                    'ux-progressbarpager': true
                }
            }  
        ];

		me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});
        me.columns  = [
        //    {xtype: 'rownumberer',stateId: 'StateGridNodeLists1'},
			{ 
                text        : i18n('sOwner'), 
                dataIndex   : 'owner', 
                tdCls       : 'gridTree', 
                flex        : 1,
                stateId     : 'StateGridNodeLists2', 
                sortable    : false,
                hidden      : true
            },
			{ text: 'Mesh',  dataIndex: 'mesh',  tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridNodeLists3'},
			{ 
                text        : i18n('sName'),   
                dataIndex   : 'name',  
                tdCls       : 'gridTree',
                width		: 130,
                renderer    : function(value,metaData, record){
                	var gateway     = record.get('gateway');
                	var reboot_flag = record.get('reboot_flag');
                	var rb_string   = '';
                	if(reboot_flag == 1){
                	    rb_string = "<i class=\"fa fa-power-off\" style=\"color:orange;\"></i>";
                	}
                    if(gateway == 'yes'){
                        return "<div class=\"fieldGreyWhite\" style=\"text-align:left;\">"+rb_string+"  "+value+"</div>";
                    }
                    if(gateway == 'no'){
                        return "<div class=\"fieldGrey\" style=\"text-align:left;\">"+rb_string+"  "+value+"</div>";
                    }  	             
                },
                stateId     : 'StateGridNodeLists4',
                flex        : 1,
                filter      : {type: 'string'}
            },
            { 
				text		: i18n('sDescription'), 
				dataIndex	: 'description',  
				tdCls		: 'gridTree', 
				flex		: 1,
				filter		: {type: 'string'},
				stateId		: 'StateGridNodeLists5',
				hidden      : true
			},
            { 
				text		: 'MAC Address',      	
				dataIndex	: 'mac',          
				tdCls		: 'gridTree', 
				flex		: 1,
				filter		: {type: 'string'},
				stateId: 'StateGridNodeLists6',
				hidden      : true
			},
            { 
				text		: i18n('sHardware'),      
				dataIndex	: 'hardware',     
				tdCls		: 'gridTree', 
				flex		: 1,
				filter		: {type: 'string'},
				hidden      : true,
				xtype       :  'templatecolumn', 
                tpl         :  new Ext.XTemplate(
                    '{hw_human}'
                ),
				stateId		: 'StateGridNodeLists7'
			},
			{
				text: 'Last 24 Hours',
				//flex: 1,
				width: 150,
				dataIndex: 'dayuptimehist',
				xtype: 'widgetcolumn',
				stateId		: 'StateGridNodeLists7a',
				sortable: false,
				widget: {
					xtype: 'sparklinebar',
					barColor: 'green',
					/*
					colorMap: {
						// Open ended range, with max value 5
						":5": "blue",
						// Open ended range, with min value 5
						"6:": "green"
					},
					*/
					barSpacing: 0,
					barWidth: 1,
					centered: true,
					disableTooltips: true,
					tipTpl: ''
				}
			},
			{
				text: 'Avail',
				//flex: 1,
				width: 75,
				dataIndex: 'uptimhistpct',
				align: 'center',
				xtype: 'widgetcolumn',
				stateId		: 'StateGridNodeLists7b',
				sortable: false,
				widget: {
					xtype: 'sparklinepie',
					sliceColors: [ 'green', 'red' ],
					centered: true,
					tipTpl: 'Mins: {value:number("0.0")} ({percent:number("0.0")}%)'
				}
			},
			{ 
                text        : "<i class=\"fa fa-gears\"></i> "+'Config Fetched', 
                dataIndex   : 'config_fetched',  
                tdCls       : 'gridTree', 
                flex        : 1,
                renderer    : function(val,metaData, record){
                    var config_fetched_human     = record.get('config_fetched_human');  
                    var config;
                    var value = record.get('config_state');
                    if(value != 'never'){                    
                        if(value == 'up'){
                            config =  "<div class=\"fieldGreen\">"+config_fetched_human+"</div>";
                        }
                        if(value == 'down'){
                            config = "<div class=\"fieldGrey\">"+config_fetched_human+"</div>";
                        }

                    }else{
                        config = "<div class=\"fieldBlue\">Never</div>";
                    }
                    return config;
                                 
                },stateId: 'StateGMVND12a',
                hidden: false
            },
            { 
                text        : "<i class=\"fa fa-heartbeat\"></i> "+'Heartbeat Received',   
                dataIndex   : 'last_contact',  
                tdCls       : 'gridTree', 
                flex        : 1,
                renderer    : function(val,metaData, record){    
                    var heartbeat;
                    var value = record.get('state');
                    if(value != 'never'){                    
                        var last_contact     = record.get('last_contact_human');
                        if(value == 'up'){
                            heartbeat =  "<div class=\"fieldGreen\">"+last_contact+"</div>";
                        }
                        if(value == 'down'){
                            heartbeat = "<div class=\"fieldRed\">"+last_contact+"</div>";
                        }

                    }else{
                        heartbeat = "<div class=\"fieldBlue\">Never</div>";
                    }
                    return heartbeat;
                                 
                },stateId: 'StateGridNodeLists8'
            },
            { 

                text        : 'From IP', 
                dataIndex   : 'last_contact_from_ip',          
                tdCls       : 'gridTree', 
                flex        : 1,
                hidden      : true, 
                xtype       :  'templatecolumn', 
                 tpl         :  new Ext.XTemplate(
                    '<div class=\"fieldGreyWhite\">{last_contact_from_ip}</div>',
                    "<tpl if='Ext.isEmpty(city)'><tpl else>",
                        '<div><b>{city}</b>  ({postal_code})</div>',
                    "</tpl>",
                    "<tpl if='Ext.isEmpty(country_name)'><tpl else>",
                        '<div><b>{country_name}</b> ({country_code})</div>',
                    "</tpl>"   
                ), 
                filter		: {type: 'string'},stateId: 'StateGridNodeLists8a'
            },
            { text: i18n('sIP_Address'), dataIndex: 'ip', tdCls: 'gridTree', flex: 1,filter : {type: 'string'}, stateId: 'StateGridNodeLists9',
                hidden: true
            },
            { 
                text    : 'OpenVPN Connections',
                sortable: false,
                width   : 150,
                hidden  : true,
                flex    : 1,
                tdCls   : 'gridTree',
                xtype   : 'templatecolumn', 
                tpl:    new Ext.XTemplate(
                    '<tpl for="openvpn_list">',     // interrogate the realms property within the data
                        "<tpl if='lc_human == \"never\"'><div class=\"fieldBlue\">{name}</div>",
                        "<div style=\"font-size: 12px;\">(Never tested {name})</div>",
                        '<tpl else>',
                            "<tpl if='state == true'>",
                                "<div class=\"fieldGreen\">{name}</div>",
                                "<div style=\"font-size: 12px; color:#4d4d4d;\">Tested up {lc_human}</div>",
                            "</tpl>",
                            "<tpl if='state == false'>",
                                "<div class=\"fieldRed\">{name}</div>",
                                "<div style=\"font-size: 12px; color:#4d4d4d;\">Tested down {lc_human}</div>",
                            "</tpl>",
                        "</tpl>",
                    '</tpl>'
                ),
                dataIndex: 'openvpn_list',
                stateId : 'StateGridNodeLists10'
            },
            {   
                text        : 'Internet Connection',       
                dataIndex   : 'wbw_signal',    
                tdCls       : 'gridTree', 
                stateId     : 'StateGridMeshViewNodes8',
                width       : 150,
                sortable    : false,
                renderer: function (v, m, r) {
                    if(v != null){
                        var bar = r.get('wbw_signal_bar');
                        var state = r.get('state');
                        if(state == 'up'){
                            var cls = 'wifigreen';
                            if(bar < 0.3){
                                cls = 'wifired';   
                            }
                            if((bar >= 0.3)&(bar <= 0.5)){
                                cls = 'wifiyellow';
                            }
                        }else{
                            cls = 'wifigrey';
                        }
                        var id = Ext.id();
                        Ext.defer(function () {
                            var p = Ext.widget('progressbarwidget', {
                                renderTo    : id,
                                value       : bar,
                                width       : 140,
                                text        : "<i class=\"fa fa-wifi\"></i> "+v+" dBm",
                                cls         : cls
                            });
                        
                            //Fetch some variables:
                            var t       = r.get('l_modified_human');

                            var t  = Ext.create('Ext.tip.ToolTip', {
                                target  : id,
                                border  : true,
                                anchor  : 'left',
                                html    : [
                                    "<div>",
                                        "<h2>Latest connection detail</h2>",
                                        "<label class='lblTipItem'>Channel</label><label class='lblTipValue'>"+r.get('wbw_channel')+"</label>",
                                        "<div style='clear:both;'></div>",
                                        "<label class='lblTipItem'>TX Power</label><label class='lblTipValue'>"+r.get('wbw_txpower')+"</label>",
                                        "<div style='clear:both;'></div>",
                                        "<label class='lblTipItem'>Quality</label><label class='lblTipValue'>"+r.get('wbw_quality')+"/70</label>",
                                        "<div style='clear:both;'></div>",
                                        "<label class='lblTipItem'>Noise</label><label class='lblTipValue'>"+r.get('wbw_noise')+"</label>",
                                        "<div style='clear:both;'></div>",
                                        "<label class='lblTipItem'>TX Packets</label><label class='lblTipValue'>"+r.get('wbw_tx_packets')+"</label>",
                                        "<div style='clear:both;'></div>",
                                        "<label class='lblTipItem'>TX Packets</label><label class='lblTipValue'>"+r.get('wbw_rx_packets')+"</label>",
                                        "<div style='clear:both;'></div>",
                                        "<label class='lblTipItem'>TX Rate</label><label class='lblTipValue'>"+r.get('wbw_tx_rate')+" Mbps</label>",
                                        "<div style='clear:both;'></div>",
                                        "<label class='lblTipItem'>TX Rate</label><label class='lblTipValue'>"+r.get('wbw_rx_rate')+" Mbps</label>",
                                        "<div style='clear:both;'></div>", 
                                        "<label class='lblTipItem'>Speed (~)</label><label class='lblTipValue'>"+r.get('wbw_expected_throughput')+" Mbps</label>",
                                        "<div style='clear:both;'></div>",
                                        "<label class='lblTipItem'>SSID</label><label class='lblTipValue'>"+r.get('wbw_ssid')+"</label>",
                                        "<div style='clear:both;'></div>",
                                    "</div>" 
                                ]
                            });

                        }, 100);
                        return Ext.String.format('<div id="{0}"></div>', id);
                    }else{
                        if(r.get('gateway') == 'no'){
                            return '<div class=\"fieldGrey\"><i class=\"fa fa-dice-d20\"></i> MESH</div>';
                        }
                        if(r.get('gateway') == 'yes'){
                            return '<div class=\"fieldBlue\"><i class=\"fa fa-network-wired\"></i> LAN</div>';
                        }
                        return 'N/A';
                    }
                }
            },
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                width       : 80,
                stateId     : 'StateGridMeshes11',
                items       : [				
					 { 
						iconCls : 'txtRed x-fa fa-trash',
						tooltip : 'Delete',
						isDisabled: function (grid, rowIndex, colIndex, items, record) {
                                if (record.get('delete') == true) {
                                     return false;
                                } else {
                                    return true;
                                }
                        },
                        handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'delete');
                        }
                    },
                    {  
                        iconCls : 'txtBlue x-fa fa-pen',
                        tooltip : 'Edit',
                        isDisabled: function (grid, rowIndex, colIndex, items, record) {
                                if (record.get('update') == true) {
                                     return false;
                                } else {
                                    return true;
                                }
                        },
						handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'update');
                        }
					},
					{  
                        iconCls : 'txtGrey x-fa fa-power-off',
                        tooltip : 'Restart',
						handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'restart');
                        }
					}
				]
	        }      
        ];
        me.callParent(arguments);
    }
});
