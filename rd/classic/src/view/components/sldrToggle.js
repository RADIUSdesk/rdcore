Ext.define('Rd.view.components.sldrToggle', {
    extend  : 'Ext.slider.Single',
    xtype   : 'sldrToggle',
    minValue: 0,
    maxValue: 1,
    width   : 190,

    onRender: function(parentNode, containerIdx) {
        this.callParent([parentNode, containerIdx]);
        this.publishValue();
    },

    setValue: function(thumbIndex,value) {
        value = value ? 1 : 0; 
        this.callParent([value]);
        if(value == 0){
            this.bodyEl.toggleCls('x-togglefield-on', false);
        }else{
            this.bodyEl.toggleCls('x-togglefield-on', true);
        }
        this.publishValue();   
    },

    getValue: function() {
        return this.callParent([0]) ? true : false;
    }
});
