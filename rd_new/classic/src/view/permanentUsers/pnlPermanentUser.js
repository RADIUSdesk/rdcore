Ext.define('Rd.view.permanentUsers.pnlPermanentUser', {
    extend  : 'Ext.tab.Panel',
    alias   : 'widget.pnlPermanentUser',
    border  : false,
    pu_id   : null,
    pu_name : null,
    record  : null, //We will supply each instance with a reference to the selected record.
    plain   : true,
    cls     : 'subTab',
    requires    : [
        'Rd.view.permanentUsers.pnlPermanentUserBasic',
        'Rd.view.permanentUsers.pnlPermanentUserPersonal'
    ],
    initComponent: function(){
        var me      = this;
        //Set default values for from and to:
        var dtFrom  = new Date();
        var dtTo    = new Date();
        dtTo.setYear(dtTo.getFullYear() + 1);

		var ap_id	= me.record.get('owner_id');

        me.items = [
        {   
            title   : i18n('sBasic_info'),
            itemId  : 'tabBasicInfo',
            xtype   : 'pnlPermanentUserBasic',
            record  : me.record  
        },
        {   
            title       : i18n('sPersonal_info'),
            itemId      : 'tabPersonalInfo',
            xtype       : 'pnlPermanentUserPersonal',
            selLanguage : me.selLanguage 
        }, 
        { 
            title   : i18n('sDevices'),
            layout  : 'fit',
            xtype   : 'gridUserDevices',  
            user_id : me.pu_id,
            username: me.pu_name
        },
        { 
            title   : i18n('sPrivate_attributes'),
            layout  : 'fit',
            xtype   : 'gridUserPrivate',  
            username: me.pu_name
        },
        { 
            title   : i18n('sAuthentication_data'),
            layout  : 'fit',
            xtype   : 'gridUserRadpostauths',  
            username: me.pu_name
        },
        { 
            title   : i18n('sAccounting_data'), 
            layout  : 'fit',
            xtype   : 'gridUserRadaccts',
            username: me.pu_name
        }
    ]; 


        me.callParent(arguments);
    }
});
