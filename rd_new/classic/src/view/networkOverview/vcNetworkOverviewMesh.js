Ext.define('Rd.view.networkOverview.vcNetworkOverviewMesh', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcNetworkOverviewMesh',
    onTreeNodeSelect: function(treeview){
        var me = this;
    },
    onClickHourButton: function(button){
       var me = this;
	   
    },
    onClickDayButton: function(button){
        var me = this;
		
    },
    onClickWeekButton: function(button){
        var me = this;
		
    },
    onClickMonthButton: function(button){
        var me = this;
		
    },
    onClickViewButton: function(button){
        var me = this;
        var selCount = me.getView().getSelectionModel().getCount();
        if(selCount == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            if(selCount > 1){
                Ext.ux.Toaster.msg(
                        i18n('sLimit_the_selection'),
                        i18n('sSelection_limited_to_one'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                );
            }else{
                var sr      = me.getView().getSelectionModel().getLastSelected();
                var id      = sr.getId();
                var name    = sr.get('name');  
				Rd.getApplication().runAction('cMeshViews','OverviewIndex',id,name); 
            }
        } 
    },
	onClickMeshDetail: function(button){
		var pnl = Ext.ComponentQuery.query('pnlMeshOverview')[0];
		Rd.getApplication().runAction('cMeshGrid','OverviewIndex',0,'Home'); 
	},
    onFilterNameChange: function( txt, newValue, oldValue, eOpts){
        var me = this;
		var pnl = txt.up('panel'),
			p_store = pnl.store;
			
		var t = pnl.down('pnlMeshOverviewTotals');
		if( t == undefined ){
			t = pnl;
		}
	    t.setLoading(true);	
	    
        p_store.filter({
                property    : 'name',
                value       : newValue,
                operator    :"like"
            });
        p_store.load({
            scope: this,
            callback: function(records, operation, success) {     
                t.setLoading(false);
            }
        });
    },
	onMeshOverviewLightStoreLoad: function(pnl) {
		var me = this
		
	},
    onAfterMeshOverviewTotalsRender: function(panel){
        var me = this;
        panel.setLoading(true);
    },
    addMeshOverviewMapMain: function(button){
    
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
            closable: true, //Make it a one shot untill we find out how to prevent google API loading multiple times
            xtype   : 'pnlMeshOverviewMapMain',
            glyph   : Rd.config.icnMap
        });
        tp.setActiveTab(map_tab_id);
    }
});
