Ext.define('Rd.view.testRadius.vcTestRadius', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcTestRadius',
    config	: {
        urlView  : '/cake4/rd_cake/third-party-radius/view.json',
        urlSave  : '/cake4/rd_cake/settings/save-email.json',
        UrlEmail : '/cake4/rd_cake/settings/test-email.json'
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
    }
});
