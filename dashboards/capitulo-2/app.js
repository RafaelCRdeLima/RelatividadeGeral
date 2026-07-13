const NS = "http://www.w3.org/2000/svg";

const state = { beta: 0.60, duration: 10 };
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const gamma = (beta) => 1 / Math.sqrt(1 - beta * beta);
const clean = (value) => Math.abs(value) < 1e-10 ? 0 : value;
const fmt = (value, digits = 2, signed = false) => {
  value = clean(value);
  const prefix = signed && value > 0 ? "+" : "";
  return prefix + value.toFixed(digits).replace(".", ",");
};

function svgEl(name, attrs = {}, text = "") {
  const element = document.createElementNS(NS, name);
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
  if (text) element.textContent = text;
  return element;
}

function add(parent, name, attrs = {}, text = "") {
  const element = svgEl(name, attrs, text);
  parent.appendChild(element);
  return element;
}

function clear(svg) { svg.replaceChildren(); }

function renderReadouts() {
  const b = state.beta;
  $("#betaValue").textContent = fmt(b, 2, true);
  $("#gammaValue").textContent = fmt(gamma(b), 2);
  $("#rapidityValue").textContent = fmt(Math.atanh(b), 2, true);
  $$(".presets button").forEach(button => {
    button.classList.toggle("active", Math.abs(Number(button.dataset.beta) - b) < 1e-6);
  });
}

function renderMinkowski() {
  const svg = $("#minkowskiPlot");
  clear(svg);
  const b = state.beta;
  const L = 4;
  const t0 = 2.5;
  const xMin = -6, xMax = 6, tMin = -5, tMax = 5;
  const left = 72, right = 675, top = 35, bottom = 520;
  const X = x => left + (x - xMin) / (xMax - xMin) * (right - left);
  const Y = t => bottom - (t - tMin) / (tMax - tMin) * (bottom - top);

  const defs = add(svg, "defs");
  const clip = add(defs, "clipPath", { id: "plotClip" });
  add(clip, "rect", { x: left, y: top, width: right-left, height: bottom-top });
  const plot = add(svg, "g", { "clip-path": "url(#plotClip)" });

  for (let x = -6; x <= 6; x += 1) add(plot, "line", { x1:X(x), y1:top, x2:X(x), y2:bottom, class:"grid-line" });
  for (let t = -5; t <= 5; t += 1) add(plot, "line", { x1:left, y1:Y(t), x2:right, y2:Y(t), class:"grid-line" });
  add(plot, "line", { x1:left, y1:Y(0), x2:right, y2:Y(0), class:"axis-line" });
  add(plot, "line", { x1:X(0), y1:top, x2:X(0), y2:bottom, class:"axis-line" });

  add(plot, "line", { x1:X(-5), y1:Y(-5), x2:X(5), y2:Y(5), class:"light-line" });
  add(plot, "line", { x1:X(-5), y1:Y(5), x2:X(5), y2:Y(-5), class:"light-line" });
  add(plot, "line", { x1:X(b*tMin), y1:Y(tMin), x2:X(b*tMax), y2:Y(tMax), class:"prime-time" });
  add(plot, "line", { x1:X(xMin), y1:Y(b*xMin), x2:X(xMax), y2:Y(b*xMax), class:"prime-space" });
  add(plot, "line", { x1:X(xMin), y1:Y(t0+b*xMin), x2:X(xMax), y2:Y(t0+b*xMax), class:"simultaneous-prime" });
  add(plot, "line", { x1:X(-L/2), y1:Y(t0), x2:X(L/2), y2:Y(t0), class:"simultaneous-s" });

  [[-L/2,"A","event-dot-a"],[L/2,"B","event-dot-b"]].forEach(([x,label,klass]) => {
    add(plot, "circle", { cx:X(x), cy:Y(t0), r:8, class:klass });
    add(svg, "text", { x:X(x)+(x<0?-24:12), y:Y(t0)-12, class:"svg-label" }, label);
  });
  add(svg, "text", { x:right-8, y:Y(0)-10, class:"axis-text", "text-anchor":"end" }, "x");
  add(svg, "text", { x:X(0)+12, y:top+16, class:"axis-text" }, "t");
  add(svg, "text", { x:X(b*4.2)+10, y:Y(4.2), class:"svg-label" }, "t′");
  add(svg, "text", { x:X(4.7), y:Y(b*4.7)-10, class:"svg-label" }, "x′");

  const dtPrime = -gamma(b) * b * L;
  $("#angleValue").textContent = fmt(Math.atan(Math.abs(b))*180/Math.PI, 1) + "°";
  $("#deltaTPrime").textContent = "Δt′ = " + fmt(dtPrime, 2, true);
}

function lightningPath(x, y) {
  return `M ${x} ${y-35} l -13 24 h 12 l -9 25 l 28 -34 h -13 l 10 -25 z`;
}

