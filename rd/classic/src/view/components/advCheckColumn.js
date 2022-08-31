Ext.define('Rd.view.components.advCheckColumn', {
    extend  : 'Ext.grid.column.Check',
    alias   : 'widget.advCheckColumn',
    renderer: function(value, meta, record) {
        var cssPrefix = Ext.baseCSSPrefix,
        cls = [cssPrefix + 'grid-checkheader'],
        disabled = false;
        if (value && disabled) {
            cls.push(cssPrefix + 'grid-checkheader-checked-disabled');
        } else if (value) {
            cls.push(cssPrefix + 'grid-checkheader-checked');
        } else if (disabled) {
            cls.push(cssPrefix + 'grid-checkheader-disabled');
        }
        return '<div class="' + cls.join(' ') + '">&#160;</div>';
    }
});
