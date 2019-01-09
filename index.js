var svgImg;
var animDelay = 100;
var iter;
var MAX_DEPTH = 2;
var colors = ['blue'];
var globalCounter = 0;
var _iter = 1;
var colorHasChanged = false;
function pageLoad(){
    window.addEventListener('wheel', function(e) { zoom(e); });
    window.addEventListener('keydown', function(e) { pan(e); });

}
function getElem(idStr){
    return document.getElementById(idStr);
}

function init(){
    setupSVG();
    iter = 0;
    play();
    addIteration(_iter);
}

function setupSVG(){
    svgImg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgImg.setAttribute("width", document.body.clientWidth);
    svgImg.setAttribute("height", document.body.clientWidth/2);
    svgImg.setAttribute("viewBox", "-0.5 0 2 1");
    svgImg.setAttribute("style", "margin: 0 !important; padding: 0 !important;");
    document.body.appendChild(svgImg);
}

function play(word){
    iter++
    addIteration(iter,word);
    // if(iter<MAX_DEPTH){
    //     setTimeout(play, animDelay);
    // }
}

function gcd(a,b) {
    if (a%b === 0) {
        return b;
    }
    return gcd(b,a%b);
}

function addIteration(q,word){
    for (var p=0; p<=q; p++){
        if(gcd(p, q)==1){
            addFordCircle(p, q,word);
        }
    }
}

function addFordCircle(p, q,word){
    addCircle(p/q, 1/(2*q*q), 1/(2*q*q),word);
}
function addCircle(x, y, r, c,word){
    y = 1.0 - y; //Flips cartesian coordinate to svg coordinate
    var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx",x);
    circle.setAttribute("cy",y);
    circle.setAttribute("r",r);
    circle.setAttribute("stroke-width",0);
    circle.setAttribute("fill", c);

    //add some text
    // --> word
    svgImg.appendChild(circle);
}

function changeAllCircleColor(){
  var allCircles = svgImg.getElementsByTagName('circle');
  console.log(allCircles);
  colorHasChanged = !colorHasChanged;
  col = (colorHasChanged)?'red':'black';
  for(var i =0;i<allCircles.length;i++){
    allCircles[i].setAttribute("fill", col);
  }
}

function zoom(e){
  // console.log(e.deltaY);

    if (e.deltaY !== 0) {
        var zoomFactor = 1.01;
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

function pan(e){
  changeAllCircleColor();
    console.log(e.key);
    if(e.key.substr(0,1) === "Arrow" || ["w","a","s","d","W","A","S","D"].indexOf(e.key)>-1){
        var initialViewBox = svgImg.getAttribute("viewBox");
        var viewBoxArr = initialViewBox.split(" ").map(parseFloat);
        var x = viewBoxArr[0];
        var y = viewBoxArr[1];
        var w = viewBoxArr[2];
        var h = viewBoxArr[3];

        if(e.key === "ArrowDown" || e.key.toLowerCase() === "s"){
            console.log("D");
            y+=w/100;
        } else if(e.key === "ArrowUp" || e.key.toLowerCase() === "w"){
            console.log("U");
            y-=w/100;
        } else if(e.key === "ArrowLeft" || e.key.toLowerCase() === "a"){
            console.log("L");
            x-=w/100;
        } else if(e.key === "ArrowRight" || e.key.toLowerCase() === "d"){
            console.log("R");
            x+=w/100;
        }

        console.log("Old viewBox: " + initialViewBox);
        var outputViewBox = [x,y,w,h].join(" ");
        svgImg.setAttribute("viewBox", outputViewBox);
        console.log("New viewBox: " + outputViewBox);
    }
}






let searchUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=';
let contentUrl = 'https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json&titles=';


let userInput;
let counter = 0;
let title = 'null';

function setup() {
  console.log('setup');
  noCanvas();
  // data from the search box
  userInput = select('#userinput');
  userInput.changed(startSearch);
    init();
}

  function startSearch() {
    counter = 0;
    goWiki(userInput.value());
  }

  function goWiki(term) {
    counter = counter + 1;
    // checking if the word is within the wikipedia title
    if (counter < 100) {
      // for keeping initial search in randomized guess
      //let term = userInput.value();
      let url = searchUrl + term;
      loadJSON(url, gotSearch, 'jsonp');

    }
    else {
      // displaying the number of searches if the word is found
      window.alert("Word was found");
      createDiv("Number of searches to find word:");
      createDiv(counter);


    }
  }

  function gotSearch(data) {
    // uncomment if you want to see the data from each page found
    //console.log(data);
    let len = data[1].length;
    let index = floor(random(len));
    title = data[1][index];

    // using try and catch to deal with randomly selecting non words in the article
    try {
    title = title.replace(/\s+/g, ' ');
    }
    catch(err) {
      title = userInput.value();
    }
    createDiv(title);
    console.log('Querying: ' + title);
    let url = contentUrl + title;
    loadJSON(url, gotContent, 'jsonp');

    play(title);
  }

  function gotContent(data) {
    let page = data.query.pages;
    let pageId = Object.keys(data.query.pages)[0];
    console.log(pageId);
    let content = page[pageId].revisions[0]['*'];
    let wordRegex = /\b\w{4,}\b/g;
    let words = content.match(wordRegex);
    // randomly selecting a word from within the wikipedia article
    let word = random(words);
    goWiki(word);

  }
