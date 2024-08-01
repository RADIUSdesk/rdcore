Ext.define('Rd.view.aps.vcApViewSqm', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcApViewSqm',
    init    : function() {
    	var me = this;   
    	var dd = Rd.getApplication().getDashboardData();
    	//Set root to use later in the app in order to set 'for_system' (root)
        me.root    = false;
        if(dd.isRootUser){
            me.root = true;   
        }  
    },
    config: {
        urlAdd  : '/cake4/rd_cake/firewall-profiles/add.json'
    },
    control: {
    	'pnlApViewSqm #reload': {
            click   : 'reload'
        },
        'pnlApViewSqm #dvApViewSqm' : {
        	itemclick	: 'itemSelected'
        }       
    },
    itemSelected: function(dv,record){
    	var me = this;
    	//--Add FirewallProfile Component--
    	console.log("Item Selected");
    	//if(record.get('type') == 'add'){
    		
    	//} 	
    },
    reload: function(){
        var me = this;
        me.getView().down('#dvApViewSqm').getStore().reload();
    }
    
});
