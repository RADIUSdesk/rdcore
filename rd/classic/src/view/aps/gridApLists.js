Ext.define('Rd.view.aps.gridApLists' ,{
    extend		: 'Ext.grid.Panel',
    alias 		: 'widget.gridApLists',
    multiSelect	: true,
    stateful	: true,
    stateId		: 'StateGridApLists',
    stateEvents	: ['groupclick','columnhide'],
    store       : 'sApLists',
    border		: false,
    requires	: [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager'
    ],
    viewConfig  : {
        loadMask:true
    },
    urlMenu     : '/cake3/rd_cake/ap-profiles/menu_for_aps_grid.json',
    plugins     : [
        'gridfilters',
        {
            ptype: 'rowexpander',
            rowBodyTpl : new Ext.XTemplate(
                '<div style="color:#2255ce;  background-color:#aeaeae; padding:5px;">',
                '<img src="/cake3/rd_cake/img/hardwares/{hw_photo}" alt="{hw_human}" style="float: left; padding-right: 20px;">',
                '<h2>{name}</h2>',
                '<span>{hw_human}</span>',
                '</div>',
                '<div class="sectionHeader">',
                    '<h2>DEVICE INFORMATION (for the past hour)</h2>',
                '</div>',
                "<div style='background-color:white; padding:5px;'>",
                   '<ul class="fa-ul">',    
                    "<tpl if='state == \"never\"'>",
                    "<li style='color:blue;'><i class='fa-li fa fa-question-circle'></i>Never connected before</li>",
                    "</tpl>",
                    "<tpl if='state == \"down\"'>",
                    "<li style='color:red;'><i class='fa-li fa  fa-exclamation-circle'></i>Offline (last check-in <b>{last_contact_human}</b> ago).</li>",
                    "</tpl>",
                    "<tpl if='state == \"up\"'>",
                    '<li style="color:green;"><i class="fa-li fa fa-check-circle"></i>Online (last check-in <b>{last_contact_human}</b> ago).</li>',
                    "</tpl>",
                    '<tpl for="ssids">',
                        '<li><i class="fa-li fa fa-wifi"></i><b>{name}</b> had <b>{users}</b> users.</li>',
                    '</tpl>',                  
                    '<li><i class="fa-li fa fa-info-circle"></i>Public IP <b>{last_contact_from_ip}</b>.</li>',
                    '<li><i class="fa-li fa fa-database"></i>Data usage <b>{data_past_hour}</b>.</li>',
                    '<li><i class="fa-li fa fa-link"></i>Last connection from <b>{newest_station}</b> which was <b>{newest_time}</b> ({newest_vendor}).</li>',
                     "<li style='color:blue;'><i class='fa-li fa fa-info-circle'></i>LAN IP: {lan_ip} LAN Gateway: {lan_gw}  ({lan_proto}) </li>",
                        '</ul>',



                "</div>"
            )
        }
    ],
    initComponent: function(){
        var me  = this;  
        me.bbar = [{
            xtype       : 'pagingtoolbar',
            store       : me.store,
            displayInfo : true,
            plugins     : {
                'ux-progressbarpager': true
            }
        }];
        
		me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});
		
        me.columns  = [
         //   {xtype: 'rownumberer',stateId: 'StateGridApLists1'},
			{ 
                text        : i18n("sOwner"), 
                dataIndex   : 'owner', 
                tdCls       : 'gridTree', 
                flex        : 1,
                stateId     : 'StateGridApLists2', 
                sortable    : false,
                hidden      : true
            },
			{ text: i18n("sProfile"),  dataIndex: 'ap_profile',  tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridApLists3'},
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
                stateId     : 'StateGridApLists4',
                flex        : 1,
                filter      : {type: 'string'}
            },
            //{ text: i18n("sName"),  dataIndex: 'name',  tdCls: 'gridMain', flex: 1,filter: {type: 'string'},stateId: 'StateGridApLists4'},
            { 
				text		: i18n("sDescription"), 
				dataIndex	: 'description',  
				tdCls		: 'gridTree', 
				flex		: 1,
				filter		: {type: 'string'},
				stateId		: 'StateGridApLists5',
				hidden      : true
			},
            { 
				text		: i18n("sMAC_address"),      	
				dataIndex	: 'mac',          
				tdCls		: 'gridTree', 
				flex		: 1,
				filter		: {type: 'string'},
				stateId     : 'StateGridApLists6'
			},
            { 
				text		: i18n("sHardware"),      
				dataIndex	: 'hw_human',     
				tdCls		: 'gridTree', 
				flex		: 1,
				filter		: {type: 'string'},
				stateId		: 'StateGridApLists7',
				hidden      : true
			},				
			{
				text        : 'Last 24 Hours',
				width       : 150,
				dataIndex   : 'dayuptimehist',
				xtype       : 'widgetcolumn',
				stateId		: 'StateGridApLists7a',
				sortable    : false,
				widget      : {
					xtype   : 'sparklinebar',
					barColor: 'green',
					/*
					colorMap: {
						// Open ended range, with max value 5
						":5": "blue",
						// Open ended range, with min value 5
						"6:": "green"
					},
					*/
					barSpacing  : 0,
					barWidth    : 1,
					centered    : true,
					disableTooltips: true,
					tipTpl      : ''
				}
			},
			{
				text        : 'Avail',
				width       : 75,
				dataIndex   : 'uptimhistpct',
				align       : 'center',
				xtype       : 'widgetcolumn',
				stateId		: 'StateGridApLists7b',
				sortable    : false,
				widget      : {
					xtype       : 'sparklinepie',
					sliceColors : [ 'green', 'red' ],
					centered    : true,
					tipTpl      : 'Mins: {value:number("0.0")} ({percent:number("0.0")}%)'
				}
			},
			{ 
                text        : "<i class=\"fa fa-gears\"></i> "+'Config Fetched', 
                dataIndex   : 'config_state',  
                tdCls       : 'gridTree', 
                flex        : 1,
                renderer    : function(value,metaData, record){
                    var config_fetched_human     = record.get('config_fetched_human');  
                    var config;
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
                                 
                },stateId: 'StateGridApLists7c',
                hidden: false
            },
            { 
                text        : "<i class=\"fa fa-heartbeat\"></i> "+'Heartbeat Received',   
                dataIndex   : 'state',  
                tdCls       : 'gridTree', 
                flex        : 1,
                renderer    : function(value,metaData, record){    
                    var heartbeat;
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
                                 
                },stateId: 'StateGridApLists8'
            },
            { 

                text        : i18n("sFrom_IP"), 
                dataIndex   : 'last_contact_from_ip',          
                tdCls       : 'gridTree', 
                width       : 170,
                hidden      : true,
                xtype       : 'templatecolumn', 
                tpl         :  new Ext.XTemplate(
                    '<tpl if="Ext.isEmpty(last_contact_from_ip)"><div class=\"fieldGreyWhite\">Not Available</div>',
                    '<tpl else>',
                    '<div class=\"fieldGreyWhite\">{last_contact_from_ip}</div>',
                    "<tpl if='Ext.isEmpty(city)'><tpl else>",
                        '<div><b>{city}</b>  ({postal_code})</div>',
                    "</tpl>",
                    "<tpl if='Ext.isEmpty(country_name)'><tpl else>",
                        '<div><b>{country_name}</b> ({country_code})</div>',
                    "</tpl>",
                    "</tpl>"   
                ), 
                filter		: {type: 'string'},stateId: 'StateGridApLists9'
            },
            { 
                text    : 'Last command',
                sortable: false,
                width   : 170,
                tdCls   : 'gridTree', 
                xtype   : 'templatecolumn', 
                tpl:    new Ext.XTemplate(
                "<tpl if='last_cmd_status == \"\"'><div class=\"fieldBlue\">(nothing)</div></tpl>", 
                "<tpl if='last_cmd_status == \"awaiting\"'><div class=\"fieldBlue\"><i class=\"fa fa-clock-o\"></i> {last_cmd}</div></tpl>",
                "<tpl if='last_cmd_status == \"fetched\"'><div class=\"fieldGreen\"><i class=\"fa fa-check-circle\"></i> {last_cmd}</div></tpl>"
                ),
                stateId	: 'StateGridApLists10',
				hidden	: true
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
                stateId	: 'StateGridApLists11'
            },
            {   
                text        : 'Internet Connection',       
                dataIndex   : 'wbw_signal',    
                tdCls       : 'gridTree', 
                stateId     : 'StateGridApLists12',
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
            }
        ];
        me.callParent(arguments);
    }
});
