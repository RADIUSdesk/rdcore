/**
 * Created by Dirk van der Walt on 7/30/2019.
 * Ext 6.6.0 breaks when use a sprite legend on charts
 */
Ext.define('Rd.overrides.chart.legend.SpriteLegend', {
    override: 'Ext.chart.legend.SpriteLegend',
    isXType: function (xtype) {       
        return xtype === 'sprite';
    },
    getItemId: function () {
        return this.getId();
    }
});
