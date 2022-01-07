/*
 * File: app/controller/cMeshOverview.js
 *
 * Mesh Overview Controller
 *
 	HISTORY

 */
Ext.define('Rd.controller.cMeshOverview', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl){
        var me = this;   
        if (me.populated) {
            return; 
        }
		
        pnl.add({
            xtype   : 'pnlMeshOverview',
            border  : false,
            itemId  : 'tabMeshOverview',
            plain   : true
        });
        me.populated = true;
    },
    views:  [
        'meshOverview.pnlMeshOverview',
        'meshOverview.pnlMeshOverviewTotals',
		'meshOverview.pnlMeshGrid'
    ],
    stores      : [
		'sMeshOverview',
		'sMeshOverviewLight',
		'sMeshOverviewLightUptime',
		'sTreeTags',
		'sTreeTagUptime'
	],
    models      : [
        'mMeshOverview',
		'mMeshOverviewLight',
		'mTreeTag'
    ],
    selectedRecord: null,
    config: {
        urlUsageForRealm    : '/cake3/rd_cake/data-usages/usage_for_realm.json',
        username            : false,
        type                : 'realm' //default is realm
    },
    refs: [
         {  ref: 'grid',         selector: 'gridMeshOverview'}   
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        me.control({
            'pnlMeshOverview' : {
                destroy   		:   me.appClose
            },
			'#pnlMeshOverview': {
                afterrender: me.getNavData
            },
            'pnlMeshOverview #reload': {
                click:      me.reload
            },
            'pnlMeshOverview #reload menuitem[group=refresh]'   : {
                click:      me.reloadOptionClick
            }
			/*  Removed Map and TreeTag Nav
			,
			'#mapOverviewTreeNav': {
				mapready: me.layoutNavMap
			}
			*/
        });
    },
    appClose:   function(){
        var me          = this;
        me.populated    = false;
    },
	layoutNavMap: function(pnl,pMap){
		var me = this,
			o_p = Ext.ComponentQuery.query('pnlMeshOverview')[0];

		var cuOptions = {
			useEasing: true, 
			useGrouping: true, 
			separator: ',', 
			decimal: '.'
		};

		//Set right side total counter objects
		// Villages		
		o_p.gpCtr = new CountUp("totGP", 0, 0, 0, 2,cuOptions);
		// Users
		o_p.userCtr = new CountUp("totUsers", 0, 0, 0, 2,cuOptions);
		// Data Totals
		o_p.totDataCtr = new CountUp("totData", 0, 0, 1, 2,cuOptions);
		// Hotspots
		o_p.hsCtr = new CountUp("hotspots", 0, 0, 0, 2,cuOptions);
		// Chart Globals (for New Chart  REMOVED Temporarily for Mid-release 
		/* Begin Tmp remove */
		Chart.helpers.merge(Chart.defaults.global, {
			maintainAspectRatio: false,
			tooltips: false,
			layout: {
				padding: 32
			},
			elements: {
				line: {
					fill: false
				},
				point: {
					hoverRadius: 7,
					radius: 5
				}
			},
			plugins: {
				legend: false,
				title: false
			}
		});	
		/* end Tmp remove */		

	},
	getNavData: function(pnl,opts){
		var me = this;
		
		pnl.nav_store.load({
			scope: pnl,
			callback: function(records, operation, success) {
				var pnl = this;
				var plur = 'S';
				var t = 1;
				// Set Title Of Nav Level 
				if (records.length > 0 ){
					f = records.length;
					plur = 'S';
				} else {
					// Restore last leaf level so pie can display
					pnl.nav_store.add(pnl.leaf_node);
					plur = '';
				}
				var nav_pnl = pnl.down('#navPanel');
				nav_pnl.setTitle(f + ' ' + pnl.nav_store.first().get('tree_level')+plur);
			}
		});
	},
    reload: function(button){
        var me =this;
		var pnl = button.up('panel'),
			ns = pnl.nav_store,
			os = pnl.store,
			p_n;
						
		var t = pnl.down('pnlMeshOverviewTotals');
	    t.setLoading(true);	

        if (me.getGrid() != undefined) {
			me.getGrid().getSelectionModel().deselectAll(true);
		}
		if (pnl.prev_node_ids.length == 0) {
			pnl.current_node_id = 0;
			pnl.current_name = 'Network';
		}
		pnl.down('#pnl_ov_tots').setTitle(pnl.current_name + ' TOTALS');
		ns.getProxy().setExtraParams({'node': pnl.current_node_id});
		var params = os.getProxy().getExtraParams();
		params.tree_tag_id = pnl.current_node_id;
		os.getProxy().setExtraParams(params);
		ns.load({
			scope: pnl,
			callback: function(records, operation, success) {
				var pnl = this;
				var plur = '';
				var t = 1;
				// Set Title Of Nav Level 
				if (records.length > 0 ){
					t = records.length;
					if (t > 1) {
						plur = 'S';
					}
					var f = records[0];
					var nav_pnl = pnl.down('#navPanel');
					nav_pnl.setTitle(t + ' ' + f.get('tree_level')+plur);
				} 	
			}
		});
		os.load({
            scope: this,
            callback: function(records, operation, success) {     
                t.setLoading(false);
            }
        });
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
    }
    
    
});
