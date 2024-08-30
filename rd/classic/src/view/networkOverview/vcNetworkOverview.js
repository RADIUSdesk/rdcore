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
           // select      : 'onTreeNodeSelect',
            itemclick   : 'onTreeNodeClick' //FIXME Might cause double call 
        },
        '#pnlMeshes' : {
            render  : 'pnlMeshesRender'
        },
        '#pnlAps' : {
            render  : 'pnlApsRender'
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
	onClickMeshView : function(button){
	    var me  = this;
	    if(button.pressed){
	        me.getView().down('#pnlMeshes').show();
	        Ext.util.Cookies.clear("rdNtwrkHideMesh");
	    }else{
	        me.getView().down('#pnlMeshes').hide();
	        Ext.util.Cookies.set("rdNtwrkHideMesh", "yes");    
	    }	
	}, 
	onClickApView : function(button){
	    var me  = this;
	    if(button.pressed){
	        me.getView().down('#pnlAps').show();
	        Ext.util.Cookies.clear("rdNtwrkHideAp");
	    }else{
	        me.getView().down('#pnlAps').hide();
	        Ext.util.Cookies.set("rdNtwrkHideAp", "yes");	        	    
	    }		
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
        main.down('#cmpNavigation').setData(md);
    },
    pnlMeshesRender: function(pnl){
        var me = this;
        if (Ext.util.Cookies.get("rdNtwrkHideMesh")) {
            pnl.hide();
            me.getView().down('#btnMeshView').setPressed(false);
        }
    },
    pnlApsRender: function(pnl){
        var me = this;
        if (Ext.util.Cookies.get("rdNtwrkHideAp")) {
            pnl.hide();
            me.getView().down('#btnApView').setPressed(false);
        } 
    }
});
