Ext.define('Rd.view.permanentUsers.vcPermanentUser', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcPermanentUser',
    control : {
        'pnlPermanentUser #dvNavigation' : {
	        itemclick: 'itemClick'
	    }
    },
    itemClick : function(view, record, item, index, e, eOpts){
        var me = this;
        if(record.get('type') == 'screen'){
            //me.getView().down('#crdMeshView').getLayout().setActiveItem(record.get('id'));
            
            var cardPanel       = me.getView().down('#crdPermanentUser');
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
