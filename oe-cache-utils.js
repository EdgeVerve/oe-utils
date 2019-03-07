/**
 * @license
 * ©2016-2017 EdgeVerve Systems Limited (a fully owned Infosys subsidiary), Bangalore, India. All Rights Reserved.
 */

 /**
  * IIFE function that caches the listdata of oe-combo with hashkey of their listurl
  */
(function() {
    window.OEUtils = window.OEUtils || {};
    let store = {};

    window.OEUtils.oeCache = store;

    /**
     * Fire function similar to Polymer 
     * @param {string} eName event Name
     * @param {Object} eDetails details to send 
     */
    function fire(eName, eDetails) {
        var evt = new CustomEvent(eName, { bubbles: true, detail: eDetails });
        window.dispatchEvent(evt);
    }

    /**
     * Event listener to update the listdata for a hashkey
     * @param {event} e Event containing new data for the haskey
     */
    function _updateCache(e) {
        //  console.log("updating")
        if (e && e.detail && e.detail.key && e.detail.data) {
            store[e.detail.key] = e.detail.data;
            fire('oe-cache-' + e.detail.key + '-updated', e.detail.data);
        }
    }
    
    window.addEventListener('oe-update-cache', _updateCache);
})();