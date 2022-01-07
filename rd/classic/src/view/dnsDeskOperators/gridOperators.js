Ext.define('Rd.view.dnsDeskOperators.gridOperators' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridOperators',
    multiSelect : true,
    store       : 'sDnsDeskOperators',
    stateful    : true,
    stateId     : 'StateGridO',
    stateEvents :['groupclick','columnhide'],
    border      : false,
    requires    : [
        'Rd.view.components.ajaxToolbar'
    ],
    viewConfig: {
        loadMask    :true
    },
    urlMenu     : '/cake3/rd_cake/dns-desk-operators/menu-for-grid.json',
    plugins     : [
        'gridfilters'
    ],
    initComponent: function(){
        var me      = this; 
        me.bbar     =  [
            {
                 xtype       : 'pagingtoolbar',
                 store       : me.store,
                 dock        : 'bottom',
                 displayInfo : true
            }  
        ];
        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});
        me.columns  = [
            {xtype: 'rownumberer',stateId: 'StateGridF1'},
            { text: i18n('sName'),         dataIndex: 'name',       tdCls: 'gridMain', flex: 1,filter: {type: 'string'},stateId: 'StateGridF3'},
            { text: i18n('sDescription'),  dataIndex: 'description',tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridF4'}
        ];      
        me.callParent(arguments);
    }
});
