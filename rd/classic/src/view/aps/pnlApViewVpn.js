Ext.define('Rd.view.aps.pnlApViewVpn', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlApViewVpn',
    border  : false,
    frame   : false,
    layout  : {
        type        : 'fit'
    },
    store   : undefined,
  	requires    : [
        'Rd.view.aps.vcApViewVpn',
        'Rd.view.aps.pnlApViewVpnGraph'
    ],
    controller  : 'vcApViewVpn',
    initComponent: function(){
        var me = this;
        
        var scale   = 'small';
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
                    xtype       : 'button', 
                    text        : '1 Hour',    
                    toggleGroup : 'time_n', 
                    enableToggle : true,
                    scale       : scale, 
                    itemId      : 'hour', 
                    pressed     : true
                },
                { 
                    xtype       : 'button', 
                    text        : '24 Hours',   
                    toggleGroup : 'time_n', 
                    enableToggle : true, 
                    scale       : scale, 
                    itemId      : 'day'
                },       
                { 
                    xtype       : 'button', 
                    text        : '7 Days',     
                    toggleGroup : 'time_n', 
                    enableToggle : true, 
                    scale       : scale, 
                    itemId      : 'week'
                },
                {
                	xtype		: 'tbseparator',
                	itemId		: 'tbsepTools'
                },
                { 
                    scale       : scale,
                    itemId      : 'btnBack',
                    glyph       : Rd.config.icnBack,  
                    text        : 'Back',
                    hidden      : true
                }
            ]
        }];
            
        me.store = Ext.create('Ext.data.Store',{
            model: 'Rd.model.mDynamicPhoto',
            proxy: {
                type        :'ajax',
                url         : '/cake4/rd_cake/vpn-reports/index-data-view.json',
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
                        '<div style="font-size:25px;color:#9999c7;text-align:left;padding-left:20px;padding-top:10px;">{name} </div>',  
                        '<div style="padding-top:10px;"></div>',
                        '<div style="font-size:16px;color:grey;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
            				'<span style="font-family:FontAwesome;">&#xf132</span>',
            				'<tpl if="vpn_type==\'wg\'">',
            				    ' Wireguard',
            				'</tpl>',
            				'<tpl if="vpn_type==\'ovpn\'">',
            				    ' OpenVPN',
            				'</tpl>',
            				'<tpl if="vpn_type==\'zt\'">',
            				    ' Zerotier',
            				'</tpl>',
            				'<tpl if="vpn_type==\'ipsec\'">',
            				    ' IKEv2+IPsec',
            				'</tpl>',
            				'<div style="padding-top:5px;"></div>',            				
            				'<tpl if="other.open_session && !other.stale_session">',
                                '<div style="color:green;">Current session</div>',
                            '</tpl>',
                            '<tpl if="other.open_session && other.stale_session">',
                                '<div style="color:orange;">Stale session</div>',
                            '</tpl>',
                            '<tpl if="!other.open_session">',
                                '<div style="color:gray;">Closed session</div>',
                            '</tpl>',
                            '<div>Last contact: {other.last_contact_in_words}</div>',
                            '<div style="font-size:11px;color:#888;">({other.last_contact})</div>',
                            '<div style="padding-top:5px;"></div>',
                            '<tpl if="totals.total_bytes">',
                                '<div>Usage {[Ext.ux.bytesToHuman(values.totals.total_bytes)]} </div>',
                            '</tpl>',         				
            			'</div>',           			                                                                                       
                    '</div>',			    	    			    	    			                				                		        					        	         	
                '</div>',
            '</tpl>'
        );

        var v = Ext.create('Ext.view.View', {
            store       : me.store,
            multiSelect : true,
            tpl         : tpl,
            itemSelector: 'div.plain-wrap',
            itemId		: 'dvApViewVpn',
            emptyText   : 'No VPN Connections Defined'
        });
    
        me.items =  [
            {
                xtype       : 'panel',
                layout      : {
                    type    : 'hbox',         
                    align   : 'stretch'
                },
                items   : [{
                    xtype       : 'panel',
                    frame       : false,
                    height      : '100%', 
                    width       :  450,
                    ui          : 'panel-blue',
                    border      : true,
                    margin      : 5,
                    title       : 'Connections',
                    itemId      : 'pnlForApViewVpnView',
                //    bodyStyle   : 'background: linear-gradient(90deg, #e0fff9 0%, #cfeeff 100%); border-radius: 10px;',
                    layout: {
                       type     : 'vbox',
                       align    : 'stretch'
                    },
                    items       : v,
                    autoScroll  : true
                },
                {
                    xtype       : 'pnlApViewVpnGraph',
                    flex        : 1
                }]
            }
        ]   
                                   
        me.callParent(arguments);
    }
});
