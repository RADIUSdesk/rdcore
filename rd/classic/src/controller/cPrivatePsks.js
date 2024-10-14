Ext.define('Rd.controller.cPrivatePsks', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl,itemId){
        var me      = this;
        var item    = pnl.down('#'+itemId);
        var added   = false;
        if(!item){
            var tp = Ext.create('Ext.tab.Panel',
            	{          
	            	border  : false,
	                itemId  : itemId,
	                plain	: true,
	                cls     : 'subSubTab', //Make darker -> Maybe grey
	                tabBar: {
                        items: [
                            { 
                                xtype   : 'btnOtherBack'
                            }              
                       ]
                    },
	                items   : [
	                    { 
	                        title   : 'Private PSKs', 
	                        xtype   : 'gridPrivatePsks',
	                        border  : false,
                            plain   : true,
                            padding : '0 5 0 5',
	                        glyph   : 'xf023@FontAwesome',
	                        listeners: {
                                activate: me.reload,
                                scope   : me
                            }
	                    }
	                ]
	            });      
            pnl.add(tp);
            added = true;
        }
        return added;      
    },
    refs    : [
        {  ref: 'grid',  selector: 'gridPrivatePsks'}       
    ],
    views   :  [
    	'privatePsks.gridPrivatePsks'
    ],
    stores  : ['sPrivatePsks'],
    models  : ['mPrivatePsk'],
    reload: function(){
        var me =this;
        me.getGrid().getSelectionModel().deselectAll(true);
        me.getGrid().getStore().load();
    }
});
