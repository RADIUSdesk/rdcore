Ext.define('Rd.view.acos.treeAco' ,{
    extend:'Ext.tree.Panel',
    useArrows: true,
    alias : 'widget.treeAco',
    store: 'sAcos',
    rootVisible: true,
    rowLines: true,
    stripeRows: true,
    border: false,
    columns: [{
            xtype: 'treecolumn', //this is so we know which column will show the tree
            text: i18n('sName'),
            flex: 1,
            sortable: true,
            dataIndex: 'alias',
            tdCls: 'gridTree'
        },
        {
            text: i18n('sComment'),
            flex: 2,
            dataIndex: 'comment',
            sortable: false,
            tdCls: 'gridTree'
        }
    ],
    tbar: [      
        { xtype: 'button',  iconCls: 'b-reload',    glyph: Rd.config.icnReload, scale: 'large', itemId: 'reload',tooltip: i18n('sReload')},              
        { xtype: 'button',  iconCls: 'b-add',       glyph: Rd.config.icnAdd,    scale: 'large', itemId: 'add',tooltip: i18n('sAdd')},
        { xtype: 'button',  iconCls: 'b-delete',    glyph: Rd.config.icnDelete, scale: 'large', itemId: 'delete',tooltip: i18n('sDelete')},
        { xtype: 'button',  iconCls: 'b-edit',      glyph: Rd.config.icnEdit,   scale: 'large', itemId: 'edit',tooltip: i18n('sEdit')},
        { xtype: 'button',  iconCls: 'b-expand',    glyph: Rd.config.icnExpand, scale: 'large', itemId: 'expand', tooltip: i18n('sExpand')},
        { xtype: 'tbfill'}
    ],
    initComponent: function(){
        var me = this;
        //Create a mask and assign is as a property to the window
        me.mask = new Ext.LoadMask(me, {msg: i18n('sConnecting')+" ...."});
        this.callParent(arguments);
    }
});
