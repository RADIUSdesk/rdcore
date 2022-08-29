Ext.define('Rd.controller.cDashboard', {
    extend: 'Ext.app.Controller',
    views: [
        'dashboard.pnlDashboard',
        'dashboard.winPasswordChanger',
        'dashboard.winDashboardSettings'
    ],
    config: {
        urlChangePassword   : '/cake4/rd_cake/dashboard/change_password.json',
        urlSettingsSubmit   : '/cake4/rd_cake/dashboard/settings_submit.json',
        urlViewSettings     : '/cake4/rd_cake/dashboard/settings_view.json',
        defaultScreen       : 'tabMainOverview'      
    },
    requires: [
 
    ],
    stores: [
        'sNavTree'
    ],
    models: [
        'mNavTree'
    ],  
    refs: [
        {   ref: 'viewP',   	selector: 'viewP',          xtype: 'viewP',    autoCreate: true},
        {   ref: 'pnlCenter',   selector: '#pnlCenter',     xtype: 'panel',    autoCreate: true},
        {   ref: 'pnlDashboard',selector: 'pnlDashboard',   xtype: 'panel',    autoCreate: true} 
    ],
    init: function() {
        var me  = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        me.control({
            'pnlDashboard #btnExpand': {
                click: me.btnExpandClick
            },
            'pnlDashboard #btnTreeLoad': {
                click: me.btnTreeLoadClick
            },
            'pnlDashboard #tlNav' : {
            	selectionchange : me.treeNodeSelect
            },
            'pnlDashboard #pnlWest' : {
                afterrender     : me.pnlWestRendered
            },
            'pnlDashboard cmbClouds' : {
		    	select: me.onCloudSelect
		    },
            'pnlDashboard  #mnuLogout' : {
		        click   : me.onLogout
		    },
		    'pnlDashboard  #mnuSettings' : {
		        click   : me.onSettings
		    },
		    'winDashboardSettings #save': {
                'click' : me.onSettingsSubmit
            },
            'winDashboardSettings': {
                beforeshow:      me.loadSettings
            },
		    'pnlDashboard  #mnuPassword' : {
		        click   : me.onPassword
		    },
		    'winPasswordChanger #save': {
                'click' : me.onChangePassword
            },
            'pnlDashboard  #btnSetupWizard' : {
		        click   : function(btn){
                    Ext.getApplication().runAction('cSetupWizard','Index');
                } 
		    }    
        });
      
    },
    actionIndex: function(){
        var me      = this;
        var dd      = Ext.getApplication().getDashboardData();
        var user    = dd.user.username;
        var cls     = dd.user.cls;   
        var pnlDash = me.getView('dashboard.pnlDashboard').create({dashboard_data: dd});            
        var vp 		= me.getViewP();
        vp.removeAll(true);
        vp.add([pnlDash]);
    },
    onLogout: function(b){
        var me = this;
        b.up('panel').close();
        me.getViewP().removeAll(true);
        Ext.getApplication().runAction('cLogin','Exit');
    },
    loadSettings: function(win){
        var me      = this; 
        var form    = win.down('form'); 
        form.load({
            url         :me.getUrlViewSettings(), 
            method      :'GET',
            success     : function(a,b,c){

                //var cmb     = form.down("cmbRealm");
                //var rec     = Ext.create('Rd.model.mRealm', {name: b.result.data.realm_name, id: b.result.data.realm_id});
                //cmb.getStore().loadData([rec],false);
                //cmb.setValue(b.result.data.realm_id); 

                //var cc     = form.down("cmbClouds");
                //var rec_c  = Ext.create('Rd.model.mClouds', {name: b.result.data.cloud_name, id: b.result.data.cloud_id});
                //cc.getStore().loadData([rec_c],false);
                //cc.setValue(b.result.data.cloud_id); 
  
                if(b.result.data.wl_img != null){
                    var img = form.down("#imgWlLogo");
                    img.setSrc(b.result.data.wl_img);
                }             
            }
        });    
    },
    onSettings: function(b){
        var me  = this;
        var dd  = Ext.getApplication().getDashboardData();
        if(!Ext.WindowManager.get('winDashboardSettingsId')){
            var w = Ext.widget('winDashboardSettings',{
                id  :'winDashboardSettingsId',
                api_key : dd.token
            });
            w.show();        
        }  
    },
    onSettingsSubmit: function(button){
        var me      = this;
        var form    = button.up('form');
        var win     = button.up('window');
        form.submit({
            clientValidation: true,
            url: me.getUrlSettingsSubmit(),
            success: function(a,b,c) {
                win.close();
                var new_data = Ext.Object.merge(me.getPnlDashboard().down('#tbtHeader').getData(),b.result.data);
                me.getPnlDashboard().down('#tbtHeader').update(new_data);
                
                if(b.result.data.hBg !== undefined){
                    var bg  = b.result.data.hBg;
                    style   = {
                        'background' : bg
                    };
                    me.getPnlDashboard().down('#tbtHeader').up('toolbar').setStyle(style)
                }
                
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure: Ext.ux.formFail
        });
    },
    onPassword: function(b){
        var me = this;
        if(!Ext.WindowManager.get('winPasswordChangerId')){
            var w = Ext.widget('winPasswordChanger',{
                id  :'winPasswordChangerId'
            });
            w.show();        
        }
    },
    onChangePassword: function(button){
        var me      = this;
        var form    = button.up('form');
        var win     = button.up('window');
        form.submit({
            clientValidation: true,
            url: me.getUrlChangePassword(),
            success: function(form, action) {
                //Important to update the token for the next requests
                //Set the token cookie
                var now = new Date();
                now.setDate(now.getDate() + 1);
                Ext.util.Cookies.set("Token", action.result.data.token, now, "/", null, false);
                
                var token = action.result.data.token; 
                Ext.Ajax.setExtraParams({token : token});
                win.close();
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure: Ext.ux.formFail
        });
    },
    updateBanner: function(tabpanel) {  
        var glyph   = tabpanel.getGlyph();
        var title   = tabpanel.getTitle();
        var iConfig = tabpanel.getInitialConfig();
        if(iConfig.tooltip !== undefined){
            title = iConfig.tooltip;
        }
        
        //Glyph needs to be witout '@FontAwesome';
		if(glyph!=null){
  		    glyph       = glyph.replace('@FontAwesome', "");
		}
        
        //Now we can set it in the header...
        var pnlDashboard = tabpanel.up('pnlDashboard');
        //We have to first get the current data to prevent other items from vanishing 
        var new_data = Ext.Object.merge(pnlDashboard.down('#tbtHeader').getData(),{fa_value:'&#'+glyph+';', value :title});
        pnlDashboard.down('#tbtHeader').update(new_data);
    },
    onCloudSelect: function(cmb,record){
    	var me = this;
    	Ext.getApplication().setCloudId(cmb.getValue());
    	//Ext.getApplication().setCloudName(record.get('name'));
        //1.) We set the extra parameters
    	var extra_p 	 = Ext.Ajax.getExtraParams();
    	extra_p.cloud_id = Ext.getApplication().getCloudId()
    	Ext.Ajax.setExtraParams(extra_p);

        //2.) Set the default screen as active first
        var children = me.getPnlCenter().query('> panel');
        Ext.each(children, function(child){
            if(child.getItemId() == me.getDefaultScreen()){
                me.getPnlCenter().setActiveItem(child);
            }
        });

        //3.) We clear the workspace (pnlCenter)
        var pnl = me.getPnlCenter();
        if(pnl){
            var children = pnl.query('> panel'); //Select only the direct children          
            Ext.each(children, function(child){
                if(child.getItemId()!== me.getDefaultScreen()){ //Remove everyone except the Overview
                    child.destroy();
                }
            })
        }
        //4.) Reload the treeview for the selected cloud 
        var pnlD = me.getPnlDashboard();
        var tl = pnlD.down('#tlNav');
        var myStore = tl.getStore();
        Ext.Ajax.request({
            url     : '/cake4/rd_cake/dashboard/nav-tree.json',
            method  :'GET',
            success: function(resp) {
                var result = Ext.decode(resp.responseText);
                myStore.getRoot().removeAll();
                myStore.getRoot().appendChild(result.items);

                //--Set the detault selected item--
                var rootNode = me.getPnlDashboard().down('#tlNav').getStore().getRootNode();
                rootNode.eachChild(function(n) {
                    if(n.get('id') == me.getDefaultScreen()){
                        me.getPnlDashboard().down('#tlNav').setSelection(n);
                    }
                });
            }
        });

        //Reload the realm store on the overviews (if included) wit this cloud_id set
        var cmbRealm = pnlD.down('#duCmbRealm');
        if(cmbRealm){
            cmbRealm.getStore().reload();
        }
    },
    btnExpandClick: function(btn){
    	var me = this;
   		var pnlDashboard = btn.up('pnlDashboard');
   		var pnlWest = pnlDashboard.down('#pnlWest');
   		var treelist = pnlWest.down('treelist');
   		treelist.setMicro(!treelist.getMicro());
   		if(treelist.getMicro()){
   			//pnlWest.setWidth(55).getEl().slideIn('r');
   			pnlWest.getEl().animate({
   				duration: 700,
				to: {
				    width: 55
				},
				listeners: {
					afteranimate: function() {
					    // Execute my custom method after the animation
					    pnlWest.setWidth(55)
					},
					scope: this
				}
			});
   		}else{
   			pnlWest.setWidth(180).getEl().slideIn('l');
   		}   
    },
    treeNodeSelect: function(tree,record,ndx,opts){
        var me = this;
    	if(record.isLeaf()){
    		var name = record.get('text');
    		var id   = record.get('id');
    		var c	 = record.get('controller');
            var pnl  = me.getViewP().down('#pnlCenter');
    		var item = pnl.down('#'+id);
            glyph    = record.get('glyph');

            var pnlDashboard = me.getViewP().down('pnlDashboard');

            var new_data = Ext.Object.merge(pnlDashboard.down('#tbtHeader').getData(),{fa_value:'&#'+glyph+';', value :name});
            pnlDashboard.down('#tbtHeader').update(new_data);
    		if(!item){
    			var added = Ext.getApplication().runAction(c,'Index',pnl,id);
                if(!added){
                    pnl.setActiveItem(item);
                    pnl.getEl().slideIn('r'); //Slide it in if **not** added
                }else{
                    pnl.setActiveItem(id);
                }
		   	}else{
		   		pnl.setActiveItem(item);
                pnl.getEl().slideIn('r'); //Slide it in if **not** added
		   	}     	
    	} 
    },
    pnlWestRendered: function(pnl){
        var me  = this;
        var dd  = Ext.getApplication().getDashboardData();
        tl      = pnl.down('#tlNav');
        var myStore = tl.getStore();
        //Initial loading
        myStore.getRoot().appendChild(dd.tree_nav);
        //--Set the detault selected item--
        var rootNode = pnl.down('#tlNav').getStore().getRootNode();
        rootNode.eachChild(function(n) {
            if(n.get('id') == me.getDefaultScreen()){
                pnl.down('#tlNav').setSelection(n);
            }
        });

        if(dd.user.cloud_count == 0){
            console.log("No Clouds - Start Up the Wizard");
            Ext.getApplication().runAction('cSetupWizard','Index') 
        }else{
            if(dd.user.cloud_id){
                var cmbCloud = me.getViewP().down('cmbClouds');
                cmbCloud.select(dd.user.cloud_id);
                me.onCloudSelect(cmbCloud);
            }           
        }
    }
});
