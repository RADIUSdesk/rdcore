Ext.define('Rd.view.meshes.vcMeshExitPoint', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcMeshExitPoint',
    config : {
        urlCheckExperimental : '/cake3/rd_cake/meshes/mesh_experimental_check.json',
        urlViewExit:        '/cake3/rd_cake/meshes/mesh_exit_view.json',
    },
    init: function() {
        var me = this;
    }, 
    onAfterRender: function(window){
   
        var me          = this;    
        var chk         = window.down('#chkDnsDesk');
        var tabDns      = chk.up('#tabDns');
	    var fsDnsIdent  = tabDns.down('#fsDnsIdent');   
	    Ext.Ajax.request({
            url: me.getUrlCheckExperimental(),
            method: 'GET',
            success: function(response){
                var jsonData = Ext.JSON.decode(response.responseText);
                if(jsonData.success){                      
                    if(jsonData.active){
                        chk.show();
                        chk.enable(); 
                        fsDnsIdent.hide();
                        fsDnsIdent.disable();    
                    }else{
                        chk.hide();
                        chk.disable();
                    }
                }   
            },
            scope: me
        });
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
		var tabDns  = chk.up('#tabDns');
	    var fsDnsIdent = tabDns.down('#fsDnsIdent'); 
		
		if(chk.getValue()){
		    any.setValue(false);
		    any.disable();
		    override.setValue(false);
		    override.disable();
		    fsDnsIdent.show();
            fsDnsIdent.enable();
            tabDns.down('#DnsIdentIp').enable(); 
            tabDns.down('#DnsIdentOpName').enable(); 
            tabDns.down('#DnsIdentOpPwd').enable(); 
		}else{
		    any.enable();
		    override.enable();
		    fsDnsIdent.hide();
            fsDnsIdent.disable();
            tabDns.down('#DnsIdentIp').disable();
            tabDns.down('#DnsIdentOpName').disable();
            tabDns.down('#DnsIdentOpPwd').disable();   
		}
	},
	onRgrpProtocolChange : function(grp){
	    var me          = this; 
	    var win         = grp.up('window');
	    var txtIpaddr   = win.down('#txtIpaddr');
        var txtNetmask  = win.down('#txtNetmask');
        var txtGateway  = win.down('#txtGateway');
        var txtDns1Tagged     = win.down('#txtDns1Tagged');
        var txtDns2Tagged     = win.down('#txtDns2Tagged');
        
        if(grp.getValue().proto == 'static'){         
            txtIpaddr.setVisible(true);
		    txtIpaddr.setDisabled(false);
            txtNetmask.setVisible(true);
            txtNetmask.setDisabled(false);  
            txtGateway.setVisible(true);
            txtGateway.setDisabled(false);     
            txtDns1Tagged.setVisible(true);
            txtDns1Tagged.setDisabled(false);
            txtDns2Tagged.setVisible(true);  
            txtDns2Tagged.setDisabled(false);
        }else{
            txtIpaddr.setVisible(false);
		    txtIpaddr.setDisabled(true);
            txtNetmask.setVisible(false);
            txtNetmask.setDisabled(true);  
            txtGateway.setVisible(false);
            txtGateway.setDisabled(true);     
            txtDns1Tagged.setVisible(false);
            txtDns1Tagged.setDisabled(true);
            txtDns2Tagged.setVisible(false);  
            txtDns2Tagged.setDisabled(true);
        }
	},
	sldrSpeedDownChange: function(sldr){
        var me 		= this;
		var fc    	= sldr.up('container');
        fc.down('displayfield').setValue(sldr.getValue());
    },
	sldrSpeedUpChange: function(sldr){
        var me 		= this;
		var fc    	= sldr.up('container');
        fc.down('displayfield').setValue(sldr.getValue());
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
                var t     = form.down("#type");
                var t_val = t.getValue();
                var vlan  = form.down('#vlan');
                var vpn   = form.down('#cmbOpenVpnServers');
                
                var rgrpProtocol= form.down('#rgrpProtocol');
                var txtIpaddr   = form.down('#txtIpaddr');
                var txtNetmask  = form.down('#txtNetmask');
                var txtGateway  = form.down('#txtGateway');
                var txtDns1     = form.down('#txtDns1');
                var txtDns2     = form.down('#txtDns2');
                var txtDns1Tagged       = form.down('#txtDns1Tagged');
                var txtDns2Tagged       = form.down('#txtDns2Tagged');
                var tagConWith          = form.down('tagMeshEntryPoints'); 
                
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
                    
                    vpn.setVisible(false);
                    vpn.setDisabled(true);
                }else{
                    vlan.setVisible(false);
                    vlan.setDisabled(true);
                }
                var ent  = form.down("tagMeshEntryPoints");
                ent.setValue(b.result.data.entry_points);
                if(b.result.data.type == 'captive_portal'){
                    if((b.result.data.auto_login_page == true)&&
                    (b.result.data.dynamic_detail != null)){
                        var cmb     = form.down("cmbDynamicDetail");
                        var rec     = Ext.create('Rd.model.mDynamicDetail', {name: b.result.data.dynamic_detail, id: b.result.data.dynamic_detail_id});
                        cmb.getStore().loadData([rec],false);
                        cmb.setValue( b.result.data.dynamic_detail_id );
                    }else{
                        //FIXME PLEASE CHECK WHAT MUST HAPPEN HERE
                        //form.down("cmbDynamicDetail").setVisible(false);
                        //form.down("cmbDynamicDetail").setDisabled(true);
                    }
                }
                
                if(b.result.data.type == 'tagged_bridge_l3'){
                
                    vlan.setVisible(true);
                    vlan.setDisabled(false);
                    rgrpProtocol.setVisible(true);
                    rgrpProtocol.setDisabled(false);
                    
                    if(rgrpProtocol.getValue().proto == 'static'){         
                        txtIpaddr.setVisible(true);
			            txtIpaddr.setDisabled(false);
                        txtNetmask.setVisible(true);
                        txtNetmask.setDisabled(false);  
                        txtGateway.setVisible(true);
                        txtGateway.setDisabled(false);     
                        txtDns1Tagged.setVisible(true);
                        txtDns1Tagged.setDisabled(false);
                        txtDns2Tagged.setVisible(true);  
                        txtDns2Tagged.setDisabled(false);
                    }else{
                        txtIpaddr.setVisible(false);
			            txtIpaddr.setDisabled(true);
                        txtNetmask.setVisible(false);
                        txtNetmask.setDisabled(true);  
                        txtGateway.setVisible(false);
                        txtGateway.setDisabled(true);     
                        txtDns1Tagged.setVisible(false);
                        txtDns1Tagged.setDisabled(true);
                        txtDns2Tagged.setVisible(false);  
                        txtDns2Tagged.setDisabled(true);
                    }
                    tagConWith.setVisible(false);
                    tagConWith.setDisabled(true);
                    
                }else{
                
                    rgrpProtocol.setVisible(false);
                    rgrpProtocol.setDisabled(true);
                    txtIpaddr.setVisible(false);
			        txtIpaddr.setDisabled(true);
                    txtNetmask.setVisible(false);
                    txtNetmask.setDisabled(true);  
                    txtGateway.setVisible(false);
                    txtGateway.setDisabled(true);     
                    txtDns1Tagged.setVisible(false);
                    txtDns1Tagged.setDisabled(true);
                    txtDns2Tagged.setVisible(false);  
                    txtDns2Tagged.setDisabled(true);
                    
                    tagConWith.setVisible(true);
                    tagConWith.setDisabled(false);
                }      
            }
        });
    } 
});
