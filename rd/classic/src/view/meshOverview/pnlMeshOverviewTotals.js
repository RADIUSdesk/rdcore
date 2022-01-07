
Ext.define('Rd.view.meshOverview.pnlMeshOverviewTotals', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlMeshOverviewTotals',
    title   : "NETWORK TOTALS",
	itemId   : 'pnl_ov_tots',
    headerPosition: 'top',
	ui       : 'light',
	bodyStyle: {backgroundColor : '#f0f1f2' }, 
    margin  : 0,
    padding : 0,
	height: 700,
	minHeight: 700,
    scrollable : false,
    border  : false,
    layout: {
        type    : 'vbox',
        align   : 'stretch'
    },
    requires: [
        'Rd.view.meshOverview.vcPnlMeshOverview'
    ],
    controller  : 'vcPnlMeshOverview',
    listeners: {
		afterrender: 'onAfterMeshOverviewTotalsRender'
    },
    initComponent: function() {
        var me      = this; 
        var m       = 10;
        var p       = 20;
        var h       = 150;
        var w2      = 100;
        var w       = 120;
        var t_a     = 'center';

        me.items = [
			{
				xtype: 'container',
				layout: {type: 'hbox', align: 'stretch' },
				flex: 1,
				items: [
					{
						xtype       : 'container',
						ui          : 'light',
						//title       : Rd.config.meshNetworks,
						itemId      : 'pnlNetworks',
						//titleAlign  : t_a,
						margin      : m,
						padding     : p,
						//border      : true,
						flex		: 1,
						//width       : w,
						//height      : h,
						layout      : 'auto',
						//glyph       : Rd.config.icnMesh,
						html		:	'<div class="col-md-6">'+
											'<div class="netword-card gradeient-1">'+
											'	<div class="card-title">Networks</div>'+
											//'	<div class="card-icon"><img src="resources/images/icons/1.png" alt=""></div>'+
											'	<div class="card-digit dg4"><span id="totGP">0</span></div>'+
											'</div>'+
										'</div>'
					},
					{
						xtype: 'container',
						ui   : 'light',
						//title: Rd.config.meshUsers,
						//titleAlign: t_a,
						margin  : m,
						padding : p,
						//border: true,
						flex		: 1,
						//width: w,
						//height: h,
						layout: 'auto',
						//glyph  : Rd.config.icnUser,
						itemId      : 'pnlUsers',
						html	:	'<div class="col-md-6">'+
										'<div class="netword-card-2 gradeient-2">'+
										'	<div class="card-title">Users <br> Connected</div>'+
										//'	<div class="card-icon"><img src="resources/images/icons/2.png" alt=""></div>'+
										'	<div class="card-digit dg1"><span id="totUsers">0</span></div>'+                                               
										'</div>'+
									'</div>'
					},
					{
						xtype       : 'container',
						ui          : 'light',
						//title       : Rd.config.meshData,
						//titleAlign  : t_a,
						margin      : m,
					    padding     : p,
						//border      : true,
						flex		: 1,
						//width       : w,
						//height      : h,
						layout      : 'auto',
						//glyph       : Rd.config.icnData,
						itemId      : 'pnlData',
						html		:	'<div class="col-md-6">'+
											'<div class="netword-card-3 gradeient-3">'+
											'	<div class="card-title">Data used</div>'+
											//'	<div class="card-icon"><img src="resources/images/icons/3.png" alt=""></div>'+
											'	<div class="card-digit dg2"><span id="totData">0.0</span> <span id="totDataSz">Kb</span></div>'+
											'	<ul>'+
											'		<li class="li-arrow-down"><i class="ti-arrow-down"></i><strong>Down</strong>: <span id="totDownData">0.0</span> <span id="totDwnDataSz">Kb</span></li>'+
											'		<li class="li-arrow-up"><i class="ti-arrow-up"></i><strong>Up</strong>: <span id="totUpData">0.0</span> <span id="totUpDataSz">Kb</span></li>'+
											'	</ul>'+
											'</div>'+
										'</div>'
					}
				]
			},{
				xtype: 'container',
				flex: 1,
				layout: {type: 'hbox', align: 'stretch' },
				items: [
					{
						xtype: 'container',
						ui   : 'light',
						//title: Rd.config.meshNodesOnline,
						//titleAlign: t_a,
						margin  : m,
						padding : p,
						//border: true,
						flex		: 1,
						//width: w2,
						//height: h,
						layout: 'auto',
						//glyph  : Rd.config.icnCheck,
						itemId 	: 'pnlOnline',
						html	: 	'<div class="col-md-6">'+
										'<div class="netword-card-4 gradeient-3">'+
										'	<div class="card-title">MESH STATION<br>STATUS</div>'+
										//'	<div class="card-icon"><img src="resources/images/icons/5.png" alt=""></div>'+
										'	<ul class="ls2">'+
										'		<li><i class="online"></i><strong>Online</strong>: <span id="nonl">0.0</span></li>'+
										//'		<li><i class="offline"></i><strong>Offline</strong>: <span id="noffl">0.0</span></li>'+
										'		<li><i class="ntotal"></i><strong>Provisioned</strong>: <span id="ntotl">0.0</span></li>'+
										'	</ul>'+
										'	<canvas id="donut" width="400" height="400"></canvas>'+
										'</div>'+
									'</div>'
					},
					{
						xtype       : 'container',
						ui          : 'light',
						//title       : Rd.config.meshNodes,
						//titleAlign  : t_a,
						margin      : m,
						padding     : p,
						//border      : true,
						flex		: 1,
						//width       : 120,
						//height      : h,
						layout      : 'auto',
						//glyph       : Rd.config.icnCube,
						itemId      : 'pnlNodes',
						html        :	'<div class="col-md-6">'+
											'<div class="netword-card-2 gradeient-2">'+
											'	<div class="card-title">MESH <br>Stations </div>'+
											//'	<div class="card-icon"><img src="resources/images/icons/4.png" alt=""></div>'+
											'	<div id="hotspots" class="card-digit dg3">0</div>'+
											'	<ul class="ls3">'+
											'		<li class="li-flaticon-wifi"><i class="flaticon-wifi"></i><strong>Single Band</strong>: <span id="sbRadios">0</span> </li>'+
											'		<li class="li-flaticon-wifi-signal"><i class="flaticon-wifi-signal-symbol"></i><strong>Dual Band</strong>: <span id="dbRadios">0</span></li>'+
											'	</ul>'+
											'</div>'+
										'</div>'
					},
					 
						// Original HotSpot Uptime  */
					,
					{
						xtype       : 'container',
						ui          : 'light',
						//title       : Rd.config.meshNodesOffline,
						//titleAlign  : t_a,
						margin      : m,
						padding     : p,
						//border      : true,
						flex		: 1,
						//width       : w2,
						//height      : h,
						layout      : 'auto',
						//glyph       : Rd.config.icnExclCircle,
						itemId      : 'pnlOffline',
						html		:	'<div class="col-md-6">'+
											'<div class="netword-card-6 gradeient-1">'+
											'	<div class="card-title">AVERAGE UPTIME</div>'+
											//'	<div class="card-icon"><img src="resources/images/icons/6.png" alt=""></div>'+
											'		<canvas id="donut2" width="400" height="400"></canvas>'+
											'</div>'+
										'</div>'

					}			
				]
			}
        ];

        me.callParent(arguments);
    }
});
