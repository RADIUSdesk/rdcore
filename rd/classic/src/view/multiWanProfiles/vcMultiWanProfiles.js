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
        'Rd.view.multiWanProfiles.vcMultiWanProfiles'      
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
                '<div class="dataview-item">',
                    '<h2 class="dataview-heading">{name}</h2>',
                    '<div class="dataview-field">',
                        '<label>Name:</label> {name}',
                    '</div>',
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
            cls         : 'custom-dataview', // Apply the custom CSS class here
            tpl         : tpl,
            itemSelector: '.dataview-item',
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
