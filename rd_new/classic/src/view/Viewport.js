Ext.define('Rd.view.Viewport', {
    extend: 'Ext.container.Viewport',
    xtype : 'viewP',
    requires:[
        'Ext.layout.container.Fit'
    ],
    layout: {
        type: 'fit'
    }
});

