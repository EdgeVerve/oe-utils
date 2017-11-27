(function() {
    this.store = {};
    window.OEUtils = window.OEUtils || {};
    window.OEUtils.oeCache = this.store;
    this.fire = function(eName, eDetails) {
        var evt = new CustomEvent(eName, { bubbles: true, detail: eDetails });
        window.dispatchEvent(evt);
    }
    this._updateCache = function(e) {
        //  console.log("updating")
        if (e && e.detail && e.detail.key && e.detail.data) {
            console.log('Updating for ', e.detail.key);
            this.store[e.detail.key] = e.detail.data;
            this.fire('oe-cache-' + e.detail.key + '-updated', e.detail.data);
        }
    }.bind(this);
    window.addEventListener('oe-update-cache', this._updateCache);
})();