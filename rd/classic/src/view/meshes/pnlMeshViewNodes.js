Ext.define('Rd.view.meshes.pnlMeshViewNodes', {
    extend  	: 'Ext.panel.Panel',
    alias   	: 'widget.pnlMeshViewNodes',
    border  	: false,
	urlOverview	:   '/cake4/rd_cake/mesh-reports/overview.json',
	meshId		: '',
    config: {
       displayBugFix: false
   },
	viewConfig	: {
        loadMask:true
    },
    tbar: [
        { xtype: 'buttongroup', title: null, items : [
            {   
                xtype   : 'button',      
                glyph   : Rd.config.icnReload ,
                scale   : 'large', 
                itemId  : 'reload',   
                tooltip : i18n('sReload'),
                ui      : Rd.config.btnUiReload
            }
        ]}    
    ],
    initComponent: function(){
        var me 	= this;
		//me.html	= "<div id='n_t_n_"+me.meshId+"' style='width:100%;height:100%;'></div>";
		me.html	= "<div id='n_t_n_"+me.meshId+"' style='width:100%;height:100%;background: rgb(10,10,110);background: linear-gradient(90deg, rgba(104,104,110,0.9864320728291317) 0%, rgba(204,227,233,1) 51%, rgba(43, 103, 140, 0.84) 100%);'></div>";
		
		me.listeners= {
		    afterrender: function(a,b,c){
				console.log("afterrender....");
				 
				
		    },
			afterlayout: function(a,b,c){
			    me.wip(); 	
		    },
			scope: me
		}
		me.callParent(arguments);
    },
    wip:function(){
    
        var me = this;
        
        
        var nodes = null;
        var edges = null;
        var network = null;

        var DIR = 'resources/images/vis/';
        var LENGTH_MAIN = 150;
        var LENGTH_SUB = 50;

        // Create a data table with nodes.
        nodes = [];

        // Create a data table with links.
        edges = [];

        nodes.push({id: 1, label: 'Main', image: DIR + 'Network-Pipe-icon.png', shape: 'image'});
        nodes.push({id: 2, label: 'Office', image: DIR + 'Network-Pipe-icon.png', shape: 'image'});
        nodes.push({id: 3, label: 'Wireless', image: DIR + 'Network-Pipe-icon.png', shape: 'image'});
        edges.push({from: 1, to: 2, length: LENGTH_MAIN});
        edges.push({from: 1, to: 3, length: LENGTH_MAIN});

        for (var i = 4; i <= 7; i++) {
        nodes.push({id: i, label: 'Computer', image: DIR + 'Hardware-My-Computer-3-icon.png', shape: 'image'});
        edges.push({from: 2, to: i, length: LENGTH_SUB});
        }

       nodes.push({id: 101, label: 'Printer', image: DIR + 'Hardware-My-Computer-3-icon.png', shape: 'image'});
        edges.push({from: 2, to: 101, length: LENGTH_SUB});

        nodes.push({id: 102, label: 'Laptop', image: DIR + 'Hardware-Laptop-1-icon.png', shape: 'image'});
        edges.push({from: 3, to: 102, length: LENGTH_SUB});

        nodes.push({id: 103, label: 'network drive', image: DIR + 'Network-Drive-icon.png', shape: 'image'});
        edges.push({from: 1, to: 103, length: LENGTH_SUB});

        nodes.push({id: 104, label: 'Internet', image: DIR + 'System-Firewall-2-icon.png', shape: 'image'});
        edges.push({from: 1, to: 104, length: LENGTH_SUB});

        for (var i = 200; i <= 201; i++ ) {
        nodes.push({id: i, label: 'Smartphone', image: DIR + 'Hardware-My-PDA-02-icon.png', shape: 'image'});
        edges.push({from: 3, to: i, length: LENGTH_SUB});
        }

        // create a network
        var container = document.getElementById('n_t_n_'+me.meshId);
        var data = {
        nodes: nodes,
        edges: edges
        };
        var options = {
        //stabilize: false   // stabilize positions before displaying
            width: me.getWidth()+'px',
            height:me.getHeight()+'px'
        };
        network = new vis.Network(container, data, options);
        
    }
    
});
