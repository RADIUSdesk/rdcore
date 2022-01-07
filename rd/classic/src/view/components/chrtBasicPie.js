Ext.define('Rd.view.components.chrtBasicPie', {
    extend      : 'Ext.chart.PolarChart',
    width       : 250,
    height      : 350,
    animate     : true,
    shadow      : true,
  
    interactions: ['rotate'],
    insetPadding: 50,
    innerPadding: 20,
    legend: {
        docked      : 'bottom'
    },

    initComponent: function() {

        var me = this;
  /*      
        me.series= [{
                type: 'pie',
                angleField: 'data',
                label: {
                    field: 'name',
                    calloutLine: {
                        length: 60,
                        width: 3
                        // specifying 'color' is also possible here
                    }
                },
                highlight: true,
                colors: [ "#f10101","#3cef05", "#0bd1fb"], //0bd1fb = blue; f10101 = red; 3cef05 = green
                tooltip: {
                    trackMouse: true,
                    renderer: function (tooltip, record, item) {
                        tooltip.setHtml("<h3>"+record.get('name') + ': ' + record.get('data') +"</h3>");
                    }
                }
            }];
        
        
/*
        me.series = [
        {
            type        : 'pie',
            angleField  : 'data',
            showInLegend: true,
            tips: {
                trackMouse  : true,
                width       : 140,
                height      : 28,
                renderer    : function(storeItem, item) {
                    // calculate and display percentage on hover
                    var total = 0;
                    me.store.each(function(rec) {
                    total += rec.get('data');
                });
                me.setTitle(storeItem.get('name') + ': ' + Math.round(storeItem.get('data') / total * 100) + '%'+ " ("+storeItem.get('data')+")");
            }
        },
        highlight: {
            segment: {
                margin: 20
            }
        },
        label: {
            field       : 'name',
            display     : 'rotate',
            contrast    : true,
            font        : '14px Arial'
            }
        }];    
        */   
        me.callParent(arguments);
    }
});
