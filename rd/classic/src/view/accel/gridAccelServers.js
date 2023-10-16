Ext.define('Rd.view.accel.gridAccelServers' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridAccelServers',
    multiSelect : true,
    store       : 'sAccelServers',
    stateful    : true,
    stateId     : 'StateGridAccelServers',
    stateEvents :['groupclick','columnhide'],
    border      : false,
    padding     : 0,
    viewConfig  : {
        loadMask    :true
    },
    listeners       : {
        activate  : 'onViewActivate'
    },
    plugins     : 'gridfilters',
    requires    : [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager',
        'Rd.view.accel.vcAccelServers',
    ],
    controller  : 'vcAccelServers',
    urlMenu     : '/cake4/rd_cake/accel-servers/menu-for-grid.json',  
    initComponent: function(){
        var me     = this;
        me.tbar    = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu}); 
        me.store   = Ext.create('Rd.store.sAccelServers');
        me.store.addListener('metachange',  me.onStoreAccelServersMetachange, me);
        me.bbar     =  [
            {
                 xtype       : 'pagingtoolbar',
                 store       : me.store,
                 dock        : 'bottom',
                 displayInfo : true
            }  
        ];
               
        me.columns  = [
            { 
                text        : 'Name',               
                dataIndex   : 'name',  
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'StateGridAccS1'
            },
            { 
                text        : 'MAC Address',               
                dataIndex   : 'mac',  
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'StateGridAccS2'
            },
            { 
                text        : 'Created',
                dataIndex   : 'created', 
                tdCls       : 'gridTree',  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{created_in_words}</div>"
                ),
                stateId     : 'StateGridAccS3',
                format      : 'Y-m-d H:i:s',
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                width       : 200
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
                stateId     : 'StateGridAccS4'
            }
        ]; 
        me.callParent(arguments);
    },
    onStoreAccelServersMetachange: function(store,meta_data) {
        var me          = this;
        console.log("Meta Data Changes Comes Here");
    }
});
