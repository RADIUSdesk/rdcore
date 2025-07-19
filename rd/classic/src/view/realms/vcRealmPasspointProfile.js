Ext.define('Rd.view.realms.vcRealmPasspointProfile', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcRealmPasspointProfile',
    init    : function() {
    
    },
    config: {
        urlSave         : '/cake4/rd_cake/realm-passpoint-profiles/save.json',
        urlView         : '/cake4/rd_cake/realm-passpoint-profiles/view.json',
        naiRealmCount   : 0,
        rcoiCount       : 0,
    },
    control: {
        'pnlRealmPasspointProfile': {
            addRealmNaiRealm    : 'addRealmNaiRealm',
            addRealmRcoi        : 'addRealmRcoi',
            activate            : 'pnlActive'
        },
        '#save': {
           click   : 'btnSave'
        }
    },
    pnlAfterRender : function(){
        var me = this;
        var realm_id = me.getView().realm_id;
        console.log("After Render "+realm_id);    
    },
    pnlActive   : function(form){
        var me          = this; 
        var realm_id    = me.getView().realm_id;
        
        me.getView().down('#cntRealmNaiRealms').removeAll(true);  
        me.getView().down('#cntRealmRcois').removeAll(true);         
        form.load({
            url         : me.getUrlView(), 
            method      : 'GET',
            params      : { realm_id: realm_id },
            success     : function(a,b,c){                                	
            	//me.warningCheck(); //Lastly
            	if(b.result.data.realm_passpoint_nai_realms){
            	    Ext.Array.forEach(b.result.data.realm_passpoint_nai_realms,function(nai,index){
            	         me.getView().down('#cntRealmNaiRealms').add({
                            xtype       : 'cntRealmNaiRealms',
                            mode        : 'edit',
                            nai_name    : nai.name,
                            eap_methods : nai.eap_methods,
                            count       : nai.id
                        });            	    
            	    })	            			
            	}
            	
            	if(b.result.data.realm_passpoint_rcois){
            	    Ext.Array.forEach(b.result.data.realm_passpoint_rcois,function(rcoi,index){
            	         me.getView().down('#cntRealmRcois').add({
                            xtype       : 'cntRealmRcois',
                            mode        : 'edit',
                            rcoi_name   : rcoi.name,
                            rcoi_id     : rcoi.rcoi_id,
                            count       : rcoi.id
                        });            	    
            	    })	            			
            	}                       
            }
        });            
    },
    warningCheck : function(){
        var me   = this;        
        var view = me.getView();       
    },
    addRealmNaiRealm: function(btn){
        var me      = this;
        me.setNaiRealmCount(me.getNaiRealmCount()+1);
        me.getView().down('#cntRealmNaiRealms').add({
            xtype   : 'cntRealmNaiRealms',
            mode    : 'add',
            count   : me.getNaiRealmCount() 
        })
        me.warningCheck();
    },
    btnDelNaiRealm: function(btn){
        var me      = this;
        btn.up('cntRealmNaiRealms').destroy();
        me.warningCheck();
    },
    addRealmRcoi: function(btn){
        var me      = this;
        me.setRcoiCount(me.getRcoiCount()+1);
        me.getView().down('#cntRealmRcois').add({
            xtype   : 'cntRealmRcois',
            mode    : 'add',
            count   : me.getRcoiCount() 
        })
        me.warningCheck();
    },
    btnDelRcoi: function(btn){
        var me      = this;
        btn.up('cntRealmRcois').destroy();
        me.warningCheck();
    },
    btnSave:function(button){
        var me          = this;
        var formPanel   = this.getView();
      
        if(false){
            Ext.ux.Toaster.msg(
                'Specifiy RCOI or NAI Realm',
                'Add at least one RCOI or NAI Realm',
                Ext.ux.Constants.clsError,
                Ext.ux.Constants.msgError
            );
            return;
        }      
        var url         = me.getUrlSave();             
        //Checks passed fine...      
        formPanel.submit({
            clientValidation    : true,
            url                 : url,
            submitEmptyText     : false, // Set this in the form config
            success             : function(form, action) {
                if (formPanel.closable) {
                    formPanel.close();
                }
                Ext.ux.Toaster.msg(
                    i18n('sItems_modified'),
                    i18n('sItems_modified_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure             : Ext.ux.formFail
        });
    }
});
