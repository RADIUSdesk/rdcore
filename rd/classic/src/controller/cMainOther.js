Ext.define('Rd.controller.cMainOther', {
    extend  : 'Ext.app.Controller',
    config: {
        urlGetContent : '/cake4/rd_cake/dashboard/other-items.json'
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
                fields  : ['column1', 'column2'],
                proxy: {
                    type        :'ajax',
                    url         : me.getUrlGetContent(),
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
                autoLoad: true
            });
                      
            var v = Ext.create('Ext.view.View', {
                store: Ext.data.StoreManager.lookup('myStore'),
                tpl: new Ext.XTemplate(
                    '<tpl for=".">',
                        '<div class="split-dataview-item">',
                            '<div class="split-dataview-column1">',
                                '<span style="font-family:FontAwesome;">&#{column1.glyph};</span>   {column1.name}',
                            '</div>',
                            '<tpl if="column2">',
                                '<div class="split-dataview-column2">',
                                '<span style="font-family:FontAwesome;">&#{column2.glyph};</span>   {column2.name}',
                            '</div>',
                            '</tpl>',
                        '</div>',
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
                    autoScroll  : true,
	            });      
            pnl.add(tp);
                              
            added = true;
        }
        return added;      
    },
    actionBackButton: function(){
        var me              = this;                           
        var pnlDashboard    = me.getViewP().down('pnlDashboard');
        var new_data        = Ext.Object.merge(pnlDashboard.down('#tbtHeader').getData(),{fa_value:'&#xf085;', value : 'OTHER'});
        pnlDashboard.down('#tbtHeader').update(new_data);
        var pnl             = me.getViewP().down('#pnlCenter');
        var item            = pnl.down('#tabMainOther');
        pnl.setActiveItem(item);
        pnl.getEl().slideIn('r');     
    },
    itemClicked: function(view, record, item, index, e){
    
        var clickedColumn   = e.getTarget('.split-dataview-column1') ? 'column1' : 'column2';
        var column          = record.get(clickedColumn);
        if(column){
            var pnlDashboard = me.getViewP().down('pnlDashboard');

            var new_data = Ext.Object.merge(pnlDashboard.down('#tbtHeader').getData(),{fa_value:'&#'+column.glyph+';', value : column.name});
            pnlDashboard.down('#tbtHeader').update(new_data);
            
            var id      = column.id;
            var pnl     = me.getViewP().down('#pnlCenter');
            var item    = pnl.down('#'+id);
            if(!item){
                var added = Ext.getApplication().runAction(column.controller,'Index',pnl,id);
                if(!added){
                    pnl.setActiveItem(item);
                }else{
                    pnl.setActiveItem(id);
                }  
            }else{
           		pnl.setActiveItem(item);
           	}   
        } 
    }
});
