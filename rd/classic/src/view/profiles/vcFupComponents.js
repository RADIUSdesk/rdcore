Ext.define('Rd.view.profiles.vcFupComponents', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcFupComponents',
    init    : function() {
        var me   = this;
        me.count = 0;
    },
    addComponent: function(){
		console.log('Add FUP Component');
        var me = this;
        me.count = me.count+1;
        console.log(me.count);
        me.getView().add({xtype : 'pnlFupComponent',ui : 'panel-green',title: 'New FUP Component '+me.count,count: me.count, action: 'add'});
	}
});
