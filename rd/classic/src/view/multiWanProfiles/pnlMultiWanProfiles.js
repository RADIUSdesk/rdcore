Ext.define('Rd.view.multiWanProfiles.pnlMultiWanProfiles', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlMultiWanProfiles',
    border  : false,
    frame   : false,
    layout: {
        type    : 'hbox',         
        align   : 'stretch'
    },
    store   : undefined,
  	requires    : [
        'Rd.view.components.ajaxToolbar',
        'Rd.view.multiWanProfiles.vcMultiWanProfiles',
        'Rd.view.multiWanProfiles.winMultiWanProfileInterfaceAdd', 
        'Rd.view.multiWanProfiles.pnlMultiWanProfileInterfaceAddEdit',     
    ],
    viewConfig  : {
        loadMask:true
    },
    urlMenu     : '/cake4/rd_cake/multi-wan-profiles/menu-for-grid.json',
    controller  : 'vcMultiWanProfiles',
    initComponent: function(){
        var me = this;

        //Create the view for the wallpapers:
    
         var tpl = new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="plain-wrap">',
                	'<tpl if="type==\'multi_wan_profile\'">',
                		'<div class="main">',
                			'<span style="font-family:FontAwesome;">&#xf06d;</span>',
                				'<tpl if="for_system">',
                					'<i class="fa fa-umbrella"></i>',
                				'</tpl>',
                			' {name}',
                		'</div>', 
                	'</tpl>',
                	'<tpl if="type==\'add\'">',
                		'<div style="margin-bottom:40px;padding:5px;cursor:move;font-size:18px;color:green;text-align:right;">',
                			'<span style="padding:5px;border:1px solid #76cf15;" onMouseOver="this.style.background=\'#76cf15\'" onMouseOut="this.style.background=\'#FFF\'"><i class="fa fa-plus"></i> NEW WAN INTERFACE</span>',
                		'</div>', 
                	'</tpl>',
                '</div>',
            '</tpl>'
        );
                   
        me.store = Ext.create('Ext.data.Store',{
            model: 'Rd.model.mDynamicPhoto',
            proxy: {
                type        :'ajax',
                url         : '/cake4/rd_cake/multi-wan-profiles/index-data-view.json',
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
          //  cls         : 'custom-dataview', // Apply the custom CSS class here
            tpl         : tpl,
            itemSelector: 'div.plain-wrap',
            itemId		: 'dvMultiWanProfiles',
            emptyText   : 'No Multi WAN Profiles Defined Yet'
        });
    
        me.items =  {
            xtype       : 'panel',
            frame       : false,
            height      : '100%', 
            width       :  550,
            itemId      : 'pnlForMultiWanProfileView',
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
