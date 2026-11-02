"use strict";
const $ = id => document.getElementById(id);
const display=$("display"), expression=$("expression"), resultDisplay=$("result"), historyList=$("historyList");
const digits=document.querySelectorAll("[data-digit]");
const ids=["clearBtn","backspaceBtn","negateBtn","decimalBtn","equalsBtn","addBtn","subBtn","mulBtn","divBtn","percentBtn","squareBtn","sqrtBtn","powerBtn","factorialBtn","sinBtn","cosBtn","tanBtn","logBtn","lnBtn","piBtn","eBtn","angleModeBtn","clearHistoryBtn","memoryClearBtn","memoryRecallBtn","memoryAddBtn","memorySubtractBtn","themeToggleBtn","themeLabel","scientificToggleBtn","scientificButtons"];
const b=Object.fromEntries(ids.map(id=>[id,$(id)]));
let current="0", stored=null, operator=null, newNumber=true, angleMode="DEG", memory=0, hasMemory=false, history=[];
const HISTORY_KEY="zayyanCalculatorHistory", THEME_KEY="zayyanCalculatorTheme";
function fmt(n){if(!Number.isFinite(n))throw Error("The result is not a valid number.");if(Object.is(n,-0))n=0;return String(Number(n.toPrecision(12)));}
function getNum(){const n=Number(current);if(!Number.isFinite(n))throw Error("Please enter a valid number.");return n;}
function update(){display.value=current;}
function error(msg){resultDisplay.textContent=msg;expression.textContent="Error";}
function enterDigit(d){if(newNumber||current==="0"||current==="Error"){current=d;newNumber=false;}else current+=d;update();}
digits.forEach(x=>x.addEventListener("click",()=>enterDigit(x.dataset.digit)));
b.decimalBtn.addEventListener("click",()=>{if(newNumber||current==="Error"){current="0.";newNumber=false;}else if(!current.includes("."))current+=".";update();});
b.backspaceBtn.addEventListener("click",()=>{if(current==="Error"||current.length<=1||(current.length===2&&current[0]==="-"))current="0";else current=current.slice(0,-1);newNumber=false;update();});
b.negateBtn.addEventListener("click",()=>{if(current==="0"||current==="Error")return;current=current.startsWith("-")?current.slice(1):"-"+current;newNumber=false;update();});
b.clearBtn.addEventListener("click",()=>{current="0";stored=null;operator=null;newNumber=true;expression.textContent="";resultDisplay.textContent="Your answer will appear here.";update();});
function calc(a,c,op){if(op==="+")return a+c;if(op==="-")return a-c;if(op==="*")return a*c;if(op==="/"){if(c===0)throw Error("Cannot divide by zero.");return a/c;}if(op==="^")return Math.pow(a,c);throw Error("Unknown operator.");}
function choose(op){try{const n=getNum();if(operator!==null&&!newNumber){stored=calc(stored,n,operator);current=fmt(stored);update();}else stored=n;operator=op;newNumber=true;expression.textContent=fmt(stored)+" "+op;resultDisplay.textContent="Enter the next number.";}catch(e){error(e.message);}}
b.addBtn.addEventListener("click",()=>choose("+"));b.subBtn.addEventListener("click",()=>choose("-"));b.mulBtn.addEventListener("click",()=>choose("*"));b.divBtn.addEventListener("click",()=>choose("/"));b.powerBtn.addEventListener("click",()=>choose("^"));
function saveHistory(){try{localStorage.setItem(HISTORY_KEY,JSON.stringify(history));}catch(e){}}
function renderHistory(){historyList.replaceChildren();if(!history.length){const li=document.createElement("li");li.className="empty-history";li.textContent="Your calculations will appear here.";historyList.appendChild(li);return;}history.forEach(item=>{const li=document.createElement("li"),line=document.createElement("div"),ans=document.createElement("strong");line.textContent=item.calculation;ans.textContent="= "+item.answer;li.append(line,ans);historyList.appendChild(li);});}
function addHistory(calculation,answer){history.unshift({calculation,answer});history=history.slice(0,50);saveHistory();renderHistory();}
function showAnswer(calculation,answer){const value=fmt(answer);current=value;newNumber=true;update();resultDisplay.textContent=calculation+" = "+value;addHistory(calculation,value);}
b.equalsBtn.addEventListener("click",()=>{if(operator===null||stored===null)return;try{const a=stored,c=getNum(),op=operator,symbols={"+":"+","-":"−","*":"×","/":"÷","^":"^"},label=fmt(a)+" "+symbols[op]+" "+fmt(c),answer=calc(a,c,op);stored=null;operator=null;expression.textContent=label;showAnswer(label,answer);}catch(e){error(e.message);current="0";stored=null;operator=null;newNumber=true;update();}});
function unary(label,fn){try{const n=getNum(),answer=fn(n),calculation=label+"("+fmt(n)+")";expression.textContent=calculation;stored=null;operator=null;showAnswer(calculation,answer);}catch(e){error(e.message);}}
b.squareBtn.addEventListener("click",()=>unary("square",n=>n*n));
b.sqrtBtn.addEventListener("click",()=>unary("√",n=>{if(n<0)throw Error("Cannot find the real square root of a negative number.");return Math.sqrt(n);}));
b.percentBtn.addEventListener("click",()=>unary("%",n=>n/100));
b.sinBtn.addEventListener("click",()=>unary("sin",n=>Math.sin(angleMode==="DEG"?n*Math.PI/180:n)));
b.cosBtn.addEventListener("click",()=>unary("cos",n=>Math.cos(angleMode==="DEG"?n*Math.PI/180:n)));
b.tanBtn.addEventListener("click",()=>unary("tan",n=>{const r=angleMode==="DEG"?n*Math.PI/180:n;if(Math.abs(Math.cos(r))<1e-12)throw Error("Tangent is undefined at this angle.");return Math.tan(r);}));
b.logBtn.addEventListener("click",()=>unary("log",n=>{if(n<=0)throw Error("Logarithm requires a number greater than zero.");return Math.log10(n);}));
b.lnBtn.addEventListener("click",()=>unary("ln",n=>{if(n<=0)throw Error("Natural logarithm requires a number greater than zero.");return Math.log(n);}));
b.factorialBtn.addEventListener("click",()=>unary("factorial",n=>{if(!Number.isInteger(n)||n<0)throw Error("Factorial requires a non-negative whole number.");if(n>170)throw Error("The maximum supported factorial is 170!.");let v=1;for(let i=2;i<=n;i++)v*=i;return v;}));
function constant(name,value){current=fmt(value);newNumber=true;stored=null;operator=null;update();expression.textContent=name;}
b.piBtn.addEventListener("click",()=>constant("π",Math.PI));b.eBtn.addEventListener("click",()=>constant("e",Math.E));
b.angleModeBtn.addEventListener("click",()=>{angleMode=angleMode==="DEG"?"RAD":"DEG";b.angleModeBtn.textContent=angleMode;});
try{const saved=JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]");if(Array.isArray(saved))history=saved.filter(x=>x&&typeof x.calculation==="string"&&typeof x.answer==="string").slice(0,50);}catch(e){history=[];}
renderHistory();update();
b.clearHistoryBtn.addEventListener("click",()=>{history=[];saveHistory();renderHistory();});
b.memoryClearBtn.addEventListener("click",()=>{memory=0;hasMemory=false;expression.textContent="Memory cleared";});
b.memoryRecallBtn.addEventListener("click",()=>{if(!hasMemory){expression.textContent="Memory is empty";return;}current=fmt(memory);newNumber=true;update();expression.textContent="Memory recalled";});
b.memoryAddBtn.addEventListener("click",()=>{try{memory+=getNum();hasMemory=true;expression.textContent="Added to memory";}catch(e){error(e.message);}});
b.memorySubtractBtn.addEventListener("click",()=>{try{memory-=getNum();hasMemory=true;expression.textContent="Subtracted from memory";}catch(e){error(e.message);}});
function applyTheme(light){document.body.classList.toggle("light-theme",light);b.themeToggleBtn.setAttribute("aria-checked",String(light));b.themeLabel.textContent=light?"Light Mode":"Dark Mode";b.themeToggleBtn.setAttribute("aria-label",light?"Switch to dark theme":"Switch to light theme");try{localStorage.setItem(THEME_KEY,light?"light":"dark");}catch(e){}}
b.themeToggleBtn.addEventListener("click",()=>applyTheme(!document.body.classList.contains("light-theme")));
let savedTheme="dark";try{savedTheme=localStorage.getItem(THEME_KEY)||"dark";}catch(e){}applyTheme(savedTheme==="light");
b.scientificToggleBtn.addEventListener("click",()=>{const closed=b.scientificButtons.classList.toggle("is-collapsed");b.scientificToggleBtn.setAttribute("aria-expanded",String(!closed));b.scientificToggleBtn.textContent=closed?"Scientific Functions ▼":"Scientific Functions ▲";});
document.addEventListener("keydown",event=>{if(event.ctrlKey||event.altKey||event.metaKey)return;if(event.target&&["INPUT","TEXTAREA"].includes(event.target.tagName))return;const k=event.key;if(/^[0-9]$/.test(k)){document.querySelector('[data-digit="'+k+'"]')?.click();return;}if(k==="."){b.decimalBtn.click();return;}const ops={"+":"addBtn","-":"subBtn","*":"mulBtn","/":"divBtn","^":"powerBtn"};if(ops[k]){event.preventDefault();$(ops[k]).click();return;}if(k==="Enter"||k==="="){event.preventDefault();b.equalsBtn.click();return;}if(k==="Backspace"){event.preventDefault();b.backspaceBtn.click();return;}if(k==="Escape"){b.clearBtn.click();return;}const shortcuts={s:"sinBtn",c:"cosBtn",t:"tanBtn",l:"logBtn",n:"lnBtn",r:"sqrtBtn",p:"piBtn",e:"eBtn",x:"squareBtn",f:"factorialBtn"};if(shortcuts[k.toLowerCase()])$(shortcuts[k.toLowerCase()]).click();});
