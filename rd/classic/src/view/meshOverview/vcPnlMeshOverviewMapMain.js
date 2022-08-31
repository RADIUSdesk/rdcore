Ext.define('Rd.view.meshOverview.vcPnlMeshOverviewMapMain', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcPnlMeshOverviewMapMain',
    config: {
        urlMapPrefView  : '/cake4/rd_cake/mesh-overviews-light/index-map.json',
        timespan        : 'daily',
        nodeId          : 0
    },
    control: {     
        '#toolEditNode': {
            click: 'toolEditNode'         
        }
    },
    onMarkerClick: function(id){
        var me      = this;  
        me.setNodeId(id);
        me.reload();
    },   
    onBtnReload: function(button){
        var me = this;
        me.getView().down('treeMeshOverview').getStore().reload();
        me.getView().down('pnlMeshOverviewLeafletMap').getController().clearLayers();    
    },   
    onTreeNodeSelect: function(tree,record,index){
        var me      = this;  
        me.setNodeId(record.id);
        me.reload();
    },
    onBtnHome: function(button){
        var me = this;
        me.setNodeId(0);
        me.reload();
        me.getView().down('treeMeshOverview').collapseAll();
    },
    onClickNowButton: function(button){
        var me = this;  
        me.setTimespan('now');
        me.reload();
    }, 
    onClickDayButton: function(button){
        var me = this;  
        me.setTimespan('daily');
        me.reload();
    }, 
    onClickWeekButton: function(button){
        var me = this;  
        me.setTimespan('weekly');
        me.reload();     
    }, 
    onClickMonthButton: function(button){
        var me = this;  
        me.setTimespan('monthly');
        me.reload();
    },
    reload: function(){
        var me = this;
        console.log(me.getNodeId());
        //me.getView().down('pnlMeshOverviewMap').store.getProxy().setExtraParams({tree_tag_id:me.getNodeId(),'timespan':me.getTimespan()});
        //me.getView().down('pnlMeshOverviewMap').store.load();
        me.getView().down('pnlMeshOverviewLeafletMap').store.getProxy().setExtraParams({node:me.getNodeId(),'timespan':me.getTimespan()});
        me.getView().down('pnlMeshOverviewLeafletMap').store.load();
    },
    toolEditNode: function(){
        var me = this;
        var sr = me.getView().down('treeMeshOverview').getSelectionModel().getLastSelected();
        if(sr){    
            me.getView().down('pnlMeshOverviewLeafletMap').getController().editNode(sr);
        }else{
            Ext.ux.Toaster.msg(
                'Select an item',
                'Select An Item to Edit On Map',
                Ext.ux.Constants.clsWarn,
                Ext.ux.Constants.msgWarn
            );
        } 
    }    
});
