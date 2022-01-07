Ext.define('Rd.view.meshes.vcMeshNodeRogue', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcMeshNodeRogue',
    config : {
        urlDelete       : '/cake3/rd_cake/node-reports/remove-scans-for-node.json',
        urlStartScan    : '/cake3/rd_cake/node-reports/start-scan-for-node.json'
    },
    init: function() {
        var me = this;
    },
    control: {
        'pnlMeshNodeRogue #reload': {
            click   : 'reload'
        },
        'pnlMeshNodeRogue #reload menuitem[group=refresh]'   : {
            click   : 'reloadOptionClick'
        },  
        'pnlMeshNodeRogue #start_scan': {
            click   : 'start_scan'
        },
        'pnlMeshNodeRogue #remove': {
            click   : 'remove'
        },
     },
    reload: function() {
        var me = this;
        var pnl   = me.getView();
       // var pnl = button.up('pnlMeshNodeRogue');
        if(pnl == undefined){
            clearInterval(me.autoReload);
        }else{
            pnl.down('gridMeshNodeRogue').getSelectionModel().deselectAll(true);
            pnl.down('gridMeshNodeRogue').getStore().load();
        }
    },
    reloadOptionClick: function(menu_item){
        var me      = this;
        var n       = menu_item.getItemId();
        var b       = menu_item.up('button'); 
        var interval= 30000; //default
        clearInterval(me.autoReload);   //Always clear
        b.setGlyph(Rd.config.icnTime);
        
        if(n == 'mnuRefreshCancel'){
            b.setGlyph(Rd.config.icnReload);
            return;
        }
        
        if(n == 'mnuRefresh1m'){
           interval = 60000
        }

        if(n == 'mnuRefresh5m'){
           interval = 360000
        }
        me.autoReload = setInterval(function(){      
            me.reload(); 
        },  interval);  
    },
    start_scan: function() {
        var me      = this; 
        var v       = me.getView();  
        var node_id = v.nodeId;    
        Ext.MessageBox.confirm(i18n('sConfirm'), "Initiate a ROUGE AP scan?", function(val){
            if(val== 'yes'){  
                Ext.Ajax.request({
                    url     : me.getUrlStartScan(),
                    method  : 'POST',          
                    jsonData: { node_id: node_id },
                    success: function(batch,options){
                        console.log('success');
                        Ext.ux.Toaster.msg(
                            'Scan Initiated',
                            'Scan Initiated Fine',
                            Ext.ux.Constants.clsInfo,
                            Ext.ux.Constants.msgInfo
                        );
                        me.reload(); //Reload from server
                    },                                    
                    failure: function(batch,options){
                        me.reload(); //Reload from server
                    }
                });
            }
        });
    },
    remove  : function(){
        var me      = this; 
        var v       = me.getView();  
        var node_id = v.nodeId;    
        Ext.MessageBox.confirm(i18n('sConfirm'), "This Action Will Delete All The Rogue Scan Results, Continue?", function(val){
            if(val== 'yes'){  
                Ext.Ajax.request({
                    url     : me.getUrlDelete(),
                    method  : 'POST',          
                    jsonData: { node_id: node_id },
                    success: function(batch,options){
                        console.log('success');
                        Ext.ux.Toaster.msg(
                            i18n('sItem_deleted'),
                            i18n('sItem_deleted_fine'),
                            Ext.ux.Constants.clsInfo,
                            Ext.ux.Constants.msgInfo
                        );
                        me.reload(); //Reload from server
                    },                                    
                    failure: function(batch,options){
                        me.reload(); //Reload from server
                    }
                });
            }
        });
    }    
});
