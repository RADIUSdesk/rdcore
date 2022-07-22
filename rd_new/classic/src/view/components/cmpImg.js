Ext.define('Rd.view.components.cmpImg', {
    extend: 'Ext.Component',  
    alias: 'widget.cmpImg',      
    html: '<img src="'+Ext.BLANK_IMAGE_URL+'">',
    url: '',
    afterRender: function () {  
        var me = this;
        if(me.url != ''){
            me.setImage(me.url);
        } 
        me.callParent(arguments);
    },
    setImage: function (img) {   
        var me = this, imgEl;                      
        imgEl = me.el.dom.firstChild;
        imgEl.src = img;
    }
});

