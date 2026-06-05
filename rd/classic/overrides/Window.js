/**
 * Global override for Ext.window.Window to ensure mobile compatibility
 * Auto-scales and centers popup windows when screen dimensions are small (< 768px).
 */
Ext.define('Rd.overrides.window.Window', {
    override: 'Ext.window.Window',

    initComponent: function () {
        var me = this;
        me.callParent(arguments);

        // Adjust dimensions before showing the window
        me.on('beforeshow', me.adjustForMobile, me);
        me.on('show', me.adjustForMobile, me);

        // Adjust dimensions dynamically if the window/viewport resizes
        Ext.on('resize', me.adjustForMobile, me);
    },

    adjustForMobile: function () {
        var me = this;
        if (me.destroyed || !me.isVisible()) {
            return;
        }

        var viewSize = Ext.getBody().getViewSize();
        var viewportWidth = viewSize.width;
        var viewportHeight = viewSize.height;

        if (viewportWidth < 768) {
            // Keep track of the original sizes configured by the application
            if (!me.originalWidth) {
                me.originalWidth = me.width || me.getWidth() || 400;
                me.originalHeight = me.height || me.getHeight() || 300;
            }

            // Scale dynamically on mobile viewports to fill most of the screen
            var responsiveWidth = Math.floor(viewportWidth * 0.95);
            var responsiveHeight = Math.floor(viewportHeight * 0.95);

            me.setWidth(responsiveWidth);
            me.setHeight(responsiveHeight);
            
            if (me.rendered) {
                me.center();
            }
        } else {
            // Restore original sizes on larger viewports
            if (me.originalWidth) {
                me.setWidth(me.originalWidth);
                me.setHeight(me.originalHeight);
                me.originalWidth = null;
                me.originalHeight = null;
                
                if (me.rendered) {
                    me.center();
                }
            }
        }
    },

    onDestroy: function () {
        var me = this;
        Ext.un('resize', me.adjustForMobile, me);
        me.callParent(arguments);
    }
});
