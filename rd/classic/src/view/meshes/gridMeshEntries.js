Ext.define('Rd.view.meshes.gridMeshEntries' ,{
    extend:'Ext.grid.Panel',
    alias : 'widget.gridMeshEntries',
    multiSelect: true,
    stateful: true,
    stateId: 'StateGridMeshEntries',
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
    urlMenu: '/cake3/rd_cake/meshes/menu_for_entries_grid.json',
    initComponent: function(){
        var me      = this;
        me.store    = Ext.create(Rd.store.sMeshEntries,{
            listeners: {
                load: function(store, records, successful) {
                    if(!successful){
                        Ext.ux.Toaster.msg(
                            'Error encountered',
                            store.getProxy().getReader().rawData.message.message,
                            Ext.ux.Constants.clsWarn,
                            Ext.ux.Constants.msgWarn
                        );
                    }  
                },
                update: function(store, records, success, options) {
                    store.sync({
                        success: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sUpdated_item'),
                                i18n('sItem_has_been_updated'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            );   
                        },
                        failure: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sProblems_updating_the_item'),
                                i18n('sItem_could_not_be_updated'),
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                        }
                    });
                },
                scope: this
            },
            autoLoad: false 
        });
        me.store.getProxy().setExtraParam('mesh_id',me.meshId);
        me.store.load();
        
        me.bbar = [{
            xtype       : 'pagingtoolbar',
            store       : me.store,
            displayInfo : true,
            plugins     : {
                'ux-progressbarpager': true
            }
        }];

        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});
        me.columns  = [
           // {xtype: 'rownumberer', stateId: 'StateGridMeshEntries1'},
            { text: i18n("sSSID"),                 dataIndex: 'name',          tdCls: 'gridMain', flex: 1, stateId: 'StateGridMeshEntries2'},
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
                stateId: 'StateGridMeshEntries3'
            },
            { text: 'Frequency',   dataIndex: 'frequency_band', tdCls: 'gridTree', flex: 1, stateId: 'sgMEnt4',
                xtype       :  'templatecolumn', 
                tpl         :  new Ext.XTemplate(
                    '<tpl if="frequency_band==\'both\'"><div class=\"fieldGreyWhite\"> 2.4G & 5.8G </div></tpl>',
                    '<tpl if="frequency_band==\'two\'"><div class=\"fieldGreyWhite\"> 2.4G </div></tpl>',
                    '<tpl if="frequency_band==\'five\'"><div class=\"fieldGreyWhite\"> 5.8G </div></tpl>',
                    '<tpl if="frequency_band==\'five_lower\'"><div class=\"fieldGreyWhite\"> 5G Lower Band </div></tpl>',
                    '<tpl if="frequency_band==\'five_upper\'"><div class=\"fieldGreyWhite\"> 5G Upper Band </div></tpl>',
                )     
            },
            { text: i18n("sHidden"),               dataIndex: 'hidden',        tdCls: 'gridTree', flex: 1, stateId: 'StateGridMeshEntries4',
                xtype       :  'templatecolumn', 
                tpl         :  new Ext.XTemplate(
                    '<tpl if="hidden"><div class=\"fieldGreen\"><i class="fa fa-check-circle"></i> Yes</div>',
                    '<tpl else>',
                    '<div class=\"fieldRed\"><i class="fa fa-times-circle"></i> No</div>',
                    "</tpl>"   
                )     
            },
            { text: i18n("sClient_isolation"),     dataIndex: 'isolate',       tdCls: 'gridTree', flex: 1, stateId: 'StateGridMeshEntries5',
                xtype       :  'templatecolumn', 
                tpl         :  new Ext.XTemplate(
                    '<tpl if="isolate"><div class=\"fieldGreen\"><i class="fa fa-check-circle"></i> Yes</div>',
                    '<tpl else>',
                    '<div class=\"fieldRed\"><i class="fa fa-times-circle"></i> No</div>',
                    "</tpl>"   
                )   
            },
            { text: i18n("sApply_to_all_nodes"),   dataIndex: 'apply_to_all',  tdCls: 'gridTree', flex: 1, stateId: 'StateGridMeshEntries6',
                xtype       :  'templatecolumn', 
                tpl         :  new Ext.XTemplate(
                    '<tpl if="apply_to_all"><div class=\"fieldGreen\"><i class="fa fa-check-circle"></i> Yes</div>',
                    '<tpl else>',
                    '<div class=\"fieldRed\"><i class="fa fa-times-circle"></i> No</div>',
                    "</tpl>"   
                )   
            },
            { 
                text        : i18n("sConnected_to_Exit"),   
                dataIndex   : 'connected_to_exit',  
                tdCls       : 'gridTree', 
                flex        : 1, 
                stateId     : 'StateGridMeshEntries7',
                renderer    : function (v, m, r) {
                    if(v == true){
                        return '<div class=\"fieldGreen\"><i class="fa fa-check-circle"></i> Yes</div>';
                    }
                    if(v == false){
                        m.tdAttr = 'data-qtip="<div><label class=\'lblTipItem\'>Go to Exit Points and connect this SSID to an Exit Point</label></div>"';
                        return '<div class=\"fieldRedWhite\"><i class="fa  fa-exclamation-circle"></i> No</div>';
                    }
                 
                }
            }
        ];
        me.callParent(arguments);
    }
});
