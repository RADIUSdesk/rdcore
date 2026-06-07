Ext.define('Rd.controller.cMainOther', {
    extend  : 'Ext.app.Controller',
    config: {
        urlGetContent : '/cake4/rd_cake/dashboard/other-items.json',
        activeScreen    : null,
        processingRoute : false   
    },
    init: function() {
        const me  = this;           
        if (me.inited) {
            return;
        }
                
        Ext.GlobalEvents.on(
            'cloudchanged',
            me.onCloudChanged,
            me
        );
        
        me.inited = true;         
    },
    refs: [
        {   ref: 'viewP',   	selector: 'viewP',          xtype: 'viewP',    autoCreate: true}
    ],
    
    onCloudChanged : function(cloud,section){
        var me = this;
        //Ext.log("Cloud Changed "+cloud+" "+section);
        if(section !== 'OTHER'){
            me.redirectTo({otherActive: null}); //Clear the hash
            return;
        }
        if(me.getActiveScreen()){
            //Ext.log(me.getActiveScreen())
            if(me.getActiveScreen()){
                me.clickScreenActive(me.getActiveScreen());
            }
        }           
    },
    
    //--- Standard pattern for level 2 deep linking--    
    routes: {
        'other_active/:activeScreen' : {
            action  : 'onScreenActive',
            lazy    : true,
            before  : 'beforeScreenActive',
            name    : 'otherActive'      
        }
    },
               
    beforeScreenActive : function(id, action){
        const me = this;       
        Ext.log("Router : before other screen active "+id);       
        if (this.getProcessingRoute()) {
            action.stop();
            return false;
        }
        
        me.setProcessingRoute(true);
        action.resume();
    },
       
    onScreenActive : function(id){
        const me = this;
        Ext.log("Router : other screen active "+id);
        me.urlScreenActive(id)
        this.setProcessingRoute(false);
    },
    
    clickScreenActive : function(id){
        const me = this;  
        if(me.validateScreen(id)){
            Ext.log("Router action : click screen active "+id);
            this.redirectTo({otherActive: 'other_active/'+id});
        }  
    },
    
    urlScreenActive: function(id){
        const me =this;
        if(me.validateScreen(id)){
            Ext.log("Router action : set active screen "+id);
            me.setActiveScreen(id);
            me.activeOtherScreen(id);
        }     
    },
          
    validateScreen: function(screen) {
        // Implement your screen validation logic
        return true;
        //return ['pnlOtherSettings','pnlOtherHardware'].includes(screen);
    },
    //--- END Standard pattern for level 2 deep linking--
    
    actionIndex: function(pnl,itemId){
        var me      = this;
        var item    = pnl.down('#'+itemId);
        var added   = false;
        if(!item){
        
            me.store = Ext.create('Ext.data.Store',{
                storeId : 'sMainOther',
                fields  : ['rowType','group','column1','column2'], // rowType: 'header' | undefined
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
                        }else{
                            me.storeLoaded();    
                        }
                    },
                    scope: this
                },
                autoLoad: true
            });
            
            var v = Ext.create('Ext.view.View', {
                store: Ext.data.StoreManager.lookup('sMainOther'),            
                tpl: new Ext.XTemplate(
                    '<tpl for=".">',
                        '<tpl if="rowType==\'header\'">',
                            '<div class="split-dataview-item rd-section-header">{group}</div>',
                        '<tpl else>',                              
                              '<div class="split-dataview-item rd-tiles-grid">',
                                  // left column
                                  '<tpl if="column1">',
                                    '<div class="rd-tile rd-tile-column1 {[values.column1.accent ? ("rd-accent-" + values.column1.accent) : ""]}" ',
                                         'data-controller="{column1.controller}" data-target="{column1.id}">',
                                      '<div class="rd-tile-icon"><span class="x-fa" style="font-family:FontAwesome;">&#{column1.glyph};</span></div>',
                                      '<div class="rd-tile-body">',
                                        '<div class="rd-tile-title">{column1.name}</div>',
                                        '<div class="rd-tile-desc">{column1.desc}</div>',
                                      '</div>',
                                      '<div class="rd-tile-stat">{column1.total}</div>',
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
                                      '<div class="rd-tile-stat">{column2.total}</div>',
                                    '</div>',
                                  '</tpl>',
                              '</div>',
                        '</tpl>',
                    '</tpl>'
                ),
                itemSelector: '.split-dataview-item',
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
                    autoScroll  : true
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
            tab = pnl.down('#tabMainOther'),
            dv = tab.down('dataview'),
            store = dv.getStore();

        header.update(Ext.apply({}, {fa_value:'&#xf085;', value : 'OTHER'}, header.getData()));

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
        
        me.setActiveScreen(null); //Clear the active screen
        me.redirectTo({otherActive: null}); //Clear the hash
        
    }, 
          
   /* itemClicked: function(view, record, item, index, e){
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
    },*/
    
    itemClicked: function(view, record, item, index, e){
        var me = this;

        var clickedColumn = e.getTarget('.rd-tile-column1') ? 'column1' : 'column2';
        var column = record.get(clickedColumn);
        if(column){          
            var id  = column.id;
            me.clickScreenActive(id);
        }
    },
    
    activeOtherScreen: function(id){  
      
        var me = this;
        
        console.log("=== Call activeOtherScreen "+id);
        var store = Ext.data.StoreManager.lookup('sMainOther');
        var controller = false;
        var glyph = false;
        var name = false;
        
        store.each(function(record) {
            var col1 = record.get('column1');
            var col2 = record.get('column2');
            
            if(col1 && col1.id === id){
                controller = col1.controller;
                glyph = col1.glyph;
                name = col1.name;
            }
            if(col2 && col2.id === id){
                controller = col2.controller;
                glyph = col2.glyph;
                name = col2.name;
            }
        });
        
        if(!controller){
            console.log("Assume Empty list - Could not Load "+id);
            return;
        }
        
        // Your existing code here...          
        var pnlDashboard = me.getViewP().down('pnlDashboard');
        var new_data = Ext.Object.merge(
            pnlDashboard.down('#tbtHeader').getData(),
            { fa_value: '&#'+glyph+';', value : name }
        );
        pnlDashboard.down('#tbtHeader').update(new_data);
                    
           
        var pnl     = me.getViewP().down('#pnlCenter');
        var item    = pnl.down('#'+id);
                                    
        if(!item){
            var added = Ext.getApplication().runAction(controller,'Index',pnl,id);
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
    },   
    
    storeLoaded: function(store){
        var me = this;
        //console.log("Store is loaded - Check for active screen "+me.getActiveScreen());
        me.activeOtherScreen(me.getActiveScreen());      
    }   
});
