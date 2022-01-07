
Ext.define('Rd.view.nas.gridNas' ,{
    extend:'Ext.grid.Panel',
    alias : 'widget.gridNas',
    store : 'sNas',
    stateful: true,
    multiSelect: true,
    stateId: 'StateGridNas',
    stateEvents:['groupclick','columnhide'],
    viewConfig: {
        preserveScrollOnRefresh: true
    },
    border: false,
    requires: [
        'Rd.view.components.ajaxToolbar'
    ],
    urlMenu:        '/cake3/rd_cake/nas/menu_for_grid.json',
    urlTagFilter:   '/cake3/rd_cake/tags/index-for-filter.json',
    urlRealmFilter: '/cake3/rd_cake/realms/index-for-filter.json',
    plugins     : 'gridfilters',  //*We specify this
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

        //Unfortunately the ListMenu filter is still buggy when loading it from a store, so we have to give it a manual list taken form a store:
        //http://www.sencha.com/forum/showthread.php?132914-ux.grid.filter.ListFilter-doesn-t-fire-load-on-associated-Store
        //http://stackoverflow.com/questions/6004386/extjs-grid-filters-how-can-i-load-list-filter-options-from-external-json
        
        var sConnType = Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data : [
                {"id":"direct",     "text": "Direct"},
                {"id":"openvpn", 	"text": "OpenVPN"},
				{"id":"pptp",       "text": "PPTP"},
				{"id":"dynamic",    "text": "Dynamic"}
            ]
        });
        
        options: ['direct', 'openvpn', 'pptp', 'dynamic']

        var sTags = Ext.create(Ext.data.Store,{
            model: 'Rd.model.mGenericList',
            extend: 'Ext.data.Store',
            proxy: {
                type    : 'ajax',
                format  : 'json',
                batchActions: true, 
                url     : me.urlTagFilter,
                reader: {
                    keepRawData     : true,
                    type: 'json',
                    rootProperty: 'items',
                    messageProperty: 'message'
                }
            },
            autoLoad: true
        });

        var sRealms = Ext.create(Ext.data.Store,{
            model: 'Rd.model.mGenericList',
            extend: 'Ext.data.Store',
            proxy: {
                type    : 'ajax',
                format  : 'json',
                batchActions: true, 
                url     : me.urlRealmFilter,
                reader: {
                    type: 'json',
                    keepRawData     : true,
                    rootProperty: 'items',
                    messageProperty: 'message'
                }
            },
            autoLoad: true
        });
        
        me.columns = [
            {xtype: 'rownumberer' ,stateId: 'StateGridNas1'},
            { text: i18n('sOwner'),         dataIndex: 'owner',        tdCls: 'gridTree', flex: 1, filter: {type: 'string'},stateId: 'StateGridNas2',
                hidden: true
            },
            { text: i18n('sIP_Address'),    dataIndex: 'nasname',      tdCls: 'gridMain', flex: 1, filter: {type: 'string'},stateId: 'StateGridNas3'},
            { text: i18n('sName'),          dataIndex: 'shortname',    tdCls: 'gridMain', flex: 1, filter: {type: 'string'},stateId: 'StateGridNas4'},
            { text: i18n('sNAS-Identifier'),dataIndex: 'nasidentifier',tdCls: 'gridMain', flex: 1, filter: {type: 'string'}, hidden: false,stateId: 'StateGridNas5'},
            { 
                text        : i18n('sConnection_type'), 
                dataIndex   : 'connection_type',        
                tdCls       :  'gridTree', 
                flex        : 1,
                hidden      : true,
                filter      : {
                    type    : 'list',
                    store   : sConnType
                },stateId: 'StateGridNas6'
            },
            { 
                text    : i18n('sAvailable_to_sub_providers'),
                flex    : 1,  
                xtype   : 'templatecolumn', 
                tpl     : new Ext.XTemplate(
                            "<tpl if='available_to_siblings == true'><div class=\"fieldGreen\">"+i18n('sYes')+"</div></tpl>",
                            "<tpl if='available_to_siblings == false'><div class=\"fieldRed\">"+i18n('sNo')+"</div></tpl>"
                        ),
                dataIndex: 'available_to_siblings',
                filter      : {
                        type    : 'boolean',
                        defaultValue   : false,
                        yesText : 'Yes',
                        noText  : 'No'
                },stateId: 'StateGridNas7'
            },
            { 
                text:   i18n('sRealms'),
                sortable: false,
                flex: 1,  
                xtype:  'templatecolumn', 
                tpl:    new Ext.XTemplate(
                            '<tpl if="Ext.isEmpty(realms)"><div class=\"fieldBlueWhite\">Available to all!</div></tpl>', //Warn them when available     to all
                            '<tpl for="realms">',     // interrogate the realms property within the data
                                "<tpl if='available_to_siblings == true'><div class=\"fieldGreen\">{name}</div></tpl>",
                                "<tpl if='available_to_siblings == false'><div class=\"fieldRed\">{name}</div></tpl>",
                            '</tpl>'
                        ),
                dataIndex: 'realms',
                filter: {
                            type: 'list',
                            store: sRealms
                        },stateId: 'StateGridNas8'
            },  
            { 
                text        :   i18n('sTags'),
                sortable    : false,
                flex        : 1,
                hidden      : true,  
                xtype       :  'templatecolumn', 
                tpl         :    new Ext.XTemplate(
                    '<tpl if="Ext.isEmpty(tags)"><div"></div></tpl>', //Warn them when available to all
                    '<tpl for="tags">',     // interrogate the realms property within the data
                        "<tpl if='available_to_siblings == true'><div class=\"fieldGreen\">{name}</div></tpl>",
                        "<tpl if='available_to_siblings == false'><div class=\"fieldRed\">{name}</div></tpl>",
                    '</tpl>'
                ),
                dataIndex   : 'tags',
                filter      : {
                    type    : 'list',
                    store   : sTags
                },
                stateId     : 'StateGridNas9'
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
                },stateId: 'StateGridNas10'
            },
            { 
                text    : i18n('sNotes'),
                sortable: false,
                width   : 130,
                xtype   : 'templatecolumn', 
                tpl     : new Ext.XTemplate(
                                "<tpl if='notes == true'><span class=\"fa fa-thumb-tack fa-lg txtGreen\"></tpl>"
                ),
                dataIndex: 'notes',stateId: 'StateGridNas11'
            }     
        ];

        me.callParent(arguments);
    }
});
