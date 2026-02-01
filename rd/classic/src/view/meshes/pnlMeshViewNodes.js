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
			  //  me.wip(); 	
		    },
			scope: me
		}
		me.callParent(arguments);
    },
    getData: function(){
		var me = this
		me.setLoading(true);
		Ext.Ajax.request({
            url: me.urlOverview,
            method: 'GET',
			params: {
				mesh_id: me.meshId
			},
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                	console.log(jsonData);
                	me.xfromData(jsonData);
					me.setLoading(false);
                }   
            },
            scope: me
        });
	},
	
	xfromData: function(jsonData){
	
	    var me = this;
	    
	    const raw = jsonData;

        const nodes = [];
        const edges = [];
        
        var DIR         = 'resources/images/vis/';
        var LENGTH_MAIN = 150;
        var LENGTH_SUB  = 50;

        raw.data.forEach(node => {

          // ----- Nodes -----
          nodes.push({
            id      : node.id,
            label   : node.name,           
            //image   : DIR + '49_openwrt_one.png',
            image   : node.data.url,
            shape   : 'image',
            color   : node.data.state === 'down'
              ? { background: '#ff4d4d' }
              : { background: '#4caf50' }
            
            /*shape: node.data?.$type === 'image' ? 'image' : 'dot',
            image: node.data?.$url || undefined,
            title: `
              <b>${node.name}</b><br/>
              IP: ${node.data.ip || '-'}<br/>
              MAC: ${node.data.mac || '-'}<br/>
              State: ${node.data.state || '-'}
            `,
            color: node.data.state === 'down'
              ? { background: '#ff4d4d' }
              : { background: '#4caf50' }*/
          });

          // ----- Edges -----
          (node.adjacencies || []).forEach(adj => {
            edges.push({
              from  : node.id,
              to    : adj.nodeTo,
              length: LENGTH_MAIN,
              color : 'green',
              //color: adj.data.$color || '#999',
              width: adj.data.$lineWidth || 1,
             // hidden: adj.data.$alpha === 0
            });
          });
        });
        
       
   /*     
        nodes.push({id: 1, label: 'Main', image: DIR + 'Network-Pipe-icon.png', shape: 'image'});
        nodes.push({id: 2, label: 'Office', image: DIR + 'Network-Pipe-icon.png', shape: 'image'});
        nodes.push({id: 3, label: 'Wireless', image: DIR + 'Network-Pipe-icon.png', shape: 'image'});
        edges.push({from: 1, to: 2, length: LENGTH_MAIN});
        edges.push({from: 1, to: 3, length: LENGTH_MAIN});
        
        console.log(nodes);
        console.log(edges);	    */   
        const data = {
            nodes: new vis.DataSet(nodes),
            edges: new vis.DataSet(edges)
        };

        const options = {
            layout: {
              improvedLayout: true
            },
            physics: {
              stabilization: true,
              barnesHut: {
                springLength: 160,
                avoidOverlap: 1
              }
            },
            interaction: {
              hover: true
            },
            nodes: {
              font: {
                size: 14
              }
            },
            edges: {
              smooth: true
            },
            width: me.getWidth()+'px',
            height:me.getHeight()+'px'
        };
        
     /*   var options = {
        //stabilize: false   // stabilize positions before displaying
            width: me.getWidth()+'px',
            height:me.getHeight()+'px'
        };*/

        var container = document.getElementById('n_t_n_'+me.meshId);
        var network = new vis.Network(container, data, options);      
        network.stabilize(50);
    
             	
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
