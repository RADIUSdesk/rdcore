
Ext.define('Rd.view.dynamicClients.gridUnknownDynamicClients' ,{
    extend		:'Ext.grid.Panel',
    alias 		: 'widget.gridUnknownDynamicClients',
    multiSelect	: true,
    stateful	: true,
    stateId		: 'StateGridUdc',
    stateEvents	:['groupclick','columnhide'],
    border		: false,
	store		: 'sUnknownDynamicClients',
    requires	: [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager'
    ],
    viewConfig  : {
        loadMask    :true
    },
    urlMenu     : '/cake3/rd_cake/unknown-dynamic-clients/menu_for_grid.json',
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
 		//	{xtype: 'rownumberer',stateId: 'StateGridUdc1'},
            { 
				text		: i18n('sNAS-Identifier'),      
				dataIndex	: 'nasidentifier',     
				tdCls		: 'gridTree', 
				flex		: 1,
				filter		: {type: 'string'},
				stateId		: 'StateGridUdc2'
			},
			{ 
				text		: 'Called-Station-Id',      
				dataIndex	: 'calledstationid',     
				tdCls		: 'gridTree', 
				flex		: 1,
				filter		: {type: 'string'},
				stateId		: 'StateGridUdc3'
			},
			{ 
                text        : 'Last Contact',   
                dataIndex   : 'last_contact',  
                tdCls       : 'gridTree', 
                flex        : 1,
                renderer    : function(v,metaData, record){
                    if(record.get('last_contact') == null){
                        return "<div class=\"fieldBlueWhite\">Never</div>";
                    }
                    var last_contact_human  = record.get('last_contact_human');
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
                },stateId: 'StateGridUdc4'
            },
			{ 

                text        : 'From IP', 
                dataIndex   : 'last_contact_ip',          
                tdCls       : 'gridTree', 
                flex        : 1,
                hidden      : false, 
                xtype       :  'templatecolumn', 
                tpl         :  new Ext.XTemplate(
                    '<div class=\"fieldGreyWhite\">{last_contact_ip}</div>',
                    "<tpl if='Ext.isEmpty(city)'><tpl else>",
                        '<div><b>{city}</b>  ({postal_code})</div>',
                    "</tpl>",
                    "<tpl if='Ext.isEmpty(country_name)'><tpl else>",
                        '<div><b>{country_name}</b> ({country_code})</div>',
                    "</tpl>"   
                ), 
                filter		: {type: 'string'},stateId: 'StateGridUdc5'
            }
        ];
        me.callParent(arguments);
    }
});
