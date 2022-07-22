Ext.define('Rd.view.components.rdColorfield', {
    extend:'Ext.ux.colorpick.Field',
    alias :'widget.rdColorfield',
    beforeBodyEl: [
        '<div class="' + Ext.baseCSSPrefix + 'colorpicker-field-swatch custom-color-picker-swatch">' +
            '<div id="{id}-swatchEl" data-ref="swatchEl" class="' + Ext.baseCSSPrefix +
                    'colorpicker-field-swatch-inner"></div>' +
        '</div>'
    ],
    value : '#DDDDE5'
});

