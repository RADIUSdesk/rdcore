Ext.define('Rd.view.components.gridNote' ,{
    extend:'Ext.grid.Panel',
    alias : 'widget.gridNote',
    multiSelect: true,
    border: false,
    noteForId   : '',
    noteForGrid : '',
    requires: ['Rd.model.mNote'],
    tbar:   [
        { xtype: 'button',  glyph   : Rd.config.icnReload,  scale: 'large', itemId: 'reload',   tooltip:    i18n('sReload')},              
        { xtype: 'button',  glyph   : Rd.config.icnAdd,     scale: 'large', itemId: 'add',      tooltip:    i18n('sAdd')   },
        { xtype: 'button',  glyph   : Rd.config.icnDelete,  scale: 'large', itemId: 'delete',   tooltip:    i18n('sDelete'), disabled: true}
    ],
    bbar: [
        {   xtype: 'component', itemId: 'count',   tpl: i18n('sResult_count_{count}'),   style: 'margin-right:5px', cls: 'lblYfi' }
    ],
    columns: [
        {xtype: 'rownumberer'},
        { 
            text        : i18n('sNote'),   
            dataIndex   : 'note',    
            flex        : 1,
            xtype       : 'templatecolumn', 
            tpl:        new Ext.XTemplate(
                "<tpl if='available_to_siblings == true'><div class=\"fieldGreen\">{note}</div></tpl>",
                "<tpl if='available_to_siblings == false'><div class=\"fieldRed\">{note}</div></tpl>"
            )
        },
        { text: i18n('sOwner'),  dataIndex: 'owner',   tdCls: 'gridTree', width: 150}
    ],
    initComponent: function(){
        var me      = this;
        me.store    = Ext.create(Ext.data.Store,{
            model: 'Rd.model.mNote',
            extend: 'Ext.data.Store',
            proxy: {
                type    : 'ajax',
                format  : 'json',
                batchActions: true, 
                url     : '/cake3/rd_cake/' + me.noteForGrid + '/note-index.json',
                extraParams: { 'for_id' : me.noteForId },
                reader: {
                    type            : 'json',
                    rootProperty    : 'items',
                    messageProperty : 'message',
                    keepRawData     : true
                },
                api: {
                    destroy  : '/cake3/rd_cake/' + me.noteForGrid + '/note-del.json'
                }
            },
            autoLoad: true
        });
        me.getStore().addListener('load',me.onStoreNoteLoaded, me); 
        me.callParent(arguments);
    },
    onStoreNoteLoaded: function() {
        var me      = this;
        console.log(me.getStore().getTotalCount());
        var count   = me.getStore().getTotalCount();
        me.down('#count').update({count: count});
    }
});
