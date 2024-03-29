/**
 * Get random number.
 * @param {number} min
 * @param {number} max
 * @param {number}
 */
function getRandomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomNum0_1(min,max){
    var num = Math.random() * (max - min) + min;
    return roundFirstDecimal(num);
}

function roundFirstDecimal(num){
    return Math.round(num * 10) / 10;
}

function getRandomFromRange(range) {
    var min = range[0]
    var max = range[1];
    return getRandomNum(min, max);
}

function getRandomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get random number in gaussian distribution
 * @param {number} min
 * @param {number} max
 */
function getRandomGaussian(min, max) {
    return Math.floor(min + gaussianRand() * (min - max + 1));
}

function gaussianRand() {
    var rand = 0;

    for (var i = 0; i < 6; i += 1) {
        rand += Math.random();
    }

    return rand / 6;
}

/**
 * Get random from (1-) squared stochastic variable
 * Higher chance to get values closer to max
 * CDF: sqrt(x)
 * PDF: 1/(2*sqrt(x))
 * @param {number} min 
 * @param {number} max 
 */
function getRandomSquared(pow, min, max) {
    var rand = Math.random();
    var sq = 1 - Math.pow(rand, pow);
    return Math.floor(sq * (max - min + 1)) + min;
}

/**
 * 
 * @param {number} spec distribution e.g. {'CACTUS_LARGE' : 0.35, 'CACTUS_SMALL': 0.35, 'PTERODACTYL': 0.3}
 */
function getRandomWeighted(spec) {
    var i, j, table = [];
    for (i in spec) {
        // The constant 10 below should be computed based on the
        // weights in the spec for a correct and optimal table size.
        // E.g. the spec {0:0.999, 1:0.001} will break this impl.
        for (j = 0; j < spec[i] * 10; j++) {
            table.push(i);
        }
    }
    return table[Math.floor(Math.random() * table.length)];

}

function getRandomSpec(values){
    var n = values.length;
    var d = {}
    if(n == 1){
        d[values[0]] = 1;
    } else {
        var total = 0;
        for(var i = 0; i < n; i++){
            if(i == n - 1){
                var rest = roundFirstDecimal(1 - total);
                d[values[i]] = rest;
            } else {
                var random = getRandomNum0_1(0.1, 1-((n - 1 - i)/10)-total );
                total += random;
                d[values[i]] = random;
            }
        }
    }
    return d;
}
/**
 * Vibrate on mobile devices.
 * @param {number} duration Duration of the vibration in milliseconds.
 */
function vibrate(duration) {
    if (IS_MOBILE && window.navigator.vibrate) {
        window.navigator.vibrate(duration);
    }
}
/**
 * Create canvas element.
 * @param {HTMLElement} container Element to append canvas to.
 * @param {number} width
 * @param {number} height
 * @param {string} opt_classname
 * @return {HTMLCanvasElement}
 */
function createCanvas(container, width, height, opt_classname) {
    var canvas = document.createElement('canvas');
    canvas.className = opt_classname ? Runner.classes.CANVAS + ' ' +
        opt_classname : Runner.classes.CANVAS;
    canvas.width = width;
    canvas.height = height;
    container.appendChild(canvas);
    return canvas;
}
/**
 * Decodes the base 64 audio to ArrayBuffer used by Web Audio.
 * @param {string} base64String
 */
function decodeBase64ToArrayBuffer(base64String) {
    var len = (base64String.length / 4) * 3;
    var str = atob(base64String);
    var arrayBuffer = new ArrayBuffer(len);
    var bytes = new Uint8Array(arrayBuffer);
    for (var i = 0; i < len; i++) {
        bytes[i] = str.charCodeAt(i);
    }
    return bytes.buffer;
}
/**
 * Return the current timestamp.
 * @return {number}
 */
function getTimeStamp() {
    return IS_IOS ? new Date().getTime() : performance.now();
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}

function addUserCookieToJSON(json) {
    json.cookie = getUserCookie();
}

function normalizeEvents(events){
    
}

function dispatchDocumentEvent(event_name){
    var evt = document.createEvent("Event");
    evt.initEvent(event_name, true, true);
    document.dispatchEvent(evt);
}

function permute(xs) {
    let ret = [];
  
    for (let i = 0; i < xs.length; i = i + 1) {
      let rest = permute(xs.slice(0, i).concat(xs.slice(i + 1)));
  
      if(!rest.length) {
        ret.push([xs[i]])
      } else {
        for(let j = 0; j < rest.length; j = j + 1) {
          ret.push([xs[i]].concat(rest[j]))
        }
      }
    }
    return ret;
}

function combinations( list ){
    var set = [],
        listSize = list.length,
        combinationsCount = (1 << listSize),
        combination;

    for (var i = 1; i < combinationsCount ; i++ ){
        var combination = [];
        for (var j=0;j<listSize;j++){
            if ((i & (1 << j))){
                combination.push(list[j]);
            }
        }
        set.push(combination);
    }
    return set;
}

function getCurrentDateTime(){
    let date = new Date().toISOString();
    return date;
}

var ceil = function (num, precision) {
	num = parseFloat(num);
	if (!precision) return num;
	return (Math.ceil(num / precision) * precision);
};

var floor = function (num, precision) {
	num = parseFloat(num);
	if (!precision) return num;
	return (Math.floor(num / precision) * precision);
};

function get_percentages_from_count_dict(d){
    var total = Object.values(d).reduce((a, b) => a + b)
    percentages = {};
    var keys = Object.keys(d);
    for(var i = 0; i < keys.length; i++){
        var key = keys[i];
        percentages[key] = d[key] / total;
    }
    return percentages;
}