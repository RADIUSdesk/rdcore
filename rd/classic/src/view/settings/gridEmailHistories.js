Ext.define('Rd.view.settigs.gridEmailHistories' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridEmailHistories',
    multiSelect : true,
    store       : 'sEmailHistories',
    stateful    : true,
    stateId     : 'StateGridEmailHist',
    stateEvents :['groupclick','columnhide'],
    border      : true,
    padding     : 10,
    viewConfig  : {
        loadMask    :true
    },
    plugins     : 'gridfilters',
    requires    : [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager'
    ],
    urlMenu: '/cake4/rd_cake/vouchers/menu-for-email-histories.json',  
    initComponent: function(){
        var me      = this;
        me.tbar    = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu}); 
        me.store   = Ext.create('Rd.store.sEmailHistories');
        me.store.getProxy().setExtraParams({ 'cloud_id' : me.cloud_id })
        me.store.addListener('metachange',  me.onStoreEmailHistoriesMetachange, me);

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
                text        : 'Created',
                dataIndex   : 'created', 
                tdCls       : 'gridTree',  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{created_in_words}</div>"
                ),
                stateId     : 'StateGridEmailHist10',
                format      : 'Y-m-d H:i:s',
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                width       : 200
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
                stateId     : 'StateGridEmailHist11'
            }
        ]; 
        me.callParent(arguments);
    },
    onStoreEmailHistoriesMetachange: function(store,meta_data) {
        var me          = this;
        console.log("Meta Data Changes Comes Here");
    }
});
