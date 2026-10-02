Ext.define('Rd.view.components.gridRadacctsGeneric' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridRadacctsGeneric',
    multiSelect : true,
    stateful    : true,
    stateId     : 'StateRadacctsGeneric',
    stateEvents : ['groupclick','columnhide'],
    border      : false,
    padding     : 0,
    ui          : 'light',
    columnLines : false,
    rowLines    : false,
    stripeRows  : true,  
    cls         : 'radacct-grid',
    controller  : 'vcRadacctsGeneric',
    requires    : [
        'Rd.view.components.ajaxToolbar',
        'Rd.view.components.vcRadacctsGeneric',
        'Rd.view.permanentUsers.winStationAlias'
    ],
    viewConfig: {
        loadMask:true,
        stripeRows: true
    },
    urlMenu: '/cake4/rd_cake/permanent-users/menu-for-accounting-data.json', //We specify per implementation
    plugins     : 'gridfilters',  //*We specify this
    columns     : [
            { text: i18n('sAcct_session_id'),dataIndex: 'acctsessionid',tdCls: 'gridTree', flex: 1,filter: {type: 'string'},    hidden: true,stateId: 'Generic2'},
            { text: i18n('sAcct_unique_id'),dataIndex: 'acctuniqueid',  tdCls: 'gridTree', flex: 1,filter: {type: 'string'},    hidden: true,stateId: 'Generic3'},         
            { 
                text        : i18n('sUsername'),
                dataIndex   : 'username',
                tdCls       : 'gridTree x-selectable',
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'Generic4', 
                hidden      : true
            },         
            { text: i18n('sGroupname'),     dataIndex: 'groupname',     tdCls: 'gridTree', flex: 1,filter: {type: 'string'},    hidden: true,stateId: 'Generic5'},
            { text: i18n('sRealm'),         dataIndex: 'realm',         tdCls: 'gridTree x-selectable', flex: 1,filter: {type: 'string'},hidden: true, stateId: 'Generic6'},
            { text: i18n('sNAS_IP_Address'),dataIndex: 'nasipaddress',  tdCls: 'gridTree', flex: 1,filter: {type: 'string'},    hidden: true, stateId: 'Generic7'},
            { text: i18n('sNAS_Identifier'),dataIndex: 'nasidentifier', tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'Generic8'},
            { text: i18n('sNAS_port_id'),   dataIndex: 'nasportid',     tdCls: 'gridTree', flex: 1,filter: {type: 'string'},    hidden: true,stateId: 'Generic9'},
            { text: i18n('sNAS_port_type'), dataIndex: 'nasporttype',   tdCls: 'gridTree', flex: 1,filter: {type: 'string'},    hidden: true,stateId: 'Generic10'},
            { 
                text        : i18n('sStart_time'),
                dataIndex   : 'acctstarttime', 
                tdCls       : 'gridTree', 
                flex        : 1,
                xtype       : 'datecolumn',   
                format      :'Y-m-d H:i:s',
                filter      : {type: 'date',dateFormat: 'Y-m-d'},stateId: 'Generic11'
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
                        var stale = record.get('stale');
                        if(stale){
                            return "<div><span class=\"fa\" style='color:green;font-family:FontAwesome;'>&#xf10c</span> "+human_value+" "+i18n('sOnline')+"</div>";
                        }else{
                            return "<div><span style='color:green;'><i class=\"fa fa-circle\"></i></span> "+human_value+" "+i18n('sOnline')+"</div>";
                        }
                    }else{
                        return value;
                    }              
                },stateId: 'Generic12'
            },
            {   text: i18n('sSession_time'), dataIndex: 'acctsessiontime', tdCls: 'gridTree', flex: 1,filter: {type: 'string'},
                renderer    : function(value){
                    return "<span>⏱</span> "+Ext.ux.secondsToHumanShort(value);            
                },stateId: 'Generic13'
            }, //Format
            { text: i18n('sAccount_authentic'), dataIndex: 'acctauthentic',     tdCls: 'gridTree', flex: 1,filter: {type: 'string'},    hidden: true,stateId: 'Generic14'},
            { text: i18n('sConnect_info_start'), dataIndex: 'connectinfo_start',tdCls: 'gridTree', flex: 1,filter: {type: 'string'}, hidden: true,stateId: 'Generic15'},
            { text: i18n('sConnect_info_stop'), dataIndex: 'connectinfo_stop',  tdCls: 'gridTree', flex: 1,filter: {type: 'string'}, hidden: true,stateId: 'Generic16'},
            { text: i18n('sData_in'), dataIndex: 'acctinputoctets',    tdCls: 'gridTree', flex: 1,filter: {type: 'string'},
        
                renderer: function(value){
                    return "<i class='fa fa-arrow-down'></i> " +Ext.ux.bytesToHuman(value)              
                },
              //  align: 'right',
                stateId: 'Generic17'
            }, //Format!
            { text: i18n('sData_out'), dataIndex: 'acctoutputoctets',    tdCls: 'gridTree', flex: 1,filter: {type: 'string'},
                renderer: function(value){
                    return "<i class='fa  fa-arrow-up'></i> "+Ext.ux.bytesToHuman(value)              
                },
               // align: 'right',
                stateId: 'Generic18'
            }, //Format!
            { text: i18n('sCalled_station_id'), dataIndex: 'calledstationid',    tdCls: 'gridTree', flex: 1,filter: {type: 'string'},    hidden: true,stateId: 'Generic19'},
            { 
                text        : i18n('sCalling_station_id_MAC'),
                dataIndex   : 'callingstationid',
                tdCls       : 'gridTree x-selectable', 
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'Generic20',
                xtype       : 'templatecolumn',
                tpl         : new Ext.XTemplate(
                    '<div style="text-align:left;"><a href="javascript:void(0)" class="grid-link">{callingstationid}<tpl if="alias"><br><small style="color: #666;">{alias}</small></tpl></a></div>'
                )              
            }, 
            { text: i18n('sTerminate_cause'), dataIndex: 'acctterminatecause',    tdCls: 'gridTree', flex: 1,filter: {type: 'string'},   hidden: true,stateId: 'Generic21'},
            { text: i18n('sService_type'), dataIndex: 'servicetype',    tdCls: 'gridTree', flex: 1,filter: {type: 'string'}, hidden: true,stateId: 'Generic22'},
            { text: i18n('sFramed_protocol'), dataIndex: 'framedprotocol',    tdCls: 'gridTree', flex: 1,filter: {type: 'string'}, hidden: true,stateId: 'Generic23'},
            { text: i18n('sFramed_ipaddress'), dataIndex: 'framedipaddress',  tdCls: 'gridTree x-selectable', flex: 1,filter: {type: 'string'},stateId: 'Generic24'},
            { text: i18n('sAcct_start_delay'), dataIndex: 'acctstartdelay',  tdCls: 'gridTree', flex: 1,filter: {type: 'string'}, hidden: true,stateId: 'Generic25'},
            { text: i18n('sAcct_stop_delay'), dataIndex: 'acctstopdelay',  tdCls: 'gridTree', flex: 1,filter: {type: 'string'}, hidden: true,stateId: 'Generic26'},
            { text: i18n('sX_Ascend_session_svr_key'), dataIndex: 'xascendsessionsvrkey',  tdCls: 'gridTree', flex: 1,filter: {type: 'string'}, hidden: true,stateId: 'Generic27'},
            { text: 'Operator-Name', dataIndex: 'operator_name',  tdCls: 'gridTree', flex: 1,filter: {type: 'string'}, hidden: true,stateId: 'Generic28'},
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                width       : 80,
                stateId     : 'Generic29',
                items       : [
                    {
                        iconCls : 'txtBlue x-fa fa-tag',
                        tooltip : 'Add/Edit Alias',
                        isDisabled: function (grid, rowIndex, colIndex, items, record) {
                            return false;
                            if (record.get('update') == true) { //FIXME For later (version 2.0)
                                 return false;
                            } else {
                                return true;
                            }
                        },
						handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'alias');
                        }
					}
				]
            }             
    ],
    
    
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
            }
        ];       
        me.callParent(arguments);
    },
    onStoreRadacctsMetachange: function(store,meta_data) {
        var me          = this;
        var totalIn     = Ext.ux.bytesToHuman(meta_data.totalIn);
        var totalOut    = Ext.ux.bytesToHuman(meta_data.totalOut);
        var totalInOut  = Ext.ux.bytesToHuman(meta_data.totalInOut);
        me.down('#totals').update({'in': totalIn, 'out': totalOut, 'total': totalInOut, total_connected: meta_data.totalCount, activeData: meta_data.activeData });        
    }
});
