Ext.define('Rd.view.clouds.treeClouds' ,{
    extend      :'Ext.tree.Panel',
    useArrows   : true,
    alias       : 'widget.treeClouds',
    rowLines    : true,
    border      : false,
    rootVisible : true,
    emptyText   : "Please Add Some Clouds",
    columns: [
        {
            xtype       : 'treecolumn', //this is so we know which column will show the tree
            text        : i18n('sName'),
            flex        : 1,
            sortable    : true,
            dataIndex   : 'text',
            tdCls       : 'gridTree'
        },
        { text: i18n('sOwner'),  dataIndex: 'owner', tdCls: 'gridTree', flex: 1,filter: {type: 'string'},hidden : true
        },
        {
            text        : i18n('sComment'),
            flex        : 1,
            dataIndex   : 'comment',
            sortable    : false,
            tdCls       : 'gridTree',
            hidden      : true
        },
        { 
            text        : i18n('sAvailable_to_sub_providers'),
            flex        : 1,  
            xtype       : 'templatecolumn', 
            tpl         : new Ext.XTemplate(
                "<tpl if='available_to_siblings == true'><div class=\"fieldGreen\">"+i18n("sYes")+"</div></tpl>",
                "<tpl if='available_to_siblings == false'><div class=\"fieldRed\">"+i18n("sNo")+"</div></tpl>"
            ),
            dataIndex   : 'available_to_siblings'
        },
        { text: 'LAT',       dataIndex: 'lat',tdCls: 'gridMain', flex: 1},
        { text: 'LNG',       dataIndex: 'lng',tdCls: 'gridMain', flex: 1},
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
        {
            xtype : 'buttongroup',
            title : null,
            items : [    
                { xtype: 'button',  glyph: Rd.config.icnReload, scale: 'large', itemId: 'reload',tooltip: i18n('sReload'),
                    ui : 'button-orange'
                },              
                { xtype: 'button',  glyph: Rd.config.icnAdd,    scale: 'large', itemId: 'add',tooltip: i18n('sAdd'),
                    ui : 'button-green'
                },
                { xtype: 'button',  glyph: Rd.config.icnDelete, scale: 'large', itemId: 'delete',tooltip: i18n('sDelete'),
                    ui : 'button-red'
                },
                { xtype: 'button',  glyph: Rd.config.icnEdit,   scale: 'large', itemId: 'edit',tooltip: i18n('sEdit'),
                    ui : 'button-blue'
                },
                { xtype: 'button',  glyph: Rd.config.icnExpand, scale: 'large', itemId: 'expand', tooltip: i18n('sExpand')},
                { xtype: 'button',  glyph: Rd.config.icnMap,    scale: 'large', itemId: 'map', tooltip: 'Map',
                    ui : 'button-blue'               
                },
                { xtype: 'button',  glyph: Rd.config.icnRecycle,scale: 'large', itemId: 'map_clear', tooltip: 'Clear Map'}
            ]
        }
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
                url     : '/cake3/rd_cake/clouds/index.json',
                reader: {
                    type        : 'json',
                    rootProperty: 'items',
                    successProperty: 'success',
                    totalProperty: 'total'
                },
                api: {
                    read    : '/cake3/rd_cake/clouds/index.json',
                    destroy : '/cake3/rd_cake/clouds/delete.json'
                }
            },          
            rootProperty: 'items'
        });       
        me.store = store;
        this.callParent(arguments);
    }
});
