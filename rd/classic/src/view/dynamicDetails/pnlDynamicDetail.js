Ext.define('Rd.view.dynamicDetails.pnlDynamicDetail', {
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlDynamicDetail',
    layout      : {
        type    : 'vbox',
        align   : 'stretch'
    },
    dynamic_detail_id: null,
    controller  : 'vcDynamicDetail',
    requires: [
        'Rd.view.dynamicDetails.vcDynamicDetail'
    ],    
    initComponent: function(){
        var me = this;
        
        me.items = [ 
            {
                xtype   : 'cntNavigation',
                margin  : 0,
                padding : 5,
                url     : '/cake4/rd_cake/dynamic-details/nav-dynamic-detail-edit.json'
            },
            {
                xtype   : 'container',
                layout  : 'card',
                itemId  : 'crdDynamicDetail',
                flex    : 1,
                items   : [
                {   
                    xtype:  'pnlDynamicDetailDetail',
                    itemId: 'tabDetail'                 
                },
                { 
                    itemId  : 'tabSettings',
                    xtype   : 'pnlDynamicDetailSettings',
                    dynamic_detail_id : me.dynamic_detail_id,
                    user_id : me.user_id
                },
                { 
                    itemId  : 'tabLogo',
                    xtype   : 'pnlDynamicDetailLogo'
                },
                { 
                    itemId  : 'tabPhoto',
                    xtype   : 'pnlDynamicDetailPhoto',
                    dynamic_detail_id : me.dynamic_detail_id
                },
                { 
                    itemId  : 'tabPages',
                    xtype   : 'gridDynamicDetailPages',
                    dynamic_detail_id : me.dynamic_detail_id
                },
                { 
                    itemId  : 'tabPairs',
                    xtype   : 'gridDynamicDetailPairs',
                    dynamic_detail_id : me.dynamic_detail_id
                },  
                { 
                    itemId  : 'tabClickToConect',
                    xtype   : 'pnlDynamicDetailClickToConnect',
                    dynamic_detail_id : me.dynamic_detail_id
                },
			    { 
                    itemId  : 'tabSocialLogin',
                    xtype   : 'pnlDynamicDetailSocialLogin',
                    dynamic_detail_id : me.dynamic_detail_id,
                    user_id : me.user_id
                }              
            ]
        }
    ]; 
        me.callParent(arguments);
    }
});
