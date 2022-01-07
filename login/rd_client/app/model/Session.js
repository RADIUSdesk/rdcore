Ext.define('AmpConf.model.Session', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'token', type: 'string' },
        { name: 'expires', type: 'date' }
    ],
    statics: {
        login: function(username,type) {
            var url = '/cake3/rd_cake/rd-clients/get_usage.json';
            var params  = {username:username,type:type};
            var x       = location.search;
            var y       = Ext.Object.fromQueryString(x);
            var z       = Ext.Object.merge(params, y);
            return new Ext.Promise(function (resolve, reject) {
                 Ext.Ajax.request({
                     url      : url,
                     method   : 'GET',
                     params   : z,
                     success: function (response) {
                         // Use the provided "resolve" method to deliver the result.
                        var obj = Ext.decode(response.responseText);
                        if(obj.success){
                            resolve(obj);
                        }else{
                            reject(obj);
                        }  
                     },
                     failure: function (response) {
                         reject(response.status);
                     }
                 });
             });
        }
    },

    isValid: function() {
       /* return !Ext.isEmpty(this.get('token'))
            && this.get('expires') > new Date()
            && this.getUser() !== null;*/
    },

    logout: function() {
        return new Ext.Promise(function (resolve, reject) {
            //Server.auth.logout({}, resolve);
        });
    }
});
