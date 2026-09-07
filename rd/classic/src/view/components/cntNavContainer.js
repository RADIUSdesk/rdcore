Ext.define('Rd.view.components.cntNavContainer', {
    extend: 'Ext.container.Container',
    xtype: 'cntNavContainer',
    
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    
    defaultType: 'cntNavItem',
    
    config: {
        items: [],
        activeItem: null
    },
    
    initComponent: function() {
        var me = this;
        
        me.callParent(arguments);
        
        // Listen to item click events
        me.on('afterrender', function() {
            me.items.each(function(item) {
                if (item.isNavItem) {
                    item.on('itemclick', me.onItemClick, me);
                }
            });
        });
    },
    
    // Override add method to attach listeners
    add: function(items) {
        var me = this;
        var result = me.callParent(arguments);
        
        // If item is an array, iterate through
        var itemArray = Ext.isArray(items) ? items : [items];
        Ext.each(itemArray, function(item) {
            if (item && item.isNavItem) {
                item.on('itemclick', me.onItemClick, me);
            }
        });
        
        return result;
    },
    
    onItemClick: function(item) {
        var me = this;
        
        // Deactivate all items
        me.items.each(function(child) {
            if (child.isNavItem && child !== item) {
                child.setActive(false);
            }
        });
        
        // Activate the clicked item
        item.setActive(true);
        
        // Fire event
        me.fireEvent('itemchange', me, item);
    },
    
    setActiveItem: function(item) {
        var me = this;
        var targetItem = item;
        
        // If item is an index
        if (Ext.isNumber(item)) {
            targetItem = me.items.getAt(item);
        }
        
        // If item is a string (itemId)
        if (Ext.isString(item)) {
            targetItem = me.getComponent(item);
        }
        
        if (targetItem && targetItem.isNavItem) {
            me.onItemClick(targetItem);
        }
    },
    
    getActiveItem: function() {
        var me = this;
        var activeItem = null;
        
        me.items.each(function(item) {
            if (item.isNavItem && item.getActive()) {
                activeItem = item;
                return false;
            }
        });
        
        return activeItem;
    }
});
