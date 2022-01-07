Ext.define('Rd.view.accessProviders.treeApUserRights' ,{
    extend      :'Ext.tree.Panel',
    requires    : ['Rd.view.components.advCheckColumn'],
    useArrows   : true,
    alias       : 'widget.treeApUserRights',
    rootVisible : true,
    rowLines    : true,
    stripeRows  : true,
    border      : false,
    ap_id       :  null,
    columns: [{
            xtype   : 'treecolumn', //this is so we know which column will show the tree
            text    : i18n('sName'),
            sortable: true,
            dataIndex: 'alias',
            tdCls   : 'gridTree',
            width   : 300
        },
        {
            xtype: 'advCheckColumn',
            text: i18n('sAllow'),
            dataIndex: 'allowed',
            renderer: function(value, meta, record) {
                var cssPrefix = Ext.baseCSSPrefix,
                cls = [cssPrefix + 'grid-checkheader'],
                disabled = true;

                if(record.isLeaf()){
                    disabled = false;// logic to disable checkbox e.g.: !can_be_checked
                }

                if (value && disabled) {
                    cls.push(cssPrefix + 'grid-checkheader-checked-disabled');
                } else if (value) {
                    cls.push(cssPrefix + 'grid-checkheader-checked');
                } else if (disabled) {
                    cls.push(cssPrefix + 'grid-checkheader-disabled');
                }
                return '<div class="' + cls.join(' ') + '">&#160;</div>';
            }
        },
        { 
            text        : 'Default Group Right',  
            xtype       : 'templatecolumn', 
            width       : '120',
            dataIndex   : 'group_right',
            tpl:    new Ext.XTemplate(
                        "<tpl if='group_right == \"yes\"'><div class=\"fieldGreen\">"+i18n("sYes")+"</div></tpl>",
                        "<tpl if='group_right == \"no\"'><div class=\"fieldRed\">"+i18n("sNo")+"</div></tpl>"
                    )
        },
        {
            text: i18n('sComment'),
            flex: 2,
            dataIndex: 'comment',
            sortable: false,
            tdCls: 'gridComment'
        }
    ],
    tbar: [      
        { xtype: 'button',  iconCls: 'b-reload', glyph: Rd.config.icnReload, scale: 'large', itemId: 'reload', tooltip: i18n('sReload')},              
        { xtype: 'button',  iconCls: 'b-expand', glyph: Rd.config.icnExpand, scale: 'large', itemId: 'expand', tooltip: i18n('sExpand')},
        { xtype: 'tbfill'}
    ],
    initComponent: function(){

        //We have to create this treeview's own store since it is unique to the AP
        var me = this;

        //Create a store specific to this Access Provider
        me.store = Ext.create(Ext.data.TreeStore,{
            model: 'Rd.model.mApUserRight',
            autoLoad: true,
            proxy: {
                type: 'ajax',
                format  : 'json',
                batchActions: true, 
                url   : '/cake3/rd_cake/acos-rights/index-ap.json',
                extraParams: { 'ap_id' : me.ap_id },
                reader: {
                    type: 'json',
                    rootProperty: 'items',
                    messageProperty: 'message'
                },
                api: {
                    read    : '/cake3/rd_cake/acos-rights/index-ap.json',
                    update  : '/cake3/rd_cake/acos-rights/edit-ap.json'
                }
            },
            root: {alias: i18n('sAccess_Provider_Rights'),leaf: false, id:'0', iconCls: 'root', expanded: false},
            folderSort: true,
            clearOnLoad: true,
            listeners: {
                load: function( store, records, a,successful,b) {
                    if(!successful){
                        Ext.ux.Toaster.msg(
                                i18n('sError_encountered'),
                                store.getProxy().getReader().rawData.message.message,
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                        );
                    }  
                },
                scope: this
            }
        });

        me.callParent(arguments);
    }
    
});
