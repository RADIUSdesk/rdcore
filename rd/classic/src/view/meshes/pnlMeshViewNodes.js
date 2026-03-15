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
                	//console.log(jsonData);
                	me.buildScreen(jsonData.items);
					me.setLoading(false);
                }   
            },
            scope: me
        });
	},
	buildScreen: function(items){
    var me = this;

    var containerId = "n_t_n_" + me.meshId;

    var cy = cytoscape({
        container: document.getElementById(containerId),

        elements: items,
        /*[

            // Node
            { data: { id: 'internet', label: 'Internet', type: 'internet' } },

            { data: { id: 'node1', label: 'Node 1', type: 'mesh', img: 'resources/images/vis/49_openwrt_one.png'  } },
            { data: { id: 'node2', label: 'Node 2', type: 'mesh', img: 'resources/images/vis/49_openwrt_one.png' } },
            { data: { id: 'node3', label: 'Node 3', type: 'mesh', img: 'resources/images/vis/49_openwrt_one.png' } },

            // Edges
            { data: { source: 'internet', target: 'node1' } },

            { data: { source: 'node1', target: 'node2' } },
            { data: { source: 'node2', target: 'node3' } },
            { data: { source: 'node3', target: 'node1' } }
        ],*/

        style: [
            {
                selector: 'node',
                style: {
                    'shape': 'circle',
                    'label': 'data(name)',
                    'text-valign': 'bottom',
                    'text-halign': 'center',
                    'font-size': 10,
                 //   'background-fit': 'cover',
                    'background-image': 'data(url)',
                    'width': 150,
                    'height': 150,
                    'border-width': 3,
                    'border-color': '#666'
                }
            },
            {
                selector: 'node[state="up"]',
                style: {
                    'border-color': '#2ecc71'
                }
                },

                {
                selector: 'node[state="down"]',
                style: {
                    'border-color': '#e74c3c',
                    'opacity': 0.35
                }
                },

                {
                selector: 'node[gateway]',
                style: {
                 //   'shape': 'diamond',
                    'border-width': 5,
                    'border-color': '#3498db'
                }
                },

                {
                selector: 'edge',
                style: {
                    'curve-style': 'bezier',
                    'line-color': 'data(color)',
                    'width': 'data(width)',
                    'opacity': 0.8
                }
            }
        ],
        layout: {
          name: 'cose',
          idealEdgeLength: 120,
          nodeRepulsion: 8000
        }
    });

    me.cy = cy;
}
    
});
