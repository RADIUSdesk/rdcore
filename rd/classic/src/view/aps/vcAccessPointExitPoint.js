Ext.define('Rd.view.aps.vcAccessPointExitPoint', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcAccessPointExitPoint',
    config : {
        urlCheckExperimental    : '/cake4/rd_cake/ap-profiles/ap_experimental_check.json',
        urlViewExit             : '/cake4/rd_cake/ap-profiles/ap_profile_exit_view.json'
    },
    init: function() {
        var me = this;
    },
    onChkApplyFirewallProfileChange: function(chk){
		var me 		= this;
		var form    = chk.up('form');
		var fw_prof = form.down('cmbFirewallProfile');
		if(chk.getValue()){
		    fw_prof.enable();		   
		}else{
		    fw_prof.disable();
		}
	},     
	onChkApplySqmProfileChange: function(chk){
		var me 		    = this;
		var form        = chk.up('form');
		var sqm_prof    = form.down('cmbSqmProfile');
		if(chk.getValue()){
		    sqm_prof.enable();		   
		}else{
		    sqm_prof.disable();
		}
	},        
	onChkDnsOverrideChange: function(chk){
		var me 		= this;
		var form    = chk.up('form');
		var d1      = form.down('#txtDns1');
		var d2      = form.down('#txtDns2');
		if(chk.getValue()){
		    d1.enable();
		    d2.enable();
		}else{
		    d1.disable();
		    d2.disable();
		}
	},
	onChkConnectAndRedirectChange: function(chk){
		var me 		        = this;
		var form            = chk.up('form');
		var txtUamUrl       = form.down('#txtUamUrl');
		var txtUamSecret    = form.down('#txtUamSecret');
		var txtWalledGarden = form.down('#txtWalledGarden');
		var redirUrl        = form.down('#txtConnectAndRedirect');
			
		if(chk.getValue()){
		    txtUamUrl.setDisabled(true);
		    txtUamSecret.setDisabled(true);
		    txtWalledGarden.setDisabled(true);
		    redirUrl.setDisabled(false);	   
		}else{
		    txtUamUrl.setDisabled(false);
		    txtUamSecret.setDisabled(false);
		    txtWalledGarden.setDisabled(false);
		    redirUrl.setDisabled(true);    
		}
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
        form.setLoading(true);
        var exitId = win.exitId;
        form.load({
            url         :me.getUrlViewExit(), 
            method      :'GET',
            params      :{exit_id:exitId},
            success     : function(a,b,c){
            
                var t           = form.down("#type");
                var t_val       = t.getValue();
                var vlan        = form.down('#vlan');  
                var vpn         = form.down('#cmbOpenVpnServers');
                var pppoe       = form.down('#cmbAccelProfiles'); 
                 
                var rgrpProtocol= form.down('#rgrpProtocol');
                
                var l3Detail    = form.down('#pnlLayer3Detail');
                var tagConWith  = form.down('tagAccessPointEntryPoints');
                var chkStats    = form.down('#chkNetworkStats');
                
                if(t_val == 'openvpn_bridge'){
                    vpn.setVisible(true);
                    vpn.setDisabled(false);
                    
                    vlan.setVisible(false);
                    vlan.setDisabled(true);
                }else{
                    vpn.setVisible(false);
                    vpn.setDisabled(true);
                }
                
                if(t_val == 'pppoe_server'){
                    pppoe.setVisible(true);
                    pppoe.setDisabled(false);
                    
                    vlan.setVisible(false);
                    vlan.setDisabled(true);
                    vpn.setVisible(false);
                    vpn.setDisabled(true);
                }else{
                    pppoe.setVisible(false);
                    pppoe.setDisabled(true);
                }
         
                if((t_val == 'tagged_bridge')||(t_val == 'nat')||(t_val == 'captive_portal')){
                    vlan.setVisible(true);
                    vlan.setDisabled(false);
                }else{
                    vlan.setVisible(false);
                    vlan.setDisabled(true);
                }
                
                if(t_val == 'nat'){
                    chkStats.show();
                    chkStats.enable();           
                }else{
                    chkStats.hide();
                    chkStats.disable();
                }
                           
                var ent  = form.down("tagAccessPointEntryPoints");
                ent.setValue(b.result.data.entry_points);
                if(b.result.data.type == 'captive_portal'){
                
                    vlan.setVisible(true);
                    vlan.setDisabled(false);
                
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
                
                form.setLoading(false);    
            }
        });
    }
});
