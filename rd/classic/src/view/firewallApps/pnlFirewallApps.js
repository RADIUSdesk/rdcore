Ext.define('Rd.view.firewallApps.pnlFirewallApps', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlFirewallApps',
    border  : false,
    frame   : false,
    layout: {
        type    : 'hbox',         
        align   : 'stretch'
    },
    store   : undefined,
  	requires    : [
        'Rd.view.components.ajaxToolbar',
        'Rd.view.firewallApps.vcPnlFirewallApps',
        'Rd.view.firewallApps.winFirewallAppAdd',
        'Rd.view.firewallApps.winFirewallAppEdit'
    ],
    viewConfig  : {
        loadMask:true
    },
    urlMenu     : '/cake4/rd_cake/firewall-apps/menu-for-grid.json',
    controller  : 'vcPnlFirewallApps',
    initComponent: function(){
        var me = this;
        
        var tpl = new Ext.XTemplate(
            '<tpl for=".">',
            	'<div class="plain-wrap">',
            		'<div class="main">',
            			'<span style="font-family:FontAwesome;">{fa_code}</span>',
            				'<tpl if="for_system">',
            					'<i class="fa fa-umbrella"></i>',
            				'</tpl>',
            			' {name}',
            		'</div>',
            		'<tpl for="element_list">',
						'<div style="font-size:18px;color:#9999c7;text-align:left;padding-left:20px;padding-top:10px;">{#}. {.}</div>',
					'</tpl>',
					'<tpl if="comment">',
						'<div style="padding-left:20px;padding-top:10px;"><i class="fa fa-edit"></i>  {comment}</div>',
					'</tpl>', 
					'<div style="margin-bottom:20px"></div>',					         		 
                '</div>',
            '</tpl>'
        );
                   
        me.store = Ext.create(Ext.data.Store,{
            model: 'Rd.model.mDynamicPhoto', //FIXME MODEL 
            proxy: {
                type        :'ajax',
                url         : '/cake4/rd_cake/firewall-apps/index-data-view.json',
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
                            'Error encountered',
                            Ext.ux.Constants.clsWarn,
                            Ext.ux.Constants.msgWarn
                        );
                    } 
                },
                exception: function(proxy, response, options) {
		            var jsonData = response.responseJson;
		            Ext.Msg.show({
		                title       : "Error",
		                msg         : response.request.url + '<br>' + response.status + ' ' + response.statusText+"<br>"+jsonData.message,
		                modal       : true,
		                buttons     : Ext.Msg.OK,
		                icon        : Ext.Msg.ERROR,
		                closeAction : 'destroy'
		            });
		        },
                scope: this
            }
        });

        var v = Ext.create('Ext.view.View', {
            store       : me.store,
            multiSelect : true,
            tpl         : tpl,
            itemSelector: 'div.plain-wrap',
            itemId		: 'dvFirewallApps',
            emptyText   : 'No Apps Defined Yet'
        });
    
        me.items =  {
                xtype       : 'panel',
                frame       : false,
                height      : '100%', 
                width       :  550,
                itemId      : 'pnlForFirewallAppsView',
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
