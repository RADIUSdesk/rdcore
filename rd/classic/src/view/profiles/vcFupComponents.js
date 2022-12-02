Ext.define('Rd.view.profiles.vcFupComponents', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcFupComponents',
    init    : function() {
        var me = this;
    },
    addComponent: function(){
		console.log("Add FUP Component");
        var me = this;
        me.getView().add({xtype : 'pnlFupComponent',ui : 'panel-blue',title: 'New FUP Component 1'});
	},
    delComponent: function(){
		console.log("DEL FUP Component");
	}
});
