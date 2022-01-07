Ext.define('Rd.view.hardwares.gridHardwares' ,{
    extend:'Ext.grid.Panel',
    alias : 'widget.gridHardwares',
    multiSelect: true,
    store : 'sHardwares',
    stateful: true,
    stateId: 'StateGridHardwares',
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
    urlMenu: '/cake3/rd_cake/hardwares/menu_for_grid.json',
    plugins     : 'gridfilters',  //*We specify this
    initComponent: function(){
        var me  = this;
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
          //  {xtype: 'rownumberer',stateId: 'StateGridFK1'},
            { text: i18n('sOwner'),        dataIndex: 'owner', tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridFK2',
                hidden      : true
            },
            { text: i18n('sName'),         dataIndex: 'name',   tdCls: 'gridMain', flex: 1,filter: {type: 'string'},stateId: 'StateGridFK3'},
            { text: 'Vendor',              dataIndex: 'vendor', flex: 1,filter: {type: 'string'},stateId: 'StateGridFK3A'},
            { text: 'Model',               dataIndex: 'model',  flex: 1,filter: {type: 'string'},stateId: 'StateGridFK3B'},
            { text: 'Firmware ID',         dataIndex: 'fw_id',  flex: 1,filter: {type: 'string'},stateId: 'StateGridFK3C',hidden: true},
            { text: 'Radio Count',         dataIndex: 'radio_count',  flex: 1,filter: {type: 'string'},stateId: 'StateGridFK3D'},
            { 
                text:   i18n('sAvailable_to_sub_providers'),
                flex: 1,  
                xtype:  'templatecolumn', 
                tpl:    new Ext.XTemplate(
                            "<tpl if='available_to_siblings == true'><div class=\"fieldGreen\">"+i18n("sYes")+"</div></tpl>",
                            "<tpl if='available_to_siblings == false'><div class=\"fieldRed\">"+i18n("sNo")+"</div></tpl>"
                        ),
                dataIndex: 'available_to_siblings',
                filter      : {
                    type    : 'boolean',
                    defaultValue   : false,
                    yesText : 'Yes',
                    noText  : 'No'
                },stateId: 'StateGridFK4'
            },
            { 
                text        : 'For Mesh',  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                                "<tpl if='for_mesh == true'><div class=\"fieldGreen\"><i class=\"fa fa-check-circle\"></i> "+i18n("sYes")+"</div></tpl>",
                                "<tpl if='for_mesh == false'><div class=\"fieldRed\"><i class=\"fa fa-times-circle\"></i> "+i18n("sNo")+"</div></tpl>"
                            ),
                dataIndex   : 'for_mesh',
                filter      : {
                        type            : 'boolean',
                        defaultValue    : false,
                        yesText         : 'Yes',
                        noText          : 'No'
                }, stateId: 'StateGridFK5'
            },
            { 
                text        : 'For AP',  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                                "<tpl if='for_ap == true'><div class=\"fieldGreen\"><i class=\"fa fa-check-circle\"></i> "+i18n("sYes")+"</div></tpl>",
                                "<tpl if='for_ap == false'><div class=\"fieldRed\"><i class=\"fa fa-times-circle\"></i> "+i18n("sNo")+"</div></tpl>"
                            ),
                dataIndex   : 'for_ap',
                filter      : {
                        type            : 'boolean',
                        defaultValue    : false,
                        yesText         : 'Yes',
                        noText          : 'No'
                }, stateId: 'StateGridFK5A'
            },
            { 
                text        : 'Created',
                dataIndex   : 'created', 
                hidden      : false,  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{created_in_words}</div>"
                ),
                stateId		: 'StateGridFK6',
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                flex        : 1
            },  
            { 
                text        : 'Modified',
                dataIndex   : 'modified', 
                hidden      : true, 
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{modified_in_words}</div>"
                ),
                flex        : 1,
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                stateId		: 'StateGridFK7'
            }
        ];        
        me.callParent(arguments);
    }
});
