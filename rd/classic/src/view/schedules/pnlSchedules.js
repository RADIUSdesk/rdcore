Ext.define('Rd.view.schedules.pnlSchedules', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlSchedules',
    border  : false,
    frame   : false,
    layout: {
        type    : 'hbox',         
        align   : 'stretch'
    },
    store   : undefined,   
    requires    : [
        'Rd.view.components.ajaxToolbar',
        'Rd.view.schedules.vcPnlSchedules',
        'Rd.view.schedules.winScheduleAdd',
        'Rd.view.schedules.winScheduleEdit',
        'Rd.view.schedules.winScheduleEntryAdd',
        'Rd.view.schedules.winScheduleEntryEdit'
    ],
    viewConfig  : {
        loadMask:true
    },
    urlMenu     : '/cake4/rd_cake/schedules/menu-for-grid.json',
    controller  : 'vcPnlSchedules',
    initComponent: function(){
        var me = this;

        //Create the view for the wallpapers:

        var imageTpl = new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="plain-wrap">',
                	'<tpl if="type==\'schedule\'">',
                		'<div class="main">',
                			'<i class="fa fa-calendar"></i>',
                				'<tpl if="for_system">',
                					'<i class="fa fa-umbrella"></i>',
                				'</tpl>',
                			' {name}',
                		'</div>', 
                	'</tpl>',
                	'<tpl if="type==\'schedule_entry\'">',
                		'<div class="sub">',
		            		'<div style="font-size:18px;color:#666699;text-align:left;"><i class="fa fa-chevron-right"></i> {description}</div>', 
		            		'<div style="font-size:25px;color:#9999c7;text-align:left;padding-left:20px;padding-top:20px;"><i class="fa fa-clock-o"></i> {time_human}</div>',
		            		'<div style="font-size:14px;color:#9999c7;text-align:left;padding-left:20px;padding-top:20px;">',
		            		'<tpl if="command_type==\'command\'">',
		            			'<span style="font-family:FontAwesome;">&#xf085;</span>',
		            		'</tpl>',
		            		'<tpl if="command_type==\'predefined_command\'">',
		            			'<span style="font-family:FontAwesome;">&#xf1cb;</span>',
		            		'</tpl>',
		            		' {command}</div>',
		            		'<tpl if="everyday">',
		            			'<div style="font-size:14px;color:#282852;text-align:left;padding-left:20px;padding-top:10px;padding-bottom:5px;"><span style="font-family:FontAwesome;">&#xf01e;</span> Every Day</div>',		            		
				        	'<tpl else>',
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
				        '</div>',
                	'</tpl>',
                	'<tpl if="type==\'add\'">',
                		'<div style="margin-bottom:40px;padding:5px;cursor:move;font-size:18px;color:green;text-align:right;">',
                			'<span style="padding:5px;border:1px solid #76cf15;" onMouseOver="this.style.background=\'#76cf15\'" onMouseOut="this.style.background=\'#FFF\'"><i class="fa fa-plus"></i> NEW SCHEDULE ENTRY</span>',
                		'</div>', 
                	'</tpl>',
                '</div>',
            '</tpl>'
        );
                   
        me.store = Ext.create('Ext.data.Store',{
            model: 'Rd.model.mSchedule',
            proxy: {
                type        :'ajax',
                url         : '/cake4/rd_cake/schedules/index-data-view.json',
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
            itemId		: 'dvSchedules',
            emptyText   : 'No Schedules Defined Yet'
        });
    
        me.items =  {
                xtype       : 'panel',
                frame       : false,
                height      : '100%', 
                width       :  550,
                itemId      : 'pnlForPhotoView',
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
