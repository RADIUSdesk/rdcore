Ext.define('Rd.controller.cMainUsers', {
    extend: 'Ext.app.Controller',   
    config: {
        urlGetContent : '/cake4/rd_cake/dashboard/users-items.json'
    },
    refs: [
        {   ref: 'viewP',   	selector: 'viewP',          xtype: 'viewP',    autoCreate: true}
    ],
    actionIndex: function(pnl,itemId){
        var me      = this;
        var item    = pnl.down('#'+itemId);
        var added   = false;
        if(!item){
        
            me.store = Ext.create('Ext.data.Store',{
                storeId : 'myStore',
                fields  : ['column1','column2'], 
                reloadOnClear: false,
                trackRemoved: false,
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
                             // '<div class="rd-tile-stat">{column1.total}</div>',
                              '<div class="rd-tile-stat">',
                                  '{column1.total}',
                                  '<tpl if="column1.online &gt; 0">',
                                    '<span class="rd-badge rd-badge-online" title="{column1.online} online">{column1.online} online</span>',
                                  '</tpl>',
                                  '<tpl if="column1.sessions &gt; 0">',
                                    '<span class="rd-badge rd-badge-online" title="{column1.sessions} sessions">{column1.sessions} sessions</span>',
                                  '</tpl>',
                                  '<tpl if="column1.suspended &gt; 0">',
                                    '<span class="rd-badge rd-badge--amber" title="{column1.suspended} suspended">{column1.suspended} suspended</span>',
                                  '</tpl>',
                                  '<tpl if="column1.terminated &gt; 0">',
                                    '<span class="rd-badge rd-badge--gray" title="{column1.terminated} terminated">{column1.terminated} terminated</span>',
                                  '</tpl>',
                                  '<tpl if="column1.expired &gt; 0">',
                                    '<span class="rd-badge rd-badge--blue" title="{column1.expired} expired">{column1.expired} expired</span>',
                                  '</tpl>',
                                '</div>',
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
                             // '<div class="rd-tile-stat">{column2.total}</div>',
                                '<div class="rd-tile-stat">',
                                  '{column2.total}',
                                  '<tpl if="column2.online &gt; 0">',
                                    '<span class="rd-badge rd-badge-online" title="{column2.online} online">{column2.online} online</span>',
                                  '</tpl>',
                                '</div>',
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
            tab = pnl.down('#tabMainUsers'),
            dv = tab.down('dataview'),
            store = dv.getStore();

        header.update(Ext.apply({}, { fa_value: '&#xf2c0;', value: 'Users' }, header.getData()));

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
