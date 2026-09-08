Ext.define('Rd.view.meshes.vcMeshView', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcMeshView',
    control : {
        'pnlMeshView #dvNavigation' : {
	        itemclick : 'itemClick',
	        beforeselect : 'beforeSelect'
	    }
    },
    itemClick : function(view, record, item, index, e, eOpts){
        var me = this;
        if(record.get('type') == 'screen'){
            //me.getView().down('#crdMeshView').getLayout().setActiveItem(record.get('id')); //No animation
            
            var cardPanel       = me.getView().down('#crdMeshView');
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
    },
    beforeSelect : function(view,record,index,eOpts){
        var me = this;
        if(record.get('type') == 'link'){
            pnlMeshView = me.getView();        
            Ext.getApplication().runAction('cMeshEdits','Index',pnlMeshView,{name:pnlMeshView.getTitle(),id:pnlMeshView.mesh_id}); 
            return false;                             
        }    
    }
});
