Ext.define('Rd.store.sDeviceTopData', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mDeviceTopData',
	storeId		: 'sDeviceTopData',
    pageSize    : 1000,
    remoteSort  : false,
    remoteFilter: true,
	/*
	data: [
		{
			"session_created" : "2017-12-12 03:20:04",
			"last_modified" : "2017-12-13 18:20:47",
			"mac" : "3c:77:e6:fa:b3:ef",
			"tot_tx_bytes" : 5534572208,
			"tot_rx_bytes" : 309915188,
			"tot_bytes" : 5844487396
		},
		{
			"session_created" : "2017-12-09 00:23:44",
			"last_modified" : "2017-12-13 18:20:30",
			"mac" : "74:df:bf:63:96:cd",
			"tot_tx_bytes" : 4589315487,
			"tot_rx_bytes" : 181191930,
			"tot_bytes" : 4770507417
		},
		{
			"session_created" : "2017-12-09 21:00:46",
			"last_modified" : "2017-12-13 18:20:31",
			"mac" : "dc:ef:ca:87:cd:13",
			"tot_tx_bytes" : 3003241860,
			"tot_rx_bytes" : 220524225,
			"tot_bytes" : 3223766085
		},
		{
			"session_created" : "2017-12-09 19:09:20",
			"last_modified" : "2017-12-13 01:45:35",
			"mac" : "94:e9:6a:0e:7b:43",
			"tot_tx_bytes" : 2946626852,
			"tot_rx_bytes" : 122902974,
			"tot_bytes" : 3069529826
		},
		{
			"session_created" : "2017-12-09 19:08:15",
			"last_modified" : "2017-12-13 18:20:31",
			"mac" : "b4:ae:2b:e7:35:38",
			"tot_tx_bytes" : 2376889706,
			"tot_rx_bytes" : 290251550,
			"tot_bytes" : 2667141256
		},
		{
			"session_created" : "2017-12-09 05:36:33",
			"last_modified" : "2017-12-13 11:34:13",
			"mac" : "ac:d1:b8:d9:83:89",
			"tot_tx_bytes" : 1945836569,
			"tot_rx_bytes" : 115995146,
			"tot_bytes" : 2061831715
		},
		{
			"session_created" : "2017-12-09 17:58:21",
			"last_modified" : "2017-12-10 01:13:10",
			"mac" : "70:81:eb:65:f0:89",
			"tot_tx_bytes" : 1693774783,
			"tot_rx_bytes" : 94738433,
			"tot_bytes" : 1788513216
		},
		{
			"session_created" : "2017-12-09 00:02:56",
			"last_modified" : "2017-12-13 01:45:37",
			"mac" : "58:40:4e:33:d3:9d",
			"tot_tx_bytes" : 1169023574,
			"tot_rx_bytes" : 72864443,
			"tot_bytes" : 1241888017
		},
		{
			"session_created" : "2017-12-09 01:18:32",
			"last_modified" : "2017-12-13 01:22:52",
			"mac" : "14:56:8e:d5:96:52",
			"tot_tx_bytes" : 684103702,
			"tot_rx_bytes" : 40309958,
			"tot_bytes" : 724413660
		},
		{
			"session_created" : "2017-12-09 00:01:49",
			"last_modified" : "2017-12-13 18:20:32",
			"mac" : "44:c3:06:20:1c:2c",
			"tot_tx_bytes" : 439328871,
			"tot_rx_bytes" : 229654077,
			"tot_bytes" : 668982948
		}
    ]
    */
	proxy: {
            type    : 'ajax',
            format  : 'json',
            batchActions: true, 
            url     : '/cake3/rd_cake/device-topdata/index.json',
            extraParams: { 'timespan': 'monthly'},
            reader: {
                type            : 'json',
                rootProperty    : 'items',
                messageProperty : 'message',
                totalProperty   : 'totalCount' //Required for dynamic paging
            },
            api: {
                destroy  : '/cake3/rd_cake/meshes/delete.json'
            },
            simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
    },
    autoLoad: true

});
