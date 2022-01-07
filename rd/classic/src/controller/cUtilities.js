Ext.define('Rd.controller.cUtilities', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl){

        var me = this;   
        if (me.populated) {
            return; 
        }     
        pnl.add({
            xtype   : 'pnlUtilities',
            border  : true,
            itemId  : 'tabUtilities',
            plain   : true
        });
        me.populated = true;
    },

    views:  [
        'utilities.pnlUtilities',
        'alerts.gridAlerts',
        'softflows.pnlSoftflows'
    ],
    stores: [],
    models: [],
    config: {
       
    },
    refs: [
         {  ref: 'pnlUtilities',     selector:   'pnlUtilities'}
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        me.control({
            '#tabUtilities' : {
                destroy   :      me.appClose   
            },
            'pnlUtilities #btnRadiusClient' : {
                click   : function(btn){
                    me.application.runAction('cRadiusClient','Index')
                } 
            },
            'pnlUtilities #btnPassword' : {
                click   : function(btn){
                    me.application.runAction('cPassword','Index')
                } 
            },
            'pnlUtilities #btnActivityMonitor' : {
                click   : me.openActivityMonitor
            },
            'pnlUtilities #btnDataUsage' : {
                click   : me.openDataUsage
            },
            'pnlUtilities #btnMeshOverview' : {
                click   : me.openMeshOverview
            },
            'pnlUtilities #btnApOverview' : {
                click   : me.openApOverview
            },
            'pnlUtilities #btnSetupWizard' : {
                click   : function(btn){
                    me.application.runAction('cSetupWizard','Index')
                } 
            },
            'pnlUtilities #btnAlerts' : {
                click   : me.openAlertOverview
            },
            'pnlUtilities #btnFlows' : {
                click   : me.openFlowsOverview
            }
        });
    },
    appClose:   function(){
        var me          = this;
        me.populated    = false;
    },
    openActivityMonitor: function(btn){
        var me  = this;
        var pnl = me.getPnlUtilities();
        me.application.runAction('cActivityMonitor','Index',pnl); 
    },
    openDataUsage: function(btn){
        var me  = this;
        var pnl = me.getPnlUtilities();
        var tp  = pnl.up('tabpanel');
        var check_if_there = tp.down('#cDataUsage');
        
        if(check_if_there){
            tp.setActiveTab('cDataUsage');
            return;
        }
        
        tp.add({
             title   : 'Data Usage',
             glyph   : Rd.config.icnData,
             id      : 'cDataUsage',
             layout  : 'fit'
        
        });
        tp.setActiveTab('cDataUsage');
        me.application.runAction('cDataUsage','Index',tp);
    },
    openMeshOverview: function(btn){
        var me  = this;
        var pnl = me.getPnlUtilities();
        var tp  = pnl.up('tabpanel');
        var check_if_there = tp.down('#cNetworkOverview');
        
        if(check_if_there){
            tp.setActiveTab('cNetworkOverview');
            return;
        }
        
        tp.add({
             title   : 'Clouds',
             glyph   : Rd.config.icnCloud,
             id      : 'cNetworkOverview',
             layout  : 'fit'
        
        });
        tp.setActiveTab('cNetworkOverview');
        me.application.runAction('cNetworkOverview','Index',tp);
    },
    openApOverview: function(btn){
        var me  = this;
        var pnl = me.getPnlUtilities();
        var tp  = pnl.up('tabpanel');
        var check_if_there = tp.down('#cApOverview');
        
        if(check_if_there){
            tp.setActiveTab('cApOverview');
            return;
        }
        
        tp.add({
             title   : 'Access Points',
             glyph   : Rd.config.icnCloud,
             id      : 'cApOverview',
             layout  : 'fit'
        
        });
        tp.setActiveTab('cApOverview');
        me.application.runAction('cApOverview','Index',tp);
    },
    openAlertOverview: function(btn){
        var me  = this;
        var pnl = me.getPnlUtilities();
        var tp  = pnl.up('tabpanel');
        var check_if_there = tp.down('#pnlAlertOverview');     
        if(check_if_there){
            tp.setActiveTab('pnlAlertOverview');
            return;
        }     
        tp.add({
             title   : 'Alerts',
             xtype   : 'gridAlerts',
             glyph   : Rd.config.icnBell,
             itemId  : 'pnlAlertOverview',
             layout  : 'fit',
             padding : Rd.config.gridPadding,
             border  : false,
             plain	 : true
        
        });
        tp.setActiveTab('pnlAlertOverview');
    },
    openFlowsOverview: function(btn){
        var me  = this;
        var pnl = me.getPnlUtilities();
        var tp  = pnl.up('tabpanel');
        var check_if_there = tp.down('#pnlFlowsOverview');     
        if(check_if_there){
            tp.setActiveTab('pnlFlowsOverview');
            return;
        }     
        tp.add({
             title   : 'Flows',
             xtype   : 'pnlSoftflows',
             glyph   : Rd.config.icnSkyatlas,
             itemId  : 'pnlFlowsOverview',
             layout  : 'fit',
             padding : Rd.config.gridPadding,
             border  : false,
             plain	 : true
        
        });
        tp.setActiveTab('pnlFlowsOverview');
    }
});
