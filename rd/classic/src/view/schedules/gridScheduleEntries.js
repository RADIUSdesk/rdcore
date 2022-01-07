Ext.define('Rd.view.schedules.gridScheduleEntries' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridScheduleEntries',
    multiSelect : true,
    stateful    : true,
    stateId     : 'SSE',
    stateEvents : ['groupclick','columnhide'],
    border      : false,
    requires    : [
        'Rd.view.components.ajaxToolbar'
    ],
    viewConfig  : {
        loadMask    :true
    },
    urlMenu     : '/cake3/rd_cake/schedules/menu-for-schedule-entries.json',
    initComponent: function(){
        var me          = this;
        var schedule_id = me.record.getId();
        
        
        me.columns      = [
            {xtype: 'rownumberer',stateId: 'SSE1'},
            {
                text: 'Everyday', dataIndex: 'every_day',tdCls: 'gridTree', flex: 1,stateId: 'SSE2',
                xtype   : 'templatecolumn',
                hidden  : true, 
                tpl     : new Ext.XTemplate(
                    "<tpl if='every_day == true'><div class=\"fieldGreen\">"+i18n("sYes")+"</div></tpl>",
                    "<tpl if='every_day == false'><div class=\"fieldRed\">"+i18n("sNo")+"</div></tpl>"
                )
            },
            {
                text: 'Monday', dataIndex: 'monday',tdCls: 'gridTree', flex: 1,stateId: 'SSE3',
                xtype   : 'templatecolumn',
                tpl     : new Ext.XTemplate(
                    "<tpl if='every_day == false'>",
                        "<tpl if='monday == true'><div class=\"fieldGreen\">"+i18n("sYes")+"</div></tpl>",
                        "<tpl if='monday == false'><div class=\"fieldRed\">"+i18n("sNo")+"</div></tpl>",
                    "</tpl>",
                    "<tpl if='every_day == true'><div class=\"fieldGreen\">"+i18n("sYes")+"</div></tpl>"   
                )
            },
            {
                text: 'Tuesday', dataIndex: 'tuesday',tdCls: 'gridTree', flex: 1,stateId: 'SSE4',
                xtype   : 'templatecolumn',
                tpl     : new Ext.XTemplate(
                    "<tpl if='every_day == false'>",
                        "<tpl if='tuesday == true'><div class=\"fieldGreen\">"+i18n("sYes")+"</div></tpl>",
                        "<tpl if='tuesday == false'><div class=\"fieldRed\">"+i18n("sNo")+"</div></tpl>",
                    "</tpl>",
                    "<tpl if='every_day == true'><div class=\"fieldGreen\">"+i18n("sYes")+"</div></tpl>"   
                )
            },
            {
                text: 'Wednesday', dataIndex: 'wednesday',tdCls: 'gridTree', flex: 1,stateId: 'SSE5',
                xtype   : 'templatecolumn',
                tpl     : new Ext.XTemplate(
                    "<tpl if='every_day == false'>",
                        "<tpl if='wednesday == true'><div class=\"fieldGreen\">"+i18n("sYes")+"</div></tpl>",
                        "<tpl if='wednesday == false'><div class=\"fieldRed\">"+i18n("sNo")+"</div></tpl>",
                    "</tpl>",
                    "<tpl if='every_day == true'><div class=\"fieldGreen\">"+i18n("sYes")+"</div></tpl>"  
                )
            },
            {
                text: 'Thursday', dataIndex: 'thursday',tdCls: 'gridTree', flex: 1,stateId: 'SSE6',
                xtype   : 'templatecolumn',
                tpl     : new Ext.XTemplate(
                    "<tpl if='every_day == false'>",
                        "<tpl if='thursday == true'><div class=\"fieldGreen\">"+i18n("sYes")+"</div></tpl>",
                        "<tpl if='thursday == false'><div class=\"fieldRed\">"+i18n("sNo")+"</div></tpl>",
                    "</tpl>",
                    "<tpl if='every_day == true'><div class=\"fieldGreen\">"+i18n("sYes")+"</div></tpl>"  
                )
            },
            {
                text: 'Friday', dataIndex: 'friday',tdCls: 'gridTree', flex: 1,stateId: 'SSE7',
                xtype   : 'templatecolumn',
                tpl     : new Ext.XTemplate(
                    "<tpl if='every_day == false'>",
                        "<tpl if='friday == true'><div class=\"fieldGreen\">"+i18n("sYes")+"</div></tpl>",
                        "<tpl if='friday == false'><div class=\"fieldRed\">"+i18n("sNo")+"</div></tpl>",
                    "</tpl>",
                    "<tpl if='every_day == true'><div class=\"fieldGreen\">"+i18n("sYes")+"</div></tpl>"  
                )
            },   
            {
                text: 'Saturday', dataIndex: 'saturday',tdCls: 'gridTree', flex: 1,stateId: 'SSE8',
                xtype   : 'templatecolumn',
                tpl     : new Ext.XTemplate(
                    "<tpl if='every_day == false'>",
                        "<tpl if='saturday == true'><div class=\"fieldGreen\">"+i18n("sYes")+"</div></tpl>",
                        "<tpl if='saturday == false'><div class=\"fieldRed\">"+i18n("sNo")+"</div></tpl>",
                    "</tpl>",
                    "<tpl if='every_day == true'><div class=\"fieldGreen\">"+i18n("sYes")+"</div></tpl>"  
                )
            },
            {
                text: 'Sunday', dataIndex: 'sunday',tdCls: 'gridTree', flex: 1,stateId: 'SSE9',
                xtype   : 'templatecolumn',
                tpl     : new Ext.XTemplate(
                    "<tpl if='every_day == false'>",
                        "<tpl if='sunday == true'><div class=\"fieldGreen\">"+i18n("sYes")+"</div></tpl>",
                        "<tpl if='sunday == false'><div class=\"fieldRed\">"+i18n("sNo")+"</div></tpl>",
                    "</tpl>",
                    "<tpl if='every_day == true'><div class=\"fieldGreen\">"+i18n("sYes")+"</div></tpl>" 
                )
            },
            { 
                text        : 'Start',   
                dataIndex   : 'start',  
                tdCls       : 'gridTree',
                flex        : 1,
                renderer    : function(value,metaData, record){
                	var always = record.get('always');
                    if(always){
                        return "<div class=\"fieldGreen\"> (ALWAYS) </div>";
                    }else{
                        return "<div class=\"fieldBlue\"> "+me.convertMinutesToTime(value)+"</div>";
                    }  	             
                },
                stateId     : 'SSE10'
            },
            { 
                text        : 'Stop',   
                dataIndex   : 'stop',  
                tdCls       : 'gridTree',
                flex        : 1,
                renderer    : function(value,metaData, record){
                	var always = record.get('always');
                    if(always){
                        return "<div class=\"fieldGreen\"> (ALWAYS) </div>";
                    }else{
                        return "<div class=\"fieldBlue\"> "+me.convertMinutesToTime(value)+"</div>";
                    }  	             
                },
                stateId     : 'SSE11'
            }       
        ];
        
        
            
        me.tbar         = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});
        //Create a store specific to this Permanent User
        me.store = Ext.create(Ext.data.Store,{
            model   : 'Rd.model.mScheduleEntry',
            proxy   : {
                type        : 'ajax',
                format      : 'json',
                batchActions: true, 
                url         : '/cake3/rd_cake/schedules/index-schedule-entry.json',
                extraParams : { 'schedule_id' : schedule_id },
                reader: {
                    type            : 'json',
                    rootProperty    : 'items',
                    messageProperty : 'message'
                },
                simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
            },
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
                scope: this
            },
            autoLoad: false    
        });
        
        me.bbar     =  [
            {
                xtype       : 'pagingtoolbar',
                store       : me.store,
                dock        : 'bottom',
                displayInfo : true
            }  
        ];    
       
        me.callParent(arguments);
    },
    convertMinutesToTime: function(newValue){
        var m       = newValue % 60;
        var h       = (newValue-m)/60;
        var hrs_mins= h.toString() + ":" + (m<10?"0":"") + m.toString();
        return hrs_mins;
    }
});
