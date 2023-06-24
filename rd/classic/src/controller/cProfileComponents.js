Ext.define('Rd.controller.cProfileComponents', {
    extend: 'Ext.app.Controller',
/*    actionIndex: function(pnl,itemId){
        var me      = this;
        var item    = pnl.down('#'+itemId);
        var added   = false;
        if(!item){  
            pnl.add({
                itemId : itemId,
             	xtype  : 'pnlProfileComponents',
                border : false,
                plain  : true,
                padding: '0 5 0 5'
            });
            pnl.on({activate : me.dvActivate,scope: me});
            added = true;
        }
        return added;      
    },
*/
    
   
    actionIndex: function(tp){
        var me      = this;  
        var tab     = tp.items.findBy(function (tab){
            return tab.getXType() === 'pnlProfileComponents';
        });
        
        if (!tab){
            tab = tp.insert(3,{
                xtype   : 'pnlProfileComponents',
                padding : Rd.config.gridSlim,
                glyph   : Rd.config.icnComponent,
                title   : 'Profile Components',
                border  : false,
                plain   : true,
                padding : '0 5 0 5',
                closable: true, 
                tabConfig: {
                    ui: Rd.config.tabDevices
                }
            });
            tab.on({activate : me.dvActivate,scope: me});
        }        
        tp.setActiveTab(tab);
    },
    
       
    views:  [
    	'profileComponents.pnlProfileComponents'
    ],
    refs: [
        {  ref: 'dv',    selector: '#dvProfileComponents'}       
    ], 
   	dvActivate: function(pnl){
        var me = this;
        me.getDv().getStore().reload();            
    }
});
