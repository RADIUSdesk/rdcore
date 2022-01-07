Ext.define('Rd.view.treeTags.treeTreeTags' ,{
    extend      :'Ext.tree.Panel',
    useArrows   : true,
    alias       : 'widget.treeTreeTags',
    rowLines    : true,
    border      : false,
    rootVisible : true,
    emptyText   : "Please Add Some TreeTags",
    columns: [
        {
            xtype       : 'treecolumn', //this is so we know which column will show the tree
            text        : i18n('sName'),
            flex        : 1,
            sortable    : true,
            dataIndex   : 'text',
            tdCls       : 'gridTree'
        },
        {
            text        : i18n('sComment'),
            flex        : 1,
            dataIndex   : 'comment',
            sortable    : false,
            tdCls       : 'gridTree',
            hidden      : true
        },
        { text: 'Center LAT',       dataIndex: 'center_lat',tdCls: 'gridMain', flex: 1},
        { text: 'Center LNG',       dataIndex: 'center_lng',tdCls: 'gridMain', flex: 1},
        { text: 'KML File',         dataIndex: 'kml_file',  tdCls: 'gridMain', flex: 1},
        { 
            text        : 'Created',
            dataIndex   : 'created', 
            tdCls       : 'gridTree',
            hidden      : true,  
            xtype       : 'templatecolumn', 
            tpl         : new Ext.XTemplate(
                "<div class=\"fieldBlue\">{created_in_words}</div>"
            ),
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
            flex        : 1
        }
    ],
    tbar: [      
        { xtype: 'button',  glyph: Rd.config.icnReload, scale: 'large', itemId: 'reload',tooltip: i18n('sReload')},              
        { xtype: 'button',  glyph: Rd.config.icnAdd,    scale: 'large', itemId: 'add',tooltip: i18n('sAdd')},
        { xtype: 'button',  glyph: Rd.config.icnDelete, scale: 'large', itemId: 'delete',tooltip: i18n('sDelete')},
        { xtype: 'button',  glyph: Rd.config.icnEdit,   scale: 'large', itemId: 'edit',tooltip: i18n('sEdit')},
        { xtype: 'button',  glyph: Rd.config.icnExpand, scale: 'large', itemId: 'expand', tooltip: i18n('sExpand')},
        { xtype: 'button',  glyph: Rd.config.icnMap,    scale: 'large', itemId: 'map', tooltip: 'Map'},
        { xtype: 'button',  glyph: Rd.config.icnRecycle,scale: 'large', itemId: 'map_clear', tooltip: 'Clear Map'},
        { xtype: 'tbfill'}
    ],
    initComponent: function(){
        var me = this;
        //Create a mask and assign is as a property to the window
        me.mask = new Ext.LoadMask(me, {msg: i18n('sConnecting')+" ...."});     
        var store = Ext.create('Ext.data.TreeStore', {
            rootVisible : false,
            autoLoad    : true,
            proxy       : {
                type    : 'ajax',
                url     : '/cake3/rd_cake/tree-tags/index.json',
                reader: {
                    type        : 'json',
                    rootProperty: 'items',
                    successProperty: 'success',
                    totalProperty: 'total'
                },
                api: {
                    read    : '/cake3/rd_cake/tree-tags/index.json',
                    destroy : '/cake3/rd_cake/tree-tags/delete.json'
                }
            },          
            rootProperty: 'items'
        });       
        me.store = store;
        this.callParent(arguments);
    }
});
