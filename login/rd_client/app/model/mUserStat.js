Ext.define('AmpConf.model.mUserStat', {
    extend: 'Ext.data.Model',
    fields: [
            {name: 'id',           type: 'int'      },
            {name: 'time_unit',    type: 'string'   },
            {name: 'data_in',      type: 'int'      },
            {name: 'data_out',     type: 'int'      }
        ]
});
