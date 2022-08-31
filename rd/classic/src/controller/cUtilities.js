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
            'pnlUtilities #btnMeshOverview' : {
                click   : me.openMeshOverview
            },
            'pnlUtilities #btnDataUsage' : {
                click   : me.openDataUsage
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
             layout  : 'fit',
		     tabConfig :{ 
		        ui : "tab-orange"
		     }
        
        });
        tp.setActiveTab('cDataUsage');
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
            title   : 'Networks',
            glyph   : 'xf0e8@FontAwesome',
            id      : 'cNetworkOverview',
            layout  : 'fit',
            tabConfig :{ 
		        ui : "tab-blue"
		     }
        
        });
        tp.setActiveTab('cNetworkOverview');
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
