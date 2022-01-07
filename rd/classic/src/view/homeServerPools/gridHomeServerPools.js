Ext.define('Rd.view.homeServerPools.gridHomeServerPools' ,{
    extend:'Ext.grid.Panel',
    alias : 'widget.gridHomeServerPools',
    multiSelect: true,
    store : 'sHomeServerPools',
    stateful: true,
    stateId: 'StateGridHomeServerPools',
    stateEvents:['groupclick','columnhide'],
    border: false,
    requires: [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager'
    ],
    viewConfig: {
        loadMask:true
    },
    urlMenu: '/cake3/rd_cake/home-server-pools/menu-for-grid.json',
    
    
    "type": "auth+acct",
                    "ipaddr": "10.1.1.1",
                    "port": 1812,
                    "secret": "Nirwana=hevymetal",
                    "response_window": 20,
                    "zombie_period": 40,
                    "revive_interval": 120,
    plugins     : [
        {
            ptype: 'rowexpander',
            rowBodyTpl : new Ext.XTemplate(
                '<tpl for="home_servers">',
                    '<div class="sectionHeader">',
                        '<h2>HOME SERVER {#}</h2>',
                    '</div>',
                    "<div style='background-color:white; padding:5px;'>",
                        "<label class='lblMap'>Type  </label><label class='lblValue'>{type}</label>",
					    "<div style='clear:both;'></div>",
					    "<label class='lblMap'>IP Address </label><label class='lblValue'> {ipaddr}</label>",
					    "<div style='clear:both;'></div>",
					    "<label class='lblMap'>Port </label><label class='lblValue'> {port}</label>",
					    "<div style='clear:both;'></div>",
                        "<label class='lblMap'>Secret </label><label class='lblValue'> {secret}</label>",
					    "<div style='clear:both;'></div>",
                        "<label class='lblMap'>Response Window </label><label class='lblValue'> {response_window}</label>",
					    "<div style='clear:both;'></div>",
					    "<label class='lblMap'>Zombie Period </label><label class='lblValue'> {zombie_period}</label>",
					    "<div style='clear:both;'></div>",
					    "<label class='lblMap'>Revive Interval </label><label class='lblValue'> {revive_interval}</label>",
					    "<div style='clear:both;'></div>",
					    "<tpl if='accept_coa == true'><label class='lblValue txtGreen'><i class='fa fa-check-circle'></i> ACCEPT COA</label></tpl>",
					    "<tpl if='accept_coa == false'><label class='lblValue txtRed'><i class='fa fa-minus-circle'></i> NOT ACCEPT COA</label></tpl>",
                    "</div>",
                '</tpl>'
            )
        },
        'gridfilters'
    ],
    initComponent: function(){
        var me  = this;
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
            { text: i18n('sOwner'),        dataIndex: 'owner', tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridHSP1',
                hidden      : true
            },
            { text: i18n('sName'),         dataIndex: 'name',   tdCls: 'gridMain', flex: 1,filter: {type: 'string'},stateId: 'StateGridHSP2'},
            { text: 'Type',                dataIndex: 'type',   flex: 1,filter: {type: 'string'},stateId: 'StateGridHSP3'},     
            { text: 'Home Server Count',   dataIndex: 'home_server_count',  flex: 1,filter: {type: 'string'},stateId: 'StateGridHSP4'},
            { 
                text:   i18n('sAvailable_to_sub_providers'),
                flex: 1,  
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
                },stateId: 'StateGridFK4'
            },
            { 
                text        : 'Created',
                dataIndex   : 'created', 
                hidden      : false,  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{created_in_words}</div>"
                ),
                stateId		: 'StateGridFK6',
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                flex        : 1
            },  
            { 
                text        : 'Modified',
                dataIndex   : 'modified', 
                hidden      : true, 
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{modified_in_words}</div>"
                ),
                flex        : 1,
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                stateId		: 'StateGridFK7'
            }
        ];        
        me.callParent(arguments);
    }
});
