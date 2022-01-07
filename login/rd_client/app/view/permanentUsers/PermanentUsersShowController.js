Ext.define('AmpConf.view.permanentUsers.PermanentUsersShowController', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.PermanentUsersShowController',
    init    : function() {
        this.callParent(arguments);
    },
    config      : {  
		urlViewBasicInfo : '/cake3/rd_cake/rd-clients/get_usage.json'
    },
    onBtnTimeTap : function(button){ 
        var me = this;
        var i = button.getItemId();
        button.setPressed(true);
        if(i == 'span_1d'){
            me.lookup('span_7d').setPressed(false);
            me.lookup('span_30d').setPressed(false);
        }
        if(i == 'span_7d'){
            me.lookup('span_1d').setPressed(false);
            me.lookup('span_30d').setPressed(false);
        }
        if(i == 'span_30d'){
            me.lookup('span_1d').setPressed(false);
            me.lookup('span_7d').setPressed(false);
        }
        me.updateGraphs();
    },
    onTabActiveItemChange: function(){
        var me = this;
        var i = me.lookup('tabpanel').getActiveItem().getItemId();
        var hidden = true;
        if(i == 'tabGraphs'){
            hidden = false;      
        }        
        me.lookup('span_1d').setHidden(hidden);
        me.lookup('span_7d').setHidden(hidden);
        me.lookup('span_30d').setHidden(hidden);
        me.onRefreshTap();
    },
    onUpdateContent: function(item_id){
        var me = this;
        me.lookup('tabpanel').setActiveItem(0); //Set focus again on the overview for the new  item selected 
        me.getView().setConfig('item_id',item_id);
        me.updateOverview(); 
    },
    onRefreshTap: function(b){
        var me  = this;
        var i   = me.lookup('tabpanel').getActiveItem().getItemId();
        if(i == 'tabGraphs'){
            me.updateGraphs();  
        }      
        if(i == 'tabOverview'){
            me.updateOverview();
        }
    },
    updateOverview: function(){
        var me = this;
        var username = me.getView().getConfig('username');
        me.lookup('tabpanel').down('#pnlInfo').mask('Updating....');     
        Ext.Ajax.request({
            url     : me.getUrlViewBasicInfo(),
            method  : 'GET',
            params : {username : username},          
            success : function(response, opts){
                var obj = Ext.decode(response.responseText);
                me.lookup('tabpanel').down('#pnlInfo').unmask();
                if(obj.success){
                    me.paintUserDetail(obj.data);       
                }
            },                                    
            failure : function(response, opts){
                var obj = Ext.decode(response.responseText);
                me.lookup('tabpanel').down('#pnlInfo').unmask();
            }
        });   
    },
    updateGraphs: function(){
        var me      = this;
        var chart = me.lookup('chart');
        chart.setTheme('category6');
        
        var span = 'daily' 
        if(me.lookup('span_7d').getPressed()){
            span = 'weekly';
            chart.setTheme('sky');   
        }
        if(me.lookup('span_30d').getPressed()){
            span = 'monthly';
            chart.setTheme('yellow');   
        }                 
            
        chart.getStore().getProxy().setExtraParams({ 'username' : this.getView().getUsername(), type: this.getView().getType(), 'span' : span });
        chart.getStore().load();
    },
    onStoreMetaChange: function(meta_data){
        var me  = this;
        var d_i = AmpConf.util.Utilities.bytesToHuman(meta_data.totalIn);
        var d_o = AmpConf.util.Utilities.bytesToHuman(meta_data.totalOut);
        var d_t = AmpConf.util.Utilities.bytesToHuman(meta_data.totalInOut);
        var str = "In "+d_i+" Out "+d_o+" Total "+d_t;
        Ext.toast(str,1000);
        return true;
    },
     paintUserDetail: function(user_detail){ 
        var me = this;        
        if(Ext.isDefined(user_detail.type)){ 
            if(user_detail.type == 'user'){
                me.getView().setTitle(user_detail.username);
                me.getView().setIconCls('x-fa fa-user');
            }
            
            if(user_detail.type == 'voucher'){
                me.getView().setTitle(user_detail.name);
                me.getView().setIconCls('x-fa fa-ticket-alt');
            }
        }
                
        if(Ext.isDefined(user_detail.perc_data_used)){
        
            if(user_detail.perc_data_used < 70){
                var cls = "wifigreen";
                me.getView().down('#pbData').toggleCls("wifiyellow",false);
                me.getView().down('#pbData').toggleCls("wifired",false);
                me.getView().down('#pbData').toggleCls(cls,true);     
            } 
            if(user_detail.perc_data_used >= 70 && user_detail.perc_data_used < 90){
                cls = "wifiyellow";
                me.getView().down('#pbData').toggleCls("wifigreen",false);
                me.getView().down('#pbData').toggleCls("wifired",false);
                me.getView().down('#pbData').toggleCls(cls,true);   
            }
            if(user_detail.perc_data_used >= 90){
                cls = "wifired"
                me.getView().down('#pbData').toggleCls("wifigreen",false);
                me.getView().down('#pbData').toggleCls("wifiyellow",false);
                me.getView().down('#pbData').toggleCls(cls,true);   
            }
            var str_data_usage = '<i class="fa  fa-database"></i>  Data Usage '+user_detail.perc_data_used+' %';
            //var str_data_usage = 'Data Usage '+user_detail.perc_data_used+' %';
            var val_data_usage = user_detail.perc_data_used / 100;
            
            me.getView().down('#pbData').show().setValue(val_data_usage).updateText(str_data_usage);
        }else{
            me.getView().down('#pbData').hide()
        }
        
        if(Ext.isDefined(user_detail.perc_time_used)){
        
            if(user_detail.perc_time_used < 70){
                var cls = "wifigreen";
                me.getView().down('#pbTime').toggleCls("wifiyellow",false);
                me.getView().down('#pbTime').toggleCls("wifired",false);
                me.getView().down('#pbTime').toggleCls(cls,true);     
            } 
            if(user_detail.perc_time_used >= 70 && user_detail.perc_time_used < 90){
                cls = "wifiyellow";
                me.getView().down('#pbTime').toggleCls("wifigreen",false);
                me.getView().down('#pbTime').toggleCls("wifired",false);
                me.getView().down('#pbTime').toggleCls(cls,true);   
            }
            if(user_detail.perc_time_used >= 90){
                cls = "wifired"
                me.getView().down('#pbTime').toggleCls("wifigreen",false);
                me.getView().down('#pbTime').toggleCls("wifiyellow",false);
                me.getView().down('#pbTime').toggleCls(cls,true);   
            }
            
            var str_time_usage = '<i class="fa fa-clock"></i> Time Usage '+user_detail.perc_time_used+' %';
            var val_time_usage = user_detail.perc_time_used / 100;  
         
            me.getView().down('#pbTime').show().setValue(val_time_usage).updateText(str_time_usage);
        }else{
            me.getView().down('#pbTime').hide()
        }
        
        me.getView().down('#pnlInfo').setData(user_detail);
    
    },
    onExit: function(b){
        var me = this;
        me.redirectTo('login');
    
    }
});
