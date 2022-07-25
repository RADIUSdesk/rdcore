Ext.define('Rd.view.meshes.gridMeshes' ,{
    extend:'Ext.grid.Panel',
    alias : 'widget.gridMeshes',
    multiSelect: false,
    store : 'sMeshes',
    stateful: true,
    stateId: 'StateGridMeshes',
    stateEvents:['groupclick','columnhide'],
    border: false,
    allowDeselect: true,
    requires: [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager'
    ],
    viewConfig: {
        loadMask:true
    },
    urlMenu: '/cake3/rd_cake/meshes/menu_for_grid.json',
    plugins     : 'gridfilters',  //*We specify this
    initComponent: function(){
        var me      = this;    
        me.store    = Ext.create(Rd.store.sMeshes,{
            listeners: {
                load: function(store, records, successful) {
                    var md          = store.getProxy().getReader().metaData;
                    if(me.down('#totals')){ //Sometimes its not there yet
                        me.down('#totals').setData(md);
                    } 
                },
                scope: me
            },
            autoLoad: true 
        });    

        me.bbar = [{
            xtype       : 'pagingtoolbar',
            store       : me.store,
            displayInfo : true,
            plugins     : {
                'ux-progressbarpager': true
            }
        }];
              
        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});

        me.columns  = [
          //  {xtype: 'rownumberer',stateId: 'StateGridMeshes1'},
            { text: i18n('sOwner'),     dataIndex: 'owner',         tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridMeshes2',
                hidden: true
            
            },
            { text: i18n('sName'),      dataIndex: 'name',          tdCls: 'gridMain', flex: 1,filter: {type: 'string'},stateId: 'StateGridMeshes3',sortable: true},
			{ 
                text:   i18n('sAvailable_to_sub_providers'),
                flex: 1,
				hidden: true,  
                xtype:  'templatecolumn', 
                tpl:    new Ext.XTemplate(
                            "<tpl if='available_to_siblings == true'><div class=\"fieldGreen\">"+i18n("sYes")+"</div></tpl>",
                            "<tpl if='available_to_siblings == false'><div class=\"fieldRed\">"+i18n("sNo")+"</div></tpl>"
                        ),
                dataIndex: 'available_to_siblings',
                filter      : {
                        type    : 'boolean',
                        defaultValue   : false,
                        yesText : 'Yes',
                        noText  : 'No'
                },stateId: 'StateGridSsids4'
            },
            { text: i18n('sSSID'),      dataIndex: 'ssid',          tdCls: 'gridTree', flex: 1,filter: {type: 'string'},hidden: true,stateId: 'StateGridMeshes5'},
            { text: i18n('sBSSID'),    dataIndex: 'bssid',         tdCls: 'gridTree', flex: 1,filter: {type: 'string'},hidden: true,stateId: 'StateGridMeshes6'},
            { 
                text        : 'Last Seen',
                dataIndex   : 'last_contact',    
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                            "<tpl if='last_contact_state ==\"never\"'>",
                                "<div class=\"fieldGrey\">Awaiting Deployment</div>",
                            "</tpl>",
                             "<tpl if='last_contact_state ==\"online\"'>",
                                "<div class=\"fieldGreen\">{last_contact_in_words}</div>",
                            "</tpl>",
                            "<tpl if='last_contact_state ==\"offline\"'>",
                                "<div class=\"fieldOrange\">{last_contact_in_words}</div>",
                            "</tpl>"
                        ),  
                stateId     : 'StateGridMeshes6a',
                sortable    : true, 
                width       : Rd.config.gridNumberCol+20       
            },
            {   
                text        : 'Nodes',   
                dataIndex   : 'node_count',    
                stateId     : 'StateGridMeshes7',
                width       : Rd.config.gridNumberCol+20,
                renderer    : function (value, m, r) {                                 
                   var id = Ext.id();
                   Ext.defer(function () {
                   
                        var h = "<div class=\"fieldGrey\">ADD PLEASE</div>";
                        if(r.get('node_count') > 0){                        
                            if((r.get('nodes_down') == r.get('node_count'))&&(r.get('nodes_down')>1)){
                                h = "<div class=\"fieldOrange\">ALL "+r.get('nodes_down')+" OFFLINE</div>";
                            }
                            
                            if((r.get('nodes_down') == r.get('node_count'))&&(r.get('nodes_down')==1)){
                                h = "<div class=\"fieldOrange\">OFFLINE</div>";
                            }
                            
                            if((r.get('nodes_up') == r.get('node_count'))&&(r.get('nodes_up')>1)){
                                h = "<div class=\"fieldGreen\">ALL "+r.get('nodes_up')+" ONLINE</div>";
                            }
                            
                             if((r.get('nodes_up') == r.get('node_count'))&&(r.get('nodes_up')==1)){
                                h = "<div class=\"fieldGreen\">ONLINE</div>";
                            }
                            
                            if((r.get('nodes_down') < r.get('node_count'))&&(r.get('nodes_down')!=0)){
                                h = "<div class=\"fieldGreen\">"+r.get('nodes_up')+" ONLINE</div>";
                                h = h+"<div class=\"fieldOrange\">"+r.get('nodes_down')+" OFFLINE</div>";
                            } 
                        }
                   
                        var p = Ext.widget('container', {
                            renderTo    : id,
                            padding     : 1,
                            html        : h
                        });
                        
                        var t  = Ext.create('Ext.tip.ToolTip', {
                            target  : id,
                            border  : true,
                            anchor  : 'left',
                            data    : r,
                            tpl     : new Ext.XTemplate(
                                "<div style='font-size:10px;'>",
                                    "<label class='lblTipItem'>Total Nodes</label><label class='lblTipValue'>{node_count}</label>",
                                    "<div style='clear:both;'></div>",
                                    "<tpl if='node_count &gt; 0'>",   
                                        "<h2>NAME + LAST SEEN</h2>",
                                        '<tpl for="node_list">',       
                                            "<label class='lblTipItem' style='font-size:10px;'>{name}</label><label class='lblTipValue'>{last_contact_human}</label>",
                                            "<br>",
                                        '</tpl>',
                                    '</tpl>',
                                "</div>"
                            )                         
                        });
                                             
                    }, 75); //Keep it 50 if its to little it does not display correct e.g. 5
                    return Ext.String.format('<div id="{0}"></div>', id);
                }
             },          
            { 
                text        : i18n('sNode_count'),
                dataIndex   : 'node_count',
                hidden      : true,    
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                            "<tpl><div class=\"fieldGreyWhite\">{node_count}</div></tpl>"
                        ),  
                stateId     : 'StateGridMeshes7a',
                sortable    : false, 
                width       : Rd.config.gridNumberCol        
            },
            { 
                text        : '<i class="fa fa-check-circle"></i> '+Rd.config.meshNodesOnline,  
                dataIndex   : 'nodes_up',
                hidden      : true,      
                xtype       :  'templatecolumn', 
                tpl         :    new Ext.XTemplate(
                            "<tpl if='nodes_up &gt; 0'><div class=\"fieldGreenWhite\">{nodes_up}</div>",
                            "<tpl else><div class=\"fieldBlue\">{nodes_up}</div></tpl>"
                        ),
                stateId     : 'StateGridMeshes8',
                sortable    : true,
                width       : Rd.config.gridNumberCol
            },

            { 
                text        : '<i class="fa fa-exclamation-circle"></i> '+Rd.config.meshNodesOffline,   
                dataIndex   : 'nodes_down',
                hidden      : true,      
                xtype       :  'templatecolumn', 
                tpl         :    new Ext.XTemplate(
                            "<tpl if='nodes_down &gt; 0'><div class=\"fieldRedWhite\">{nodes_down}</div>",
                            "<tpl else><div class=\"fieldBlue\">{nodes_down}</div></tpl>"
                        ),
                stateId     : 'StateGridMeshes9',
                sortable    : true,
                width       : Rd.config.gridNumberCol
            },
            { 
                text    : '<i class="fa fa-sticky-note"></i> '+i18n('sNotes'),
                sortable: false,
                width   : 130,
                hidden  : true,
                xtype   : 'templatecolumn', 
                tpl     : new Ext.XTemplate(
                                "<tpl if='notes == true'><span class=\"fa fa-thumb-tack fa-lg txtGreen\"></tpl>"
                ),
                dataIndex: 'notes',stateId: 'StateGridMeshes10'
            },
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                width       : 80,
                stateId     : 'StateGridMeshes11',
                items       : [				
					 { 
						iconCls : 'txtRed x-fa fa-trash',
						tooltip : 'Delete',
						isDisabled: function (grid, rowIndex, colIndex, items, record) {
                                if (record.get('delete') == true) {
                                     return false;
                                } else {
                                    return true;
                                }
                        },
                        handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'delete');
                        }
                    },
                    {  
                        iconCls : 'txtBlue x-fa fa-pen',
                        tooltip : 'Edit',
                        isDisabled: function (grid, rowIndex, colIndex, items, record) {
                                if (record.get('update') == true) {
                                     return false;
                                } else {
                                    return true;
                                }
                        },
						handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'update');
                        }
					},
					{  
                        iconCls : 'txtGreen x-fa fa-search',
                        tooltip : 'View',
                        isDisabled: function (grid, rowIndex, colIndex, items, record) {
                                if (record.get('view') == true) {
                                     return false;
                                } else {
                                    return true;
                                }
                        },
						handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'view');
                        }
					}
				]
	        }      
        ];
        me.callParent(arguments);
    }
});
