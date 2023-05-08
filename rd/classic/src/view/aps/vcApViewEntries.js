Ext.define('Rd.view.aps.vcApViewEntries', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcApViewEntries',
    config: {
        gridPage        : null,
        mac             : false,
        span            : 'hour', //hour, day, week
        urlApUsageForSsid : '/cake4/rd_cake/wifi-charts/ap-usage-for-ssid.json',
        urlEditAlias    : '/cake4/rd_cake/wifi-charts/edit-mac-alias.json',
        urlEditLimit    : '/cake4/rd_cake/wifi-charts/edit-mac-limit.json',
        UrlEditBlock	: '/cake4/rd_cake/wifi-charts/edit-mac-block.json',
        UrlEditFirewall	: '/cake4/rd_cake/wifi-charts/edit-mac-firewall.json'
    }, 
    control: {
        'pnlApViewEntriesGraph' : {
            activate : 'onGraphActivate'
        },
        'pnlApViewEntries' : {
            activate : 'reload'
        },
        '#reload': {
             click: 'reload'
        },
        'cmbApViewSsids' : {
            change: 'onChangeSsids'
        },
        '#graph': {
             click: 'showGraph'
        },
        '#list': {
            click: 'showList'         
        },
        '#hour':{
            click: 'onClickHourButton'
        },
        '#day':{
            click: 'onClickDayButton'
        },
        '#week':{
            click: 'onClickWeekButton'
        },
        '#btnBack':{
            click: 'onBtnBackClick'
        },
     	'#alias'	: {
        	click	: 'onClickAlias'
        },
        '#firewall'	: {
        	click	: 'onClickFirewall'
        },
        '#limit'	: {
        	click	: 'onClickLimit'
        },
        '#block'	: {
        	click	: 'onClickBlock'
        },
        '#toolAlias': {
            click: 'onClickToolAlias'         
        },
        '#toolFirewall': {
            click: 'onClickToolFirewall'         
        },
        'winApEditMacFirewall #save': {
            click: 'firewallSave'
        },
        '#toolLimit': {
        	click: 'onClickToolLimit'
        },
        'winApEditMacLimit #save': {
            click: 'limitSave'
        },
        '#toolBlock': {
        	click: 'onClickToolBlock'
        },
        'winApEditMacBlock #save': {
            click: 'blockSave'
        },
        'winApEditMacAlias #chkRemoveAlias' : {
            change: 'onChkRemoveAliasChange'
        },
        'winApEditMacAlias #save': {
            click: 'aliasEditSave'
        },
        'pnlApViewEntriesGraph grid' : {
            rowclick    : 'rowClickEvent'
        }
    },
    init: function() {
    
    },
    onGraphActivate: function(pnl){
        me = this;
        me.reload();
    },    
    reload: function(button){
        var me = this;
        var xt = me.getView().getLayout().getActiveItem().getXType();
        var cmb  = 'cmbApViewSsids';
        if(xt == 'pnlApViewEntriesGraph'){      
            me.getView().down(cmb).enable();
            me.fetchDataUsage();                    
        }
              
        if(xt == 'gridApViewEntries'){
            me.getView().down(cmb).disable();
            me.reloadViewEntry();
        }
    },
    onChangeSsids: function(cmb){
        var me = this;
        me.reload();
    },
    onChangeNodes: function(cmb){
        var me = this;
        me.reload();
    },
    onClickHourButton: function(button){
        var me = this;
        me.setSpan('hour');
        me.reload();
    },
    onClickDayButton: function(button){
        var me = this;
        me.setSpan('day');
        me.reload();
    },
    onClickWeekButton: function(button){
        var me = this;
        me.setSpan('week');
        me.reload();
    },
    showGraph: function(button){
        var me = this;
        me.getView().getLayout().setActiveItem(0);
        me.getView().down('#tbsepTools').hide();
        me.getView().down('#alias').hide();
        me.getView().down('#firewall').hide();
        me.getView().down('#limit').hide();
        me.getView().down('#block').hide();
        me.reload();
    },
    showList: function(button){
        var me = this;
        me.getView().getLayout().setActiveItem(1);
        me.getView().down('#tbsepTools').show();
        me.getView().down('#alias').show();
        me.getView().down('#firewall').show();
        me.getView().down('#limit').show();
        me.getView().down('#block').show();
        me.reload();
    },
    fetchDataUsage: function(){
        var me = this;      
        var dd      = Ext.getApplication().getDashboardData();
        var tz_id   = dd.user.timezone_id; 
        
        var ssid_id = false;
        var ap_id   = false;
             
        if(me.getView().down('pnlApViewEntriesGraph').role == 'entries'){
            ssid_id = me.getView().down('cmbApViewSsids').getValue();
        }  
          
        me.getView().down('pnlApViewEntriesGraph').setLoading(true);
        ap_id = me.getView().apId;
        
        Ext.Ajax.request({
            url: me.getUrlApUsageForSsid(),
            params: {
                span        : me.getSpan(),
                ap_id       : ap_id,
                timezone_id : tz_id,
                ap_entry_id : ssid_id,
                mac         : me.getMac()
            },
            method: 'GET',
            success: function(response){
                var jsonData = Ext.JSON.decode(response.responseText);
                me.getView().down('pnlApViewEntriesGraph').setLoading(false);
                
                if(jsonData.success){    
                    me.paintDataUsage(jsonData.data);
                    //if(me.getType()=='user'){
                        //me.fetchDevicesForUser();
                    //}
                }else{

                  
                }
            }
        });
    },
    paintDataUsage: function(data){
        var me = this;
        var total    = me.getView().down('pnlApViewEntriesGraph').down('#total');
        
        data.totals.data_in     = Ext.ux.bytesToHuman(data.totals.data_in);
        data.totals.data_out    = Ext.ux.bytesToHuman(data.totals.data_out);
        data.totals.data_total  = Ext.ux.bytesToHuman(data.totals.data_total);
        
        total.setData(data.totals); 
                  
        me.getView().down('pnlApViewEntriesGraph').down('cartesian').getStore().setData(data.graph.items);
        
        me.getView().down('#gridTopTen').getStore().setData(data.top_ten);
        
        if(data.node_data !== undefined){   
            me.getView().down('#plrNodes').getStore().setData(data.node_data);
        }
        
        if(data.device_info !== undefined){
        
            //===Signal NOW===
            var bar = data.device_info.signal_bar;           
            if(bar > 0.5){
                var cls = "wifigreen";
                me.getView().down('#pbSnow').toggleCls("wifiyellow",false);
                me.getView().down('#pbSnow').toggleCls("wifired",false);
                me.getView().down('#pbSnow').toggleCls(cls,true);     
            } 
            if((bar >= 0.3)&(bar <= 0.5)){
                cls = "wifiyellow";
                me.getView().down('#pbSnow').toggleCls("wifigreen",false);
                me.getView().down('#pbSnow').toggleCls("wifired",false);
                me.getView().down('#pbSnow').toggleCls(cls,true);   
            }
            if(bar < 0.3){
                cls = "wifired"
                me.getView().down('#pbSnow').toggleCls("wifigreen",false);
                me.getView().down('#pbSnow').toggleCls("wifiyellow",false);
                me.getView().down('#pbSnow').toggleCls(cls,true);   
            }
            var str_data_usage = '<i class="fa fa-wifi"></i>  Signal Now '+data.device_info.signal_now+' dBm';          
            me.getView().down('#pbSnow').show().setValue(bar).updateText(str_data_usage);
            
            //===Signal Average===            
            var bar_avg = data.device_info.signal_avg_bar;           
            if(bar_avg > 0.5){
                var cls = "wifigreen";
                me.getView().down('#pbSavg').toggleCls("wifiyellow",false);
                me.getView().down('#pbSavg').toggleCls("wifired",false);
                me.getView().down('#pbSavg').toggleCls(cls,true);     
            } 
            if((bar_avg >= 0.3)&(bar_avg <= 0.5)){
                cls = "wifiyellow";
                me.getView().down('#pbSavg').toggleCls("wifigreen",false);
                me.getView().down('#pbSavg').toggleCls("wifired",false);
                me.getView().down('#pbSavg').toggleCls(cls,true);   
            }
            if(bar_avg < 0.3){
                cls = "wifired"
                me.getView().down('#pbSavg').toggleCls("wifigreen",false);
                me.getView().down('#pbSavg').toggleCls("wifiyellow",false);
                me.getView().down('#pbSavg').toggleCls(cls,true);   
            }
            var str_data_usage = '<i class="fa fa-wifi"></i>  Signal Average '+data.device_info.signal_avg+' dBm';          
            me.getView().down('#pbSavg').show().setValue(bar_avg).updateText(str_data_usage);
         
            me.getView().down('#pnlInfo').setData(data.device_info)
        }
    },
    reloadViewEntry: function(){
        var me = this;       
        me.getView().down('gridApViewEntries').getStore().getProxy().setExtraParam('timespan',me.getSpan());
        me.getView().down('gridApViewEntries').getStore().reload();   
    },
    reloadViewNode: function(){
        var me = this;       
        me.getView().down('gridApViewNodes').getStore().getProxy().setExtraParam('timespan',me.getSpan());
        me.getView().down('gridApViewNodes').getStore().reload();   
    },
    onClickAlias: function(btn){
    	var me = this;
    	if(me.getView().down("gridApViewEntries")){
    		var grid = me.getView().down("gridApViewEntries")
    	}
        if(grid.getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );          
        }else{
            var sr      = grid.getSelectionModel().getLastSelected();
            var mac     = sr.get('mac');
            var alias   = sr.get('alias');
            if(alias == false){
            	alias = '';
            }
            var vendor  = sr.get('vendor');  			
			if(!Ext.WindowManager.get('winApEditMacAliasId')){
                var w = Ext.widget('winApEditMacAlias',{id:'winApEditMacAliasId',mac:mac,alias:alias,vendor:vendor});
                me.getView().add(w); 
                let appBody = Ext.getBody();
                w.showBy(appBody);           
            }
        }           
    },
    onClickToolAlias: function(btn){
        var me = this;
        if(me.getView().down("#gridTopTen").getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );          
        }else{
            var sr      = me.getView().down("#gridTopTen").getSelectionModel().getLastSelected();
            var mac     = sr.get('mac');
            var alias   = sr.get('alias');
            var vendor  = sr.get('vendor');  			
			if(!Ext.WindowManager.get('winApEditMacAliasId')){
                var w = Ext.widget('winApEditMacAlias',{id:'winApEditMacAliasId',mac:mac,alias:alias,vendor:vendor});
                me.getView().add(w); 
                let appBody = Ext.getBody();
                w.showBy(appBody);          
            }
        }
    },    
    onClickFirewall: function(btn){
    	var me = this;
    	if(me.getView().down("gridApViewEntries")){
    		var grid = me.getView().down("gridApViewEntries")
    	}
        if(grid.getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );          
        }else{
           if(!Ext.WindowManager.get('winApEditMacFirewallId')){
                var w = Ext.widget('winApEditMacFirewall',{id:'winApEditMacFirewallId','grid' : grid});
                me.getView().add(w); 
                let appBody = Ext.getBody();
                w.showBy(appBody);           
            }
        }       
    },
    onClickToolFirewall: function(btn){
        var me = this;
        if(me.getView().down("#gridTopTen").getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );          
        }else{
           console.log("Show Firewall Window");
           if(!Ext.WindowManager.get('winApEditMacFirewallId')){
                var w = Ext.widget('winApEditMacFirewall',{id:'winApEditMacFirewallId','grid' : me.getView().down("#gridTopTen")});
                me.getView().add(w); 
                let appBody = Ext.getBody();
                w.showBy(appBody);           
            }
        }
    }, 
    firewallSave: function(btn){
    	var me = this;
        var form    = btn.up('form');
        var window  = form.up('window');
        var selected= window.grid.getSelectionModel().getSelection();
        var list    = [];
        var values 	= form.getForm().getValues();
        Ext.Array.forEach(selected,function(item){
            var mac = item.get('mac');
            Ext.Array.push(list,{'mac' : mac});
        });
        values.ap_id = me.getView().apId;     
        values.items = list;    
        Ext.Ajax.request({
            url		: me.getUrlEditFirewall(),
            method	: 'POST',          
            jsonData: values,
            success	: function(batch,options){
                Ext.ux.Toaster.msg(
                    'Firewall Action',
                    'Firewall Action Completed',
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                me.reload(); //Reload from server
                window.close();
            },                                    
            failure: function(batch,options){
                Ext.ux.Toaster.msg(
                    'Problems Firewalling Devices',
                    batch.proxy.getReader().rawData.message.message,
                    Ext.ux.Constants.clsWarn,
                    Ext.ux.Constants.msgWarn
                );
                me.reload(); //Reload from server
                window.close();
            }
        }); 
    }, 
    onClickLimit: function(btn){
    	var me = this;
    	if(me.getView().down("gridApViewEntries")){
    		var grid = me.getView().down("gridApViewEntries")
    	}
        if(grid.getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );          
        }else{
           if(!Ext.WindowManager.get('winApEditMacLimitId')){
                var w = Ext.widget('winApEditMacLimit',{id:'winApEditMacLimitId','grid' : grid});
                me.getView().add(w); 
                let appBody = Ext.getBody();
                w.showBy(appBody);           
            }
        }   
    },
    onClickToolLimit: function(btn){
        var me = this;
        if(me.getView().down("#gridTopTen").getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );          
        }else{
           console.log("Show Limit Window");
           if(!Ext.WindowManager.get('winApEditMacLimitId')){
                var w = Ext.widget('winApEditMacLimit',{id:'winApEditMacLimitId','grid' : me.getView().down("#gridTopTen")});
                me.getView().add(w); 
                let appBody = Ext.getBody();
                w.showBy(appBody);           
            }
        }
    },
    limitSave: function(btn){
    	var me = this;
        var form    = btn.up('form');
        var window  = form.up('window');
        var selected= window.grid.getSelectionModel().getSelection();
        var list    = [];
        var values 	= form.getForm().getValues();
        Ext.Array.forEach(selected,function(item){
            var mac = item.get('mac');
            Ext.Array.push(list,{'mac' : mac});
        });
        values.ap_id = me.getView().apId;     
        values.items = list;    
        Ext.Ajax.request({
            url		: me.getUrlEditLimit(),
            method	: 'POST',          
            jsonData: values,
            success	: function(batch,options){
                Ext.ux.Toaster.msg(
                    'Block Action',
                    'Block Action Completed',
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                me.reload(); //Reload from server
                window.close();
            },                                    
            failure: function(batch,options){
                Ext.ux.Toaster.msg(
                    'Problems Blocking Devices',
                    batch.proxy.getReader().rawData.message.message,
                    Ext.ux.Constants.clsWarn,
                    Ext.ux.Constants.msgWarn
                );
                me.reload(); //Reload from server
                window.close();
            }
        }); 
    },
    onClickBlock: function(btn){
    	var me = this;
    	if(me.getView().down("gridApViewEntries")){
    		var grid = me.getView().down("gridApViewEntries")
    	}
        if(grid.getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );          
        }else{
           console.log("Show Block Window");
           if(!Ext.WindowManager.get('winApEditMacBlockId')){
                var w = Ext.widget('winApEditMacBlock',{id:'winApEditMacBlockId','grid' : grid});
                me.getView().add(w); 
                let appBody = Ext.getBody();
                w.showBy(appBody);           
            }
        }           
    },
    onClickToolBlock: function(btn){
        var me = this;
        if(me.getView().down("#gridTopTen").getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );          
        }else{
           console.log("Show Block Window");
           if(!Ext.WindowManager.get('winApEditMacBlockId')){
                var w = Ext.widget('winApEditMacBlock',{id:'winApEditMacBlockId','grid' : me.getView().down("#gridTopTen")});
                me.getView().add(w); 
                let appBody = Ext.getBody();
                w.showBy(appBody);           
            }
        }
    },
    blockSave: function(btn){
    	var me = this;
        var form    = btn.up('form');
        var window  = form.up('window');
        var selected= window.grid.getSelectionModel().getSelection();        
        var list    = [];
        var values 	= form.getForm().getValues();
        Ext.Array.forEach(selected,function(item){
            var mac = item.get('mac');
            Ext.Array.push(list,{'mac' : mac});
        });
        values.ap_id = me.getView().apId;    
        values.items = list;    
        Ext.Ajax.request({
            url		: me.getUrlEditBlock(),
            method	: 'POST',          
            jsonData: values,
            success	: function(batch,options){
                Ext.ux.Toaster.msg(
                    'Block Action',
                    'Block Action Completed',
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                me.reload(); //Reload from server
                window.close();
            },                                    
            failure: function(batch,options){
                Ext.ux.Toaster.msg(
                    'Problems Blocking Devices',
                    batch.proxy.getReader().rawData.message.message,
                    Ext.ux.Constants.clsWarn,
                    Ext.ux.Constants.msgWarn
                );
                me.reload(); //Reload from server
                window.close();
            }
        });    
    },
    onChkRemoveAliasChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var txt_a   = form.down('#txtAlias');
        //var chkAtoS = form.down('#chkAtoS');
        if(chk.getValue()){
            txt_a.disable();
            txt_a.hide();
            //chkAtoS.disable();
            //chkAtoS.hide();
        }else{
            txt_a.enable();
            txt_a.show();
            //chkAtoS.enable();
            //chkAtoS.show();      
        }
    },
    aliasEditSave: function(btn){
        var me = this;
        var form    = btn.up('form');
        var window  = form.up('window');
        var mac     = window.mac    
        form.submit({
            clientValidation: true,
            params          : {mac:mac},
            url             : me.getUrlEditAlias(),
            success         : function(form, action) {              
                //FIXME reload store....
                Ext.ux.Toaster.msg(
                    'Item Added',
                    'Item Added Fine',
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );               
                me.reload();
                window.close();
            },
            failure: Ext.ux.formFail,
            scope: me
        });
    },
    rowClickEvent: function(grid,record){  
        var me      = this;
        var mac     = record.get('mac');     
        me.getView().down('#btnBack').show();
        me.getView().down('#plrTopTen').hide();
        me.getView().down('#pnlApViewUser').show();
        me.setMac(mac); 
        me.reload();
    },
    onBtnBackClick: function(btn){
        var me   = this;    
        btn.hide();
        me.getView().down('#plrTopTen').show();
        me.getView().down('#pnlApViewUser').hide(); 
        me.setMac(false);
        me.reload(); 
    }
});
