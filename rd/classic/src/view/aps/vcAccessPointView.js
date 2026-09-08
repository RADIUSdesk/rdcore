Ext.define('Rd.view.aps.vcAccessPointView', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcAccessPointView',
    control : {
        'pnlAccessPointView #dvNavigation' : {
	        itemclick: 'itemClick'
	    }
    },
    itemClick : function(view, record, item, index, e, eOpts){
        var me = this;
        if(record.get('type') == 'screen'){
            //me.getView().down('#vcAccessPointView').getLayout().setActiveItem(record.get('id'));
            
            var cardPanel       = me.getView().down('#crdAccessPointView');
            var layout          = cardPanel.getLayout();
            var targetItemId    = record.get('id');
            var nextCard        = cardPanel.down('#' + targetItemId) || cardPanel.getComponent(targetItemId);
            if (nextCard) {
                layout.setActiveItem(nextCard);
                var el = nextCard.getEl();
                if (el) {
                    el.setStyle('opacity', 0); 
                    el.animate({
                        duration: 1000, 
                        to: {
                            opacity: 1
                        }
                    });
                }
            }                          
        }   
    }
});
