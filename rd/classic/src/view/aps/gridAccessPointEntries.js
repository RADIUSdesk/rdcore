Ext.define('Rd.view.aps.gridAccessPointEntries' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridAccessPointEntries',
    multiSelect : true,
    stateful    : true,
    stateId     : 'StateGridAccessPointEntries',
    stateEvents :['groupclick','columnhide'],
    border      : false,
    requires    : [
        'Rd.view.components.ajaxToolbar'
    ],
    viewConfig  : {
        loadMask:true
    },
    urlMenu: '/cake3/rd_cake/ap-profiles/menu_for_entries_grid.json',
    initComponent: function(){
        var me      = this;
        me.store    = Ext.create(Rd.store.sAccessPointEntries,{});
        me.store.getProxy().setExtraParam('ap_profile_id',me.apProfileId);
        me.store.load();
        
        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});
        
        me.columns  = [
         //   {xtype: 'rownumberer', stateId: 'StateGridAccessPointEntries1'},
            { text: i18n("sSSID"),                 dataIndex: 'name',          tdCls: 'gridMain', flex: 1, stateId: 'StateGridAccessPointEntries2'},
            { 
                text        : i18n("sEncryption"),   
                dataIndex   : 'encryption',  
                tdCls       : 'gridTree', 
                flex        : 1,
                xtype       :  'templatecolumn', 
                tpl         :  new Ext.XTemplate(
                    '<tpl if="encryption==\'none\'"><div class="fieldGreyWhite"><i class="fa fa-unlock"></i> '+' '+i18n('sNone')+'</div></tpl>',
                    '<tpl if="encryption==\'wep\'"><div class="fieldGreyWhite"><i class="fa fa-lock"></i> '+' '+i18n('sWEP')+'</div></tpl>', 
                    '<tpl if="encryption==\'psk\'"><div class="fieldGreyWhite"><i class="fa fa-lock"></i> '+' '+i18n('sWPA_Personal')+'</div></tpl>',
                    '<tpl if="encryption==\'psk2\'"><div class="fieldGreyWhite"><i class="fa fa-lock"></i> '+' '+i18n('sWPA2_Personal')+'</div></tpl>',
                    '<tpl if="encryption==\'wpa\'"><div class="fieldGreyWhite"><i class="fa fa-lock"></i> '+' '+i18n('sWPA_Enterprise')+'</div></tpl>',
                    '<tpl if="encryption==\'wpa2\'"><div class="fieldGreyWhite"><i class="fa fa-lock"></i> '+' '+i18n('sWPA2_Enterprise')+'</div></tpl>' 
                ),   
                stateId: 'StateGridAccessPointEntries3'
            },
            { text: i18n("sHidden"),               dataIndex: 'hidden',            tdCls: 'gridTree', flex: 1, stateId: 'StateGridAccessPointEntries4',
                xtype       :  'templatecolumn', 
                tpl         :  new Ext.XTemplate(
                    '<tpl if="hidden"><div class=\"fieldGreen\"><i class="fa fa-check-circle"></i> Yes</div>',
                    '<tpl else>',
                    '<div class=\"fieldRed\"><i class="fa fa-times-circle"></i> No</div>',
                    "</tpl>"   
                )   
            },
            { text: i18n("sClient_isolation"),     dataIndex: 'isolate',           tdCls: 'gridTree', flex: 1, stateId: 'StateGridAccessPointEntries5',
                xtype       :  'templatecolumn', 
                tpl         :  new Ext.XTemplate(
                    '<tpl if="isolate"><div class=\"fieldGreen\"><i class="fa fa-check-circle"></i> Yes</div>',
                    '<tpl else>',
                    '<div class=\"fieldRed\"><i class="fa fa-times-circle"></i> No</div>',
                    "</tpl>"   
                )
            },
            { 
                text        : 'Connected to Exit' ,   
                dataIndex   : 'connected_to_exit',  
                tdCls       : 'gridTree', 
                flex        : 1, 
                stateId     : 'StateGridAccessPointEntries6',
                renderer    : function (v, m, r) {
                    if(v == true){
                        return '<div class=\"fieldGreen\"><i class="fa fa-check-circle"></i> Yes</div>';
                    }
                    if(v == false){
                        m.tdAttr = 'data-qtip="<div><label class=\'lblTipItem\'>Go to Exit Points and connect this SSID to an Exit Point</label></div>"';
                        return '<div class=\"fieldRedWhite\"><i class="fa  fa-exclamation-circle"></i> No</div>';
                    }
                 
                }
            },
            { text: 'Frequency',   dataIndex: 'frequency_band', tdCls: 'gridTree', flex: 1, stateId: 'StateGridAccessPointEntries7',
                xtype       :  'templatecolumn', 
                tpl         :  new Ext.XTemplate(
                    '<tpl if="frequency_band==\'both\'"><div class=\"fieldGreyWhite\"> 2.4G & 5.8G </div></tpl>',
                    '<tpl if="frequency_band==\'two\'"><div class=\"fieldGreyWhite\"> 2.4G </div></tpl>',
                    '<tpl if="frequency_band==\'five\'"><div class=\"fieldGreyWhite\"> 5.8G </div></tpl>',
                    '<tpl if="frequency_band==\'five_lower\'"><div class=\"fieldGreyWhite\"> 5G Lower Band </div></tpl>',
                    '<tpl if="frequency_band==\'five_upper\'"><div class=\"fieldGreyWhite\"> 5G Upper Band </div></tpl>',
                )     
            },
            { text: 'WPA Personal Key', hidden: true,dataIndex: 'speical_key',          tdCls: 'gridTree', flex: 1, stateId: 'StateGridAccessPointEntries8'},
            { text: 'RADIUS Server',    hidden: true,dataIndex: 'auth_server',  tdCls: 'gridTree', flex: 1, stateId: 'StateGridAccessPointEntries9'},
            { text: 'RADIUS Secret',    hidden: true,dataIndex: 'auth_secret',  tdCls: 'gridTree', flex: 1, stateId: 'StateGridAccessPointEntries10'}
            
        ];
        me.callParent(arguments);
    }
});
