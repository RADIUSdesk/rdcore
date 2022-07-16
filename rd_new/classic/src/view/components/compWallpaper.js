Ext.define('Rd.view.components.compWallpaper', {
    extend: 'Ext.Component',  
    alias: 'widget.compWallpaper', 
    cls: 'ux-wallpaper',      
    html: '<img src="'+Ext.BLANK_IMAGE_URL+'">', 
    afterRender: function () {  
        var me = this;  
        me.setWallpaper(); 
        me.callParent(arguments);
    },
    setWallpaper: function () {   
        var me = this, imgEl;              
        if (me.rendered) {             
            imgEl = me.el.dom.firstChild;
            imgEl.src = me.url;
            Ext.fly(imgEl).setStyle({
                    width: '100%',
                    height: '100%'
                }).show();
        }
    }
});

