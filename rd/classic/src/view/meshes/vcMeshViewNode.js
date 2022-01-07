Ext.define('Rd.view.meshes.vcMeshViewNode', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcMeshViewNode',
    config: {
        gridPage        : null,
        span            : 'hour', //hour, day, week
        urlUsageForSsid : '/cake3/rd_cake/wifi-charts/usage-for-ssid.json',
    }, 
    control: {
        'pnlMeshViewNodesGraph' : {
            activate : 'onGraphActivate'
        },
        '#reload': {
             click: 'reload'
         },
         'cmbMeshViewSsids' : {
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
         '#toolAlias': {
            click: 'onClickToolAlias'         
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
        if(xt == 'pnlMeshViewNodesGraph'){      
            me.getView().down('cmbMeshViewSsids').enable();
            me.fetchDataUsage();                    
        }
        
        if(xt == 'gridMeshViewNodes'){
            me.getView().down('cmbMeshViewSsids').disable();
            me.reloadViewEntry();
        }
    },
    onChangeSsids: function(cmb){
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
        var ssid_id = me.getView().down('cmbMeshViewSsids').getValue();
          
        me.getView().down('pnlMeshViewNodesGraph').setLoading(true);
        var mesh_id = me.getView().meshId;
        Ext.Ajax.request({
            url: me.getUrlUsageForSsid(),
            params: {
                type        : 'mesh_nodes',
                span        : me.getSpan(),
                mesh_id     : mesh_id,
                timezone_id : tz_id,
                mesh_entry_id : ssid_id
            },
            method: 'GET',
            success: function(response){
                var jsonData = Ext.JSON.decode(response.responseText);
                me.getView().down('pnlMeshViewNodesGraph').setLoading(false);
                
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
        var total    = me.getView().down('pnlMeshViewNodesGraph').down('#total');
        
        data.totals.data_in     = Ext.ux.bytesToHuman(data.totals.data_in);
        data.totals.data_out    = Ext.ux.bytesToHuman(data.totals.data_out);
        data.totals.data_total  = Ext.ux.bytesToHuman(data.totals.data_total);
        
        total.setData(data.totals); 
                  
        me.getView().down('pnlMeshViewNodesGraph').down('cartesian').getStore().setData(data.graph.items);
        
        me.getView().down('#gridTopTen').getStore().setData(data.top_ten);
    },
    reloadViewEntry: function(){
        var me = this;       
        me.getView().down('gridMeshViewNodes').getStore().getProxy().setExtraParam('timespan',me.getSpan());
        me.getView().down('gridMeshViewNodes').getStore().reload();   
    },
    onClickToolAlias: function(btn){
        var me = this;
    }
});
