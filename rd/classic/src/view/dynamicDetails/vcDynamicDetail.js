Ext.define('Rd.view.dynamicDetails.vcDynamicDetail', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcDynamicDetail',
    control : {
        'pnlDynamicDetail #dvNavigation' : {
	        itemclick: 'itemClick'
	    }
    },
    itemClick : function(view, record, item, index, e, eOpts){
        var me = this;
        if(record.get('type') == 'screen'){
            //me.getView().down('#crdDynamicDetail').getLayout().setActiveItem(record.get('id'));
            
            var cardPanel       = me.getView().down('#crdDynamicDetail');
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
