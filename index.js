var svgImg;
var iter = 1;
var globalCounter = 0;
var searchDiv = document.getElementById('baseDiv');
let userInput;
let counter = 0;


function setup() {
    noCanvas();
    userInput = select('#userinput');
    userInput.changed(startSearch);
    setupSVG();
    //window.addEventListener('wheel', function(e) { zoom(e); });
}

function setupSVG(){
    svgImg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgImg.setAttribute("width", document.body.clientWidth);
    svgImg.setAttribute("height", document.body.clientWidth/2);
    svgImg.setAttribute("viewBox", "-50 0 200 100");
    svgImg.setAttribute("style", "margin: 0 !important; padding: 0 !important;");
    svgImg.setAttribute("bg-position", "left 0px top 0px")
    document.body.appendChild(svgImg);
}

function play(results){
    console.log('play called with results', results)

    results.forEach((r) => {
        addIteration(iter, r.title, r.link);
        iter++;
    });
}

function addIteration(q, word, link) {
    console.log('addIteration called with', q, word, link)
    for (var p=0; p<=q; p++){
        if(gcd(p, q)==1){
            addFordCircle(p, q,word, link);
        }
    }
}

function addFordCircle(p, q, word, link) {
    addCircle(p/q, 1/(2*q*q), 1/(2*q*q),word, p, link);
}

function addCircle(x, y, r, c, n, link){
    //console.log('addCircle called')
    y = 1.0 - y; //Flips cartesian coordinate to svg coordinate
    var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx",x*100);
    circle.setAttribute("cy",y*100);
    circle.setAttribute("r",r*100);
    circle.setAttribute("stroke-width",0);
    //circle.setAttribute("fill", c);

    //  <text x="20" y="20" font-family="sans-serif" font-size="20px" fill="red">Hello!</text>
    var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    //add some text
    text.setAttribute("x",x*100);
    text.setAttribute("y",y*100);
    text.setAttribute("font-family","sans-serif");
    text.setAttribute("font-size", (5/(n+2))+"px");
    text.setAttribute("fill", "white");
    text.setAttribute("text-anchor", "middle");
    //text.setAttribute("onclick", window.open(link))
    text.textContent = c;
    svgImg.appendChild(circle);
    svgImg.appendChild(text);
}


function zoom(e){
  // console.log(e.deltaY);

    if (e.deltaY !== 0) {
        var zoomFactor = 1.09;
        var initialViewBox = svgImg.getAttribute("viewBox");
        var viewBoxArr = initialViewBox.split(" ").map(parseFloat);
        var x = viewBoxArr[0];
        var y = viewBoxArr[1];
        var w = viewBoxArr[2];
        var h = viewBoxArr[3];
        var cx = x+(w/2);
        var cy = y+(h/2);
        if (e.deltaY < 0) { //scroll up = zoom in
            w/=zoomFactor;
            h/=zoomFactor;
            x=cx-(w/2);
            y=cy-(h/2)/zoomFactor;
            globalCounter++;
        } else { //scroll down = zoom out
            w*=zoomFactor;
            h*=zoomFactor;
            x=cx-(w/2);
            y=cy-(h/2)*zoomFactor;
            globalCounter--;
        }
        // console.log("Old viewBox: " + initialViewBox);
        var outputViewBox = [x,y,w,h].join(" ");
        svgImg.setAttribute("viewBox", outputViewBox);
        console.log(globalCounter);
        // if(globalCounter%30===0){
        //   _iter++;
        //   addIteration(_iter);
        // }
        console.log("New viewBox: " + outputViewBox);

    }
}

let searchUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&limit=100&search=';
let contentUrl = 'https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json&titles=';

  function startSearch() {
    counter = 0;
    goWiki(userInput.value());
  }

  function goWiki(term) {
    console.log('goWiki')
    let url = searchUrl + term;
    loadJSON(url, gotSearch, 'jsonp');
  }

  function gotSearch(data) {
    // to see the data from each page found
    console.log('result', data);
    var results = [];
    var titles = data[1];
    var links = data[3];
    for(var i=0; i<titles.length; i++) {
        results.push({
            title: titles[i],
            link: links[i]
        });
    }
    play(results);
  }

function gcd(a, b) {
    if (a % b === 0) {
        return b;
    }
    return gcd(b, a % b);
}
