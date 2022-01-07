Ext.define('Rd.view.components.winSelectTreeTag', {
    extend  : 'Ext.window.Window',
    alias   : 'widget.winSelectTreeTag',
    title   : 'Select Grouping',
    layout  : 'fit',
    autoShow: false,
    width   : 600,
    height  : 400,
    glyph   : Rd.config.icnEdit,
    updateDisplay: false,
    updateValue  : false,
    requires    : [   
        'Rd.view.components.pnlTreeTags' 
    ],
    initComponent: function() {
        var me = this;
        var scrnTreeTags   = me.mkScrnTreeTags();
        me.items = [
            scrnTreeTags
        ];  
        me.callParent(arguments);
    },

    //____ AccessProviders tree SCREEN ____
    mkScrnTreeTags: function(){
        var me = this;
        var pnlTree = Ext.create('Rd.view.components.pnlTreeTags',{
            itemId          : 'scrnTreeTags',
            border          : false,
            updateDisplay   : me.updateDisplay,
            updateValue     : me.updateValue
        });
        return pnlTree;
    }
});
