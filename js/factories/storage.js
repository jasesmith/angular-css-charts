angular.module('app')
.factory('StorageService', function () {
    return {
        /**
         * get item out of local storage and if it's a string, turn it into a json object
         * @param key
         * @returns {*}
         */
        get: function (key) {
            var item = localStorage.getItem(key);
            if (item && _.isString(item) && _.isEmpty(item) === false) {
                return angular.fromJson(item);
            } else {
                return item;
            }
        },

        /**
         * save object as a json string
         * @param key
         * @param data
         */
        save: function (key, data) {
            localStorage.setItem(key, JSON.stringify(data));
        },

        /**
         * remove a specific item
         * @param key
         */
        remove: function (key) {
            localStorage.removeItem(key);
        },

        /**
         * blow them all away
         */
        clearAll : function () {
            localStorage.clear();
        }
    };
});
