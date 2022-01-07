Ext.define('Rd.view.dynamicDetails.gridDynamicDetailTranslations' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridDynamicDetailTranslations',
    multiSelect : true,
    stateful    : true,
    stateId     : 'SgTrans',
    stateEvents :['groupclick','columnhide'],
    border      : false,
    emptyText   : '<h1>~Nothing Found~</h1>',
    padding     : Rd.config.gridPadding,
    requires: [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager',
        'Rd.view.dynamicDetails.vcDynamicDetailTranslations',
        'Rd.view.dynamicDetails.winDynamicLanguageAdd',
        'Rd.view.dynamicDetails.winDynamicLanguageEdit',
        'Rd.view.dynamicDetails.winDynamicLanguageDel',
        'Rd.view.dynamicDetails.winDynamicDetailTransKeyAdd',
        'Rd.view.dynamicDetails.winDynamicDetailTransKeyEdit',
        'Rd.view.dynamicDetails.winDynamicDetailTransKeyDel',
        'Rd.view.dynamicDetails.winDynamicDetailTranslationAdd',
        'Rd.view.dynamicDetails.cmbDynamicDetailTransPages',
        'Rd.view.dynamicDetails.cmbDynamicDetailTransOptions'       
    ],
    controller  : 'vcDynamicDetailTranslations',
    viewConfig: {
        loadMask:true
    },
    features: [{
        ftype               : 'groupingsummary',
        enableGroupingMenu  : false,
        startCollapsed      : true
    }],
    urlMenu: '/cake3/rd_cake/dynamic-details/menu-for-dynamic-translations.json',
    listeners       : {
        afterrender : 'gridAfterrender'
    },
    columns: [
        {   text            : 'Key',      
            dataIndex       : 'key',      
            tdCls           : 'gridTree', 
            stateId         : 'SgTrans1',
            width           : 150
        },       
        {   text: 'Language', dataIndex: 'language', tdCls: 'gridTree', stateId: 'SgTrans2',width  : 150,
            summaryType     : 'count',
            summaryRenderer : function(value, summaryData) {
                var tx_bytes =summaryData.txBytes; 
                if(tx_bytes == 0){
                    return 'No Languages';
                }else{
                    return ((value === 0 || value > 1) ? '(' + value + ' Languages)' : '(1 Language)');
                }
            }
        
        },
        { text: 'Phrase',   dataIndex: 'value',    tdCls: 'gridTree', flex: 1,stateId: 'SgTrans3'},
        { 
            text        : 'Created',
            width       : 150,
            dataIndex   : 'created', 
            tdCls       : 'gridTree',
            hidden      : true, 
            xtype       : 'templatecolumn', 
            tpl         : new Ext.XTemplate(
                "<div class=\"fieldBlue\">{created_in_words}</div>"
            ),
            filter      : {type: 'date',dateFormat: 'Y-m-d'},
            stateId		: 'SgTrans4'
        },
        { 
            text        : 'Modified',
            width       : 150,
            dataIndex   : 'modified', 
            tdCls       : 'gridTree',
            hidden      : false, 
            xtype       : 'templatecolumn', 
            tpl         : new Ext.XTemplate(
                "<div class=\"fieldBlue\">{modified_in_words}</div>"
            ),
            filter      : {type: 'date',dateFormat: 'Y-m-d'},
            stateId		: 'SgTrans5'
        }
    ],
    initComponent: function(){
        var me      = this;
        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});
        //Create a store specific to this Dynamic Detail
        me.store = Ext.create(Ext.data.Store,{
            model       : 'Rd.model.mDynamicDetailTranslation',
            //To force server side sorting:
            remoteSort  : true,
            remoteFilter: true,
            groupField  : 'key',
            proxy: {
                type    : 'ajax',
                format  : 'json',
                batchActions: true, 
                url     : '/cake3/rd_cake/dynamic-detail-translations/index.json',
                reader  : {
                    type            : 'json',
                    rootProperty    : 'items',
                    messageProperty : 'message',
                    totalProperty   : 'totalCount' //Required for dynamic paging
                },
                api: {
                    destroy  : '/cake3/rd_cake/data-collectors/delete.json'
                },
                simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
            },
            autoLoad: false
        });
        
       me.bbar     =  [
            {
                 xtype       : 'pagingtoolbar',
                 store       : me.store,
                 dock        : 'bottom',
                 displayInfo : true
            }  
        ];
       
        me.callParent(arguments);
    }
});
