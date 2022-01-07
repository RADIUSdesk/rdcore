Ext.define('Rd.view.accessProviders.pnlAccessProvider', {
    extend  : 'Ext.tab.Panel',
    alias   : 'widget.pnlAccessProvider',
    border  : false,
    ap_id   : null,
    plain   : true,
    tabPosition: 'top',
    cls     : 'subTab',
    initComponent: function(){

        var me = this;
        if(me.limits){
            me.items = [
                {   
                    title   : i18n('sDetail'),
                    itemId  : 'tabDetail',
                    xtype   : 'pnlAccessProviderDetail',
                    ap_id   : me.ap_id
                },
                { 
                    title   : i18n('sRealms'),
                    itemId  : 'tabRealms',
                    xtype   : 'gridApRealms', 
                    ap_id   : me.ap_id
                },
                {
                    title   : i18n('sRights'),
                    itemId  : 'tabRights',
                    xtype   : 'treeApUserRights', 
                    ap_id   : me.ap_id
                },
                {
                    title   : i18n('sLimits'),
                    itemId  : 'tabLimits',
                    xtype   : 'gridAccessProviderLimits',
                    ap_id   : me.ap_id
                }
            ];
        }else{
            me.items = [
                {   
                    title   : i18n('sDetail'),
                    itemId  : 'tabDetail',
                    xtype   : 'pnlAccessProviderDetail',
                    ap_id   : me.ap_id
                },
                { 
                    title   : i18n('sRealms'),
                    itemId  : 'tabRealms',
                    xtype   : 'gridApRealms', 
                    ap_id   : me.ap_id
                },
                {
                    title   : i18n('sRights'),
                    itemId  : 'tabRights',
                    xtype   : 'treeApUserRights', 
                    ap_id   : me.ap_id
                }
            ];
        }
        me.callParent(arguments);
    }
});
