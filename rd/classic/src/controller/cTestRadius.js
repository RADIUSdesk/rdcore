Ext.define('Rd.controller.cTestRadius', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl,itemId){
    	var me = this;
        pnl.add({ 
            xtype   : 'pnlTestRadius',
            border  : false,
            plain   : true,
            padding : Rd.config.gridSlim,
            tabConfig   : {
                ui : 'tab-brown'
            }   
        });
        pnl.on({activate : me.onViewActivate,scope: me});   
    },
    config	: {
        urlView  : '/cake4/rd_cake/third-party-radius/view.json'
    },
    refs: [
        {  ref: 'pnlTestRadius',  selector:   'pnlTestRadius'} 
    ], 
    views:  [
        'testRadius.pnlTestRadius'
    ],
    onViewActivate : function(pnl){   	
    	var me = this;
    	var p  = me.getPnlTestRadius();
        console.log("Gooi Hom");
        p.setLoading(true);
        p.load({url:me.getUrlView(), method:'GET',
			success : function(a,b){  
		        p.setLoading(false);
            }
		});    
    }
    
});
