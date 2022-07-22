Ext.define('Rd.view.dynamicDetails.gridDynamicDetailPages' ,{
    extend:'Ext.grid.Panel',
    alias : 'widget.gridDynamicDetailPages',
    multiSelect: true,
    stateful: true,
    stateId: 'StateGridDynamicDetailPages',
    stateEvents:['groupclick','columnhide'],
    border: false,
    dynamic_detail_id: undefined,
    requires: [
        'Rd.view.components.ajaxToolbar'
    ],
    viewConfig: {
        loadMask:true
    },
    urlMenu: '/cake3/rd_cake/dynamic-details/menu-for-dynamic-pages.json',
    bbar: [
        {   xtype: 'component', itemId: 'count',   tpl: i18n('sResult_count_{count}'),   style: 'margin-right:5px', cls: 'lblYfi' }
    ],
    columns: [
         /*   {xtype: 'rownumberer',stateId: 'StateGridDynamicDetailPages1'},*/
            { 
                text    : 'Language',
                width   : 150,  
                xtype:  'templatecolumn', 
                tpl     :    new Ext.XTemplate(
                    '<tpl if="!Ext.isEmpty(language)">',
                       '<div class=\"fieldGrey\">{language_full} ({language})</div>',
                    '<tpl else>',
                        '<div class=\"fieldOrange\">NO LANGUAGE</div>',
                    '</tpl>'   
                ),
                dataIndex   : 'language_full',
                stateId     : 'StateGridDynamicDetailPages1'
            },
            { text: i18n('sName'),      dataIndex: 'name',      tdCls: 'gridMain', width: 200,stateId: 'StateGridDynamicDetailPages2'},
            { text: i18n('sContent'),   dataIndex: 'content',   tdCls: 'gridTree', flex: 1,stateId: 'StateGridDynamicDetailPages3'}
    ],
    initComponent: function(){
        var me      = this;
       

        //Create a store specific to this Dynamic Detail
        me.store = Ext.create(Ext.data.Store,{
            model: 'Rd.model.mDynamicPage',
            //To force server side sorting:
            remoteSort: true,
            proxy: {
                type    : 'ajax',
                format  : 'json',
                batchActions: true, 
                url     : '/cake3/rd_cake/dynamic-details/index-page.json',
                extraParams: { 'dynamic_detail_id' : me.dynamic_detail_id },
                reader: {
                    type: 'json',
                    rootProperty: 'items',
                    messageProperty: 'message',
                    totalProperty: 'totalCount' //Required for dynamic paging
                },
                api: {
                    destroy  : '/cake3/rd_cake/dynamic-details/delete-page.json'
                },
                simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
            }
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

        me.callParent(arguments);
    }
});
