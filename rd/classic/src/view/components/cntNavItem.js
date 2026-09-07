Ext.define('Rd.view.components.cntNavItem', {
    extend  : 'Ext.container.Container',
    xtype   : 'cntNavItem',
    
    config: {
        glyph   : null,
        text    : '',
        active  : false,
        disabled: false
    },
    
    cls     : 'nav-item',
    layout  : 'vbox',
    align   : 'center',
    padding : '10 20',    
    initComponent: function() {
        var me = this;
        
        me.items = [{
            xtype: 'component',
            itemId: 'glyphEl',
            glyph: me.getGlyph(),
            cls: 'nav-glyph',
            style: 'font-size: 24px; color: #666;'
        }, {
            xtype: 'component',
            itemId: 'textEl',
            html: me.getText(),
            cls: 'nav-text',
            style: 'font-size: 12px; color: #666; margin-top: 5px;'
        }];
        
        me.callParent(arguments);
        
        if (me.getActive()) {
            me.setActive(true);
        }
        
        if (me.getDisabled()) {
            me.setDisabled(true);
        }
        
        me.on('click', me.onItemClick, me);
    },
    
    setGlyph: function(glyph) {
        var glyphEl = this.getComponent('glyphEl');
        if (glyphEl) {
            glyphEl.setGlyph(glyph);
        }
    },
    
    setText: function(text) {
        var textEl = this.getComponent('textEl');
        if (textEl) {
            textEl.setHtml(text);
        }
    },
    
    setActive: function(active) {
        var me = this;
        
        if (me.getDisabled()) {
            return;
        }
        
        me.setConfig('active', active);
        
        if (active) {
            me.addCls('nav-item-active');
            me.getComponent('glyphEl').setStyle('color', '#2196F3');
            me.getComponent('textEl').setStyle('color', '#2196F3');
        } else {
            me.removeCls('nav-item-active');
            me.getComponent('glyphEl').setStyle('color', '#666');
            me.getComponent('textEl').setStyle('color', '#666');
        }
    },
    
    setDisabled: function(disabled) {
        var me = this;
        
        me.setConfig('disabled', disabled);
        
        if (disabled) {
            me.addCls('nav-item-disabled');
            me.getComponent('glyphEl').setStyle('color', '#ccc');
            me.getComponent('textEl').setStyle('color', '#ccc');
            me.setActive(false);
        } else {
            me.removeCls('nav-item-disabled');
            me.getComponent('glyphEl').setStyle('color', '#666');
            me.getComponent('textEl').setStyle('color', '#666');
        }
    },
    
    onItemClick: function() {
        var me = this;
        
        if (me.getDisabled()) {
            return;
        }
        
        // Fire event that can be caught by parent
        me.fireEvent('itemclick', me);
    },
    
    // Override to make the container clickable
    onRender: function() {
        var me = this;
        
        me.callParent(arguments);
        
        me.el.on('click', function() {
            me.onItemClick();
        });
        
        // Add hover effect
        me.el.on('mouseenter', function() {
            if (!me.getActive() && !me.getDisabled()) {
                me.getComponent('glyphEl').setStyle('color', '#1976D2');
                me.getComponent('textEl').setStyle('color', '#1976D2');
            }
        });
        
        me.el.on('mouseleave', function() {
            if (!me.getActive() && !me.getDisabled()) {
                me.getComponent('glyphEl').setStyle('color', '#666');
                me.getComponent('textEl').setStyle('color', '#666');
            }
        });
    }
});
