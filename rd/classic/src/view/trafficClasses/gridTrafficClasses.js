Ext.define('Rd.view.trafficClasses.gridTrafficClasses' ,{
    extend      : 'Ext.grid.Panel',
    alias       : 'widget.gridTrafficClasses',
    multiSelect : true,
    store       : 'sTrafficClasses',
    stateful    : true,
    stateId     : 'StateGridTrafficClasses',
    stateEvents : ['groupclick','columnhide'],
    border      : false,
    requires    : [
        'Rd.view.components.ajaxToolbar'
    ],
    viewConfig: {
        loadMask:true,
		enableTextSelection: true
    },
    urlMenu: '/cake3/rd_cake/traffic-classes/menu_for_grid.json',
    plugins     : [
        'gridfilters',
        {
            ptype: 'rowexpander',
            rowBodyTpl : new Ext.XTemplate(      
                '<div class="sectionHeader">',
                    '<h2>Traffic Class Config File Content</h2>',
                '</div>',
                "<div style='background-color:white; padding:5px;'>",
                    "{content_html}",
                "</div>"
            )
        }
    ],
    initComponent: function(){
        var me      = this;
        
        me.bbar     =  [
            {
                 xtype       : 'pagingtoolbar',
                 store       : me.store,
                 dock        : 'bottom',
                 displayInfo : true,
                 plugins     : {
                    'ux-progressbarpager': true
                }
            }  
        ];
        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});

        me.columns  = [
          //  {xtype: 'rownumberer',stateId: 'StateGridTrafficClasses1'},
            { text: i18n('sOwner'),        dataIndex: 'owner', tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridTrafficClasses2',
                hidden: true
            },
            { text: i18n('sName'),         dataIndex: 'name', tdCls: 'gridMain', flex: 1,filter: {type: 'string'},stateId: 'StateGridTrafficClasses3'},
            { text: i18n('sDescription'),  dataIndex: 'description',  tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridTrafficClasses4'},
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
                },stateId: 'StateGridTrafficClasses5',
                tdCls: 'gridTree'
            }
        ];
           
        me.callParent(arguments);
    }
});
