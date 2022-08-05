Ext.define('Rd.view.dataUsage.vcPnlDataUsage', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcPnlDataUsage',
    config: {
        span : 'day'
    }, 
    onClickTodayButton: function(button){
        var me = this;
        me.lookup('btnTimeBack').setTooltip('Go Back 1Day');
        me.lookup('btnTimeForward').setTooltip('Go Forward 1Day');
        me.setSpan('day');
        me.getView().setScrollY(0,{duration: 1000});
    },
    onClickThisWeekButton: function(button){
        var me = this;
        me.lookup('btnTimeBack').setTooltip('Go Back 1Week');
        me.lookup('btnTimeForward').setTooltip('Go Forward 1Week');
        me.setSpan('week');
        var h_one = me.getView().down("pnlDataUsageDay").getHeight();
        me.getView().setScrollY(h_one+1,{duration: 1000});
    },
    onClickThisMonthButton: function(button){
        var me = this;
        me.lookup('btnTimeBack').setTooltip('Go Back 1Month');
        me.lookup('btnTimeForward').setTooltip('Go Forward 1Month');
        me.setSpan('month');
        var h_one = me.getView().down("pnlDataUsageDay").getHeight();
        var h_two  = me.getView().down("pnlDataUsageWeek").getHeight();
        me.getView().setScrollY(h_one+h_two+1,{duration: 1000});
    },
    onClickRadiusClientsButton: function(button){
    
        var me = this;
        tp = button.up('tabpanel');
        var pnlDataUsage = button.up('pnlDataUsage');
        var tabDataUsageClients  = tp.items.findBy(function (tab){
            return tab.getXType() === 'pnlDataUsageClients';
        });
        
        if (!tabDataUsageClients){
            tabDataUsageClients = tp.insert(1,{ 
                title   : 'RADIUS Clients',  
                xtype   : 'pnlDataUsageClients',   
                glyph   : Rd.config.icnWifi,
                plain	: true,
                closable: true,
                timezone_id: pnlDataUsage.timezone_id, 
                tabConfig: {
                    ui: Rd.config.tabDtaUsageCl
                }
            });
        }     
        tp.setActiveTab(tabDataUsageClients);
    
    },
    onClickTimeBack: function(b){
        var me          = this;
        var picker      = me.lookup('dtDate');
        var step        = -1;
        var unit        = Ext.Date.DAY;
        if(me.getSpan()== 'week'){
            step        = -7;
        }
        if(me.getSpan()== 'month'){
            step        = -1;
            unit        = Ext.Date.MONTH;
        }
        me.lookup('btnTimeForward').setDisabled(false);
        var d_current   = picker.getValue();
        var d_back      = Ext.Date.add(d_current, unit, step);
        picker.setValue(d_back);
        
    },
    onClickTimeForward: function(b){
        var me          = this;
        var picker      = me.lookup('dtDate');
        var step        = 1;
        var unit        = Ext.Date.DAY;
        if(me.getSpan()== 'week'){
            step        = 7;
        }
        if(me.getSpan()== 'month'){
            step        = 1;
            unit        = Ext.Date.MONTH;
        }
        var d_current   = picker.getValue();
        var today       = new Date();
        var d_fwd       = Ext.Date.add(d_current, unit, step);
        if(Ext.Date.format(d_fwd,'timestamp') >= Ext.Date.format(today,'timestamp')){
            me.lookup('btnTimeForward').setDisabled(true);
            d_fwd  = today;
        }
        picker.setValue(d_fwd); 
    }
});
