Ext.define('Rd.view.nas.pnlNas', {
    extend  : 'Ext.tab.Panel',
    alias   : 'widget.pnlNas',
    border  : false,
    nas_id  : null,
    url     : null,
    plain   : true,
    cls     : 'subTab',
    initComponent: function(){
        var me = this;

        //Make the second tab active to triger tha activate
        Ext.Ajax.request({
            url     : me.url+'?nas_id='+me.nas_id,
            method  : 'GET',
            success : me.buildPanel,
            scope   : me
        });
        me.callParent(arguments);
    },
    buildPanel: function(response){
        var me          = this;
        var items       = [];
        var jsonData    = Ext.JSON.decode(response.responseText);
        if(jsonData.success){
            me.add(jsonData.items); //Add the items
            me.setActiveTab(0);
            //Configure the settings for the realms
            var gridR    = me.down('gridRealmsForNasOwner');
            gridR.getStore().getProxy().setExtraParam('nas_id',me.nas_id);
            gridR.getStore().getProxy().setExtraParam('owner_id',me.record.get('user_id'));
            gridR.getStore().getProxy().setExtraParam('available_to_siblings',me.record.get('available_to_siblings'));

            var gridA   = me.down('gridNasAvailability');
            gridA.getStore().getProxy().setExtraParam('nas_id',me.nas_id);

            //If there is an Actions grid included.
            var gridActions = me.down('gridNasActions');
            if(gridActions != undefined){
                gridActions.getStore().getProxy().setExtraParam('nas_id',me.nas_id);
            }

        }
    }
});
