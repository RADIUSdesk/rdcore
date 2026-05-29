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
                text        : 'Username',               
                dataIndex   : 'username',
                tdCls       : 'gridMain', 
                flex        : 1
            },           
            { 
                text        : 'Created',
                dataIndex   : 'created', 
                tdCls       : 'gridTree', 
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"rd-chip rd-chip--blue\">{created_in_words}</div>"
                ),
                flex        : 1,
                format      : 'Y-m-d H:i:s',
                filter      : {type: 'date',dateFormat: 'Y-m-d'}
            },  
            { 
                text        : 'Modified',
                dataIndex   : 'modified', 
                tdCls       : 'gridTree',
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"rd-chip rd-chip--blue\">{modified_in_words}</div>"
                ),
                flex        : 1,
                filter      : {type: 'date',dateFormat: 'Y-m-d'}
            }  
        ]; 
        me.callParent(arguments);
    }
});
