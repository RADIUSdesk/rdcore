Ext.define('Rd.view.networkOverview.vcNetworkOverview', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcNetworkOverview',
    config  : {
        urlIndexNetworkOverview    : '/cake4/rd_cake/clouds/index_network_overview.json',
        timespan        : 'now',
        nodeId          : 0
    },
    control: {
        'treeNetworkOverview': {
            select      : 'onTreeNodeSelect',
            itemclick   : 'onTreeNodeClick' //FIXME Might cause double call 
        }
    },
    //FROM treeNetworkOverview
    onTreeNodeSelect: function(tree,record,index){
        var me  = this;  
        me.setNodeId(record.id);
        me.reload();
    },
    onTreeNodeClick: function(tree,record,index){
        var me  = this;  
        me.setNodeId(record.id);
        me.reload();
    },      
    onBtnHome: function(button){
        var me = this;
        me.setNodeId(0);
        me.reload();
        me.getView().down('treeNetworkOverview').collapseAll();
    },
    onBtnReload: function(button){
        var me = this;
        me.getView().down('treeNetworkOverview').getStore().reload();
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
    reload: function(){
        var me      = this;
        var dd      = Ext.getApplication().getDashboardData();
        var tz_id   = dd.user.timezone_id;
        me.getView().down('pnlNetworkOverviewDetail').setLoading(true);
        Ext.Ajax.request({
            url     : me.getUrlIndexNetworkOverview(),
            method  : 'GET',
            params  : {
                'node'          : me.getNodeId(),
                'timespan'      : me.getTimespan(),      
                'timezone_id'   : tz_id
            },
            success : function(response){
                me.getView().down('pnlNetworkOverviewDetail').setLoading(false);
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                    me.doMetaData(jsonData.metaData);
                    me.getView().down('#pnlMeshes').down('polar').getStore().setData(jsonData.data.meshdesk.online);
                    me.getView().down('#pnlMeshes').down('cartesian').getStore().setData(jsonData.data.meshdesk.graph.items);
                    
                    me.getView().down('#pnlMeshes').down('#cntInfo').setData(jsonData.data.meshdesk.totals);
                        
                    me.getView().down('#pnlAps').down('polar').getStore().setData(jsonData.data.apdesk.online);
                    me.getView().down('#pnlAps').down('cartesian').getStore().setData(jsonData.data.apdesk.graph.items);
                    
                    me.getView().down('#pnlAps').down('#cntInfo').setData(jsonData.data.apdesk.totals);
                }   
            },
            scope: me
        });
    },
    onClickMesh : function(button){
		//var pnl = Ext.ComponentQuery.query('pnlMeshOverview')[0];
		//Rd.getApplication().runAction('cMeshGrid','OverviewIndex',0,'Home');
		var me          = this
        var tp          = button.up('tabpanel');
        var map_tab_id  = 'meshOverviewTab';
        var nt          = tp.down('#'+map_tab_id);
        if(nt){
            tp.setActiveTab(map_tab_id); //Set focus on  Tab
            return;
        }         
        var map_tab_name = 'Mesh Networks'; 
        tp.add({
            title   : map_tab_name,
            itemId  : map_tab_id,
            closable: true,
            xtype   : 'gridNetworkOverviewMesh',
            glyph   : Rd.config.icnMesh
        });
        tp.setActiveTab(map_tab_id);
	},    
    onClickMap : function(button){
    
        var me          = this
        var tp          = button.up('tabpanel');
        var map_tab_id  = 'leafletTab';
        var nt          = tp.down('#'+map_tab_id);
        if(nt){
            tp.setActiveTab(map_tab_id); //Set focus on  Tab
            return;
        }
         
        var map_tab_name = 'Maps'; 
        tp.add({
            title   : map_tab_name,
            itemId  : map_tab_id,
            closable: true,
            xtype   : 'pnlNetworkOverviewMap',
            glyph   : Rd.config.icnMap
        });
        tp.setActiveTab(map_tab_id);
    },
    doMetaData: function(md){
        var me      = this;    
        var main    = me.getView(); 
        //FIXME WE WILL HAVE TO CHANGE THIS
 /*       
            
        if(md.level == -1){
            main.down('#cntBanner').setStyle('background','#adc2eb');
            }            
        }        
        if(md.level == 0){
            main.down('#cntBanner').setStyle('background','#c2c2a3');        
            }
            
        }
        if(md.level == 1){
            main.down('#cntBanner').setStyle('background','#00cccc');
        }        
        if(md.level == 2){
            main.down('#cntBanner').setStyle('background','#adc2eb');
        }          
        main.down('#cntBanner').setData(md);
*/
    }
});
