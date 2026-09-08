Ext.define('Rd.view.aps.pnlApViewWan', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlApViewWan',
    border  : false,
    frame   : false,
    layout  : {
        type        : 'fit'
    },
    store   : undefined,
  	requires    : [
        'Rd.view.aps.vcApViewWan',
        'Rd.view.aps.pnlApViewWanGraph',
        'Rd.view.aps.pnlApViewWanLte',
        'Rd.view.aps.pnlApViewWanWifi',
        'Rd.view.aps.pnlApViewWanDetail'
    ],
    controller  : 'vcApViewWan',
    initComponent: function(){
        var me = this;
        
        var scale = 'small';
        
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
                    xtype       : 'button', 
                    text        : '15 Minutes',    
                    toggleGroup : 'time_n', 
                    enableToggle : true,
                    scale       : scale, 
                    itemId      : 'small', 
                    pressed     : true
                },
                { 
                    xtype       : 'button', 
                    text        : '30 Minutes',   
                    toggleGroup : 'time_n', 
                    enableToggle : true, 
                    scale       : scale, 
                    itemId      : 'medium'
                },       
                { 
                    xtype       : 'button', 
                    text        : '60 Minutes',     
                    toggleGroup : 'time_n', 
                    enableToggle : true, 
                    scale       : scale, 
                    itemId      : 'large'
                },
                { xtype: 'tbseparator' },
                {   
                    xtype       : 'button', 
                    glyph       : Rd.config.icnData, 
                    scale       : scale,
                    toggleGroup : 'wan_view', 
                    enableToggle : true, 
                    itemId      : 'btnData',   
                    tooltip     : 'Data Usage',
                    pressed     : true
                },
                {   
                    xtype       : 'button', 
                    glyph       : Rd.config.icnWifi, 
                    scale       : scale, 
                    toggleGroup : 'wan_view', 
                    enableToggle : true,
                    itemId      : 'btnLte',   
                    tooltip     : 'LTE Signal'
                },
                {   
                    xtype       : 'button', 
                    glyph       : Rd.config.icnSsid, 
                    scale       : scale, 
                    toggleGroup : 'wan_view', 
                    enableToggle : true,
                    itemId      : 'btnWifi',   
                    tooltip     : 'WiFi Signal'
                },
                {   
                    xtype       : 'button', 
                    glyph       : Rd.config.icnGears, 
                    scale       : scale, 
                    toggleGroup : 'wan_view', 
                    enableToggle : true,
                    itemId      : 'btnDetail',   
                    tooltip     : 'More Detail'
                }
            ]
        }]
            
        me.store = Ext.create('Ext.data.Store',{
            model: 'Rd.model.mDynamicPhoto',
            proxy: {
                type        :'ajax',
                url         : '/cake4/rd_cake/wan-reports/index-data-view.json',
                batchActions: true,
                format      : 'json',
                reader      : {
                    type        : 'json',
                    rootProperty: 'items'
                }
            },
            listeners: {
                load: function(store, records, successful) {
                    if(!successful){
                        Ext.ux.Toaster.msg(
                            'Error encountered',
                            store.getProxy().getReader().rawData.message.message,
                            Ext.ux.Constants.clsWarn,
                            Ext.ux.Constants.msgWarn
                        );
                    } 
                },
                scope: this
            },
            autoLoad: false
        });
        
        var tpl = new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="plain-wrap">',
                    '<div class="sub">',
                        '<tpl if="type==\'ethernet\'">',
                            '<div style="font-size:25px;color:#9999c7;text-align:left;padding-left:20px;padding-top:10px;"><i class="fa fa-sitemap"></i> {name} ',
                        '</tpl>',
                        '<tpl if="type==\'lte\'">',
                            '<div style="font-size:25px;color:#9999c7;text-align:left;padding-left:20px;padding-top:10px;"><i class="fa fa-signal"></i> {name} ',
                        '</tpl>',
                        '<tpl if="type==\'wifi\'">',
                            '<div style="font-size:25px;color:#9999c7;text-align:left;padding-left:20px;padding-top:10px;"><i class="fa fa-wifi"></i> {name} ',
                        '</tpl>',               			
                        '</div>',
                        '<tpl if="apply_sqm_profile">',
                            '<div style="padding-top:5px;"></div>',
                            '<div style="font-size:16px;color:blue;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
		                        '<span style="font-family:FontAwesome;">&#xf00a</span>',
		                        '  {sqm_profile.name}',
	                        '</div>',				                			              
                        '</tpl>',
                        
                        '<div style="padding-top:10px;"></div>',
                        '<tpl if="status==\'online\'">',
                            "<tpl if=\"policy_role=='standby' && Ext.isEmpty(values.traffic_percent)\">", //HEADS-UP you have to use values.<whatever> in the function
                                '<div style="font-size:16px;color:blue;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
                    				'<span style="font-family:FontAwesome;">&#xf111;</span>',
                    				' Standby for {[Ext.ux.formatDuration(values.online)]}',
                    			'</div>',
                            '<tpl else>',
		            	        '<div style="font-size:16px;color:green;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
                    				'<span style="font-family:FontAwesome;">&#xf111;</span>',
                    				' Online for {[Ext.ux.formatDuration(values.online)]}',
                    			'</div>',
                			'</tpl>',
                	    '</tpl>',
                	    '<tpl if="status==\'offline\' || status==\'disabled\'">',
		        	        '<div style="font-size:16px;color:orange;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
                				'<span style="font-family:FontAwesome;">&#xf10c;</span>',
                				' Offline for {[Ext.ux.formatDuration(values.offline)]}',
                			'</div>',
                	    '</tpl>',
                	    '<tpl if="status==\'notracking\'">',
		        	        '<div style="font-size:16px;color:grey;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
                				'<span style="font-family:FontAwesome;">&#xf1db;</span>',
                				' NO TRACKING',
                			'</div>',
                	    '</tpl>',
                	    '<tpl if="up">',                	                     	 
	            	        '<div style="font-size:16px;color:grey;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
                				//'<span style="font-family:FontAwesome;">&#xf0c1;</span>',
                				'<i class="fa fa-chevron-right"></i>',
                				' Interface up for {[Ext.ux.formatDuration(values.uptime)]}',
                			'</div>',
            			'</tpl>',
            			
            			'<tpl if="!Ext.isEmpty(values.ipv4_address)">',                	                     	 
	            	        '<div style="font-size:16px;color:grey;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
                				'<i class="fa fa-chevron-right"></i>',
                				' IPv4 {ipv4_address}',
                			'</div>',
            			'</tpl>',
            			'<tpl if="!Ext.isEmpty(values.ipv6_address)">',                	                     	 
	            	        '<div style="font-size:16px;color:grey;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
                				'<i class="fa fa-chevron-right"></i>',
                				' IPv6 {ipv6_address}',
                			'</div>',
            			'</tpl>',    
            			
            			'<tpl if="traffic_percent !== undefined">',
            			    '<div style="font-size:16px;color:green;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">', 
                                '<i class="fa fa-sliders"></i>',
                                ' Traffic allocation is {traffic_percent}%',
                            '</div>',
                        '</tpl>',
            			
            			'<tpl if="policy_mode==\'load_balance\'">',
	                        '<div style="padding-top:5px;"></div>',
	            			'<div style="font-size:16px;color:#282852;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
	            				'<span style="font-family:FontAwesome;">&#xf24e</span>',
	            				'  LOAD BALANCE',
	            			'</div>',
		            	'</tpl>',				    	    
		    	        '<tpl if="policy_mode==\'fail_over\'">',
		    	            '<div style="padding-top:5px;"></div>',
	            			'<div style="font-size:16px;color:#282852;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
	            				'<span style="font-family:FontAwesome;">&#xf205</span>',
	            				'  FAIL-OVER ',
	            				'<tpl if="policy_role==\'active\'">',
	            				    '(<span style="font-family:FontAwesome;">&#xf01d</span> Active)',
	            			    '<tpl else>',
	            			        '(<span style="font-family:FontAwesome;">&#xf28c</span> Standby)',
	            		        '</tpl>', 
	            			'</div>',				    	        
		    	        '</tpl>',
            			
            			                                                                                       
                    '</div>',			    	    			    	    			                				                		        					        	         	
                '</div>',
            '</tpl>'
        );
        
        var v = Ext.create('Ext.view.View', {
            store       : me.store,
            multiSelect : true,
            tpl         : tpl,
           // cls         : 'custom-dataview', // Apply the custom CSS class here
            itemSelector: 'div.plain-wrap',
            itemId		: 'dvApViewWan',
            emptyText   : 'No WAN Stats Available'
        });
    
        me.items =  [
            {
                xtype       : 'panel',
                layout      : {
                    type    : 'hbox',         
                    align   : 'stretch'
                },
                items   : [
                    {
                        xtype       : 'panel',
                        margin      : 5,
                        frame       : false,
                        height      : '100%', 
                        width       :  450,
                        itemId      : 'pnlForApViewWanView',
                        layout: {
                           type     : 'vbox',
                           align    : 'stretch'
                        },
                        items       : v,
                        autoScroll  : true
                    },
                    {
                        xtype   : 'panel',
                        layout  : 'card',
                        itemId  : 'pnlCardWan',
                        flex    : 1,
                        items   : [
                            {
                                xtype       : 'pnlApViewWanGraph',
                                itemId      : 'pnlApViewWanGraph',
                            },
                            {
                                xtype       : 'pnlApViewWanLte',
                                itemId      : 'pnlApViewWanLte'
                            },
                            {
                                xtype       : 'pnlApViewWanWifi',
                                itemId      : 'pnlApViewWanWifi'
                            },
                            {
                                xtype       : 'pnlApViewWanDetail',
                                itemId      : 'pnlApViewWanDetail'
                            }
                        ]
                    }
                ]
            }
        ]   
                                   
        me.callParent(arguments);
    }
});
