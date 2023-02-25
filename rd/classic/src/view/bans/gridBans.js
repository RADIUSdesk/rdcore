Ext.define('Rd.view.bans.gridBans' ,{
    extend		:'Ext.grid.Panel',
    alias 		: 'widget.gridBans',
    padding     : Rd.config.gridSlim,
    requires	: [
   		'Rd.view.bans.vcBans',
   		'Rd.view.bans.winAddBan',
   		'Rd.view.bans.winEditBan',
   		'Rd.view.components.cmbApProfile',
   		'Rd.view.components.cmbMesh'
    ],
    controller  : 'vcBans',
    viewConfig  : {
        loadMask    :true
    },
    listeners       : {
        activate  : 'onViewActivate'
    },
    urlMenu		: '/cake4/rd_cake/bans/menu-for-grid.json',
    plugins     : 'gridfilters',  //*We specify this
    requires	: [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager'
    ],
    initComponent: function(){
        var me  = this;   
        me.tbar = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});                 
        var store = Ext.create('Ext.data.Store', {
		   fields: [
			   {name: 'id',   	type: 'int'},
			   {name: 'mac', 	type: 'string'},
			   {name: 'alias', 	type: 'string'},
			   {name: 'cloud_wide', 	type: 'bool'},
			   {name: 'mesh_name', 		type: 'string'},
			   {name: 'ap_profile_name',type: 'string'},
			   {name: 'cloud_id', 		type: 'int'},
			   {name: 'mesh_id', 		type: 'int'},
			   {name: 'ap_profile_id', 	type: 'int'},
			   {name: 'created',        type: 'date'},
         	   {name: 'modified',       type: 'date'}
		   	],
		   	pageSize    : 100,
    		remoteSort  : true,
    		remoteFilter: true,
		   	proxy: {
				    type    : 'ajax',
				    format  : 'json',
				    batchActions: true, 
				    url     : '/cake4/rd_cake/bans/index.json',
				    reader: {
				        type            : 'json',
				        rootProperty    : 'items',
				        messageProperty : 'message',
				        totalProperty   : 'totalCount' //Required for dynamic paging
				    },
				    simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
			},
			autoLoad: true // add mode must auto load else leave it for load action on window (edit)
		});
		
		me.store = store;
		
		me.bbar = [{
            xtype       : 'pagingtoolbar',
            store       : me.store,
            displayInfo : true,
            plugins     : {
                'ux-progressbarpager': true
            }
        }];
                       
        me.columns  = [
			{ text: i18n('sMAC_address'),   dataIndex: 'mac',       tdCls: 'gridMain', flex: 1,filter: {type: 'string'},stateId: 'StateGridBan1'},
			{ text: 'Alias',   				dataIndex: 'alias',     tdCls: 'gridTree', flex: 1,stateId: 'StateGridBan2'},
			{ 
				text		: 'Cloud Wide',
				dataIndex	: 'cloud_wide',
				tdCls		: 'gridTree',
				flex		: 1,
				xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<tpl if='cloud_wide == true'><div style='text-align:left;' class=\"fieldGreen\"><i class=\"fa fa-check-circle\"></i> "+i18n("sYes")+"</div></tpl>",
                    "<tpl if='cloud_wide == false'><div style='text-align:left;' class=\"fieldGrey\"><i class=\"fa fa-times-circle\"></i> "+i18n("sNo")+"</div></tpl>"
                ),
				filter      : {
                    type            : 'boolean',
                    defaultValue    : false,
                    yesText         : 'Cloud Wide',
                    noText          : 'Network Wide'
                },
				stateId		: 'StateGridBan3'
			},
			{ 
				text		: 'Mesh Network',
				dataIndex	: 'mesh_name',
				tdCls		: 'gridTree',
				flex		: 1,
				xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<tpl if='mesh_id'><div style='text-align:left;' class=\"fieldGreen\"><span style='font-family:FontAwesome;'>&#xf20e;</span> {mesh_name}</div>",
                    "<tpl else>",
                    	"<tpl if='cloud_wide == true'><div style='text-align:left;' class=\"fieldGrey\"><i class=\"fa fa-info-circle\"></i> All Mesh Networks</div></tpl>",
                    	"<tpl if='cloud_wide == false'><div style='text-align:left;' class=\"fieldGrey\"><i class=\"fa fa-minus\"></i></div></tpl>",
                    "</tpl>"
                ),
				filter: {type: 'string'},
				stateId		: 'StateGridBan4'
			},
			{ 
				text		: 'AP Profile',
				dataIndex	: 'ap_profile_name',
				tdCls		: 'gridTree',
				flex		: 1,
				xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<tpl if='ap_profile_id'><div style='text-align:left;' class=\"fieldGreen\"><i class=\"fa fa-cubes\"></i> {ap_profile_name}</div>",
                    "<tpl else>",
                    	"<tpl if='cloud_wide == true'><div style='text-align:left;' class=\"fieldGrey\"><i class=\"fa fa-info-circle\"></i> All AP Profiles</div></tpl>",
                    	"<tpl if='cloud_wide == false'><div style='text-align:left;' class=\"fieldGrey\"><i class=\"fa fa-minus\"></i></div></tpl>",
                    "</tpl>"
                ),
				filter: {type: 'string'},
				stateId		: 'StateGridBan5'
			},
			{ 
				text		: 'Action',
				dataIndex	: 'action',
				tdCls		: 'gridTree',
				flex		: 1,
				xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<tpl if='action == \"block\"'><div style='text-align:left;' class=\"fieldRed\"><i class=\"fa fa-ban\"></i> Block</div></tpl>",
                    "<tpl if='action == \"limit\"'><div style='text-align:left;' class=\"fieldGreen\"><span style=\"font-family:FontAwesome;\">&#xf0e4;</span> <span style=\"font-size:75%;color:#cc6600;\">(<i class=\"fa fa-arrow-circle-down\"></i> {bw_down} {bw_down_suffix} / <i class=\"fa fa-arrow-circle-up\"></i> {bw_up} {bw_up_suffix} )</span></div></tpl>"                    
                ),
				stateId		: 'StateGridBan6'
			},
			{ 
                text        : 'Created',
                dataIndex   : 'created', 
                tdCls       : 'gridTree',
                hidden      : true,  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{created_in_words}</div>"
                ),
                stateId		: 'StateGridBan7',
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                flex        : 1
            },  
            { 
                text        : 'Modified',
                dataIndex   : 'modified', 
                tdCls       : 'gridTree',
                hidden      : true, 
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{modified_in_words}</div>"
                ),
                flex        : 1,
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                stateId		: 'StateGridBan8'
            }
        ];
        me.callParent(arguments);
    }
});