function renderTrain() {
  const svg = $("#trainPlot");
  clear(svg);
  const b = state.beta;
  const g = gamma(b);
  const L = 4;
  const tA = g*b*L/2;
  const tB = -g*b*L/2;

  add(svg, "line", { x1:65, y1:244, x2:695, y2:244, stroke:"#557184", "stroke-width":3 });
  for (let x=90; x<700; x+=55) add(svg,"line",{x1:x,y1:244,x2:x-14,y2:260,stroke:"#557184","stroke-width":3});
  add(svg,"rect",{x:190,y:116,width:380,height:92,rx:18,fill:"#0e7897",stroke:"#82d6dc","stroke-width":2});
  add(svg,"rect",{x:225,y:136,width:72,height:35,rx:5,fill:"#bfeaec",opacity:.8});
  add(svg,"rect",{x:463,y:136,width:72,height:35,rx:5,fill:"#bfeaec",opacity:.8});
  add(svg,"circle",{cx:265,cy:214,r:17,fill:"#051522",stroke:"#82d6dc","stroke-width":3});
  add(svg,"circle",{cx:495,cy:214,r:17,fill:"#051522",stroke:"#82d6dc","stroke-width":3});
  add(svg,"path",{d:lightningPath(180,95),fill:"#ac4145"});
  add(svg,"path",{d:lightningPath(580,95),fill:"#e5b653"});
  add(svg,"circle",{cx:380,cy:188,r:9,fill:"#fff"});
  add(svg,"text",{x:380,y:105,"text-anchor":"middle",fill:"#d9f5f4","font-size":12},"observador do trem");
  if (Math.abs(b) > .001) {
    const direction = b>0 ? 1 : -1;
    add(svg,"line",{x1:380,y1:70,x2:380+direction*105,y2:70,stroke:"#82d6dc","stroke-width":3});
    add(svg,"path",{d:`M ${380+direction*105} 70 l ${-direction*13} -8 v 16 z`,fill:"#82d6dc"});
  }
  add(svg,"text",{x:180,y:42,"text-anchor":"middle",fill:"#fff","font-weight":700},"evento A");
  add(svg,"text",{x:580,y:42,"text-anchor":"middle",fill:"#fff","font-weight":700},"evento B");
  add(svg,"text",{x:380,y:282,"text-anchor":"middle",fill:"#7fa0b2","font-size":12},"plataforma: A e B simultâneos em S");

  $("#timeA").textContent = "t′A = " + fmt(tA,2,true);
  $("#timeB").textContent = "t′B = " + fmt(tB,2,true);
  $("#trainDirection").textContent = b===0 ? "S e S′ coincidem" : `S′ move-se para a ${b>0?"direita":"esquerda"}`;
  const difference = Math.abs(tB-tA);
  if (difference < 1e-9) {
    $("#simultaneitySentence").textContent = "Em repouso relativo, A e B também são simultâneos em S′.";
  } else {
    const first = tA < tB ? "A" : "B";
    const second = first === "A" ? "B" : "A";
    $("#simultaneitySentence").textContent = `Em S′, ${first} acontece ${fmt(difference)} unidades de tempo antes de ${second}.`;
  }
}

function renderProperTime() {
  const svg = $("#properTimePlot");
  clear(svg);
  const left=72,right=680,top=35,bottom=360;
  const X=b => left+b/.99*(right-left);
  const Y=r => bottom-r*(bottom-top);
  for(let i=0;i<=5;i++){
    const b=i*.2; add(svg,"line",{x1:X(b),y1:top,x2:X(b),y2:bottom,class:"grid-line"});
    add(svg,"text",{x:X(b),y:bottom+23,"text-anchor":"middle",class:"axis-text"},b.toFixed(1).replace(".",","));
    const r=i*.2; add(svg,"line",{x1:left,y1:Y(r),x2:right,y2:Y(r),class:"grid-line"});
    add(svg,"text",{x:left-12,y:Y(r)+4,"text-anchor":"end",class:"axis-text"},r.toFixed(1).replace(".",","));
  }
  add(svg,"line",{x1:left,y1:bottom,x2:right,y2:bottom,class:"axis-line"});
  add(svg,"line",{x1:left,y1:top,x2:left,y2:bottom,class:"axis-line"});
  const points=[]; for(let i=0;i<=120;i++){const b=.99*i/120;points.push([X(b),Y(Math.sqrt(1-b*b))]);}
  const linePath=points.map((p,i)=>(i?"L":"M")+p[0]+" "+p[1]).join(" ");
  const areaPath=linePath+` L ${right} ${bottom} L ${left} ${bottom} Z`;
  add(svg,"path",{d:areaPath,class:"curve-area"}); add(svg,"path",{d:linePath,class:"curve-line"});
  const b=Math.abs(state.beta), ratio=Math.sqrt(1-b*b);
  add(svg,"line",{x1:X(b),y1:Y(ratio),x2:X(b),y2:bottom,stroke:"#ac4145","stroke-dasharray":"5 5"});
  add(svg,"circle",{cx:X(b),cy:Y(ratio),r:8,class:"curve-dot"});
  add(svg,"text",{x:right,y:bottom+23,"text-anchor":"end",class:"axis-text"},"|β|");
  add(svg,"text",{x:left+8,y:top+15,class:"axis-text"},"τ/T");

  const T=state.duration, tau=T*ratio;
  $("#durationValue").textContent=fmt(T,1);
  $("#earthTime").textContent=fmt(T);
  $("#properTime").textContent=fmt(tau);
  $("#timeDifference").textContent=fmt(T-tau);
  $("#travelerClock").style.setProperty("--fraction",ratio);
}

