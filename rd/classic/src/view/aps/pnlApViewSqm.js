Ext.define('Rd.view.aps.pnlApViewSqm', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlApViewSqm',
    border  : false,
    frame   : false,
    layout  : {
        type        : 'fit'
    },
    store   : undefined,
  	requires    : [
        'Rd.view.aps.vcApViewSqm',
        'Rd.view.aps.pnlApViewSqmGraph'
    ],
    controller  : 'vcApViewSqm',
    initComponent: function(){
        var me = this;
        
        
        me.tbar  = [
            {   
                xtype   : 'button', 
                glyph   : Rd.config.icnReload , 
                scale   : 'small', 
                itemId  : 'reload',   
                tooltip : i18n('sReload'),
                ui      : 'button-orange'
            },
            '|',
            {   
                xtype       : 'button', 
                text        : '1 Hour',    
                toggleGroup : 'time_n', 
                enableToggle : true,
                scale       : 'small', 
                itemId      : 'hour', 
                pressed     : true,
                ui          : 'button-metal'
            },
            { 
                xtype       : 'button', 
                text        : '24 Hours',   
                toggleGroup : 'time_n', 
                enableToggle : true, 
                scale       : 'small', 
                itemId      : 'day',
                ui          : 'button-metal' 
            },       
            { 
                xtype       : 'button', 
                text        : '7 Days',     
                toggleGroup : 'time_n', 
                enableToggle : true, 
                scale       : 'small', 
                itemId      : 'week',
                ui          : 'button-metal'
            },
            {
            	xtype		: 'tbseparator',
            	itemId		: 'tbsepTools'
            },
            { 
                scale       : 'small',
                itemId      : 'btnBack',
                glyph       : Rd.config.icnBack,  
                text        : 'Back',
                hidden      : true,
                ui          : 'button-pink'
            }            
        ];
            
        me.store = Ext.create('Ext.data.Store',{
            model: 'Rd.model.mDynamicPhoto',
            proxy: {
                type        :'ajax',
                url         : '/cake4/rd_cake/sqm-reports/index-data-view.json',
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
        '<div class="dataview-item">',
            '<h2 class="dataview-heading">{sqm_profile.name}',
            '<tpl if="vlan">',
            '<span class="dataview-extra"> VLAN {vlan}',
            '</tpl>',
            '<tpl if="vlan_internal">',
            ' (<i>Internal</i>)',
            '</tpl>',
            '</span></h2>',
            '<div class="dataview-columns">',
                '<div class="dataview-column">',
                    '<div class="dataview-field">',
                        '<label>Download:</label> {sqm_profile.download} {sqm_profile.download_suffix}',
                    '</div>',
                    '<div class="dataview-field">',
                        '<label>Upload:</label> {sqm_profile.upload} {sqm_profile.upload_suffix}',
                    '</div>',
                    '<div class="dataview-field">',
                        '<label>Type:</label> {[values.type.toUpperCase()]}',
                    '</div>',
                    '<div class="dataview-field">',
                        '<label>VLAN:</label> {vlan}',
                    '</div>',
                '</div>',
                '<div class="dataview-column">',
                    '<div class="dataview-field">',
                        '<label>Bytes:</label> {[Ext.ux.bytesToHuman(values.totals.bytes)]}',
                    '</div>',
                    '<div class="dataview-field">',
                        '<label>Packets:</label> {totals.packets}',
                    '</div>',
                    '<div class="dataview-field">',
                        '<label>Drops:</label> {totals.drops}',
                    '</div>',
                    '<div class="dataview-field">',
                        '<label>Overlimits:</label> {totals.overlimits}',
                    '</div>',
                '</div>',
            '</div>',
        '</div>',
    '</tpl>'
);

   /*        
        var tpl = new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="dataview-item">',
                    '<div class="dataview-columns">',
                        '<div class="dataview-column">',
                            '<div class="dataview-field">',
                                '<label>Name:</label> {sqm_profile.name}',
                            '</div>',
                            '<div class="dataview-field">',
                                '<label>Download Speed:</label> {sqm_profile.download}',
                            '</div>',
                            '<div class="dataview-field">',
                                    '<label>Upload Speed:</label> {sqm_profile.upload}',
                            '</div>',
                            '<div class="dataview-field">',
                                    '<label>Type:</label> {type}',
                            '</div>',
                            '<div class="dataview-field">',
                                    '<label>VLAN:</label> {vlan}',
                            '</div>',
                        '</div>',
                        '<div class="dataview-column">',
                            '<div class="dataview-field">',
                                '<label>Total Bytes:</label> {totals.bytes}',
                            '</div>',
                            '<div class="dataview-field">',
                                '<label>Total Packets:</label> {totals.packets}',
                            '</div>',
                            '<div class="dataview-field">',
                                '<label>Total Drops:</label> {totals.drops}',
                            '</div>',
                            '<div class="dataview-field">',
                                '<label>Total Overlimits:</label> {totals.overlimits}',
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',
            '</tpl>'
        );

    */    
        var v = Ext.create('Ext.view.View', {
            store       : me.store,
            multiSelect : true,
            tpl         : tpl,
            cls         : 'custom-dataview', // Apply the custom CSS class here
            itemSelector: 'div.dataview-item',
            itemId		: 'dvApViewSqm',
            emptyText   : 'No SQM Stats Available'
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
                    itemId      : 'pnlForApViewSqmView',
                    layout: {
                       type     : 'vbox',
                       align    : 'stretch'
                    },
                    items       : v,
                    autoScroll  : true
                },
                {
                    xtype       : 'pnlApViewSqmGraph',
                    flex        : 1
                }]
            }
        ]   
                                   
        me.callParent(arguments);
    }
});
