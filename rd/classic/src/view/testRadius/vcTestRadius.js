Ext.define('Rd.view.testRadius.vcTestRadius', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcTestRadius',
    config	: {
        urlView  : '/cake4/rd_cake/third-party-radius/view.json',
        urlTest  : '/cake4/rd_cake/third-party-radius/test-radius.json'
    },
    control: {
        '#test': {
            click   : 'test'
        }
    },
    onViewActivate: function(pnl){
        var me = this;
        console.log("Gooi Hom");
        me.getView().setLoading(true);
        me.getView().load({url:me.getUrlView(), method:'GET',params:{'edit_cloud_id':me.getView().cloud_id},
			success : function(a,b){  
		        me.getView().setLoading(false);
            }
		});       
    },
    test: function(btn){
    	var me 		= this;
    	var form    = btn.up('form');
        var window  = form.up('window'); 
        me.getView().setLoading(true);
        form.submit({
            clientValidation: true,
            url             : me.getUrlTest(),
            success         : function(form, action) {              
                //FIXME reload store....
                console.log(action.result.data);
                me.getView().down('#pnlResult').setData(action.result.data);
                me.getView().setLoading(false);
            	console.log("Test Done");
            },
            failure: Ext.ux.formFail,
            scope: me
        });    
    }
});
