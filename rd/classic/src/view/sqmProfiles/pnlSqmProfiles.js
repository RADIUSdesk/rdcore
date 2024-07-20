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
        'Rd.view.components.cmbSqmProfile',
        'Rd.view.sqmProfiles.winSqmProfileAdd',
        'Rd.view.sqmProfiles.cmbSqmScriptOptions',
        'Rd.view.sqmProfiles.cmbSqmQdiscOptions',
        'Rd.view.components.rdSliderSpeed',
        'Rd.view.sqmProfiles.winSqmProfileEdit'       
    ],
    viewConfig  : {
        loadMask:true
    },
    urlMenu     : '/cake4/rd_cake/sqm-profiles/menu-for-grid.json',
    controller  : 'vcPnlSqmProfiles',
    initComponent: function(){
        var me = this;

        //Create the view for the wallpapers:

        var tpl = new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="dataview-item">',
                    '<div class="dataview-field">',
                        '<label>Name:</label> {name}',
                    '</div>',
                    '<div class="dataview-field">',
                        '<label>Download Speed:</label> {download}',
                    '</div>',
                    '<div class="dataview-field">',
                        '<label>Upload Speed:</label> {upload}',
                    '</div>',
                    '<div class="dataview-field">',
                        '<label>Queueing Discipline:</label> {qdisc}',
                    '</div>',
                    '<div class="dataview-field">',
                        '<label>Queue Setup Script:</label> {script}',
                    '</div>',
                    '<div class="dataview-field">',
                        '<label>System Wide:</label> {[values.for_system ? "Yes" : "No"]}',
                    '</div>',
                '</div>',
            '</tpl>'
        );
                   
        me.store = Ext.create('Ext.data.Store',{
            model: 'Rd.model.mDynamicPhoto',
            proxy: {
                type        :'ajax',
                url         : '/cake4/rd_cake/sqm-profiles/index-data-view.json',
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
            tpl         : tpl,
            itemSelector: '.dataview-item',
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
