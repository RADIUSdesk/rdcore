//127.0.0.1/rd/#cloud/23/NETWORK|network_active/nodes|ap_action/view/300

Ext.define('Rd.controller.cMainNetworks', {
    extend: 'Ext.app.Controller',
    config: {
        //urlGetContent   : '/cake4/rd_cake/dashboard/items-for.json',
        urlGetContent   : '/cake4/rd_cake/dashboard/networks-items.json',
        activeTab       : null,
        processingRoute : false   
    },    
    init: function() {
        const me  = this;           
        if (me.inited) {
            return;
        }
        me.inited = true;  
        me.control({
            '#tabMainNetworks': {
                tabchange: me.onTabChanged
            }
        });        
    },
    refs: [
        {   ref: 'tabMainNetworks',   	selector: '#tabMainNetworks',          xtype: 'tabpanel',    autoCreate: false},
        {   ref: 'viewP',   	selector: 'viewP',          xtype: 'viewP',    autoCreate: true}
    ],
    
    onTabChanged: function(tabPanel, newCard, oldCard) {
        const me = this;
        console.log('Tab changed to:', newCard.title || newCard.itemId);
        console.log('Tab ID:', newCard.itemId);
        me.clickTabActive(newCard.itemId);
    },
     
    routes: {
        'network_active/:activeTab' : {
            action  : 'onTabActive',
            lazy    : true,
            before  : 'beforeTabActive',
            name    : 'networkActive'      
        }
    },    
      
    beforeTabActive : function(tabId, action){
        const me = this;       
        Ext.log("=== BEFORE Network Tab Active === "+tabId);
        
        if (this.getProcessingRoute() || tabId === this.getActiveTab() ) {
            action.stop();
            return false;
        }
        
        this.setProcessingRoute(true);
        action.resume();
    },
       
    onTabActive : function(tabId){
        const me = this;
        Ext.log("=== Network Tab Active === "+tabId);
        this.setActiveTab(tabId);
        this.urlTabActive(tabId);
        this.setProcessingRoute(false);
    },
    
    clickTabActive : function(tabId){
        const me = this;     
        if(me.validateTab(tabId)){
            Ext.log("=== CLICK Tab Active === "+tabId);
            this.redirectTo({networkActive: 'network_active/'+tabId});
        }  
    },
    
    urlTabActive: function(tabId){
        const me =this;
        if(me.validateTab(tabId)){
            Ext.log("=== URL Tab Active === "+tabId);
            me.getTabMainNetworks().setActiveTab(tabId);
        }     
    },
       
    validateTab: function(tab) {
        // Implement your page validation logic
        return ['mesh_networks', 'nodes', 'ap_profiles', 'aps', 'arrivals'].includes(tab);
    },
    
    actionIndex: function(pnl,itemId){
        var me      = this;
        var item    = pnl.down('#'+itemId);
        var added   = false;
        if(!item){
        
            me.store = Ext.create('Ext.data.Store',{
                storeId : 'myStore',
                fields  : ['column1','column2'], 
                proxy   : {
                    type   :'ajax',
                    url    : me.getUrlGetContent(),
                    format : 'json',
                    reader : { type: 'json', rootProperty: 'items' }
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
                autoLoad: true
            });                   
            var v = Ext.create('Ext.view.View', {
                store: Ext.data.StoreManager.lookup('myStore'),            
                tpl: new Ext.XTemplate(
                    '<tpl for=".">',
                        '<div class="rd-tiles-grid">',
                        // left column
                        '<tpl if="column1">',
                            '<div class="rd-tile rd-tile-column1 {[values.column1.accent ? ("rd-accent-" + values.column1.accent) : ""]}" ',
                                'data-controller="{column1.controller}" data-target="{column1.id}">',
                                '<div class="rd-tile-icon"><span class="x-fa" style="font-family:FontAwesome;">&#{column1.glyph};</span></div>',
                                '<div class="rd-tile-body">',
                                    '<div class="rd-tile-title">{column1.name}</div>',
                                    '<div class="rd-tile-desc">{column1.desc}</div>',
                                '</div>', 
                                
                                '<tpl if="column1.meshdesk">',
                                     //--Special for Mesh Networks--   
                                    "<div style='font-size:larger;'>",
                                        "<ul class='fa-ul'>",
                                            "<li style='padding:4px;'>",
                                                // Display meshes_total with ONLINE and OFFLINE parts
                                                "<span class='fa-li' style='font-family:FontAwesome;'>&#xf20e</span> {column1.meshes_total} networks",
                                                "<tpl if='column1.meshes_up &gt; 0'>",
                                                    " - <span style='color:green;'>  {column1.meshes_up} online</span>",
                                                "</tpl>",
                                                "<tpl if='column1.meshes_down &gt; 0'>",
                                                    " - <span style='color:#c27819;'>  {column1.meshes_down} offline</span>",
                                                "</tpl>",
                                            "</li>",
                                            "<li style='padding:4px;'>",
                                                "<i class='fa-li fa fa-share-alt'></i> {column1.nodes_total} nodes",
                                                "<tpl if='column1.nodes_up &gt; 0'>",
                                                    " - <span style='color:green;'>  {column1.nodes_up} online</span>",
                                                "</tpl>",
                                                "<tpl if='column1.nodes_down &gt; 0'>",
                                                    " - <span style='color:#c27819;'>  {column1.nodes_down} offline</span>",
                                                "</tpl>",
                                            "</li>",
                                        "</ul>",
                                    '</div>',
                                    //--END special section--
                                '<tpl else>',                                                                         
                                    '<div class="rd-tile-stat">',
                                      '{column1.total}',
                                      '<tpl if="column1.online &gt; 0">',
                                        '<span class="rd-badge rd-badge-online" title="{column1.online} new">{column1.online} new</span>',
                                      '</tpl>',
                                    '</div>',
                                '</tpl>',
                                                                                
                            '</div>',                                                                                    
                        '</tpl>',
                        // right column
                        '<tpl if="column2">',
                            '<div class="rd-tile rd-tile-column2 {[values.column2.accent ? ("rd-accent-" + values.column2.accent) : ""]}" ',
                                'data-controller="{column2.controller}" data-target="{column2.id}">',
                                '<div class="rd-tile-icon"><span class="x-fa" style="font-family:FontAwesome;">&#{column2.glyph};</span></div>',
                                '<div class="rd-tile-body">',
                                    '<div class="rd-tile-title">{column2.name}</div>',
                                    '<div class="rd-tile-desc">{column2.desc}</div>',
                                '</div>',
                                
                                //--Special for AP Profiles --   
                                "<div style='font-size:larger;'>",
                                    "<ul class='fa-ul'>",
                                        "<li style='padding:4px;'>",
                                            // Display meshes_total with ONLINE and OFFLINE parts
                                            "<i class='fa-li fa fa-cubes'></i> {column2.ap_profiles_total} profiles",
                                            "<tpl if='column2.ap_profiles_up &gt; 0'>",
                                                " - <span style='color:green;'>  {column2.ap_profiles_up} online</span>",
                                            "</tpl>",
                                            "<tpl if='column2.ap_profiles_down &gt; 0'>",
                                                " - <span style='color:#c27819;'>  {column2.ap_profiles_down} offline</span>",
                                            "</tpl>",
                                        "</li>",
                                        "<li style='padding:4px;'>",
                                            "<i class='fa-li fa fa-cube'></i> {column2.aps_total} devices",
                                            "<tpl if='column2.aps_up &gt; 0'>",
                                                " - <span style='color:green;'>  {column2.aps_up} online</span>",
                                            "</tpl>",
                                            "<tpl if='column2.aps_down &gt; 0'>",
                                                " - <span style='color:#c27819;'>  {column2.aps_down} offline</span>",
                                            "</tpl>",
                                        "</li>",
                                    "</ul>",
                                '</div>',
                                //--END special section--
                                                                                                                              
                            '</div>',
                        '</tpl>',
                        '</div>',
                    '</tpl>'
                ),
                itemSelector: '.rd-tiles-grid',
                listeners: {
                    itemclick: me.itemClicked,
                    scope: me
                }
            });
                                 
            var tp = Ext.create('Ext.panel.Panel',
            	{          
	            	border      : false,
	                itemId      : itemId,
	                items       : v,
	                height      : '100%', 
                    autoScroll  : true,
	            });      
            pnl.add(tp);
                              
            added = true;
        }
        return added;      
    },
    
    actionBackButton: function () {
        var me = this,
            vp = me.getViewP(),
            pnlDashboard = vp.down('pnlDashboard'),
            header = pnlDashboard.down('#tbtHeader'),
            pnl = vp.down('#pnlCenter'),
            tab = pnl.down('#tabMainNetworks'),
            dv = tab.down('dataview'),
            store = dv.getStore();

        header.update(Ext.apply({}, { fa_value: '&#xf0e8;', value: 'NETWORKS' }, header.getData()));

        // avoid empty flash during load
        store.clearOnLoad = false;
        dv.setLoading('Loading…');

        // ensure the incoming card is hidden before activation
        tab.on('afterrender', function () { tab.getEl().hide(); }, { single: true });

        store.load({
            callback: function () {
                dv.setLoading(false);

                // switch card (no animation here)
                pnl.setActiveItem(tab);

                // now animate the newly active card
                var el = tab.getEl();
                if (el) {
                el.slideIn('r', { duration: 250, easing: 'easeOut' });
                }
            },
            scope: me
        });
    }, 
          
    itemClicked: function(view, record, item, index, e){
        var me = this;

        var clickedColumn = e.getTarget('.rd-tile-column1') ? 'column1' : 'column2';
        var column = record.get(clickedColumn);
        if(column){
            var pnlDashboard = me.getViewP().down('pnlDashboard');
            var new_data = Ext.Object.merge(
                pnlDashboard.down('#tbtHeader').getData(),
                { fa_value: '&#'+column.glyph+';', value : column.name }
            );
            pnlDashboard.down('#tbtHeader').update(new_data);

            var id  = column.id;
            var pnl = me.getViewP().down('#pnlCenter');
            var item= pnl.down('#'+id);
            if(!item){
                var added = Ext.getApplication().runAction(column.controller,'Index',pnl,id);
                if(!added){
                    pnl.setActiveItem(item);
                }else{                
                    pnl.setActiveItem(id);
                    // now animate the newly active card                    
                    var i   = pnl.down('#'+id);
                    var el  = i.getEl();
                    if (el) {
                        el.slideIn('l', { duration: 250, easing: 'easeOut' });
                    }
                }
            }else{
                pnl.setActiveItem(item);               
                // now animate the newly active card
                var el = item.getEl();
                if (el) {
                el.slideIn('l', { duration: 250, easing: 'easeOut' });
                }                
            }
        }
    }
});
