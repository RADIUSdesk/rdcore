Ext.define('Rd.view.firewallProfiles.pnlFirewallProfiles', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlFirewallProfiles',
    border  : false,
    frame   : false,
    layout: {
        type    : 'hbox',         
        align   : 'stretch'
    },
    store   : undefined,
  	requires    : [
        'Rd.view.components.ajaxToolbar',
        'Rd.view.firewallProfiles.vcPnlFirewallProfiles',
        'Rd.view.firewallProfiles.winFirewallProfileAdd',
        'Rd.view.firewallProfiles.winFirewallProfileEdit',
        'Rd.view.firewallProfiles.winFirewallProfileEntryAdd',
        'Rd.view.firewallProfiles.winFirewallProfileEntryEdit',
        'Rd.view.components.cmbFirewallProfile'
    ],
    viewConfig  : {
        loadMask:true
    },
    urlMenu     : '/cake4/rd_cake/firewall-profiles/menu-for-grid.json',
    controller  : 'vcPnlFirewallProfiles',
    initComponent: function(){
        var me = this;

        //Create the view for the wallpapers:

        var imageTpl = new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="plain-wrap">',
                	'<tpl if="type==\'firewall_profile\'">',
                		'<div class="main">',
                			'<span style="font-family:FontAwesome;">&#xf06d;</span>',
                				'<tpl if="for_system">',
                					'<i class="fa fa-umbrella"></i>',
                				'</tpl>',
                			' {name}',
                		'</div>', 
                	'</tpl>',
                	'<tpl if="type==\'firewall_profile_entry\'">',
                		'<div class="sub">',
                			'<tpl if="action==\'block\'">',
                				'<div style="font-size:25px;color:#9999c7;text-align:left;padding-left:20px;padding-top:10px;"><i class="fa fa-ban"></i> Block ',
                			'</tpl>',
                			'<tpl if="action==\'allow\'">',
                				'<div style="font-size:25px;color:#9999c7;text-align:left;padding-left:20px;padding-top:10px;"><span style="font-family:FontAwesome;">&#xf05d;</span> Allow ',
                			'</tpl>',
                			'<tpl if="action==\'limit\'">',
                				'<div style="font-size:25px;color:#9999c7;text-align:left;padding-left:20px;padding-top:10px;"><span style="font-family:FontAwesome;">&#xf0e4;</span> Limit ',
                			'</tpl>',
                			'<tpl if="schedule==\'always\'">',
                				'always',
                			'</tpl>',
                			'<tpl if="schedule==\'every_day\'">',
                				'every day',
                			'</tpl>',
                			'<tpl if="schedule==\'every_week\'">',
                				'every week',
                			'</tpl>',
                			'<tpl if="schedule==\'one_time\'">',
                				'one time',
                			'</tpl>',
                			
                			'<tpl if="action==\'limit\'">',
                				'<div style="font-size:16px;color:blue;text-align:left;padding-top:10px;">Upload {bw_up} {bw_up_suffix} / Download {bw_down} {bw_down_suffix}</div>',
                			'</tpl>',
                			           			
                			'</div>', 
                			'<tpl if="schedule!==\'always\'">',               				
		            			'<div style="font-size:15px;color:#287160;text-align:left;padding-left:20px;padding-top:10px;"><span style="font-family:FontAwesome;">&#xf017;</span> {start_time_human} to {end_time_human} ({human_span})</div>',
		            		'</tpl>',
		            		'<tpl if="schedule==\'one_time\'">',               				
		            			'<div style="font-size:15px;color:#287160;text-align:left;padding-left:20px;padding-top:10px;"><i class="fa fa-calendar"></i> {one_time_date}</div>',
		            		'</tpl>',
				        	'<tpl if="schedule==\'every_week\'">',
				        		'<div style="font-size:14px;color:#282852;text-align:left;padding-left:20px;padding-top:10px;padding-bottom:5px;">',
				        			'<tpl if="mo">',
				        				'<span style="font-family:FontAwesome;">&#xf046;</span>',
				        			'<tpl else>',
				        				'<span style="font-family:FontAwesome;">&#xf096;</span>',
				        			'</tpl>',
				        			'<span style="margin-right:15px;"> Mo</span>',
				        			'<tpl if="tu">',
				        				'<span style="font-family:FontAwesome;">&#xf046;</span>',
				        			'<tpl else>',
				        				'<span style="font-family:FontAwesome;">&#xf096;</span>',
				        			'</tpl>',
				        			'<span style="margin-right:15px;"> Tu</span>',
				        			'<tpl if="we">',
				        				'<span style="font-family:FontAwesome;">&#xf046;</span>',
				        			'<tpl else>',
				        				'<span style="font-family:FontAwesome;">&#xf096;</span>',
				        			'</tpl>',
				        			'<span style="margin-right:15px;"> We</span>',
				        			'<tpl if="th">',
				        				'<span style="font-family:FontAwesome;">&#xf046;</span>',
				        			'<tpl else>',
				        				'<span style="font-family:FontAwesome;">&#xf096;</span>',
				        			'</tpl>',
				        			'<span style="margin-right:15px;"> Th</span>',
				        			'<tpl if="fr">',
				        				'<span style="font-family:FontAwesome;">&#xf046;</span>',
				        			'<tpl else>',
				        				'<span style="font-family:FontAwesome;">&#xf096;</span>',
				        			'</tpl>',
				        			'<span style="margin-right:15px;"> Fr</span>',
				        			'<tpl if="sa">',
				        				'<span style="font-family:FontAwesome;">&#xf046;</span>',
				        			'<tpl else>',
				        				'<span style="font-family:FontAwesome;">&#xf096;</span>',
				        			'</tpl>',
				        			'<span style="margin-right:15px;"> Sa</span>',
				        			'<tpl if="su">',
				        				'<span style="font-family:FontAwesome;">&#xf046;</span>',
				        			'<tpl else>',
				        				'<span style="font-family:FontAwesome;">&#xf096;</span>',
				        			'</tpl>',
				        			'<span style="margin-right:15px;"> Su</span>',
				        		'</div>',	            		
				        	'</tpl>',
				        	
				        	'<tpl if="category==\'app\'">',
						    	'<tpl if="firewall_profile_entry_firewall_apps">',
						    		'<div style="padding-top:10px;"></div>',
						    		'<tpl for="firewall_profile_entry_firewall_apps">',
						    			'<div style="font-size:16px;color:#282852;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
						    				'<span style="font-family:FontAwesome;">{firewall_app.fa_code}</span>',
						    				'  {firewall_app.name}',
						    			'</div>',
						    		'</tpl>',
						    	'</tpl>',
						    '</tpl>',
				        	
				        	'<tpl if="category==\'domain\'">',
				        		'<div style="padding-top:10px;"></div>',
					    			'<div style="font-size:16px;color:#282852;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
					    				'<span style="font-family:FontAwesome;">&#xf0ac;</span>',
					    				'  {domain}',
					    			'</div>',
					    		'</div>',
				        	'</tpl>',
				        	
				        	'<tpl if="category==\'ip_address\'">',
				        		'<div style="padding-top:10px;"></div>',
					    			'<div style="font-size:16px;color:#282852;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
					    				'<span style="font-family:FontAwesome;">&#xf069;</span>',
					    				'  {ip_address}',
					    			'</div>',
					    		'</div>',
				        	'</tpl>',
				        	
				        	'<tpl if="category==\'internet\'">',
				        		'<div style="padding-top:10px;"></div>',
					    			'<div style="font-size:16px;color:#282852;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
					    				'<span style="font-family:FontAwesome;">&#xf0c2</span>',
					    				'  INTERNET',
					    			'</div>',
					    		'</div>',
				        	'</tpl>',
				        	
				        	'<tpl if="category==\'local_network\'">',
				        		'<div style="padding-top:10px;"></div>',
					    			'<div style="font-size:16px;color:#282852;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
					    				'<span style="font-family:FontAwesome;">&#xf109;</span>',
					    				'  Local Network',
					    			'</div>',
					    		'</div>',
				        	'</tpl>',				        	
				        			        					        	
				        '</div>',
                	'</tpl>',
                	'<tpl if="type==\'add\'">',
                		'<div style="margin-bottom:40px;padding:5px;cursor:move;font-size:18px;color:green;text-align:right;">',
                			'<span style="padding:5px;border:1px solid #76cf15;" onMouseOver="this.style.background=\'#76cf15\'" onMouseOut="this.style.background=\'#FFF\'"><i class="fa fa-plus"></i> NEW RULE</span>',
                		'</div>', 
                	'</tpl>',
                '</div>',
            '</tpl>'
        );
                   
        me.store = Ext.create(Ext.data.Store,{
            model: 'Rd.model.mDynamicPhoto',
            proxy: {
                type        :'ajax',
                url         : '/cake4/rd_cake/firewall-profiles/index-data-view.json',
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
            }
        });

        var v = Ext.create('Ext.view.View', {
            store       : me.store,
            multiSelect : true,
            tpl         : imageTpl,
            itemSelector: 'div.plain-wrap',
            itemId		: 'dvFirewallProfiles',
            emptyText   : 'No Firewall Profiles Defined Yet'
        });
    
        me.items =  {
                xtype       : 'panel',
                frame       : false,
                height      : '100%', 
                width       :  550,
                itemId      : 'pnlForFirewallProfileView',
                layout: {
                   type: 'vbox',
                   align: 'stretch'
                },
                items       : v,
                autoScroll  : true,
                tbar        : Ext.create('Rd.view.components.ajaxToolbar',{
                    url         : me.urlMenu
                })
        };         
        me.callParent(arguments);
    }
});
