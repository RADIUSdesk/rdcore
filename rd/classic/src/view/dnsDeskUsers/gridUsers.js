Ext.define('Rd.view.dnsDeskUsers.gridUsers' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridUsers',
    multiSelect : true,
    stateful    : true,
    stateId     : 'StateGridF',
    stateEvents :['groupclick','columnhide'],
    border      : false,
    requires    : [
        'Rd.view.components.ajaxToolbar'
    ],
    viewConfig: {
        loadMask    :true
    },
    urlMenu     : '/cake3/rd_cake/dns-desk-users/menu-for-grid.json',
    plugins     : [
        'gridfilters',
        {
            ptype: 'rowexpander',
            rowBodyTpl : new Ext.XTemplate(
                '<div style="color:grey;  background-color:white; padding:5px;">',
                    '<h2>{name}</h2>',
                    '{description}',
                    '<ul class="fa-ul">',
                        "<tpl if='enableFilter'>",
                            "<li style='color:green;'><i class='fa-li fa fa-check-circle'></i>Enabled</li>",
                        '<tpl else>',
                            "<li style='color:red;'><i class='fa-li fa fa-times-circle'></i>Not Enabled</li>",
                        '</tpl>',
                        "<tpl if='blockAll'>",
                            "<li style='color:blue;'><i class='fa-li fa fa-check-circle'></i>Block Everything</li>",
                        '<tpl else>',
                            "<li style='color:grey;'><i class='fa-li fa fa-times-circle'></i>Don't Block Everything</li>",
                        '</tpl>',
                         "<tpl if='blockUnclass'>",
                            "<li style='color:blue;'><i class='fa-li fa fa-check-circle'></i>Block Unclassified Domains</li>",
                        '<tpl else>',
                            "<li style='color:grey;'><i class='fa-li fa fa-times-circle'></i>Don't Block Unclassified Domains</li>",
                        '</tpl>',
                    '</ul>',
                '</div>',
                '<div class="sectionHeader">',
                    '<h2>FILTERED CATEGORIES</h2>',
                '</div>',
                "<div style='background-color:#F3F3F3; padding:10px;  border-style: solid; border-color: black; border-width: 1px;'>",
                    '<tpl for="blockCategoryList">',
                        '<div class="{[xindex % 2 === 0 ? "even" : "odd"]} box">',
                            "<tpl if='checkFlag'>",
                                "<label class='lblValue txtGreen'><i class='fa fa-check-circle'></i> {#}. {name}</label> <small><br><i>{description}</i></small>",
                             '<tpl else>',
                                "<label class='lblValue txtGrey'><i class='fa fa-times-circle'></i> {#}. {name}</label> <small><br><i>{description}</i></small>",
                            '</tpl>',
                        '</div>',
                    '</tpl>',    
                "</div>"
            )
        }
    ],
    initComponent: function(){
        var me      = this; 
        me.store    = Ext.create(Rd.store.sDnsDeskUsers);
        me.store.getProxy().setExtraParam('operator_id',me.operatorId);
        me.store.getProxy().setExtraParam('operator_name',me.operatorName);
        me.store.load();
        
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
            {xtype: 'rownumberer',stateId: 'StateGridF1'},
            { text: i18n('sName'),         dataIndex: 'name',       tdCls: 'gridMain', flex: 1,filter: {type: 'string'},stateId: 'StateGridF3'},
            { text: i18n('sDescription'),  dataIndex: 'description',tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridF4'}
        ];      
        me.callParent(arguments);
    }
});
