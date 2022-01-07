Ext.define('Rd.view.hardwareOwners.gridHardwareOwners' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridHardwareOwners',
    multiSelect : true,
    store       : 'sHardwareOwners',
    stateful    : true,
    stateId     : 'StateGridHwO',
    stateEvents :['groupclick','columnhide'],
    border      : false,
    controller  : 'vcGridHardwareOwners',
    requires    : [
        'Rd.view.components.ajaxToolbar',
        'Rd.view.hardwareOwners.vcGridHardwareOwners',
        'Rd.view.hardwareOwners.winHardwareOwnerAddWizard',
        'Rd.view.hardwareOwners.winHardwareOwnerDelete'
    ],
    viewConfig  : {
        loadMask:true
    },
    urlMenu     : '/cake3/rd_cake/hardware-owners/menu_for_grid.json',
    plugins     : 'gridfilters',  //*We specify this
    initComponent: function(){
        var me      = this;     
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
        
        var status = Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data : [
                {"id": "awaiting-check-in",     "text": "Awaiting Check-In"},
                {"id": "checked-in", 		    "text": "Checked-In"},
				{"id": "awaiting-check-out",    "text": "Awaiting Check-Out"},
				{"id": "checked-out",           "text": "Checked-Out"}
            ]
        });
        
        
        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});
        me.columns  = [
            { text: i18n('sOwner'),        dataIndex: 'owner', tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridHwO2',
                hidden: true
            },
            { text: 'Description',   dataIndex: 'description',  tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridHwO3'},
            { text: 'MAC Address',   dataIndex: 'name',         tdCls: 'gridMain', flex: 1,filter: {type: 'string'},stateId: 'StateGridHwO4'},
            { text: 'Hardware',      dataIndex: 'hardware',     tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridHwO5'},
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
                },stateId: 'StateGridHwO6'
            },
            { 
                text    : 'Status',
                flex    : 1,  
                xtype   : 'templatecolumn', 
                tpl     : new Ext.XTemplate(
                    "<tpl if='status == \"awaiting-check-in\"'><div class=\"fieldBlue\"><i class='fa fa-clock'></i> "+"Awaiting Check-In"+"</div></tpl>",
                    "<tpl if='status == \"checked-in\"'><div class=\"fieldGreen\"><i class='fa fa-check'></i> "+"Checked-In"+"</div>",
                    "<div>{modified_in_words}</div>",
                    "</tpl>",
                    "<tpl if='status == \"awaiting-check-out\"'><div class=\"fieldGrey\"><i class='fa fa-clock'></i> "+"Awaiting Check-Out"+"</div>",
                    "<div>{modified_in_words}</div>",
                    "</tpl>",
                    "<tpl if='status == \"checked-out\"'><div class=\"fieldGrey\"><i class='fa fa-check'></i> "+"Checked-Out"+"</div>",
                    "<div>{modified_in_words}</div>",
                    "</tpl>",
                ),
                dataIndex : 'status',
                filter      : {
                    type    : 'list',
                    store   : status
                },
                stateId: 'StateGridHwO7'
            }
        ];           
        me.callParent(arguments);
    }
});
