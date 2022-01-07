Ext.define('Rd.model.mMeshTopData', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',               type: 'int'     },
         {name: 'name',             type: 'string'  },
         {name: 'node_count',       type: 'int'},
         {name: 'nodes_up',         type: 'int'},
         {name: 'nodes_down',       type: 'int'},
         {name: 'users',            type: 'int'},
         {name: 'tot_bytes',        type: 'int'},
         {name: 'tot_tx_bytes',     type: 'int'},
         {name: 'tot_rx_bytes',     type: 'int'}
        ]
});
