Ext.define('Rd.view.permanentUsers.gridUserImportReports' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridUserImportReports',
    multiSelect : true,
    stateful    : true,
    stateId     : 'sUIR',
    stateEvents :['groupclick','columnhide'],
    border      : false,
    requires    : [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager',
        'Rd.view.permanentUsers.vcUserImportReports'
    ],
    controller  : 'vcUserImportReports',
    viewConfig: {
        loadMask:true
    },
    urlMenu: '/cake4/rd_cake/import-failures/menu-for-grid.json',
    plugins: [
        'gridfilters',
        {
            ptype: 'rowexpander',
            rowBodyTpl: new Ext.XTemplate(
                '<div style="max-height:250px; overflow:auto;">',

                    '<h3>Errors</h3>',
                    '<pre style="white-space:pre-wrap;">',
                        '{[Ext.encode(values.error_message, null, 2)]}',
                    '</pre>',

                    '<h3>Payload</h3>',
                    '<pre style="white-space:pre-wrap;">',
                        '{[Ext.encode(values.payload, null, 2)]}',
                    '</pre>',

                '</div>'
            )
        }
    ],
    columns: [
          //  {xtype: 'rownumberer',stateId: 'gUD1'},
        {
            text: 'Row',
            dataIndex: 'csv_row',
            width: 80
        },
        {
            text        : 'Identifier',
            dataIndex   : 'identifier',
            flex        : 1,
            filter      : {type: 'string'}
        },
        {
            text        : 'Type',
            dataIndex   : 'error_type',
            width       : 120,
            filter      : {type: 'string'}
        },
        {
            text        : 'Errors',
            flex        : 2,
            renderer    : function (v, meta, rec) {

                var errors = rec.get('error_message');

                if (!errors) return '';

                var out = [];

                Ext.Object.each(errors, function (field, obj) {
                    Ext.Object.each(obj, function (rule, msg) {
                        out.push('<b>' + field + '</b>: ' + msg);
                    });
                });

                return out.join('<br>');
            },
            filter      : {type: 'string'}
        }, 
        {
            text        : 'Payload',
            flex        : 2,
            hidden      : true,
            renderer    : function (v, meta, rec) {

                var payload = rec.get('payload');
                if (!payload) return '';
                var out = [];
                Ext.Object.each(payload, function (field, value) {
                        out.push('<b>' + field + '</b>: ' + value);
                });
                return out.join('<br>');
            },
            filter      : {type: 'string'}
        },
        { 
            text        : 'Created',
            dataIndex   : 'created', 
            hidden      : false,  
            xtype       : 'templatecolumn', 
            tpl         : new Ext.XTemplate(
                "{created_in_words}"
            ),
            filter      : {type: 'date',dateFormat: 'Y-m-d'},
            width       : 180
        },  
        { 
            text        : 'Modified',
            dataIndex   : 'modified', 
            tdCls       : 'gridTree',
            hidden      : true, 
            xtype       : 'templatecolumn', 
            tpl         : new Ext.XTemplate(
                "{modified_in_words}"
            ),
            flex        : 1,
            filter      : {type: 'date',dateFormat: 'Y-m-d'}
        }
    ],
    username: 'nobody', //dummy value
    initComponent: function(){
        var me      = this;      
        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu+'?user_id='+me.user_id+'&username='+me.username});
        me.store    = Ext.create('Rd.store.sImportFailures',{});
        me.store.getProxy().setExtraParam('model', 'PermanentUsers');
        me.store.load();
        
        me.bbar =  [
            {
                xtype       : 'pagingtoolbar',
                store       : me.store,
                displayInfo : true,
                plugins     : {
                    'ux-progressbarpager': true
                }
            }  
        ];
       
        me.callParent(arguments);
    }
});
