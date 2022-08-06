Ext.define('Rd.view.components.pnlClouds', {
    extend      :'Ext.tree.Panel',
    alias       :'widget.pnlClouds',
    useArrows   : true,
    store       : Ext.create('Rd.store.sClouds',{}),
    //store       :'sClouds',
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
        'Rd.store.sClouds',
        'Rd.view.components.vcClouds'
    ],
    controller  : 'vcClouds',
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
                itemId      : 'btnCloudSelect',
                listeners   : {
                    click       : 'onBtnCloudSelectClick'
                }
            }];  
         
        }else{
        
            if(me.startScreen){
                me.buttons = [{
                    itemId  : 'btnCloudNext',
                    text    : 'Next',
                    scale   : 'large',
                    glyph   : Rd.config.icnNext,
                    margin  : Rd.config.buttonMargin
                }];
            
            }else{
                me.buttons = [
                    {
                        itemId: 'btnCloudPrev',
                        text: i18n('sPrev'),
                        scale: 'large',
                        glyph   : Rd.config.icnBack,
                        margin  : Rd.config.buttonMargin
                    },
                    {
                        itemId  : 'btnCloudNext',
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




