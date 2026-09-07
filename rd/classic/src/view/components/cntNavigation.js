Ext.define('Rd.view.components.cntNavigation', {
    extend  : 'Ext.container.Container',
    alias   : 'widget.cntNavigation',
    layout  : 'fit',
    cls     : 'cnt-navigation',
    initComponent:  function() {
    
        var me = this;
                     
        var m = Ext.create('Ext.data.Model',{
            fields: ['id', 'text', 'glyph', 'type']
        });
        
        var userStore = Ext.create('Ext.data.Store', {
            model       : m,
            autoLoad    : true, 
            proxy       : {
                type    : 'ajax',
                url     : me.url,
                reader  : {
                    type: 'json',
                    rootProperty: 'items' 
                }
            }
        });
        
        me.items = [      
            {
            
                xtype           : 'dataview',
                store           : userStore,
                itemId          : 'dvNavigation',
                itemSelector    : 'div.nav-item-wrap', 
                overItemCls     : 'nav-item-hover',
                selectedItemCls : 'nav-item-selected',
                multiSelect     : false,       
                tpl             : [
                    '<div class="nav-container">',
                        '<tpl for=".">',
                            '<div class="nav-item-wrap <tpl if="type == \'link\'">nav-item-link-type</tpl>">',
                                '<span class="{glyph} nav-item-icon"></span>', 
                                '<span class="nav-item-text">{text}</span>',
                            '</div>',
                        '</tpl>',
                    '</div>'
                ],
                               
                listeners: {
                    refresh: function(view) { //Code that triggers once the store is loaded. This code makes the first item active
                        var store = view.getStore();
                        if (store && store.getCount() > 0) {
                            var firstRecord = store.getAt(0);                          
                            view.getSelectionModel().select(firstRecord);
                        }
                    }
                }              
            }
        ];
        
        me.callParent(arguments);
    }
});
