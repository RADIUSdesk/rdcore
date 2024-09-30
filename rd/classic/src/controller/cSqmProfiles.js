Ext.define('Rd.controller.cSqmProfiles', {
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
	                        title   : 'SQM Profiles', 
	                        xtype   : 'pnlSqmProfiles',
	                        border  : false,
                            plain   : true,
                            padding : '0 5 0 5',
	                        glyph   : 'xf00a@FontAwesome',
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
    	'sqmProfiles.pnlSqmProfiles'
    ],
    refs: [
        {  ref: 'dv',    selector: '#dvSqmProfiles'}       
    ],
   	dvActivate: function(pnl){
        var me = this;
        me.getDv().getStore().reload();            
    }
});
