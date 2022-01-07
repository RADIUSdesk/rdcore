Ext.define('Rd.model.mMeshNodeRogue', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',               type: 'int'     },
         {name: 'channel',          type: 'int'     },
         {name: 'signal',           type: 'int'     },
         {name: 'quality',          type: 'int'     },
         {name: 'quality_max',      type: 'int'     },
         {name: 'ssid',          	type: 'string'  },
		 {name: 'mode',          	type: 'string'  },
         {name: 'bssid',            type: 'string'  },
		 {name: 'mac',        	    type: 'string'  },
         {name: 'mac_vendor',       type: 'string'  }, 
         {name: 'rogue_flag',       type: 'bool'},
         'encryption'		
        ]
});
