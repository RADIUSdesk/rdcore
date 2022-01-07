Ext.define('Rd.view.registrationRequests.gridRegistrationRequests' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridRegistrationRequests',
    multiSelect : true,
    store       : 'sRegistrationRequests',
    stateful    : true,
    stateId     : 'StateGridRegistrationRequests',
    stateEvents :['groupclick','columnhide'],
    border      : false,
    requires    : [
        'Rd.view.components.ajaxToolbar',
		'Rd.view.registrationRequests.vcRegistrationRequests'
    ],
    viewConfig: {
        loadMask:true
    },
	controller  : 'vcRegistrationRequests',

    urlMenu: '/cake3/rd_cake/registration-requests/menu_for_grid.json',
    plugins     : 'gridfilters',  //*We specify this
    initComponent: function(){
        var me      = this;
        var state = Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data : [
                {"id":"not_allocated",  "text": "Not Allocated"},
                {"id":"allocated", 		"text": "Allocated"},
				{"id":"email_sent",     "text": "Email Sent"},
				{"id":"regstation_completed",    "text": "Registration Completed"},
				{"id":"expired",        "text": "Expired"},
            ]
        });
        
        me.bbar     =  [
            {
                 xtype       : 'pagingtoolbar',
                 store       : me.store,
                 dock        : 'bottom',
                 displayInfo : true
            }  
        ];
        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});

        me.columns  = [
            { text: i18n('sOwner'),        dataIndex: 'owner', tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridRR1',
                hidden: true
            },
            { text: 'Email',    dataIndex: 'email',  tdCls: 'gridMain', flex: 1,filter: {type: 'string'},stateId: 'StateGridRR2'},
            {
                text: 'Code',   dataIndex: 'registration_code',  tdCls: 'gridTree', flex: 1, stateId: 'StateGridRR2a'
            },
            { 
                text        : 'State',
                flex        : 1,  
                tdCls       : 'gridTree',
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                                "<tpl if='state == \"not_allocated\"'><div class=\"fieldBlue\">Code Not Allocated</div></tpl>",
                                "<tpl if='state == \"allocated\"'><div class=\"fieldGrey\">Code Allocated</div></tpl>",
                                "<tpl if='state == \"email_sent\"'><div class=\"fieldGrey\">Email Sent</div></tpl>",
                                "<tpl if='state == \"verified\"'><div class=\"fieldGrey\">Verified</div></tpl>",
                                "<tpl if='state == \"registration_completed\"'><div class=\"fieldGreen\">Registration Completed</div></tpl>",
                                "<tpl if='state == \"expired\"'><div class=\"fieldGreen\">Expired</div></tpl>"
                ),
                dataIndex   : 'state',
                filter      : {
                                type    : 'list',
                                store   : state
                              },stateId: 'StateGridRR3'
            },
            { 
                text        : 'Created',
                dataIndex   : 'created', 
                tdCls       : 'gridTree',
                hidden      : false,  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{created_in_words}</div>"
                ),
                stateId		: 'StateGridRR4',
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                flex        : 1
            },
            { 
                text        : 'Email Sent',
                dataIndex   : 'email_sent', 
                tdCls       : 'gridTree',
                hidden      : false,  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    '<tpl if="Ext.isEmpty(email_sent)"><div class=\"fieldGrey\">Not Sent Yet</div>',
                    '<tpl else><div class=\"fieldGreen\">{email_sent_in_words}</div></tpl>' 
                ),
                stateId		: 'StateGridRR4a',
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                flex        : 1
            }, 
            { 
                text        : 'Expires',
                dataIndex   : 'expire', 
                tdCls       : 'gridTree',
                hidden      : true,  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<tpl if='expire_flag == true'><div class=\"fieldRed\">{expire_in_words}</div></tpl>",
                    "<tpl if='expire_flag == false'><div class=\"fieldGreen\">{expire_in_words}</div></tpl>"
                ),
                stateId		: 'StateGridRR4b',
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                flex        : 1
            },   
            { 
                text        : 'Modified',
                dataIndex   : 'modified', 
                tdCls       : 'gridTree',
                hidden      : true, 
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{modified_in_words}</div>"
                ),
                flex        : 1,
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                stateId		: 'StateGridRR5'
            },
            {
                xtype       :'actioncolumn',
                text        : 'Actions',
                width       :100,
                items       : [
					{
						iconCls : 'txtBlack x-fa fa-qrcode',
						tooltip : 'Get Code',
						handler	: 'onRowCodeClick'
					 },{
						iconCls : 'txtBlack x-fa fa-envelope-open', 
						tooltip : 'Send Email',
						handler	: 'onRowEmailClick'
					 },{
						iconCls : 'txtBlue x-fa fa-pen',
						tooltip : 'Edit',
						handler	: 'onRowEditClick'
					 },{
						iconCls : 'txtRed x-fa fa-trash',
						tooltip : 'Delete',
						handler	: 'onRowDeleteClick'
					}
				]
            }        
        ];
           
        me.callParent(arguments);
    }
});
