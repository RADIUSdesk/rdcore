Ext.define('Rd.view.meshes.gridUnknownNodes' ,{
    extend		:'Ext.grid.Panel',
    alias 		: 'widget.gridUnknownNodes',
    multiSelect	: true,
    stateful	: true,
    stateId		: 'StateGridUnknownNodes',
    stateEvents	:['groupclick','columnhide'],
    border		: false,
    requires	: [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager'
    ],
    viewConfig: {
        loadMask:true
    },
    urlMenu     : '/cake3/rd_cake/unknown-nodes/menu-for-grid.json',
    plugins     : 'gridfilters',  //*We specify this
    initComponent: function(){
        var me      = this;
       
		me.store    = Ext.create(Rd.store.sUnknownNodes,{
            listeners: {
                load: function(store, records, successful) {
                    if(!successful){
                        Ext.ux.Toaster.msg(
                            i18n('sError_encountered'),
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
        
         me.bbar     =  [
            {
                 xtype       : 'pagingtoolbar',
                 store       : me.store,
                 displayInfo : true,
                 plugins     : {
                    'ux-progressbarpager': true
                }
            }  
        ];

		me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});
        me.columns  = [
 		//	{xtype: 'rownumberer',stateId: 'StateGridUnknownNodes1'},
 		/*	{ 
				text		: 'Descriptive Name',      	
				dataIndex	: 'name',          
				tdCls		: 'gridMain', 
				flex		: 1,
				filter		: {type: 'string'},
				stateId     : 'StateGridUNd2'
			},
			{ 
				text		: 'Firmware Key',      	
				dataIndex	: 'token_key',          
				tdCls		: 'gridMain', 
				flex		: 1,
				hidden		: true,
				filter		: {type: 'string'},
				stateId     : 'StateGridUNd3'
			},*/
            { 
				text		: 'MAC Address',      	
				dataIndex	: 'mac',          
				tdCls		: 'gridMain', 
				flex		: 1,
				filter		: {type: 'string'},
				stateId: 'StateGridUnknownNodes2'
			},
            { 
				text		: 'Vendor',      
				dataIndex	: 'vendor',     
				tdCls		: 'gridTree',
				hidden      : true, 
				flex		: 1,
				filter		: {type: 'string'},
				stateId		: 'StateGridUnknownNodes3'
			},
            { 
                text        : 'Last contact',   
                dataIndex   : 'last_contact',  
                tdCls       : 'gridTree', 
                flex        : 1,
                renderer    : function(v,metaData, record){
                    if(record.get('last_contact') == null){
                        return "<div class=\"fieldBlueWhite\">Never</div>";
                    }
                    var last_contact_human  = record.get('modified_in_words');
                    var green_flag          = false; //We show contact from the last seconds and minutes as geeen
                    if(
                        (last_contact_human.match(/just now/g))||
                        (last_contact_human.match(/minute/g))||
                        (last_contact_human.match(/second/g))
                    ){
                        green_flag = true;
                    }
                    if(green_flag){
                        return "<div class=\"fieldGreenWhite\">"+last_contact_human+"</div>";
                    }else{
                        return "<div class=\"fieldPurpleWhite\">"+last_contact_human+"</div>";
                    }          
                },stateId: 'StateGridUnknownNodes4'
            },
            { 

                text        : 'From IP', 
                dataIndex   : 'from_ip',          
                tdCls       : 'gridTree', 
                flex        : 1,
                hidden      : false, 
                xtype       :  'templatecolumn', 
                 tpl         :  new Ext.XTemplate(
                    '<div class=\"fieldGreyWhite\">{from_ip}</div>',
                    "<tpl if='Ext.isEmpty(city)'><tpl else>",
                        '<div><b>{city}</b>  ({postal_code})</div>',
                    "</tpl>",
                    "<tpl if='Ext.isEmpty(state_name)'><tpl else>",
                        '<div><b>{state_name}</b>  ({state_code})</div>',
                    "</tpl>",
                    "<tpl if='Ext.isEmpty(country_name)'><tpl else>",
                        '<div><b>{country_name}</b> ({country_code})</div>',
                    "</tpl>"   
                ), 
                filter		: {type: 'string'},stateId: 'StateGridUnknownNodes5'
            },
			{ 
                text    :   'Gateway',
                flex    : 1,
				hidden  : false, 
				tdCls   : 'gridTree',  
                xtype   :  'templatecolumn', 
                tpl:    new Ext.XTemplate(
                            "<tpl if='gateway == true'><div class=\"fieldGreenWhite\">"+i18n("sYes")+"</div></tpl>",
                            "<tpl if='gateway == false'><div class=\"fieldBlueWhite\">"+i18n("sNo")+"</div></tpl>"
                        ),
                dataIndex: 'gateway',
                filter  : {
                    type: 'boolean'    
                },stateId: 'StateGridUnknownNodes6'
            },
            { 
                text    : 'Redirect To',
                flex    : 1,
				hidden  : true,  
                xtype   : 'templatecolumn',
                tdCls   : 'gridTree', 
                tpl     : new Ext.XTemplate(
                    "<tpl if='new_server'>",
                        "<tpl if='new_server_status == \"awaiting\"'><div class=\"fieldBlueWhite\">{new_server_protocol}://{new_server}</div></tpl>",
                        "<tpl if='new_server_status == \"fetched\"'><div class=\"fieldGreenWhite\">{new_server_protocol}://{new_server}</div></tpl>",
                    "</tpl>"
                ),
                dataIndex: 'new_server',
                filter  : {
                    type: 'boolean'    
                },stateId: 'StateGridUnknownNodes7'
            },
            { 
                text    : 'Change Mode To',
                flex    : 1,
				hidden  : true,  
                xtype   : 'templatecolumn',
                tdCls   : 'gridTree', 
                tpl     : new Ext.XTemplate(
                    "<tpl if='new_mode'>",
                        "<tpl if='new_mode_status == \"awaiting\"'><div class=\"fieldBlueWhite\">{new_mode}</div></tpl>",
                        "<tpl if='new_mode_status == \"fetched\"'><div class=\"fieldGreenWhite\">{new_mode}</div></tpl>",
                    "</tpl>"
                ),
                dataIndex: 'new_mode',
                filter  : {
                    type: 'boolean'    
                },stateId: 'StateGridUnknownNodes8'
            },
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                width       : 80,
                stateId     : 'StateGridUnknownNodes9',
                items       : [					 
                    {  
                        iconCls : 'txtBlue x-fa fa-paperclip',
                        tooltip : 'Attach',
						handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'attach');
                        }
					},
					{ 
						iconCls : 'txtRed x-fa fa-trash',
						tooltip : 'Delete',
                        handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'delete');
                        }
                    },
					{  
                        iconCls : 'txtGrey x-fa fa-random',
                        tooltip : 'Redirect',
						handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'redirect');
                        }
					}
				]
	        }      
        ];
        me.callParent(arguments);
    }
});
