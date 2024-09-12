Ext.define('Rd.view.aps.gridAccessPointAps' ,{
    extend:'Ext.grid.Panel',
    alias : 'widget.gridAccessPointAps',
    multiSelect: true,
    stateful: true,
    stateId: 'StateGAPD',
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
    urlMenu: '/cake4/rd_cake/ap-profiles/menu_for_devices_grid.json',
    plugins     : 'gridfilters',  //*We specify this
    initComponent: function(){
        var me      = this;
        me.store    = Ext.create('Rd.store.sAps',{});
        me.store.getProxy().setExtraParam('ap_profile_id',me.apProfileId);
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
       //     {xtype: 'rownumberer',stateId: 'StateGAPD1'},
            { text: i18n("sName"),              dataIndex: 'name',           tdCls: 'gridMain', flex: 1,stateId: 'StateGAPD2', filter      : {type: 'string'}},
            { text: i18n("sDescription"),       dataIndex: 'description',    tdCls: 'gridTree', flex: 1,stateId: 'StateGAPD3', filter      : {type: 'string'}},
            { text: i18n("sMAC_address"),       dataIndex: 'mac',            tdCls: 'gridTree', flex: 1,stateId: 'StateGAPD4', filter      : {type: 'string'}},
            { 
				text		: i18n('sHardware'),    
				dataIndex	: 'hardware',     
				tdCls		: 'gridTree', 
				flex		: 1,
				filter		: {type: 'string'},
				xtype       :  'templatecolumn', 
                tpl         :  new Ext.XTemplate(
                    '{hardware}'
                ),
				stateId		: 'StateGAPD5'
			},
            { 
                text        : i18n("sLast_contact"),  
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
                },stateId: 'StateGAPD6'
            },     
            { 

                text        : i18n("sFrom_IP"), 
                dataIndex   : 'last_contact_from_ip',          
                tdCls       : 'gridTree', 
                width       : 170,
                xtype       :  'templatecolumn', 
                tpl         :  new Ext.XTemplate(
                    '<tpl if="Ext.isEmpty(last_contact_from_ip)"><div class=\"fieldGreyWhite\">Not Available</div>',
                    '<tpl else>',
                    '<div class=\"fieldGreyWhite\">{last_contact_from_ip}</div>',
                    "<tpl if='Ext.isEmpty(city)'><tpl else>",
                        '<div><b>{city}</b>  ({postal_code})</div>',
                    "</tpl>",
                    "<tpl if='Ext.isEmpty(country_name)'><tpl else>",
                        '<div><b>{country_name}</b> ({country_code})</div>',
                    "</tpl>",
                    "</tpl>"   
                ), 
                filter		: {type: 'string'},stateId: 'StateGAPD7'
            }
        ];
        me.callParent(arguments);
    }
});
