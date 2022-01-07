Ext.define('Rd.model.mAlive', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',          type: 'int'     },
         {name: 'mac',         type: 'string'  },
         {name: 'mcc',         type: 'string'  },
         {name: 'band',        type: 'string'  },
         {name: 'sig',         type: 'string'  },
         {name: 'debug',       type: 'string'  },
         {name: 'operator',    type: 'string'  },
         {name: 'rband',       type: 'string'  },
         {name: 'time',        type: 'string'  },
         {name: 'country',     type: 'string'  }
        ]
});
