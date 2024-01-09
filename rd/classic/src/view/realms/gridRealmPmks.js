Ext.define('Rd.view.realms.gridRealmPmks' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridRealmPmks',
    multiSelect : true,
    stateful    : true,
    stateId     : 'StateGridRP',
    stateEvents :['groupclick','columnhide'],
    border      : false,
    requires    : [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager',
        'Rd.view.realms.vcRealmPmks'
    ],
    urlMenu     : '/cake4/rd_cake/realm-ssids/menu-for-grid.json',
    plugins     : 'gridfilters',  //*We specify this
    viewConfig: {
        loadMask:true
    },
    listeners       : {
        activate  : 'onViewActivate'
    },
    controller  : 'vcRealmPmks',
    initComponent: function(){
        var me      = this;
        
        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});
        me.store    = Ext.create('Rd.store.sRealmPmks');
        me.store.getProxy().setExtraParam('realm_id',me.realm_id);
        me.store.load();
               
        me.bbar = [{
            xtype       : 'pagingtoolbar',
            store       : me.store,
            displayInfo : true,
            plugins     : {
                'ux-progressbarpager': true
            }
        }];

        me.columns  = [
        	{ text: 'ID',       dataIndex: 'id',                        flex: 1, stateId: 'StateGridRP0', hidden : true},
        	{ text: 'SSID',     dataIndex: 'ssid',  tdCls: 'gridMain',  flex: 1, filter: {type: 'string'},stateId: 'StateGridRP1'},      
            { text: 'ppsk',     dataIndex: 'ppsk',  tdCls: 'gridTree',  flex: 1, filter: {type: 'string'},stateId: 'StateGridRP2'},
            { text: 'pmk',      dataIndex: 'pmk',   tdCls: 'gridTree',  flex: 1, filter: {type: 'string'},stateId: 'StateGridRP3'},
            { 
                text        : 'Created',
                dataIndex   : 'created', 
                tdCls       : 'gridTree',
                hidden      : false,  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{created_in_words}</div>"
                ),
                stateId		: 'StateGridRP5',
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                flex        : 1
            },  
            { 
                text        : 'Modified',
                dataIndex   : 'modified', 
                tdCls       : 'gridTree',
                hidden      : false, 
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{modified_in_words}</div>"
                ),
                flex        : 1,
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                stateId		: 'StateGridRP6'
            }
        ];
        me.callParent(arguments);
    }
});
