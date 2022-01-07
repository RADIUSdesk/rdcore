Ext.define('Rd.model.mDeviceTopData', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',               type: 'string'     },
         {name: 'name',             type: 'string'  },
         {name: 'mac',              type: 'string'},
         {name: 'tot_tx_bytes',     type: 'int'},
         {name: 'tot_rx_bytes',     type: 'int'},
         {name: 'tot_bytes',         type: 'int'}
        ]
});
