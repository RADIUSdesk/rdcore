Ext.define('Rd.controller.cProfileFup', {
    extend: 'Ext.app.Controller',
    views:  [
        'profiles.pnlEditProfileFup' 
    ],
    config      : {  
        urlViewProfile     : '/cake4/rd_cake/profiles/fup_view.json',
        urlEditProfile     : '/cake4/rd_cake/profiles/fup_edit.json'
    },
    refs: [
        {  ref: 'tabProfiles',  selector: '#tabProfiles' } 
    ],
    init: function() {
        var me = this;
        
        if (me.inited) {
            return;
        }
        me.inited = true;
            
        me.control({
            'pnlEditProfileFup' : {
                activate:  me.pnlActivate
            },
            'pnlEditProfileFup #save': {
                click: me.btnSave
            } 
        });
    },
    actionIndex: function(profile_id,params){
		var me      	= this;
        var id			= 'tabEditProfileFup'+ profile_id;
        var tp          = params.tp;
		var name 		= params.name;
		var store		= params.store;	
        var newTab      = tp.items.findBy(
        function (tab){
            return tab.getItemId() === id;
        });
         
        if (!newTab){
            newTab = tp.add({
                glyph   		: Rd.config.icnHandshakeO, 
                title   		: "FUP Edit "+name,
                closable		: true,
                xtype   		: 'pnlEditProfileFup',
                itemId  		: id,
                profileId       : profile_id,
				store			: store
            });
        }    
        tp.setActiveTab(newTab);    
   },
   btnSave:  function(button){
        var me      = this;
        var form    = button.up("form");
        var pnl     = button.up('pnlEditProfileFup');              
        form.submit({
            clientValidation: true,
            url: me.getUrlEditProfile(),
            success: function(form, action) {
                pnl.close();
                Ext.ux.Toaster.msg(
                        i18n("sItem_updated_fine"),
                        i18n("sItem_updated_fine"),
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                );               
            },
            scope       : me,
            failure     : Ext.ux.formFail
        });       
    },
    pnlActivate: function(pnl){
        var me = this;
        pnl.getForm().load({
            url     : me.getUrlViewProfile(),
            method  : 'GET',
            params  : {
                profile_id   : pnl.profileId
            },
            success : function(a,b){
                var me = this;
                if(b.result.data.profile_fup_components){
                    me.loadFupComponents(pnl,b.result.data.profile_fup_components);
                }    
            },
            scope   : me,
            failure : function(form, action) {
                Ext.Msg.alert(action.response.statusText, action.response.responseText);
            }
        });
    },
    loadFupComponents: function(pnl,list){
        var me = this;
        var pnlComponents = pnl.down('pnlFupComponents');
        //Clear the panel first
        pnlComponents.removeAll(true); 
        
        Ext.Array.forEach(list,function(item){
            console.log(item);
            pnlComponents.add({xtype : 'pnlFupComponent',ui : 'panel-blue',title: item.name ,count: item.id, action: 'edit',d:item});
        });        
    }
});
