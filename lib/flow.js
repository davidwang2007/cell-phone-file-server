/***
 * 1. 提供排队执行机制
 * 2. 提供并发执行机制
 * @author davidwang
 * @date 2016-12-26 10:12:41
 */

function noop() { }

function Serial() {
    if (!(this instanceof Serial)) return new Serial();
    this.funcs = [];
    this.errors = [];
    this._done = noop;
    return this;
}

/**
 * 如果接收到err
 */
Serial.prototype._callback = function (err) {
    this.errors.push(err);
    if (err) return this._done(err);
    var func = this.funcs.shift();
    func ? process.nextTick(func.bind(this, this._callback)) : this._done.apply(this, this.errors);

    return this;
};

/**
 * func params: cb
 */
Serial.prototype.then = function (func) {
    this.funcs.push(func);
    //bind the function
    return this;
};

Serial.prototype.done = function (cb) {
    this._done = cb;
    var func = this.funcs.shift();
    func ? process.nextTick(func.bind(this, this._callback)) : cb();
    return this;
};


/**
 * 并行执行
 */
function Parallel() {
    if (!(this instanceof Parallel)) return new Parallel();
    this.funcs = [];
    this._done = noop;
    this.errors = [];
    this.count = 0;
    return this;
}

/**
 * 并行时的回调
 */
Parallel.prototype._callback = function(err,index){
    this.count--;
    this.errors[index] = err;
    if(this.count == 0) this._done.apply(this,this.errors);
};

/**
 * add function to execute
 */
Parallel.prototype.add = function(func){
    this.count++;
    var i = this.funcs.length;
    this.funcs.push(func);
    //execute immediately    
    process.nextTick(func.bind(undefined,this._callback.bind(this),i));
    return this;
}

Parallel.prototype.done = function(cb){
    this._done = cb;
    if(this.count == 0) cb();
    return this;
};


module.exports = {
    P: Parallel,
    Parallel: Parallel,
    S: Serial,
    Serial: Serial
};