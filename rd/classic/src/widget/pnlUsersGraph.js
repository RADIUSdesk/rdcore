Ext.create('Rd.view.analytics.pnlUsersGraph', {
    renderTo: document.body,
    width: 500,
    height: 300,
    alias   : 'widget.pnlUsersGraph',
    store: {
        fields: ['name', 'g1', 'g2'],
        data: [
            {"name": "Item-0", "g1": 18.34,"g2": 0.04},
            {"name": "Item-1", "g1": 2.67, "g2": 14.87},
            {"name": "Item-2", "g1": 1.90, "g2": 5.72},
            {"name": "Item-3", "g1": 21.37,"g2": 2.13},
            {"name": "Item-4", "g1": 2.67, "g2": 8.53},
            {"name": "Item-5", "g1": 18.22,"g2": 4.62},
            {"name": "Item-6", "g1": 28.51, "g2": 12.43},
            {"name": "Item-7", "g1": 34.43, "g2": 4.40},
            {"name": "Item-8", "g1": 21.65, "g2": 13.87},
            {"name": "Item-9", "g1": 12.98, "g2": 35.44},
            {"name": "Item-10", "g1": 22.96, "g2": 38.70},
            {"name": "Item-11", "g1": 0.49, "g2": 51.90},
            {"name": "Item-12", "g1": 20.87, "g2": 62.07},
            {"name": "Item-13", "g1": 25.10, "g2": 78.46},
            {"name": "Item-14", "g1": 16.87, "g2": 56.80}
        ]
    },

    interactions: {
        type: 'panzoom'
    },

    legend: {
        docked: 'right'
    },

    axes: [{
        type: 'numeric',
        position: 'left',
        grid: true
    }, {
        type: 'category',
        position: 'bottom',
        visibleRange: [0, 0.4]
    }],

    series: [{
        type: 'area',
        xField: 'name',
        yField: ['g1', 'g2'],
        title: ['G1', 'G2'],
        style: {
            stroke: '#666666',
            fillOpacity: 0.8
        }
    }]
});

