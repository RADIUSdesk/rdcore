Ext.define('Rd.view.auditLogs.gridAuditLogs' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridAuditLogs',
    multiSelect : true,
    store       : 'sAuditLogs',
    stateful    : true,
    stateId     : 'StateGridAuditLogs',
    stateEvents : ['groupclick','columnhide'],
    border      : false,
    padding     : 0,
    ui          : 'light',
    columnLines : false,
    rowLines    : false,
    stripeRows  : true,
    viewConfig  : {
        loadMask    :true
    },
    listeners       : {
        activate  : 'onViewActivate'
    },
    plugins     : [
        {
            ptype: 'rowexpander',
            rowBodyTpl: new Ext.XTemplate(
                '<div class="audit-summary">',
                    '{summary}',
                '</div>',
                '<div class="audit-detail-wrap">',

                    '<table class="audit-detail-table">',

                        '<thead>',
                            '<tr>',
                                '<th>Field</th>',
                                '<th>Old Value</th>',
                                '<th>New Value</th>',
                            '</tr>',
                        '</thead>',

                        '<tbody>',

                            '<tpl for="changes_array">',

                                '<tr class="{[xindex % 2 ? \'odd\' : \'even\']}">',

                                    '<td class="field-name">{field}</td>',

                                    '<td class="old-value">',
                                        '{[this.renderValue(values.old)]}',
                                    '</td>',

                                    '<td class="new-value">',
                                        '{[this.renderValue(values.new)]}',
                                    '</td>',

                                '</tr>',

                            '</tpl>',

                        '</tbody>',

                    '</table>',

                '</div>',

                {
                    renderValue: function(v){

                        if(v === null){
                            return '<span class="audit-null">NULL</span>';
                        }

                        if(v === ''){
                            return '<span class="audit-empty">(empty)</span>';
                        }

                        return Ext.String.htmlEncode(String(v));
                    }
                }
            )
        },
        'gridfilters'
    ],     
    requires    : [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager',
        'Rd.view.auditLogs.vcAuditLogs'
    ],
    controller  : 'vcAuditLogs',
    urlMenu     : '/cake4/rd_cake/audit-logs/menu-for-grid.json',  
    initComponent: function(){
        var me     = this;
        me.tbar    = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu}); 
        me.store   = Ext.create('Rd.store.sAuditLogs');
        me.bbar    =  [
            {
                 xtype       : 'pagingtoolbar',
                 store       : me.store,
                 dock        : 'bottom',
                 displayInfo : true
            }  
        ];            
        me.columns  = [
            { 
                text        : 'Time',
                stateId     : 'gaul1',
                dataIndex   : 'created', 
                tdCls       : 'gridTree',
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "{created_in_words}"
                ),
                flex        : 1,
                format      : 'Y-m-d H:i:s',
                filter      : {type: 'date',dateFormat: 'Y-m-d'}
            },
            { 
                text        : 'Admin',
                stateId     : 'gaul2',
                filter		: {type: 'string'},              
                dataIndex   : 'username',
                tdCls       : 'gridTree', 
                flex        : 1
            }, 
            { 
                text        : 'Action',
                stateId     : 'gaul3',
                filter		: {type: 'string'},              
                dataIndex   : 'action',
                tdCls       : 'gridTree',
                flex        : 1
            },
            { 
                text        : 'Entity',
                stateId     : 'gaul4',
                filter		: {type: 'string'},              
                dataIndex   : 'entity',
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "{entity} #{entity_id}"
                ),
                tdCls       : 'gridTree', 
                flex        : 1
            },
            { 
                text        : 'Entity ID',
                stateId     : 'gaul5',
                filter		: {type: 'string'},              
                dataIndex   : 'entity_id',
                tdCls       : 'gridTree',
                hidden      : true,
                flex        : 1
            },           
            { 
                text        : 'Summary',
                stateId     : 'gaul6',
                filter		: {type: 'string'},              
                dataIndex   : 'summary',
                tdCls       : 'gridTree', 
                flex        : 1
            },
            { 
                text        : 'IP',
                stateId     : 'gaul7',
                filter		: {type: 'string'},              
                dataIndex   : 'ip_address',
                tdCls       : 'gridTree', 
                flex        : 1
            },
        ]; 
        me.callParent(arguments);
    }
});
