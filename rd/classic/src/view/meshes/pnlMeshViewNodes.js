Ext.define('Rd.view.meshes.pnlMeshViewNodes', {
    extend  	: 'Ext.panel.Panel',
    alias   	: 'widget.pnlMeshViewNodes',
    border  	: false,
	urlOverview	:   '/cake3/rd_cake/mesh-reports/overview.json',
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
		//me.html	= "<div id='n_t_n_"+me.meshId+"' style='width:100%;height:100%;background-color:#aaf6be;'></div>";
		me.html	= "<div id='n_t_n_"+me.meshId+"' style='width:100%;height:100%;background: rgb(104,104,110);background: linear-gradient(90deg, rgba(104,104,110,0.9864320728291317) 0%, rgba(204,227,233,1) 51%, rgba(43, 103, 140, 0.84) 100%);'></div>";
		
		me.buffered = Ext.Function.createBuffered(function(){			
				me.fd.computeIncremental({
					iter	: 40,
					property: ['end'],
					onStep: function(perc){
					  //console.log(perc + '% loaded...');
					},
					onComplete: function(){
					  //console.log('done');
					  me.fd.animate({
						modes: ['linear'],
						transition: $jit.Trans.Elastic.easeOut,
						duration: 2500
					  });
					}
				});
			},1000,me);
		
		me.listeners= {
		    afterrender: function(a,b,c){
				//console.log("afterrender....");
				me.initCanvas();
		    },
			afterlayout: function(a,b,c){
				//console.log("afterlayout....");
				var me = this;
				var w  = me.getWidth();
				var h  = me.getHeight()-90; //90 is the space taken up by the top toolbar
				me.fd.canvas.resize(w,h);	
				me.buffered();
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
                	//console.log(jsonData)
					me.fd.loadJSON(jsonData.data);
					//re-layout
					me.loadImages();
					me.buffered()
					me.setLoading(false);
                }   
            },
            scope: me
        });
	},
	loadImages: function(){
	    var me = this;
        me.fd.graph.eachNode( function(node){
            if( node.getData('type') == 'image' ){
                var img = new Image();
                img.addEventListener('load', function(){
                    node.setData('image',img); // store this image object in node
                }, false);
                img.src=node.getData('url');
            }
        });
    },
	initCanvas: function(){
		var me = this;
		//console.log("Init the canvas");
		var labelType, useGradients, nativeTextSupport, animate;

		(function() {
		  var ua = navigator.userAgent,
			  iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
			  typeOfCanvas = typeof HTMLCanvasElement,
			  nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
			  textSupport = nativeCanvasSupport 
				&& (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
		  //I'm setting this based on the fact that ExCanvas provides text support for IE
		  //and that as of today iPhone/iPad current text support is lame
		  labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
		  nativeTextSupport = labelType == 'Native';
		  useGradients = nativeCanvasSupport;
		  animate = !(iStuff || !nativeCanvasSupport);
		})();
		
		//https://stackoverflow.com/questions/7287285/how-to-make-custom-nodes-in-infovis-toolkit/17089114
		$jit.ForceDirected.Plot.NodeTypes.implement({
            'image': { 
                     'render': function(node, canvas){
                            var ctx = canvas.getCtx(); 
                            var pos = node.pos.getc(true);
                            if( node.getData('image') != 0 ){
                            var img = node.getData('image');
                            ctx.drawImage( img, pos.x-15, pos.y-15,40,40);
                            }
                        }, 
                        'contains': function(node,pos){ 
                            var npos = node.pos.getc(true); 
                            dim = node.getData('dim'); 
                            return this.nodeHelper.circle.contains(npos, pos, dim); 
                        } 
            }
        });


		var i  = 'n_t_n_'+me.meshId;
		// init ForceDirected
		var fd = new $jit.ForceDirected({
			Canvas: {
				height : 500,
        		width  : 200
			},
			//id of the visualization container
			injectInto: i,
			//Enable zooming and panning
			//by scrolling and DnD
			Navigation: {
			  enable: true,
			  //Enable panning events only if we're dragging the empty
			  //canvas (and not a node).
			  panning: 'avoid nodes',
			  zooming: 10 //zoom speed. higher is more sensible
			},
			// Change node and edge styles such as
			// color and width.
			// These properties are also set per node
			// with dollar prefixed data-properties in the
			// JSON structure.
			Node: {
			  	overridable: true          
			},
			Edge: {
			  overridable: true,
			  color: 'red',
			  lineWidth: 0.4
			},
			//Native canvas text styling
			Label: {
			  type	: labelType, //Native or HTML
			  size	: 15,
			  style	: 'bold',
			  color	: '#434446'
			},
			//Add Tips
			Tips: {
			  enable: true,
			  onShow: function(tip, node) {
				//count connections
				var count = 0;
				node.eachAdjacency(function(a,b,c) { 
					console.log(a)
					console.log(b)
					console.log(c)
					count++; 
				});
				//display node info in tooltip
				tip.innerHTML = "<div class='divTip'>"+
					"<h2>"+ node.name + "</h2>"+
					"<label class='lblTipItem'>MAC</label><label class='lblTipValue'>"+node.data.mac+"</label>"+
                    "<div style='clear:both;'></div>"+
					"<label class='lblTipItem'>Description</label><label class='lblTipValue'>"+node.data.description+"</label>"+
                    "<div style='clear:both;'></div>"+
					"<label class='lblTipItem'>Hardware</label><label class='lblTipValue'>"+node.data.hw_human+"</label>"+
                    "<div style='clear:both;'></div>"+
					"<label class='lblTipItem'>IP Address</label><label class='lblTipValue'>"+node.data.ip+"</label>"+
                    "<div style='clear:both;'></div>"+
					"<label class='lblTipItem'>Last contact</label><label class='lblTipValue'>"+node.data.last_contact_human+"</label>"+
                    "<div style='clear:both;'></div>"+
					"</div>";
			  }
			},
			// Add node events
			Events: {
			  enable: true,
			  type: 'Native',
			  //Change cursor style when hovering a node
			  onMouseEnter: function() {
				fd.canvas.getElement().style.cursor = 'move';
			  },
			  onMouseLeave: function() {
				fd.canvas.getElement().style.cursor = '';
			  },
			  //Update node positions when dragged
			  onDragMove: function(node, eventInfo, e) {
				  var pos = eventInfo.getPos();
				  node.pos.setc(pos.x, pos.y);
				  fd.plot();
			  },
			  //Implement the same handler for touchscreens
			  onTouchMove: function(node, eventInfo, e) {
				$jit.util.event.stop(e); //stop default touchmove event
				this.onDragMove(node, eventInfo, e);
			  },
			  //Add also a click handler to nodes
			  onClick: function(node) {
				  if(!node) return;
				  console.log(node);
				  node.data["$color"] = "#FF0000";
				  fd.plot();
			  }
			},
			//Number of iterations for the FD algorithm
			iterations			: 50,
			//Edge length
			levelDistance		: 130,
			// Add text to the labels. This method is only triggered
			// on label creation and only for DOM labels (not native canvas ones).
			onCreateLabel: function(domElement, node){
			  domElement.innerHTML 	= node.name;
			  var style 			= domElement.style;
			  style.fontSize 		= "1.8em";
			  style.color 			= "black";
			}
		});

		//Some dummy date to start with (else it spitz out an error)
		var json = [
			{
				id: "graphnode1",
				name: ".",
				data: {
				    $color: "#117c25",
				    $type: "circle",
				    $dim: 1
				}
			}
		];
		fd.loadJSON(json);
		me.fd 			= fd;
	}
});
