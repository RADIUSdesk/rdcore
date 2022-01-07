Ext.define('Rd.view.vouchers.gridVoucherRadaccts' ,{
    extend:'Ext.grid.Panel',
    alias : 'widget.gridVoucherRadaccts',
    multiSelect: true,
    stateful: true,
    stateId: 'StGVoucherRadaccts',
    stateEvents:['groupclick','columnhide'],
    border: false,
    requires: [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager'
    ],
    viewConfig: {
        loadMask:true
    },
    urlMenu: '/cake3/rd_cake/vouchers/menu-for-accounting-data.json',
    plugins     : 'gridfilters',
    columns: [
       // {xtype: 'rownumberer',stateId: 'StGVoucherRadaccts1'},
        { text: i18n('sAcct_session_id'),dataIndex: 'acctsessionid',tdCls: 'gridTree', flex: 1,filter: {type: 'string'},    hidden: true,stateId: 'StGVoucherRadaccts2'},
        { text: i18n('sAcct_unique_id'),dataIndex: 'acctuniqueid',  tdCls: 'gridTree', flex: 1,filter: {type: 'string'},    hidden: true,stateId: 'StGVoucherRadaccts3'},
        { text: i18n('sGroupname'),     dataIndex: 'groupname',     tdCls: 'gridTree', flex: 1,filter: {type: 'string'},    hidden: true,stateId: 'StGVoucherRadaccts4'},
        { text: i18n('sRealm'),         dataIndex: 'realm',         tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StGVoucherRadaccts5'},
        { text: i18n('sNAS_IP_Address'),dataIndex: 'nasipaddress',  tdCls: 'gridTree', flex: 1,filter: {type: 'string'}, hidden: true, stateId: 'StGVoucherRadaccts6'},
        { text: i18n('sNAS_Identifier'),dataIndex: 'nasidentifier', tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StGVoucherRadaccts7'},
        { text: i18n('sNAS_port_id'),   dataIndex: 'nasportid',     tdCls: 'gridTree', flex: 1,filter: {type: 'string'},    hidden: true,stateId: 'StGVoucherRadaccts8'},
        { text: i18n('sNAS_port_type'), dataIndex: 'nasporttype',   tdCls: 'gridTree', flex: 1,filter: {type: 'string'},    hidden: true,stateId: 'StGVoucherRadaccts9'},
        { 
            text        : i18n('sStart_time'),
            dataIndex   : 'acctstarttime', 
            tdCls       : 'gridTree', 
            flex        : 1,
            xtype       : 'datecolumn',   
            format      :'Y-m-d H:i:s',
            filter      : {type: 'date',dateFormat: 'Y-m-d'},
            stateId     : 'StGVoucherRadaccts10'
        },
        { 
            text        : i18n('sStop_time'),   
            dataIndex   : 'acctstoptime',  
            tdCls       : 'gridTree', 
            flex        : 1,
            filter      : {type: 'date',dateFormat: 'Y-m-d'},
            renderer    : function(value,metaData, record){
                if(record.get('active') == true){
                    var human_value = record.get('online_human')
                    return "<div class=\"fieldGreen\">"+human_value+" "+i18n('sOnline')+"</div>";
                }else{
                    return value;
                }              
            },
            stateId     : 'StGVoucherRadaccts11'
        },
        {   text: i18n('sSession_time'), dataIndex: 'acctsessiontime', tdCls: 'gridTree', flex: 1,filter: {type: 'string'},
            renderer    : function(value){
                return Ext.ux.secondsToHuman(value);             
            },stateId: 'StGVoucherRadaccts12'
        }, //Format
        { text: i18n('sAccount_authentic'), dataIndex: 'acctauthentic',     tdCls: 'gridTree', flex: 1,filter: {type: 'string'},    hidden: true,stateId: 'StGVoucherRadaccts13'},
        { text: i18n('sConnect_info_start'), dataIndex: 'connectinfo_start',tdCls: 'gridTree', flex: 1,filter: {type: 'string'}, hidden: true,stateId: 'StGVoucherRadaccts14'},
        { text: i18n('sConnect_info_stop'), dataIndex: 'connectinfo_stop',  tdCls: 'gridTree', flex: 1,filter: {type: 'string'}, hidden: true,stateId: 'StGVoucherRadaccts15'},
        { text: i18n('sData_in'), dataIndex: 'acctinputoctets',    tdCls: 'gridTree', flex: 1,filter: {type: 'string'},
            renderer: function(value){
                return Ext.ux.bytesToHuman(value)              
            },stateId: 'StGVoucherRadaccts16'
        }, //Format!
        { text: i18n('sData_out'), dataIndex: 'acctoutputoctets',    tdCls: 'gridTree', flex: 1,filter: {type: 'string'},
            renderer: function(value){
                return Ext.ux.bytesToHuman(value)              
            },stateId: 'StGVoucherRadaccts17'
        }, //Format!
        { text: i18n('sCalled_station_id'), dataIndex: 'calledstationid',    tdCls: 'gridTree', flex: 1,filter: {type: 'string'},    hidden: true,stateId: 'StGVoucherRadaccts18'},
        { text: i18n('sCalling_station_id_MAC'), dataIndex: 'callingstationid',    tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StGVoucherRadaccts19'}, 
        { text: i18n('sTerminate_cause'), dataIndex: 'acctterminatecause',    tdCls: 'gridTree', flex: 1,filter: {type: 'string'},   hidden: true,stateId: 'StGVoucherRadaccts20'},
        { text: i18n('sService_type'), dataIndex: 'servicetype',    tdCls: 'gridTree', flex: 1,filter: {type: 'string'}, hidden: true,stateId: 'StGVoucherRadaccts21'},
        { text: i18n('sFramed_protocol'), dataIndex: 'framedprotocol',    tdCls: 'gridTree', flex: 1,filter: {type: 'string'}, hidden: true,stateId: 'StGVoucherRadaccts22'},
        { text: i18n('sFramed_ipaddress'), dataIndex: 'framedipaddress',  tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StGVoucherRadaccts23'},
        { text: i18n('sAcct_start_delay'), dataIndex: 'acctstartdelay',  tdCls: 'gridTree', flex: 1,filter: {type: 'string'}, hidden: true,stateId: 'StGVoucherRadaccts24'},
        { text: i18n('sAcct_stop_delay'), dataIndex: 'acctstopdelay',  tdCls: 'gridTree', flex: 1,filter: {type: 'string'}, hidden: true,stateId: 'StGVoucherRadaccts25'},
        { text: i18n('sX_Ascend_session_svr_key'), dataIndex: 'xascendsessionsvrkey',  tdCls: 'gridTree', flex: 1,filter: {type: 'string'}, hidden: true,stateId: 'StGVoucherRadaccts26'}
    ],
    username: 'nobody', //dummy value
    initComponent: function(){
        var me     = this;    
        me.tbar    = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu}); 
        me.store   = Ext.create('Rd.store.sRadaccts');
        me.store.getProxy().setExtraParams({ 'username' : me.username })
        me.store.addListener('metachange',  me.onStoreRadacctsMetachange, me);
        me.bbar     = [
            {
                xtype       : 'pagingtoolbar',
                store       : me.store,
                displayInfo : true,
                plugins     : {
                    'ux-progressbarpager': true
                }
            },
            '->',
            {   xtype: 'component', itemId: 'totals',  tpl: i18n('tpl_In_{in}_Out_{out}_Total_{total}'),   style: 'margin-right:5px', cls: 'lblRd' }
        ];       
        me.callParent(arguments);
    },
    onStoreRadacctsMetachange: function(store,meta_data) {
        var me          = this;
        var totalIn     = Ext.ux.bytesToHuman(meta_data.totalIn);
        var totalOut    = Ext.ux.bytesToHuman(meta_data.totalOut);
        var totalInOut  = Ext.ux.bytesToHuman(meta_data.totalInOut);
        me.down('#totals').update({'in': totalIn, 'out': totalOut, 'total': totalInOut });
    }
});
