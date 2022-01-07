Ext.define('Rd.view.acos.treeApRights' ,{
    extend:'Ext.tree.Panel',
    requires:   ['Rd.view.components.advCheckColumn'],
    useArrows: true,
    alias : 'widget.treeApRights',
    store: 'sApRights',
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
            text: i18n('sComment'),
            flex: 2,
            dataIndex: 'comment',
            sortable: false,
            tdCls: 'gridTree'
        }
    ],
    tbar: [      
        { xtype: 'button',  iconCls: 'b-reload', glyph: Rd.config.icnReload,    scale: 'large', itemId: 'reload',   tooltip: i18n('sReload')},              
        { xtype: 'button',  iconCls: 'b-expand', glyph: Rd.config.icnExpand,   scale: 'large', itemId: 'expand',   tooltip: i18n('sExpand')},
        { xtype: 'tbfill'}
    ]
});
