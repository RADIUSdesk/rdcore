Ext.define('Rd.view.components.pnlTreeTags', {
    extend      :'Ext.tree.Panel',
    alias       :'widget.pnlTreeTags',
    useArrows   : true,
    store       : 'sTreeTags',
    rootVisible : true,
    rowLines    : true,
    layout      : 'fit',
    stripeRows  : true,
    border      : false,
    wizard      : false,
    startScreen : false,
    updateDispaly: false,
    updateValue  : false,
    onlyLeaves  : true,
    requires    : [   
        'Rd.store.sTreeTags',
        'Rd.view.components.vcTreeTags'
    ],
    controller  : 'vcTreeTags',
    columns: [
        {
            xtype       : 'treecolumn', //this is so we know which column will show the tree
            text        : 'Grouping',
            sortable    : true,
            flex        : 1,
            dataIndex   : 'name',
            tdCls       : 'gridTree'
        }
    ],
    listeners : {
        beforerender: function(pnl){
            pnl.getStore().load();
        }
    },
    initComponent: function() {
        var me = this;
        if(me.wizard == false){  
            me.buttons = [{
                xtype       : 'btnCommon',
                itemId      : 'btnTreeTagSelect',
                listeners   : {
                    click       : 'onBtnTreeTagSelectClick'
                }
            }];  
         
        }else{
        
            if(me.startScreen){
                me.buttons = [{
                    itemId  : 'btnTreeTagNext',
                    text    : 'Next',
                    scale   : 'large',
                    glyph   : Rd.config.icnNext,
                    margin  : Rd.config.buttonMargin
                }];
            
            }else{
                me.buttons = [
                    {
                        itemId: 'btnTreeTagPrev',
                        text: i18n('sPrev'),
                        scale: 'large',
                        glyph   : Rd.config.icnBack,
                        margin  : Rd.config.buttonMargin
                    },
                    {
                        itemId  : 'btnTreeTagNext',
                        text    : i18n('sNext'),
                        scale   : 'large',
                        glyph   : Rd.config.icnNext,
                        margin  : Rd.config.buttonMargin
                    }
                ];
            }
        }       
        this.callParent(arguments);
    }
});




