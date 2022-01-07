Ext.define('Rd.controller.cDataUsage', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl){

        var me = this;   
        if (me.populated) {
            return; 
        }         
        pnl.add({
            xtype   : 'pnlDataUsage',
            border  : false,
            itemId  : 'tabDataUsage',
            plain   : true,
            timezone_id : me.getTimezone_id()
        });       
        me.populated = true;
    },

    views:  [
        'dataUsage.pnlDataUsage',
        'components.cmbRealm',
        'components.pnlUsageGraph',
        'dataUsage.pnlDataUsageDay',
        'dataUsage.pnlDataUsageWeek',
        'dataUsage.pnlDataUsageMonth',
        'dataUsage.pnlDataUsageGraph',
        'dataUsage.pnlDataUsageUserDetail',
        //Add ON
        'dataUsage.pnlDataUsageClients',
        'dataUsage.pnlDataUsageClientsDay',
        'dataUsage.pnlDataUsageClientsWeek',
        'dataUsage.pnlDataUsageClientsMonth',
        'dataUsage.pnlDataUsageClientDetail'
    ],
    stores: [],
    models: ['mRealm','mUserStat'],
    selectedRecord: null,
    config: {
        urlUsageForRealm            : '/cake3/rd_cake/data-usages/usage_for_realm.json',
        urlClientUsageForRealm      : '/cake3/rd_cake/data-usages/client_usage_for_realm.json',
        username                    : false,
        type                        : 'realm', //default is realm
        mac                         : false,
        dateday                     : false,
        timezone_id                 : 316, //Default
        timezone_id_clients         : 316 //Default
    },
    refs: [
         {  ref: 'pnlDataUsageDay',     selector:   'pnlDataUsageDay'},
         {  ref: 'pnlDataUsageWeek',    selector:   'pnlDataUsageWeek'},
         {  ref: 'pnlDataUsageMonth',   selector:   'pnlDataUsageMonth'},
         {  ref: 'pnlDataUsage',        selector:   'pnlDataUsage'},
         {  ref: 'cntBanner',           selector:   '#cntBanner'},
         //Add ON
         {  ref: 'pnlDataUsageClientsDay',     selector:   'pnlDataUsageClientsDay'},
         {  ref: 'pnlDataUsageClientsWeek',    selector:   'pnlDataUsageClientsWeek'},
         {  ref: 'pnlDataUsageClientsMonth',   selector:   'pnlDataUsageClientsMonth'},
         {  ref: 'pnlDataUsageClients',        selector:   'pnlDataUsageClients'},
         {  ref: 'cntBannerClients',           selector:   '#cntBannerClients'},      
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        /*
        //---FOR LATER--
        Ext.define('Ext.chart.theme.Custom', {
            extend: 'Ext.chart.theme.Base',
            singleton: true,
            alias: 'chart.theme.custom',
            config: {
                baseColor: '#adc2eb'
            }
        });
        //----
        */
        var dd  = me.application.getDashboardData();
        me.setTimezone_id(dd.user.timezone_id);
        me.setTimezone_id_clients(dd.user.timezone_id);
        
        me.control({
            'pnlDataUsage'  : {
                afterlayout : me.resizeSegments
            },
            '#tabDataUsage' : {
                destroy   :      me.appClose   
            },
            //Users
            'pnlDataUsage cmbRealm' : {
                change      : me.realmChange,
                afterrender : me.afterRenderEventRealm   
            },
            'pnlDataUsage datefield' : {
                change      : me.dateChange  
            },
            'pnlDataUsage #reload' : {
                click      : me.reload   
            },
            'pnlDataUsage #btnShowRealm' : {
                click       : me.btnShowRealmClick
            },
            'pnlDataUsage grid' : {
                rowclick    : me.rowClickEvent
            },
            'pnlDataUsage #btnSeeMore' : {
                click       : me.openActivityViewer
            },
            'pnlDataUsage cmbTimezones' : {
                change      : me.tzChange
            },
            
            //ADD ON - RADIUS Clients
            'pnlDataUsageClients'  : {
                afterlayout : me.resizeClientsSegments
            },
            'pnlDataUsageClients cmbRealm' : {
                change      : me.realmClientChange,
                afterrender : me.afterRenderEventRealm   
            },
            'pnlDataUsageClients datefield' : {
                change      : me.dateClientChange  
            },   
            'pnlDataUsageClients #reload' : {
                click      : me.reloadClients   
            },
            'pnlDataUsageClients #btnShowRealm' : {
                click       : me.btnClientsShowRealmClick
            },
            'pnlDataUsageClients grid' : {
                rowclick    : me.rowClientsClickEvent
            },
            'pnlDataUsageClients #btnSeeMore' : {
                click       : me.openActivityViewer
            },
            'pnlDataUsageClients cmbTimezones' : {
                change      : me.tzClientChange
            }
            
        });
    },
    appClose:   function(){
        var me          = this;
        me.populated    = false;
    },
    reload: function(){
        var me = this;
        me.fetchDataUsage();
    },
    realmChange: function(cmb){
        var me = this;
        me.setType('realm')
        me.setUsername(cmb.getValue())
        me.fetchDataUsage();
    },
    dateChange: function(dt){
        var me = this;
        //console.log(dt.getRawValue());
        me.fetchDataUsage();
    },
    afterRenderEventRealm: function(cmb){
        var me      = this;
        var dd      = me.application.getDashboardData();
        var rn      = dd.data_usage.realm_name;
        var r_id    = dd.data_usage.realm_id;
        var rec     = Ext.create('Rd.model.mRealm', {name: rn, id: r_id});
        cmb.getStore().loadData([rec],false);
        cmb.setValue(r_id);
    },
    tzChange: function(cmb){
        var me = this;
        me.setTimezone_id(cmb.getValue())
        me.fetchDataUsage();
    },
    fetchDataUsage: function(){
        var me = this;    
        me.getPnlDataUsage().setLoading(true);
        var day = me.getPnlDataUsage().down('#dtDate').getRawValue();
        me.setDateday(day);
        Ext.Ajax.request({
                url: me.getUrlUsageForRealm(),
                params: {
                    type    : me.getType(),
                    username: me.getUsername(),
                    day     : day,
                    mac     : me.getMac(),
                    timezone_id : me.getTimezone_id()
                },
                method: 'GET',
                success: function(response){
                    var jsonData = Ext.JSON.decode(response.responseText);

                    me.getPnlDataUsage().setLoading(false);
                    
                    if(jsonData.success){    
                        me.paintDataUsage(jsonData.data);
                        if(me.getType()=='user'){
                            me.fetchDevicesForUser();
                        }
                    }else{

                      
                    }
                }
            });
    },
    fetchDevicesForUser: function(){
        var me = this;
        Ext.data.StoreManager.lookup('dayMacStore').getProxy().setExtraParams({'username':me.getUsername(),'day':me.getDateday(),'span': 'day','type':'user'});
        Ext.data.StoreManager.lookup('dayMacStore').reload();
        
        Ext.data.StoreManager.lookup('weekMacStore').getProxy().setExtraParams({'username':me.getUsername(),'day':me.getDateday(),'span': 'week','type':'user'});
        Ext.data.StoreManager.lookup('weekMacStore').reload();
        
        Ext.data.StoreManager.lookup('monthMacStore').getProxy().setExtraParams({'username':me.getUsername(),'day':me.getDateday(),'span': 'month','type':'user'});
        Ext.data.StoreManager.lookup('monthMacStore').reload();
    },
    paintDataUsage: function(data){
        var me          = this;    
        var totalDay    = me.getPnlDataUsageDay().down('#dailyTotal');
        var totalWeek   = me.getPnlDataUsageWeek().down('#weeklyTotal');
        var totalMonth  = me.getPnlDataUsageMonth().down('#monthlyTotal');
        var cntBanner   = me.getCntBanner();
        
        cntBanner.setData(data.query_info);
        
        data.daily.totals.data_in = Ext.ux.bytesToHuman(data.daily.totals.data_in);
        data.daily.totals.data_out = Ext.ux.bytesToHuman(data.daily.totals.data_out);
        data.daily.totals.data_total = Ext.ux.bytesToHuman(data.daily.totals.data_total);
        
        totalDay.setData(data.daily.totals);
        
        data.weekly.totals.data_in      = Ext.ux.bytesToHuman(data.weekly.totals.data_in);
        data.weekly.totals.data_out     = Ext.ux.bytesToHuman(data.weekly.totals.data_out);
        data.weekly.totals.data_total   = Ext.ux.bytesToHuman(data.weekly.totals.data_total);
        
        totalWeek.setData(data.weekly.totals);
        
        data.monthly.totals.data_in     = Ext.ux.bytesToHuman(data.monthly.totals.data_in);
        data.monthly.totals.data_out    = Ext.ux.bytesToHuman(data.monthly.totals.data_out);
        data.monthly.totals.data_total  = Ext.ux.bytesToHuman(data.monthly.totals.data_total);
        
        totalMonth.setData(data.monthly.totals);
        
        Ext.data.StoreManager.lookup('dayStore').setData(data.daily.top_ten);
        Ext.data.StoreManager.lookup('activeStore').setData(data.daily.active_sessions);
        Ext.data.StoreManager.lookup('weekStore').setData(data.weekly.top_ten);   
        Ext.data.StoreManager.lookup('monthStore').setData(data.monthly.top_ten); 
        
        me.getPnlDataUsageDay().down('cartesian').getStore().setData(data.daily.graph.items);
        me.getPnlDataUsageWeek().down('cartesian').getStore().setData(data.weekly.graph.items);
        me.getPnlDataUsageMonth().down('cartesian').getStore().setData(data.monthly.graph.items);   
        
          
        //if user; update the devicesStores
        if(data.query_info.type == 'user'){
            //Ext.data.StoreManager.lookup('dayMacStore').setData(data.daily.user_devices);
            //Ext.data.StoreManager.lookup('weekMacStore').setData(data.weekly.user_devices);
            //Ext.data.StoreManager.lookup('monthMacStore').setData(data.monthly.user_devices);    
        }
        
        if(data.user_detail != undefined){
            me.paintUserDetail(data.user_detail); 
        }else{
            me.hideUserDetail();   
        }
        me.handleDevicesDisplay(data);
    },
    paintUserDetail: function(user_detail){
        var me          = this; 
        me.getPnlDataUsageDay().down('pnlDataUsageUserDetail').paintUserDetail(user_detail);
        me.getPnlDataUsageDay().down('#plrDaily').hide();
        me.getPnlDataUsageDay().down('pnlDataUsageUserDetail').show();
        
        me.getPnlDataUsageWeek().down('pnlDataUsageUserDetail').paintUserDetail(user_detail);
        me.getPnlDataUsageWeek().down('#plrWeekly').hide();
        me.getPnlDataUsageWeek().down('pnlDataUsageUserDetail').show();
        
        me.getPnlDataUsageMonth().down('pnlDataUsageUserDetail').paintUserDetail(user_detail);
        me.getPnlDataUsageMonth().down('#plrMonthly').hide();
        me.getPnlDataUsageMonth().down('pnlDataUsageUserDetail').show();
           
    },
    handleDevicesDisplay: function(data){
        var me   = this;
        //==REALMS==
        //We're not showing active connections in historical data for realms
        if((data.query_info.type == 'realm')&&
            (data.query_info.historical == true)
        ){
            me.getPnlDataUsageDay().down('#gridActive').hide();
        }
        
        if((data.query_info.type == 'realm')&&
            (data.query_info.historical == false)
        ){
            me.getPnlDataUsageDay().down('#gridActive').show();
        }
        
        if(data.query_info.type == 'realm'){
            me.getPnlDataUsageDay().down('#gridMacs').hide();
            me.getPnlDataUsageWeek().down('#gridMacs').hide();
            me.getPnlDataUsageMonth().down('#gridMacs').hide();
        }
        
        if(data.query_info.type == 'user'){
            me.getPnlDataUsageDay().down('#gridActive').hide(); //Hide this regardless when looking at user
            me.getPnlDataUsageDay().down('#gridMacs').show();
            me.getPnlDataUsageWeek().down('#gridMacs').show();
            me.getPnlDataUsageMonth().down('#gridMacs').show();
        }  
    
    },
    hideUserDetail: function(){
        var me          = this; 
        me.getPnlDataUsageDay().down('#plrDaily').show();
        me.getPnlDataUsageDay().down('pnlDataUsageUserDetail').hide();
        
        me.getPnlDataUsageWeek().down('#plrWeekly').show();
        me.getPnlDataUsageWeek().down('pnlDataUsageUserDetail').hide();
        
        me.getPnlDataUsageMonth().down('#plrMonthly').show();
        me.getPnlDataUsageMonth().down('pnlDataUsageUserDetail').hide();
    
    },
    rowClickEvent: function(grid,record){
        var me   = this;
        if(record.get('type') == 'device'){
            me.setType('device');
            me.setMac(record.get('mac'));
            me.getPnlDataUsage().down('#cntBanner').setStyle('background','#c2c2a3');
        }else{     
            me.setType('user');
            me.setMac(false);
            me.getPnlDataUsage().down('#cntBanner').setStyle('background','#00cccc'); 
        }     
        var username    = record.get('username');        
        me.getPnlDataUsage().down('#btnShowRealm').show();
        me.getPnlDataUsage().down('cmbRealm').setDisabled(true);
        me.setUsername(username);                 
        me.fetchDataUsage();      
    },
    btnShowRealmClick: function(btn){
        var me = this;
        if(me.getType()=='device'){ //Back one = user (username us still suppose to be set)
            me.setType('user');
            me.setMac(false); 
            me.getPnlDataUsage().down('#cntBanner').setStyle('background','#00cccc');        
        }else{
            me.getPnlDataUsage().down('cmbRealm').setDisabled(false);
            btn.hide();
            me.setUsername(me.getPnlDataUsage().down('cmbRealm').getValue());
            me.setType('realm');   
            me.getPnlDataUsage().down('#cntBanner').setStyle('background','#adc2eb');
        }
        me.fetchDataUsage(); 
    },
    resizeSegments: function(pnl){
        var me = this;
        if(pnl.getHeight() > 400){
            me.getPnlDataUsageDay().setHeight((pnl.getHeight()-40-50));
            me.getPnlDataUsageWeek().setHeight((pnl.getHeight()-40-50));
            me.getPnlDataUsageMonth().setHeight((pnl.getHeight()-40-50));
        }
    },
    openActivityViewer: function(btn){
        var me  = this;
        var pnl = me.getPnlDataUsage();
        me.application.runAction('cActivityMonitor','Index',pnl); 
    },
    //Add ON
    resizeClientsSegments: function(pnl){
        var me = this;
        if(pnl.getHeight() > 400){
            me.getPnlDataUsageClientsDay().setHeight((pnl.getHeight()-40-50));
            me.getPnlDataUsageClientsWeek().setHeight((pnl.getHeight()-40-50));
            me.getPnlDataUsageClientsMonth().setHeight((pnl.getHeight()-40-50));
        }
    },
    reloadClients: function(){
        var me = this;
        me.fetchDataClientsUsage();
    },
    btnClientsShowRealmClick: function(btn){
        var me = this;
        me.getPnlDataUsageClients().down('cmbRealm').setDisabled(false);
        btn.hide();
        me.setUsername(me.getPnlDataUsageClients().down('cmbRealm').getValue());
        me.setType('realm');  
        me.fetchDataClientsUsage();
        me.getPnlDataUsageClients().down('#cntBannerClients').setStyle('background','#adc2eb'); 
    },
    fetchDataClientsUsage: function(){
        var me = this;
        me.getPnlDataUsageClients().setLoading(true);
        var day = me.getPnlDataUsageClients().down('#dtDate').getRawValue();
        Ext.Ajax.request({
                url: me.getUrlClientUsageForRealm(),
                params: {
                    type    : me.getType(),
                    username: me.getUsername(),
                    day     : day,
                    timezone_id : me.getTimezone_id_clients()
                },
                method: 'GET',
                success: function(response){
                    var jsonData = Ext.JSON.decode(response.responseText);
                    me.getPnlDataUsageClients().setLoading(false);
                    me.paintDataClientUsage(jsonData.data);
                }
            });
    },
    realmClientChange: function(cmb){
        var me = this;
        me.setType('realm')
        me.setUsername(cmb.getValue())
        me.fetchDataClientsUsage();
    },
    dateClientChange: function(dt){
        var me = this;
        me.fetchDataClientsUsage();
    },
    tzClientChange: function(cmb){
        var me = this;
        me.setTimezone_id_clients(cmb.getValue())
        me.fetchDataClientsUsage();
    },
    paintDataClientUsage: function(data){
        var me          = this;    
        var totalDay    = me.getPnlDataUsageClientsDay().down('#dailyTotal');
        var totalWeek   = me.getPnlDataUsageClientsWeek().down('#weeklyTotal');
        var totalMonth  = me.getPnlDataUsageClientsMonth().down('#monthlyTotal');
        var cntBanner   = me.getCntBannerClients();
        
        cntBanner.setData(data.query_info);
        
        data.daily.totals.data_in = Ext.ux.bytesToHuman(data.daily.totals.data_in);
        data.daily.totals.data_out = Ext.ux.bytesToHuman(data.daily.totals.data_out);
        data.daily.totals.data_total = Ext.ux.bytesToHuman(data.daily.totals.data_total);
        
        totalDay.setData(data.daily.totals);
        
        data.weekly.totals.data_in      = Ext.ux.bytesToHuman(data.weekly.totals.data_in);
        data.weekly.totals.data_out     = Ext.ux.bytesToHuman(data.weekly.totals.data_out);
        data.weekly.totals.data_total   = Ext.ux.bytesToHuman(data.weekly.totals.data_total);
        
        totalWeek.setData(data.weekly.totals);
        
        data.monthly.totals.data_in     = Ext.ux.bytesToHuman(data.monthly.totals.data_in);
        data.monthly.totals.data_out    = Ext.ux.bytesToHuman(data.monthly.totals.data_out);
        data.monthly.totals.data_total  = Ext.ux.bytesToHuman(data.monthly.totals.data_total);
        
        totalMonth.setData(data.monthly.totals);
          
        Ext.data.StoreManager.lookup('dayClientsStore').setData(data.daily.top);
        Ext.data.StoreManager.lookup('activeStore').setData(data.daily.active_sessions);
        me.getPnlDataUsageClientsDay().down('cartesian').getStore().setData(data.daily.graph.items);
        
        Ext.data.StoreManager.lookup('weekClientsStore').setData(data.weekly.top);
        me.getPnlDataUsageClientsWeek().down('cartesian').getStore().setData(data.weekly.graph.items);
        
        Ext.data.StoreManager.lookup('monthClientsStore').setData(data.monthly.top);
        me.getPnlDataUsageClientsMonth().down('cartesian').getStore().setData(data.monthly.graph.items);
        
        if(data.client_detail != undefined){
            me.paintClientsDetail(data.client_detail); 
        }else{
            me.hideClientsDetail();   
        }    
    },
    rowClientsClickEvent: function(grid,record){  
        var me       = this;
        var nasid    = record.get('nasid');
        me.getPnlDataUsageClients().down('#btnShowRealm').show();
        me.getPnlDataUsageClients().down('cmbRealm').setDisabled(true);
        me.getPnlDataUsageClients().down('#cntBannerClients').setStyle('background','#00cccc');
        me.setUsername(nasid);
        me.setType('nas_id'); 
        me.fetchDataClientsUsage();
    },
    paintClientsDetail: function(client_detail){
        var me          = this; 
        me.getPnlDataUsageClientsDay().down('pnlDataUsageClientDetail').paintClientDetail(client_detail);
        me.getPnlDataUsageClientsDay().down('#plrDaily').hide();
        me.getPnlDataUsageClientsDay().down('pnlDataUsageClientDetail').show();
        
        me.getPnlDataUsageClientsWeek().down('pnlDataUsageClientDetail').paintClientDetail(client_detail);
        me.getPnlDataUsageClientsWeek().down('#plrWeekly').hide();
        me.getPnlDataUsageClientsWeek().down('pnlDataUsageClientDetail').show();
        
        me.getPnlDataUsageClientsMonth().down('pnlDataUsageClientDetail').paintClientDetail(client_detail);
        me.getPnlDataUsageClientsMonth().down('#plrMonthly').hide();
        me.getPnlDataUsageClientsMonth().down('pnlDataUsageClientDetail').show();
           
    },
    hideClientsDetail: function(){
        var me          = this; 
        me.getPnlDataUsageClientsDay().down('#plrDaily').show();
        me.getPnlDataUsageClientsDay().down('pnlDataUsageClientDetail').hide();
        
        me.getPnlDataUsageClientsWeek().down('#plrWeekly').show();
        me.getPnlDataUsageClientsWeek().down('pnlDataUsageClientDetail').hide();
        
        me.getPnlDataUsageClientsMonth().down('#plrMonthly').show();
        me.getPnlDataUsageClientsMonth().down('pnlDataUsageClientDetail').hide();
    
    }
});
