Ext.define('Rd.view.dynamicDetails.pnlDynamicDetailCustomerItem', {
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlDynamicDetailCustomerItem',
    itemName    : 'Gender',
    chkWidth    : 207,
    width       : 565,
    name        : 'gender',
    stripe      : false,
    layout      : {
      type      : 'hbox',
      lign      : 'stretchmax',
      pack      : 'start'
    },
    bodyPadding : 0,
    initComponent: function(){
        var me = this; 
        if(me.stripe){
            me.bodyStyle = 'background: #f0f0f5';
        }else{
            me.bodyStyle = 'background: #d1e0e0';
        }
        
        me.items = [
            {
                xtype       : 'checkbox',      
                fieldLabel  : me.itemName,
                name        : me.name,
                inputValue  : 'cust_info_check',
                checked     : false,
                labelClsExtra: 'lblRdReq',
                disabled    : true,
                width       : me.chkWidth,
                listeners   : {
					change  : 'sldrToggleChange'
				}  
            },
            {
                xtype       : 'checkbox',
                fieldLabel  : 'Required',
                itemId      : 'sldrRequire',
                name        : me.name+'_required',
                checked     : false,
                disabled    : true,
                width       : me.chkWidth  
            }
        ];
        
        
           
           
       /* me.items = [
            {
                xtype       : 'sldrToggle',
                fieldLabel  : me.itemName,
                userCls     : 'sldrDark',
                name        : me.name,
                value       : 0,
                width       : me.chkWidth,
                disabled    : true,
                listeners   : {
					change  : 'sldrToggleChange'
				}    
            },
            {
                xtype       : 'sldrToggle',
                fieldLabel  : 'Required',
                userCls     : 'sldrDark',
                itemId      : 'sldrRequire',
                name        : me.name+'_required',
                value       : 0,
                disabled    : true,
                width       : me.chkWidth 
            }
        ];*/ 
        me.callParent(arguments);
    }
});
