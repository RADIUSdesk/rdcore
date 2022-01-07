Ext.define('Rd.view.meshes.gridMeshExits' ,{
    extend:'Ext.grid.Panel',
    alias : 'widget.gridMeshExits',
    multiSelect: true,
    stateful: true,
    stateId: 'StateGridMeshExitsId',
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
    urlMenu: '/cake3/rd_cake/meshes/menu_for_exits_grid.json',
    initComponent: function(){
        var me      = this;
        me.store    = Ext.create(Rd.store.sMeshExits,{
            listeners: {
                load: function(store, records, successful) {
                    if(!successful){
                        Ext.ux.Toaster.msg(
                            'Error encountered',
                            store.getProxy().getReader().rawData.message.message,
                            Ext.ux.Constants.clsWarn,
                            Ext.ux.Constants.msgWarn
                        );
                        //console.log(store.getProxy().getReader().rawData.message.message);
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
          //  {xtype: 'rownumberer',stateId: 'StateGridMeshExitsId1'},
            { 
                text    : i18n('sType'),                 
                dataIndex: 'type',          
                tdCls   : 'gridTree', 
                flex    : 1,
                xtype   : 'templatecolumn', 
                tpl     : new Ext.XTemplate(
                    '<tpl if="type==\'bridge\'"><div class="fieldGreyWhite"><i class="fa fa-bars"></i> '+' '+'Bridge'+'</div></tpl>',
                    '<tpl if="type==\'captive_portal\'"><div class="fieldPurpleWhite"><i class="fa fa-key"></i> '+' '+'Captive Portal'+'</div></tpl>',
                    '<tpl if="type==\'nat\'"><div class="fieldGreenWhite"><i class="fa fa-arrows-alt"></i> '+' '+'NAT+DHCP'+'</div></tpl>',
                    '<tpl if="type==\'tagged_bridge\'"><div class="fieldBlueWhite"><i class="fa fa-tag"></i> '+' '+'Layer 2 Tagged Ethernet Bridge (&#8470; {vlan})'+'</div></tpl>',
                    '<tpl if="type==\'openvpn_bridge\'"><div class="fieldBlueWhite"><i class="fa fa-quote-right"></i> '+' '+'OpenVPN Bridge'+'</div></tpl>',
                    '<tpl if="type==\'tagged_bridge_l3\'"><div class="fieldBlue"><i class="fa fa-tag"></i> '+' '+'Layer 3 Tagged Ethernet Bridge (&#8470; {vlan})'+'</div></tpl>'
                ),        
                stateId: 'StateGridMeshExitsId3'
            },
            { 
                text    :   i18n('sConnects_with'),
                sortable: false,
                flex    : 1,  
                tdCls   : 'gridTree',
                xtype   :  'templatecolumn', 
                tpl:    new Ext.XTemplate(
                    '<tpl if="(Ext.isEmpty(connects_with)&&(type!=\'tagged_bridge_l3\'))"><div class=\"fieldRedWhite\"><i class="fa fa-exclamation-circle"></i> '+i18n('sNo_one')+'</div></tpl>', //Warn them when available     to all
                    '<tpl for="connects_with">',     // interrogate the realms property within the data
                        "<tpl><div class=\"fieldGreyWhite\">{name}</div></tpl>",
                    '</tpl>'
                ),
                dataIndex: 'connects_with',stateId: 'StateGridMeshExitsId4'
            },  
            { text: i18n('sAuto_detect'),          dataIndex: 'auto_detect',   tdCls: 'gridTree', flex: 1,stateId: 'StateGridMeshExitsId5',
                xtype       :  'templatecolumn', 
                tpl         :  new Ext.XTemplate(
                    '<tpl if="auto_detect"><div class=\"fieldGreen\"><i class="fa fa-check-circle"></i> Yes</div>',
                    '<tpl else>',
                    '<div class=\"fieldRed\"><i class="fa fa-times-circle"></i> No</div>',
                    "</tpl>"   
                )   
            }
        ];
        me.callParent(arguments);
    }
});
