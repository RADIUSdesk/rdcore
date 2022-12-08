Ext.define('Rd.view.clouds.vcCloudDetail', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcCloudDetail',
    config: {
        urlView  : '/cake4/rd_cake/clouds/view.json',
        urlSave  : '/cake4/rd_cake/clouds/save-cloud.json'
    }, 
    control: {
        'pnlCloudDetail #save'    : {
            click   : 'save'
        }
    },
    onViewActivate: function(pnl){
        var me = this;
        me.getView().setLoading(true);
        me.getView().load({url:me.getUrlView(), method:'GET',params:{'edit_cloud_id':me.getView().cloud_id},
			success : function(a,b){  
		        me.getView().setLoading(false);
                var ent  = me.getView().down('tagAccessProviders');
                ent.setValue(b.result.data.admins);
            }
		});       
    },
    save: function(button){
        var me         = this;
        var form       = button.up('form');
        var e_cloud_id = form.down('#editCloudId').getValue();
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlSave(),
            params              : { //Add extra param for cloud id
                edit_cloud_id : e_cloud_id
            },
            success             : function(form, action) {              
                //FIXME reload store....
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure             : Ext.ux.formFail
        });
    }
});
