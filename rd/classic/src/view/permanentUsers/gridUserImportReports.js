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
        'Rd.view.permanentUsers.vcUserImportReports',
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

                    '<b>Errors</b>',
                    '<pre style="white-space:pre-wrap;">',
                        '{[Ext.encode(values.error_message, null, 2)]}',
                    '</pre>',

                    '<b>Payload</b>',
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
            flex        : 1
        },
        {
            text        : 'Type',
            dataIndex   : 'error_type',
            width       : 120
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
            }
        },  
        {
            text        : 'Created',
            dataIndex   : 'modified_in_words',
            width       : 180
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
            stateId		: 'sUIR2'
        }
    ],
    username: 'nobody', //dummy value
    initComponent: function(){
        var me      = this;      
        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu+'?user_id='+me.user_id+'&username='+me.username});
        me.store    = Ext.create('Rd.store.sImportFailures',{});
        
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
