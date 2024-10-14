Ext.define('Rd.controller.cMultiWan', {
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
	                        title   : 'MultiWan', 
	                        xtype   : 'pnlMultiWanProfiles',
	                        border  : false,
                            plain   : true,
                            padding : '0 5 0 5',
	                        glyph   : 'xf0e8@FontAwesome',
	                        listeners: {
                                activate: me.dvActivate,
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
    views:  [
    	'multiWanProfiles.pnlMultiWanProfiles','multiWanProfiles.winMultiWanProfileAdd','multiWanProfiles.winMultiWanProfileEdit'
    ],
    refs: [
        {  ref: 'dv',    selector: '#dvMultiWanProfiles'}       
    ],
   	dvActivate: function(pnl){
        var me = this;
        me.getDv().getStore().reload();            
    }
});
