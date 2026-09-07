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
        {   
            xtype   : 'button',      
            glyph   : Rd.config.icnReload ,
            scale   : 'small', 
            itemId  : 'reload',   
            tooltip : i18n('sReload'),
            ui      : Rd.config.btnUiReload
        }  
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

/*
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
        ],

        style: [
            {
                selector: 'node',
                style: {
                    'shape': 'circle',
                    'label': 'data(name)' + "\n" + 'data(last_contact_human)',
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
    */
/*    
    var cy = cytoscape({
  container: document.getElementById(containerId),

  boxSelectionEnabled: false,
  autounselectify: true,

  style: cytoscape.stylesheet()
    .selector('node')
      .css({
        'height': 80,
        'width': 80,
        'background-fit': 'cover',
        'border-color': '#000',
        'border-width': 3,
        'border-opacity': 0.5
      })
    .selector('.eating')
      .css({
        'border-color': 'red'
      })
    .selector('.eater')
      .css({
        'border-width': 9
      })
    .selector('edge')
      .css({
        'curve-style': 'bezier',
        'width': 6,
        'target-arrow-shape': 'triangle',
        'line-color': '#ffaaaa',
        'target-arrow-color': '#ffaaaa'
      })
    .selector('#bird')
      .css({
        'background-image': 'https://live.staticflickr.com/7272/7633179468_3e19e45a0c_b.jpg'
      })
    .selector('#cat')
      .css({
        'background-image': 'https://live.staticflickr.com/1261/1413379559_412a540d29_b.jpg'
      })
    .selector('#ladybug')
      .css({
        'background-image': 'https://live.staticflickr.com/3063/2751740612_af11fb090b_b.jpg'
      })
  .selector('#aphid')
      .css({
        'background-image': 'https://live.staticflickr.com/8316/8003798443_32d01257c8_b.jpg'
      })
  .selector('#rose')
      .css({
        'background-image': 'https://live.staticflickr.com/5109/5817854163_eaccd688f5_b.jpg'
      })
  .selector('#grasshopper')
      .css({
        'background-image': 'https://live.staticflickr.com/6098/6224655456_f4c3c98589_b.jpg'
      })
  .selector('#plant')
      .css({
        'background-image': 'https://live.staticflickr.com/3866/14420309584_78bf471658_b.jpg'
      })
  .selector('#wheat')
      .css({
        'background-image': 'https://live.staticflickr.com/2660/3715569167_7e978e8319_b.jpg'
      }),

  elements: {
    nodes: [
      { data: { id: 'cat' } },
      { data: { id: 'bird' } },
      { data: { id: 'ladybug' } },
      { data: { id: 'aphid' } },
      { data: { id: 'rose' } },
      { data: { id: 'grasshopper' } },
      { data: { id: 'plant' } },
      { data: { id: 'wheat' } }
    ],
    edges: [
      { data: { source: 'cat', target: 'bird' } },
      { data: { source: 'bird', target: 'ladybug' } },
      { data: { source: 'bird', target: 'grasshopper' } },
      { data: { source: 'grasshopper', target: 'plant' } },
      { data: { source: 'grasshopper', target: 'wheat' } },
      { data: { source: 'ladybug', target: 'aphid' } },
      { data: { source: 'aphid', target: 'rose' } }
    ]
  },

  layout: {
    name: 'breadthfirst',
    directed: true,
    padding: 10
  }
}); // cy init

*/

// register the layout
   var cy = window.cy = cytoscape({
		container: document.getElementById(containerId),

		layout: {
			name: 'avsdf',
			nodeSeparation: 120
		},

		style: [
			{
				selector: 'node',
				style: {
					'label'         : 'data(name)',
					'text-valign'   : 'center',
					'color'         : '#0f1f3d',
					'background-color': 'data(color)',
					'shape'         : 'data(shape)'
				}
			},

			{
				selector: 'edge',
				style: {
					'width': 'data(width)',
					'line-color': 'data(color)',
					'opacity': 'data(alpha)',
					
				}
			}
		],

		elements: items /*{
			nodes: [
				{ data: { id: 'v1', weight: 1} },
				{ data: { id: 'v2', weight: 2} },
				{ data: { id: 'v3', weight: 3} },
				{ data: { id: 'v4', weight: 4} },
				{ data: { id: 'v5', weight: 5} },
				{ data: { id: 'v6', weight: 6} },
				{ data: { id: 'v7', weight: 7} }
			],
			edges: [
				{ data: { source: 'v1', target: 'v2', directed: 'false'} },
				{ data: { source: 'v1', target: 'v4', directed: 'false'} },
				{ data: { source: 'v1', target: 'v5', directed: 'false'} },
				{ data: { source: 'v2', target: 'v4', directed: 'false'} },
				{ data: { source: 'v2', target: 'v6', directed: 'false'} },
				{ data: { source: 'v3', target: 'v4', directed: 'false'} },
				{ data: { source: 'v3', target: 'v7', directed: 'false'} },
				{ data: { source: 'v4', target: 'v5', directed: 'false'} },
				{ data: { source: 'v4', target: 'v7', directed: 'false'} },
				{ data: { source: 'v5', target: 'v6', directed: 'false'} },
				{ data: { source: 'v6', target: 'v7', directed: 'false'} },
				{ data: { source: 'v6', target: 'v3', directed: 'false'} }
			]
		}*/
	});

    
}
    
});
