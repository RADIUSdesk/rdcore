Ext.define('Rd.view.settigs.gridSmsHistories' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridSmsHistories',
    multiSelect : true,
    store       : 'sSmsHistories',
    stateful    : true,
    stateId     : 'StateGridSmsHist',
    stateEvents :['groupclick','columnhide'],
    border      : false,
    padding     : 10,
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
        'Rd.view.settings.vcSmsHistories',
    ],
    controller  : 'vcSmsHistories',
    urlMenu     : '/cake4/rd_cake/settings/menu-for-sms-histories.json',  
    initComponent: function(){
        var me      = this;
        me.tbar    = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu}); 
        me.store   = Ext.create('Rd.store.sSmsHistories');
        me.store.getProxy().setExtraParams({ 'edit_cloud_id' : me.edit_cloud_id, 'nr' : me.nr })
        me.store.addListener('metachange',  me.onStoreSmsHistoriesMetachange, me);

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
                text        : 'Recipient',               
                dataIndex   : 'recipient',  
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'StateGridSmsHist1'
            },
            { 
                text        : 'Reason',               
                dataIndex   : 'reason',  
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'StateGridSmsHist2'
            },
            { 
                text        : 'Message',               
                dataIndex   : 'message',  
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'StateGridSmsHist3'
            },
            { 
                text        : 'Reply',               
                dataIndex   : 'reply',  
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'StateGridSmsHist4'
            },
            { 
                text        : 'Created',
                dataIndex   : 'created', 
                tdCls       : 'gridTree',  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{created_in_words}</div>"
                ),
                stateId     : 'StateGridSmsHist5',
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
                stateId     : 'StateGridSmsHist5'
            }
        ]; 
        me.callParent(arguments);
    },
    onStoreSmsHistoriesMetachange: function(store,meta_data) {
        var me          = this;
        console.log("Meta Data Changes Comes Here");
    }
});
