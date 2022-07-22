Ext.define('Rd.view.dynamicClients.gridDynamicClients' ,{
    extend      : 'Ext.grid.Panel',
    alias       : 'widget.gridDynamicClients',
    multiSelect : true,
    store       : 'sDynamicClients',
    stateful    : true,
    stateId     : 'StateGridDc1',
    stateEvents : ['groupclick','columnhide'],
    border      : false,
    requires    : [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager'
    ],
    viewConfig: {
        loadMask:true
    },
    urlMenu: '/cake3/rd_cake/dynamic-clients/menu-for-grid.json',
    plugins     : 'gridfilters',  //*We specify this
    initComponent: function(){
        var me      = this;
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
       //     {xtype: 'rownumberer',stateId: 'StateGridDc1'},
            { text: i18n('sOwner'),        dataIndex: 'owner', tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridDc2',
                hidden: true
            },
            { text: i18n('sName'),         dataIndex: 'name',  tdCls: 'gridMain', flex: 1,filter: {type: 'string'},stateId: 'StateGridDc3'},
            { text: i18n('sNAS-Identifier'),dataIndex: 'nasidentifier',tdCls: 'gridMain', flex: 1, filter: {type: 'string'},stateId: 'StateGridDc4'},
            { text: i18n('sCalled-Station-Id'),dataIndex: 'calledstationid',tdCls: 'gridTree', flex: 1, filter: {type: 'string'},stateId: 'StateGridDc5',
                hidden: true
            },
            
            { 
                text        : i18n('sActive'), 
                width       : 130,
                hidden      : true,
                tdCls       : 'gridTree',
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                                "<tpl if='active == true'><div class=\"fieldGreen\">"+i18n("sYes")+"</div></tpl>",
                                "<tpl if='active == false'><div class=\"fieldRed\">"+i18n("sNo")+"</div></tpl>"
                            ),
                dataIndex   : 'active',
                filter      : {
                        type    : 'boolean',
                        defaultValue   : false,
                        yesText : 'Yes',
                        noText  : 'No'
                },stateId: 'StateGridDc6'
            },
            { 
                text:   'To Sub-Providers',
                width:  130,
                hidden  : true,
                tdCls   : 'gridTree',
                xtype:  'templatecolumn', 
                tpl:    new Ext.XTemplate(
                            "<tpl if='available_to_siblings == true'><div class=\"fieldGreen\">"+i18n("sYes")+"</div></tpl>",
                            "<tpl if='available_to_siblings == false'><div class=\"fieldRed\">"+i18n("sNo")+"</div></tpl>"
                        ),
                dataIndex: 'available_to_siblings',
                filter      : {
                        type    : 'boolean',
                        defaultValue   : false,
                        yesText : 'Yes',
                        noText  : 'No'
                },stateId: 'StateGridDc7'
            },
            { 
                text    :   i18n('sRealms'),
                sortable: false,
                width   :  150,
                tdCls   : 'gridTree',
                xtype   :  'templatecolumn', 
                tpl:    new Ext.XTemplate(
                            '<tpl if="Ext.isEmpty(realms)"><div class=\"fieldBlueWhite\">Available to all!</div></tpl>', //Warn them when available     to all
                            '<tpl for="realms">',     // interrogate the realms property within the data
                                "<tpl if='available_to_siblings == true'><div class=\"fieldGreen\">{name}</div></tpl>",
                                "<tpl if='available_to_siblings == false'><div class=\"fieldRed\">{name}</div></tpl>",
                            '</tpl>'
                        ),
                dataIndex: 'realms',
                stateId: 'StateGridDc8'
            },
            { 
                text        : 'Last Contact',   
                dataIndex   : 'last_contact',
                width       : 150, 
                tdCls       : 'gridTree', 
                renderer    : function(v,metaData, record){
                    if(record.get('last_contact') == null){
                        return "<div class=\"fieldBlueWhite\">Never</div>";
                    }
                    var last_contact_human  = record.get('last_contact_human');
                    var green_flag          = false; //We show contact from the last seconds and minutes as geeen
                    if(
                        (last_contact_human.match(/just now/g))||
                        (last_contact_human.match(/minute/g))||
                        (last_contact_human.match(/second/g))
                    ){
                        green_flag = true;
                    }
                    if(green_flag){
                        return "<div class=\"fieldGreenWhite\">"+last_contact_human+"</div>";
                    }else{
                        return "<div class=\"fieldPurpleWhite\">"+last_contact_human+"</div>";
                    }     
                },
                stateId : 'StateGridUdc9'
            },
			{ 

                text        : 'From IP', 
                dataIndex   : 'last_contact_ip',          
                tdCls       : 'gridTree', 
                width       : 150,
                xtype       :  'templatecolumn', 
                tpl         :  new Ext.XTemplate(
                    '<tpl if="Ext.isEmpty(last_contact_ip)"><div class=\"fieldGreyWhite\">Not Available</div>',
                    '<tpl else>',
                    '<div class=\"fieldGreyWhite\">{last_contact_ip}</div>',
                    "<tpl if='Ext.isEmpty(city)'><tpl else>",
                        '<div><b>{city}</b>  ({postal_code})</div>',
                    "</tpl>",
                    "<tpl if='Ext.isEmpty(country_name)'><tpl else>",
                        '<div><b>{country_name}</b> ({country_code})</div>',
                    "</tpl>",
                    "</tpl>"   
                ), 
                filter		: {type: 'string'},
                stateId     : 'StateGridUdc10'
            },
            { 
                text        : i18n("sStatus"),   
                dataIndex   : 'status',  
                tdCls       : 'gridTree', 
                width       :  130,
                hidden      : true,
                renderer    : function(value,metaData, record){
                    if(value != 'unknown'){                    
                        var online      = record.get('status_time');
                        if(value == 'up'){
                            return "<div class=\"fieldGreen\">"+i18n("sUp")+" "+Ext.ux.secondsToHuman(online)+"</div>";
                        }
                        if(value == 'down'){
                            return "<div class=\"fieldRed\">"+i18n("sDown")+" "+Ext.ux.secondsToHuman(online)+"</div>";
                        }

                    }else{
                        return "<div class=\"fieldBlue\">"+i18n("sUnknown")+"</div>";
                    }              
                },
                stateId: 'StateGridDc11'
            },
            {   
                text        : 'Data Limits',       
                dataIndex   : 'data_used',    
                tdCls       : 'gridTree', 
                stateId     : 'StateGridDc12',
                width       : 150,
                hidden      : true,
                renderer    : function (value, m, r) {           
                    var month   = r.get('data_limit_active');
                    var day     = r.get('daily_data_limit_active');
                    var height  = 85;
                    if(month && day){
                        height = 170
                    }
                    if(month||day){
                    
                        var id = Ext.id();
                        
                        //Monthly
                        if(month){                                                 
                            var bar = r.get('perc_data_used');
                            var cls = 'wifigreen';
                            if(bar > 0.9){
                                cls = 'wifired';   
                            }
                            if((bar <= 0.9)&(bar >= 0.7)){
                                cls = 'wifiyellow';
                            } 
                            var id = Ext.id();
                            var p_text = bar*100;
                            p_text = +p_text.toFixed(2);
                        }
                        
                        //Daily
                        if(day){
                            var d_bar = r.get('daily_perc_data_used');
                            var d_cls = 'wifigreen';
                            if(d_bar > 0.9){
                                d_cls = 'wifired';   
                            }
                            if((d_bar <= 0.9)&(d_bar >= 0.7)){
                                d_cls = 'wifiyellow';
                            } 
                            var d_p_text = d_bar*100;
                            d_p_text = +d_p_text.toFixed(2);
                        }
                                              
                        Ext.defer(function () {                                             
                            var items = [];
                            //Daily
                            if(day){
                                var id_d_pb = Ext.id();
                                var d_cap     = Ext.ux.bytesToHuman(r.get('daily_data_cap'));
                                var d_used    = Ext.ux.bytesToHuman(r.get('daily_data_used'));                        
                                Ext.Array.push(items,{
                                    xtype   : 'container',
                                    margin  : '10 0 5 0',
                                    html    : [
                                        '<div>',
                                          "<div style='font-size:10px;color:#5c5f63;text-align:center;'>DAILY LIMIT</div>",
                                        '</div>'                                        
                                    ],    
                                    height  : 15                                  
                                });
                                
                                Ext.Array.push(items,{
                                    xtype : 'progress',
                                    value : d_bar,
                                    width : 136,
                                    text  : d_p_text+"% USED",
                                    cls   : d_cls,
                                    id    : id_d_pb
                                });
                                
                                Ext.Array.push(items,{
                                    xtype   : 'container',
                                    margin  : '2 0 2 0',
                                    html    : [
                                        '<div>',
                                          "<div style='font-size:10px;color:#1a75ff;text-align:center;'>"+d_used+'/'+d_cap+"</div>",
                                        '</div>'                                        
                                    ],    
                                    height  : 15                                  
                                });    
                                                                                                                                                    
                            }
                            //Monthly 
                            if(month){
                                var cap     = Ext.ux.bytesToHuman(r.get('data_cap'));
                                var used    = Ext.ux.bytesToHuman(r.get('data_used')); 
                                var id_m_pb = Ext.id();

                                Ext.Array.push(items,{
                                    xtype   : 'container',
                                    margin  : '10 0 5 0',
                                    html    : [
                                        '<div>',
                                          "<div style='font-size:10px;color:#5c5f63;text-align:center;'>MONTHLY LIMIT</div>",
                                        '</div>'                                        
                                    ],    
                                    height  : 15                                  
                                });
                                
                                Ext.Array.push(items,{
                                    xtype : 'progress',
                                    value : bar,
                                    width : 136,
                                    text  : p_text+"% USED",
                                    cls   : cls,
                                    id    : id_m_pb
                                });
                                
                                Ext.Array.push(items,{
                                    xtype   : 'container',
                                    margin  : '2 0 2 0',
                                    html    : [
                                        '<div>',
                                          "<div style='font-size:10px;color:#1a75ff;text-align:center;'>"+used+'/'+cap+"</div>",
                                        '</div>'                                        
                                    ],    
                                    height  : 15                                  
                                });                                                                                           
                            }
                            
                            var p = Ext.widget('container', {
                                renderTo    : id,
                                height      : height,
                                padding     : 1,
                                style       : {
                                    borderColor : '#838383', 
                                    borderStyle : 'solid', 
                                    borderWidth : '1px',
                                    background  : '#b3cccc'
                                },
                                layout: {
                                    align   : 'stretch',
                                    type    : 'vbox'
                                },
                                items       : items
                            });
                            
                            //Monthly                  
                            if(month){
                                var tm  = Ext.create('Ext.tip.ToolTip', {
                                    target  : id_m_pb,
                                    border  : true,
                                    anchor  : 'left',
                                    html    : [
                                        "<div>",
                                            "<h3>Monthly Data Limit Detail</h3>",
                                            "<label class='lblTipItem'>Cap Type</label><label class='lblTipValue'>"+r.get('data_limit_cap')+"</label>",
                                            "<div style='clear:both;'></div>",
                                            "<label class='lblTipItem'>Limit</label><label class='lblTipValue'>"+cap+"</label>",
                                            "<div style='clear:both;'></div>",
                                            "<label class='lblTipItem'>Used</label><label class='lblTipValue'>"+used+"</label>",
                                            "<div style='clear:both;'></div>",
                                            "<label class='lblTipItem'>Reset On</label><label class='lblTipValue'>"+r.get('data_limit_reset_on')+"</label>",
                                            "<div style='clear:both;'></div>",
                                            "<label class='lblTipItem'>Reset Hour</label><label class='lblTipValue'>"+r.get('data_limit_reset_hour')+"</label>",
                                            "<div style='clear:both;'></div>",
                                            "<label class='lblTipItem'>Reset Minute</label><label class='lblTipValue'>"+r.get('data_limit_reset_minute')+"</label>",
                                            "<div style='clear:both;'></div>",
                                        "</div>" 
                                    ]
                                });                            
                            } 
                            
                            //Daily
                            if(day){
                             var tm  = Ext.create('Ext.tip.ToolTip', {
                                    target  : id_d_pb,
                                    border  : true,
                                    anchor  : 'left',
                                    html    : [
                                        "<div>",
                                            "<h3>Daily Data Limit Detail</h3>",
                                            "<label class='lblTipItem'>Cap Type</label><label class='lblTipValue'>"+r.get('daily_data_limit_cap')+"</label>",
                                            "<div style='clear:both;'></div>",
                                            "<label class='lblTipItem'>Limit</label><label class='lblTipValue'>"+d_cap+"</label>",
                                            "<div style='clear:both;'></div>",
                                            "<label class='lblTipItem'>Used</label><label class='lblTipValue'>"+d_used+"</label>",
                                            "<div style='clear:both;'></div>",
                                            "<label class='lblTipItem'>Reset Hour</label><label class='lblTipValue'>"+r.get('daily_data_limit_reset_hour')+"</label>",
                                            "<div style='clear:both;'></div>",
                                            "<label class='lblTipItem'>Reset Minute</label><label class='lblTipValue'>"+r.get('daily_data_limit_reset_minute')+"</label>",
                                            "<div style='clear:both;'></div>",
                                        "</div>" 
                                    ]
                                });
                            }                                                                        
                                                                                     
                        }, 50);
                        return Ext.String.format('<div id="{0}"></div>', id);
                    }else{
                        return "N/A";
                    }
                }                          
            },
            {   
                text        : 'Mobile Connection',   
                dataIndex   : 'data_used',    
                tdCls       : 'gridTree', 
                stateId     : 'StateGridDc13',
                width       : 150,
                hidden      : false,
                renderer    : function (value, m, r) {           
                    v=r.get('alive_current');
                    if(v){
                        var id = Ext.id();
                        
                        var cls = 'wifigreen';
                        if(v.sig < 10){
                            cls = 'wifired';   
                        }
                        if((v.sig <= 20)&(v.sig > 10)){
                            cls = 'wifiyellow';
                        }
                        var pb  = v.pb; 
                        var sig = v.sig;
                        var debug = v.debug;
                        var oper  = v.operator;
                        
                        var htm_last_seen       = "<div style='font-size:10px;color:#5c5f63;text-align:center;'><i class='fa fa-clock-o'></i> LAST SEEN</div>";
                        var last_contact_human  = v.time_human;
                        var html_time           = "<div class=\"fieldBlueWhite\">"+last_contact_human+"</div>";
                        var green_flag          = false; //We show contact from the last seconds and minutes as geeen
                        if(
                            (last_contact_human.match(/just now/g))||
                            (last_contact_human.match(/minute/g))||
                            (last_contact_human.match(/second/g))
                        ){
                            green_flag = true;
                        }
                        if(green_flag){
                            html_time = "<div class=\"fieldGreenWhite\">"+last_contact_human+"</div>";
                        }
                        
                       var html_in   = "<div style='font-size:10px;color:#5c5f63;text-align:center;'><i class='fa fa-map-marker'></i>  IN</div>"; 
                       var html_in_v = "<div class=\"fieldGreyWhite\">"+v.country+"</div>";
                       var html_con  = "<div style='font-size:10px;color:#5c5f63;text-align:center;'><i class='fa fa-chain'></i> CONNECTING</div>";
                       var html_con_v= "<div class=\"fieldGreyWhite\">"+v.band+"</div>";
                       var html_sig  = "<div style='font-size:10px;color:#5c5f63;text-align:center;'><i class='fa fa-signal'></i> SIGNAL</div>";                       
                        
                       Ext.defer(function () {
                            var p = Ext.widget('container', {
                                renderTo    : id,
                                height      : 170,
                                padding     : 1,
                                style       : {
                                    borderColor : '#838383', 
                                    borderStyle : 'solid', 
                                    borderWidth : '1px',
                                    background  : 'rgb(183,227,255)',
                                    background  : 'linear-gradient(90deg, rgba(183,227,255,1) 0%, rgba(239,240,240,1) 51%, rgba(183,227,255,1) 100%)'
                                },
                                layout: {
                                    align   : 'stretch',
                                    type    : 'vbox'
                                },
                                items       : [
                                    {
                                        xtype   : 'container',
                                        html    : [
                                            '<div>',
                                              htm_last_seen,
                                              html_time,
                                              html_in,
                                              html_in_v,
                                              html_con,
                                              html_con_v,
                                              html_sig,
                                            '</div>'                                        
                                        ],    
                                        height  : 132                                  
                                    },
                                    {
                                        xtype : 'progress',
                                        value : pb,
                                        width : 136,
                                        text  : sig+"/30",
                                        cls   : cls
                                    }
                                ]
                            });
                            
                            var t  = Ext.create('Ext.tip.ToolTip', {
                                target  : id,
                                border  : true,
                                anchor  : 'left',
                                html    : [
                                    "<div style='font-size:10px;'>",
                                        "<h2>Mobile Connection Detail</h2>",
                                        "<label class='lblTipItem'>Operator</label><label class='lblTipValue'>"+oper+"</label>",
                                        "<div style='clear:both;'></div>",
                                        "<label class='lblTipItem'>Debug</label><label class='lblTipValue'>"+debug+"</label>",
                                        "<div style='clear:both;'></div>",
                                    "</div>" 
                                ]
                            });
                                                 
                        }, 50);
                        return Ext.String.format('<div id="{0}"></div>', id);
                    }else{
                        return "N/A";
                    }
                }
            },
            { 
                text    : i18n('sNotes'),
                sortable: false,
                width   : 130,
                hidden  : true,
                xtype   : 'templatecolumn', 
                tpl     : new Ext.XTemplate(
                                "<tpl if='notes == true'><span class=\"fa fa-thumb-tack fa-lg txtGreen\"></tpl>"
                ),
                dataIndex: 'notes',stateId: 'StateGridDc14'
            },
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                width       : 80,
                stateId     : 'StateGridDc15',
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
					}
				]
            }            
        ];     
        me.callParent(arguments);
    }
});
