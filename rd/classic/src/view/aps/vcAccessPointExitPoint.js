Ext.define('Rd.view.aps.vcAccessPointExitPoint', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcAccessPointExitPoint',
    config : {
        urlCheckExperimental    : '/cake3/rd_cake/ap-profiles/ap_experimental_check.json',
        urlViewExit             : '/cake3/rd_cake/ap-profiles/ap_profile_exit_view.json'
    },
    init: function() {
        var me = this;
    },    
	onChkDnsOverrideChange: function(chk){
		var me 		= this;
		var form    = chk.up('form');
		var d1      = form.down('#txtDns1');
		var d2      = form.down('#txtDns2');
		var desk    = form.down('#chkDnsDesk');
		if(chk.getValue()){
		    d1.enable();
		    d2.enable();
		    desk.setValue(false);
		    desk.disable(); 
		}else{
		    d1.disable();
		    d2.disable();
		    desk.enable(); 
		}
	},
	onChkDnsDeskChange: function(chk){
	    var me 		= this;
		var form    = chk.up('form');
		var override= form.down('#chkDnsOverride');
		var any     = form.down('#chkAnyDns');
		if(chk.getValue()){
		    any.setValue(false);
		    any.disable();
		    override.setValue(false);
		    override.disable();  
		}else{
		    any.enable();
		    override.enable();  
		}
	},
	onDnsDeskBeforeRender : function(chk){
	    var me = this; 
	    Ext.Ajax.request({
            url: me.getUrlCheckExperimental(),
            method: 'GET',
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){                      
                    if(jsonData.active){
                        chk.show();
                        chk.enable();  
                    }else{
                        chk.hide();
                        chk.disable(); 
                    }
                }   
            },
            scope: me
        });
	},
	onRgrpProtocolChange : function(grp){
	    var me          = this; 
	    var win         = grp.up('window');
        var l3Detail    = win.down('#pnlLayer3Detail');  
        if(grp.getValue().proto == 'static'){ 
            l3Detail.setHidden(false);
            l3Detail.setDisabled(false);                    
        }else{
            l3Detail.setHidden(true);
            l3Detail.setDisabled(true);                        
        }
	},
	loadExit: function(win){
        var me      = this; 
        var form    = win.down('form');
        var exitId = win.exitId;
        form.load({
            url         :me.getUrlViewExit(), 
            method      :'GET',
            params      :{exit_id:exitId},
            success     : function(a,b,c){
            
                var t           = form.down("#type");
                var t_val       = t.getValue();
                var vlan        = form.down('#vlan');  
                var vpn         = form.down('#cmbOpenVpnServers') 
                 
                var rgrpProtocol= form.down('#rgrpProtocol');
                
                var l3Detail    = form.down('#pnlLayer3Detail');
                var tagConWith  = form.down('tagAccessPointEntryPoints');
                
                if(t_val == 'openvpn_bridge'){
                    vpn.setVisible(true);
                    vpn.setDisabled(false);
                    
                    vlan.setVisible(false);
                    vlan.setDisabled(true);
                }else{
                    vpn.setVisible(false);
                    vpn.setDisabled(true);
                }
         
                if(t_val == 'tagged_bridge'){
                    vlan.setVisible(true);
                    vlan.setDisabled(false);
                }else{
                    vlan.setVisible(false);
                    vlan.setDisabled(true);
                }
                var ent  = form.down("tagAccessPointEntryPoints");
                ent.setValue(b.result.data.entry_points);
                if(b.result.data.type == 'captive_portal'){
                    //Login Page (Dynamic Detail)
                    if((b.result.data.auto_login_page == true)&&
                    (b.result.data.dynamic_detail != null)){
                        var cmb     = form.down("cmbDynamicDetail");
                        var rec     = Ext.create('Rd.model.mDynamicDetail', {name: b.result.data.dynamic_detail, id: b.result.data.dynamic_detail_id});
                        cmb.getStore().loadData([rec],false);
                        cmb.setValue( b.result.data.dynamic_detail_id );
                    }else{
                        form.down("cmbDynamicDetail").setVisible(false);
                        form.down("cmbDynamicDetail").setDisabled(true);
                    }
                    //Realms for Dynamic Client (auto_dynamic_client)
                    if((b.result.data.auto_dynamic_client == true)&&
                    (b.result.data.realm_records != null)){    
                        var cmb_r     = form.down("cmbRealm");
                        var record_list = [];
                        Ext.Array.forEach(b.result.data.realm_records,function(r){
                            var rec = Ext.create('Rd.model.mRealm', {name: r.name, id: r.id});
			                Ext.Array.push(record_list,rec);
		                });
                        cmb_r.getStore().loadData(record_list,false);
                        cmb_r.setValue(b.result.data.realm_ids);
                    }else{
                        form.down("cmbRealm").setVisible(false);
                        form.down("cmbRealm").setDisabled(true);
                    }    
                }
                
                if(b.result.data.type == 'tagged_bridge_l3'){
                
                    vlan.setVisible(true);
                    vlan.setDisabled(false);
                    rgrpProtocol.setVisible(true);
                    rgrpProtocol.setDisabled(false);                   
                    if(rgrpProtocol.getValue().proto == 'static'){ 
                        l3Detail.setHidden(false);
                        l3Detail.setDisabled(false);                    
                    }else{
                        l3Detail.setHidden(true);
                        l3Detail.setDisabled(true);                        
                    }
                    tagConWith.setVisible(false);
                    tagConWith.setDisabled(true);
                    
                }else{
                
                    rgrpProtocol.setVisible(false);
                    rgrpProtocol.setDisabled(true);
                    l3Detail.setHidden(true);
                    l3Detail.setDisabled(true);       
                    
                    tagConWith.setVisible(true);
                    tagConWith.setDisabled(false);
                }    
            }
        });
    }
});
