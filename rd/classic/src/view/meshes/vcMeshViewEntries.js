Ext.define('Rd.view.meshes.vcMeshViewEntries', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcMeshViewEntries',
    config: {
        gridPage        : null,
        mac             : false,
        span            : 'hour', //hour, day, week
        urlUsageForSsid : '/cake3/rd_cake/wifi-charts/usage-for-ssid.json',
        urlEditAlias    : '/cake3/rd_cake/wifi-charts/edit-mac-alias.json'
    }, 
    control: {
        'pnlMeshViewEntriesGraph' : {
            activate : 'onGraphActivate'
        },
        '#reload': {
             click: 'reload'
        },
        'cmbMeshViewSsids' : {
            change: 'onChangeSsids'
        },
        'cmbMeshViewNodes' : {
            change: 'onChangeNodes'
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
        '#toolAlias': {
            click: 'onClickToolAlias'         
        },
        'winMeshEditMacAlias #chkRemoveAlias' : {
            change: 'onChkRemoveAliasChange'
        },
        'winMeshEditMacAlias #save': {
            click: 'aliasEditSave'
        },
        'pnlMeshViewEntriesGraph grid' : {
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
        //Default
        var role = 'entries';
        var cmb  = 'cmbMeshViewSsids';
        if(me.getView().down('pnlMeshViewEntriesGraph').role == 'nodes'){
            cmb  = 'cmbMeshViewNodes';
        }
    
        if(xt == 'pnlMeshViewEntriesGraph'){      
            me.getView().down(cmb).enable();
            me.fetchDataUsage();                    
        }
              
        if(xt == 'gridMeshViewEntries'){
            me.getView().down(cmb).disable();
            me.reloadViewEntry();
        }
        
        if(xt == 'gridMeshViewNodes'){
            me.getView().down(cmb).disable();
            me.reloadViewNode();
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
        me.reload();
    },
    showList: function(button){
        var me = this;
        me.getView().getLayout().setActiveItem(1);
        me.reload();
    },
    fetchDataUsage: function(){
        var me = this;      
        var dd      = Ext.getApplication().getDashboardData();
        var tz_id   = dd.user.timezone_id; 
        
        var ssid_id = false;
        var node_id = false;
        var t       = false;
        
        if(me.getView().down('pnlMeshViewEntriesGraph').role == 'entries'){
            ssid_id = me.getView().down('cmbMeshViewSsids').getValue();
            t = 'mesh_entries';
        }       

        if(me.getView().down('pnlMeshViewEntriesGraph').role == 'nodes'){
            node_id = me.getView().down('cmbMeshViewNodes').getValue();
            t = 'mesh_nodes';
        }
          
        me.getView().down('pnlMeshViewEntriesGraph').setLoading(true);
        var mesh_id = me.getView().meshId;
        Ext.Ajax.request({
            url: me.getUrlUsageForSsid(),
            params: {
                type        : t,
                span        : me.getSpan(),
                mesh_id     : mesh_id,
                timezone_id : tz_id,
                mesh_entry_id : ssid_id,
                node_id     : node_id,
                mac         : me.getMac()
            },
            method: 'GET',
            success: function(response){
                var jsonData = Ext.JSON.decode(response.responseText);
                me.getView().down('pnlMeshViewEntriesGraph').setLoading(false);
                
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
        var total    = me.getView().down('pnlMeshViewEntriesGraph').down('#total');
        
        data.totals.data_in     = Ext.ux.bytesToHuman(data.totals.data_in);
        data.totals.data_out    = Ext.ux.bytesToHuman(data.totals.data_out);
        data.totals.data_total  = Ext.ux.bytesToHuman(data.totals.data_total);
        
        total.setData(data.totals); 
                  
        me.getView().down('pnlMeshViewEntriesGraph').down('cartesian').getStore().setData(data.graph.items);
        
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
        me.getView().down('gridMeshViewEntries').getStore().getProxy().setExtraParam('timespan',me.getSpan());
        me.getView().down('gridMeshViewEntries').getStore().reload();   
    },
    reloadViewNode: function(){
        var me = this;       
        me.getView().down('gridMeshViewNodes').getStore().getProxy().setExtraParam('timespan',me.getSpan());
        me.getView().down('gridMeshViewNodes').getStore().reload();   
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
			if(!Ext.WindowManager.get('winMeshEditMacAliasId')){
                var w = Ext.widget('winMeshEditMacAlias',{id:'winMeshEditMacAliasId',mac:mac,alias:alias,vendor:vendor});
                me.getView().add(w); 
                w.show();           
            }
        }
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
        console.log(mac);       
        me.getView().down('#btnBack').show();
        me.getView().down('#plrTopTen').hide();
        me.getView().down('#pnlMeshViewUser').show();
        me.setMac(mac); 
        me.reload();
    },
    onBtnBackClick: function(btn){
        var me   = this;    
        btn.hide();
        me.getView().down('#plrTopTen').show();
        me.getView().down('#pnlMeshViewUser').hide(); 
        me.setMac(false);
        me.reload(); 
    }
});
