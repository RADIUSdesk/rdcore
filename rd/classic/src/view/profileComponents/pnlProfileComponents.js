Ext.define('Rd.view.profileComponents.pnlProfileComponents', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlProfileComponents',
    border  : false,
    frame   : false,
    layout: {
        type    : 'hbox',         
        align   : 'stretch'
    },
    store   : undefined,   
    requires    : [
        'Rd.view.components.ajaxToolbar',
        'Rd.view.profileComponents.vcProfileComponents',
        'Rd.view.profileComponents.winProfileComponentAdd',
        'Rd.view.profileComponents.winProfileComponentEdit',
        'Rd.view.profileComponents.winProfileComponentEntryAdd',
        'Rd.view.profileComponents.winProfileComponentEntryEdit',
    ],
    viewConfig  : {
        loadMask:true
    },
    urlMenu     : '/cake4/rd_cake/profile-components/menu-for-grid.json',
    controller  : 'vcProfileComponents',
    initComponent: function(){
        var me = this;

        //Create the view for the wallpapers:

         var imageTpl = new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="plain-wrap">',
                	'<tpl if="type==\'profile_component\'">',
                		'<div class="main">',
                			'<i class="fa fa-puzzle-piece"></i>',
                				'<tpl if="for_system">',
                					'<i class="fa fa-umbrella"></i>',
                				'</tpl>',
                			' {name}',
                		'</div>', 
                	'</tpl>',
                	
                	'<tpl if="type==\'check\'">',
                		'<div class="sub-check">', 
                			'<div style="font-size:10px;color:#acacad;text-align:center;padding:2px;">CHECK</div>',
		            		'<div style="font-size:1.2em;color:#2642ab;padding:2px;">{attribute} <span style="color:#161617;">{op}</span> <span style="color:#016316;">{value}</span></div>',
		            		'<tpl if="comment!==\'\'">',
		            			'<div style="font-size:12px;color:#747475;text-align:left;padding:5px;"><i>{comment}</i></div>',
		            		'</tpl>',
				        '</div>',
                	'</tpl>',
                	
                	'<tpl if="type==\'reply\'">',
                		'<div class="sub-reply">',
                			'<div style="font-size:10px;color:#acacad;text-align:center;padding:2px;">REPLY</div>',
		            		'<div style="font-size:1.2em;color:#2642ab;padding:2px;">{attribute} <span style="color:#161617;">{op}</span> <span style="color:#016316;">{value}</span></div>', 
		            		'<tpl if="comment!==\'\'">',
		            			'<div style="font-size:12px;color:#747475;text-align:left;padding:5px;"><i>{comment}</i></div>',
		            		'</tpl>',
				        '</div>',
                	'</tpl>',
                	
                	'<tpl if="type==\'add\'">',
                		'<div style="margin-bottom:40px;padding:5px;cursor:move;font-size:18px;color:green;text-align:right;">',
                			'<span style="padding:5px;border:1px solid #76cf15;" onMouseOver="this.style.background=\'#76cf15\'" onMouseOut="this.style.background=\'#FFF\'"><i class="fa fa-plus"></i> NEW ENTRY</span>',
                		'</div>', 
                	'</tpl>',
                '</div>',
            '</tpl>'
        );
                   
        me.store = Ext.create(Ext.data.Store,{
            model: 'Rd.model.mProfileComponentDataView',
            proxy: {
                type        :'ajax',
                url         : '/cake4/rd_cake/profile-components/index-data-view.json',
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
            itemId		: 'dvProfileComponents',
            emptyText   : 'No Profile Components Defined Yet'
        });
    
        me.items =  {
                xtype       : 'panel',
                frame       : false,
                height      : '100%', 
                width       :  550,
                itemId      : 'pnlForProfileComponent',
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
