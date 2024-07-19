Ext.define('Rd.view.sqmProfiles.pnlSqmProfiles', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlSqmProfiles',
    border  : false,
    frame   : false,
    layout: {
        type    : 'hbox',         
        align   : 'stretch'
    },
    store   : undefined,
  	requires    : [
        'Rd.view.components.ajaxToolbar',
        'Rd.view.sqmProfiles.vcPnlSqmProfiles',
        'Rd.view.components.cmbSqmProfile'
    ],
    viewConfig  : {
        loadMask:true
    },
    urlMenu     : '/cake4/rd_cake/sqm-profiles/menu-for-grid.json',
    controller  : 'vcPnlSqmProfiles',
    initComponent: function(){
        var me = this;

        //Create the view for the wallpapers:

        var imageTpl = new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="plain-wrap">',
                 '<h1>{name}</h1>',
                '</div>',
            '</tpl>'
        );
                   
        me.store = Ext.create('Ext.data.Store',{
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
            itemId		: 'dvSqmProfiles',
            emptyText   : 'No SQM Profiles Defined Yet'
        });
    
        me.items =  {
            xtype       : 'panel',
            frame       : false,
            height      : '100%', 
            width       :  550,
            itemId      : 'pnlForSqmProfileView',
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