function renderTwins() {
  const svg=$("#twinsPlot"); clear(svg);
  const b=Math.abs(state.beta),T=state.duration,tau=T*Math.sqrt(1-b*b),turn=b*T/2;
  const left=105,right=665,top=35,bottom=455,maxX=Math.max(1,turn*1.3);
  const X=x=>left+x/maxX*(right-left),Y=t=>bottom-t/T*(bottom-top);
  for(let i=0;i<=5;i++){const t=T*i/5;add(svg,"line",{x1:left,y1:Y(t),x2:right,y2:Y(t),class:"grid-line"});add(svg,"text",{x:left-12,y:Y(t)+4,"text-anchor":"end",class:"axis-text"},fmt(t,1));}
  add(svg,"line",{x1:left,y1:top,x2:left,y2:bottom,class:"axis-line"});
  add(svg,"line",{x1:left,y1:bottom,x2:right,y2:bottom,class:"axis-line"});
  add(svg,"path",{d:`M ${X(0)} ${Y(0)} L ${X(0)} ${Y(T)}`,class:"world-earth"});
  add(svg,"path",{d:`M ${X(0)} ${Y(0)} L ${X(turn)} ${Y(T/2)} L ${X(0)} ${Y(T)}`,class:"world-traveler"});
  [[0,0,"partida"],[turn,T/2,"retorno"],[0,T,"reencontro"]].forEach(([x,t,label])=>{add(svg,"circle",{cx:X(x),cy:Y(t),r:7,class:"world-event"});add(svg,"text",{x:X(x)+12,y:Y(t)-10,class:"svg-label"},label);});
  add(svg,"text",{x:left+12,y:top+18,class:"axis-text"},"tempo em S");
  add(svg,"text",{x:right,y:bottom+28,"text-anchor":"end",class:"axis-text"},"distância da Terra");
  $("#twinEarthAge").textContent=fmt(T)+" anos";
  $("#twinTravelerAge").textContent=fmt(tau)+" anos";
}

function renderBarn() {
  const svg=$("#barnPlot"); clear(svg);
  const b=Math.abs(state.beta),contracted=10/gamma(b),barnLength=7;
  const barnLeft=250,barnRight=510,barnY=95,floor=235,center=(barnLeft+barnRight)/2;
  add(svg,"rect",{x:barnLeft,y:barnY,width:barnRight-barnLeft,height:floor-barnY,fill:"#d9e3df",stroke:"#486877","stroke-width":3});
  add(svg,"path",{d:`M ${barnLeft-20} ${barnY} L ${center} 38 L ${barnRight+20} ${barnY}`,fill:"#0e607f",stroke:"#486877","stroke-width":3});
  add(svg,"line",{x1:barnLeft,y1:barnY,x2:barnLeft,y2:floor,stroke:"#ac4145","stroke-width":7});
  add(svg,"line",{x1:barnRight,y1:barnY,x2:barnRight,y2:floor,stroke:"#ac4145","stroke-width":7});
  const polePixels=contracted/barnLength*(barnRight-barnLeft),x1=center-polePixels/2,x2=center+polePixels/2;
  add(svg,"line",{x1:x1,y1:180,x2:x2,y2:180,stroke:contracted<=barnLength?"#2f8257":"#e5b653","stroke-width":13,"stroke-linecap":"round"});
  add(svg,"circle",{cx:x1,cy:180,r:7,fill:"#fff"});add(svg,"circle",{cx:x2,cy:180,r:7,fill:"#fff"});
  add(svg,"text",{x:center,y:165,"text-anchor":"middle",class:"svg-label"},`escada vista em S: L = ${fmt(contracted)}`);
  add(svg,"text",{x:center,y:276,"text-anchor":"middle",class:"svg-note"},"portas do celeiro fechadas simultaneamente em S");
  $("#contractedLength").textContent="L = "+fmt(contracted);
  const fits=contracted<=barnLength+1e-9,status=$("#fitStatus");
  status.textContent=fits?"Cabe em S":"Ainda não cabe"; status.classList.toggle("fits",fits);
}

function renderAll() {
  renderReadouts(); renderMinkowski(); renderTrain(); renderProperTime(); renderTwins(); renderBarn();
}

$("#betaSlider").addEventListener("input", event => { state.beta=Number(event.target.value); renderAll(); });
$("#durationSlider").addEventListener("input", event => { state.duration=Number(event.target.value); renderProperTime(); renderTwins(); });
$$(".presets button").forEach(button => button.addEventListener("click", () => {
  state.beta=Number(button.dataset.beta); $("#betaSlider").value=state.beta; renderAll();
}));

renderAll();
