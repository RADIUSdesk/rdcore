Ext.define('Rd.view.profiles.vcProfileGeneric', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcProfileGeneric',
    config : {
        urlViewProfile   : '/cake3/rd_cake/profiles/simple_view.json',
    },
    init: function() {
        var me = this;
    },
    onBtnPickOwnerClick: function(button){
        var me 		        = this;
        var pnl             = button.up('panel');
        var updateDisplay  = pnl.down('#displUser');
        var updateValue    = pnl.down('#hiddenUser'); 
        
		console.log("Clicked Change Owner");
		if(!Ext.WindowManager.get('winSelectOwnerId')){
            var w = Ext.widget('winSelectOwner',{id:'winSelectOwnerId',updateDisplay:updateDisplay,updateValue:updateValue});
            w.show();       
        }  
    },
    loadProfileContent: function(){ 
        var me          = this;
        var profile_id  = me.getView().profileId;

        me.getView().load({
            url         :me.getUrlViewProfile(), 
            method      :'GET',
            params      :{profile_id : profile_id},
            success     : function(a,b,c){   
                //console.log(b.result.data);
            }
        });
    }
    
});
