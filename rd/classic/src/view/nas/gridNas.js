
Ext.define('Rd.view.nas.gridNas' ,{
    extend      : 'Ext.grid.Panel',
    alias       : 'widget.gridNas',
    store       : 'sNas',
    stateful    : true,
    multiSelect : true,
    stateId     : 'StateGridNas',
    stateEvents : ['groupclick','columnhide'],
    viewConfig  : {
        preserveScrollOnRefresh: true
    },
    border      : false,
    requires    : [
        'Rd.view.components.ajaxToolbar'
    ],
    urlMenu         : '/cake4/rd_cake/nas/menu-for-grid.json',
    urlRealmFilter  : '/cake4/rd_cake/realms/index-for-filter.json',
    plugins         : 'gridfilters',  //*We specify this
    initComponent: function(){
        var me      = this;         
         me.bbar    =  [
            {
                 xtype       : 'pagingtoolbar',
                 store       : me.store,
                 dock        : 'bottom',
                 displayInfo : true
            }  
        ];

        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});     
        me.columns  = [
            { text: i18n('sIP_Address'),    dataIndex: 'nasname',      tdCls: 'gridMain', flex: 1, filter: {type: 'string'},stateId: 'StateGridNas1'},
            { text: i18n('sName'),          dataIndex: 'shortname',    tdCls: 'gridMain', flex: 1, filter: {type: 'string'},stateId: 'StateGridNas2'},
            { text: i18n('sNAS-Identifier'),dataIndex: 'nasidentifier',tdCls: 'gridMain', flex: 1, filter: {type: 'string'}, hidden: false,stateId: 'StateGridNas3'},
             { 
                text        : 'System Wide',  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                                "<tpl if='for_system == true'><div class=\"fieldBlue\">"+i18n("sYes")+"</div></tpl>",
                                "<tpl if='for_system == false'><div class=\"fieldGrey\">"+i18n("sNo")+"</div></tpl>"
                            ),
                dataIndex   : 'for_system',
                filter      : {
                        type            : 'boolean',
                        defaultValue    : false,
                        yesText         : 'Yes',
                        noText          : 'No'
                }, stateId: 'StateGridNas4'
            },
            { 
                text:   i18n('sRealms'),
                sortable: false,
                flex: 1,  
                xtype:  'templatecolumn', 
                tpl:    new Ext.XTemplate(
                            '<tpl if="Ext.isEmpty(realms)"><div class=\"fieldBlueWhite\">Available to all!</div></tpl>', //Warn them when available     to all
                            '<tpl for="realms">',     // interrogate the realms property within the data
                                "<tpl if='other_cloud == true'><div class=\"fieldGrey\">{name}</div></tpl>",
                                "<tpl if='other_cloud == false'><div class=\"fieldGreen\">{name}</div></tpl>",
                            '</tpl>'
                        ),
                dataIndex: 'realms',
                stateId: 'StateGridNas5'
            },
            { 
                text        : i18n("sStatus"),   
                dataIndex   : 'status',  
                flex        : 1,
                renderer    : function(value,metaData, record){
                    if(value != 'unknown'){                    
                        var online      = record.get('status_time');
                        if(value == 'up'){
                            return "<div class=\"fieldGreen\">"+i18n("sUp")+" "+Ext.ux.secondsToHuman(online)+"</div>";
                        }
                        if(value == 'down'){
                            return "<div class=\"fieldRed\">"+i18n("sDown")+" "+Ext.ux.secondsToHuman(online)+"</div>";
                        }

                    }else{
                        return "<div class=\"fieldBlue\">"+i18n("sUnknown")+"</div>";
                    }              
                },stateId: 'StateGridNas6'
            }   
        ];

        me.callParent(arguments);
    }
});
