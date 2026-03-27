(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const n of o)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function t(o){const n={};return o.integrity&&(n.integrity=o.integrity),o.referrerPolicy&&(n.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?n.credentials="include":o.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(o){if(o.ep)return;o.ep=!0;const n=t(o);fetch(o.href,n)}})();const W="modulepreload",Y=function(m,e){return new URL(m,e).href},M={},P=function(e,t,i){let o=Promise.resolve();if(t&&t.length>0){let c=function(h){return Promise.all(h.map(d=>Promise.resolve(d).then(p=>({status:"fulfilled",value:p}),p=>({status:"rejected",reason:p}))))};const r=document.getElementsByTagName("link"),a=document.querySelector("meta[property=csp-nonce]"),l=a?.nonce||a?.getAttribute("nonce");o=c(t.map(h=>{if(h=Y(h,i),h in M)return;M[h]=!0;const d=h.endsWith(".css"),p=d?'[rel="stylesheet"]':"";if(i)for(let u=r.length-1;u>=0;u--){const g=r[u];if(g.href===h&&(!d||g.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${h}"]${p}`))return;const f=document.createElement("link");if(f.rel=d?"stylesheet":W,d||(f.as="script"),f.crossOrigin="",f.href=h,l&&f.setAttribute("nonce",l),document.head.appendChild(f),d)return new Promise((u,g)=>{f.addEventListener("load",u),f.addEventListener("error",()=>g(new Error(`Unable to preload CSS for ${h}`)))})}))}function n(r){const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=r,window.dispatchEvent(a),!a.defaultPrevented)throw r}return o.then(r=>{for(const a of r||[])a.status==="rejected"&&n(a.reason);return e().catch(n)})},X={1:{thematic:"Valentía",options:["Josué 1:9","Salmos 27:1","Isaías 41:10","2 Timoteo 1:7","Salmos 118:6","Deuteronomio 31:6","1 Crónicas 28:20","Salmos 31:24","Efesios 3:12","Hebreos 13:6"]},2:{thematic:"Provisión",options:["Salmos 23:1","Filipenses 4:19","San Mateo 6:33","Salmos 34:10","San Mateo 7:11","Génesis 22:14","Salmos 37:25","San Lucas 12:24","2 Corintios 9:8","Filipenses 4:11"]},3:{thematic:"Fortaleza",options:["Filipenses 4:13","Isaías 40:31","Salmos 18:2","Efesios 6:10","Habacuc 3:19","Éxodo 15:2","1 Crónicas 16:11","Salmos 28:7","Salmos 73:26","Zacarías 4:6"]},4:{thematic:"Paz",options:["San Juan 14:27","Filipenses 4:7","Isaías 26:3","Salmos 4:8","Colosenses 3:15","Números 6:26","Salmos 29:11","San Juan 16:33","Romanos 5:1","2 Tesalonicenses 3:16"]},5:{thematic:"Confianza",options:["Proverbios 3:5","Jeremías 17:7","Salmos 37:5","Salmos 62:8","Isaías 12:2","Salmos 9:10","Salmos 56:3","Salmos 112:7","Isaías 26:4","Nahúm 1:7"]},6:{thematic:"Amor de Dios",options:["San Juan 3:16","Romanos 5:8","1 Juan 4:19","Sofonías 3:17","Jeremías 31:3","Salmos 136:1","Efesios 2:4","1 Juan 3:1","1 Juan 4:8","1 Juan 4:10"]},7:{thematic:"Descanso",options:["San Mateo 11:28","Salmos 62:1","Salmos 91:1","Éxodo 33:14","Hebreos 4:9","Salmos 4:8","Salmos 23:2","Salmos 127:2","Isaías 11:10","San Mateo 11:29"]},8:{thematic:"Sabiduría",options:["Santiago 1:5","Proverbios 2:6","Salmos 111:10","Proverbios 4:7","Colosenses 2:3","Job 28:28","Salmos 19:7","Proverbios 1:7","Proverbios 3:13","Efesios 1:17"]},9:{thematic:"Propósito",options:["Jeremías 29:11","Romanos 8:28","Efesios 2:10","Proverbios 16:3","Salmos 138:8","Salmos 57:2","Proverbios 19:21","Eclesiastés 3:1","San Juan 15:16","Hechos 13:36"]},10:{thematic:"Refugio",options:["Salmos 46:1","Salmos 9:9","Proverbios 18:10","Salmos 144:2","Nahúm 1:7","2 Samuel 22:3","Salmos 18:30","Salmos 61:3","Salmos 71:3","Salmos 91:2"]},11:{thematic:"Fe",options:["Hebreos 11:1","San Marcos 9:23","San Mateo 21:22","Romanos 10:17","2 Corintios 5:7","San Mateo 17:20","Hechos 16:31","Romanos 1:17","Gálatas 2:20","Efesios 3:17"]},12:{thematic:"Guía",options:["Salmos 119:105","Isaías 30:21","Salmos 32:8","Proverbios 3:6","Salmos 48:14","Salmos 23:3","Salmos 25:9","Salmos 73:24","Salmos 139:24","San Juan 16:13"]},13:{thematic:"Ansiedad",options:["1 Pedro 5:7","Filipenses 4:6","Salmos 55:22","San Mateo 6:34","Salmos 94:19","Salmos 34:4","Isaías 35:4","San Mateo 6:25","San Mateo 6:31","San Mateo 10:19"]},14:{thematic:"Perdonar",options:["Efesios 4:32","Colosenses 3:13","San Mateo 6:14","San Lucas 6:37","Proverbios 17:9","Salmos 86:5","Salmos 103:3","San Marcos 11:25","Hechos 10:43","1 Juan 1:9"]},15:{thematic:"Gozar",options:["Nehemías 8:10","Salmos 16:11","Filipenses 4:4","1 Tesalonicenses 5:16","Habacuc 3:18","Salmos 30:5","Salmos 100:2","San Juan 15:11","Romanos 12:12","Gálatas 5:22"]},16:{thematic:"Gracia",options:["Efesios 2:8","Hebreos 4:16","2 Corintios 12:9","Romanos 3:24","Tito 2:11","San Juan 1:16","Romanos 5:2","Romanos 5:15","Efesios 1:7","2 Timoteo 2:1"]},17:{thematic:"Socorro",options:["Salmos 121:2","Isaías 41:13","Salmos 145:18","Hebreos 13:6","Salmos 40:17","Salmos 33:20","Salmos 46:1","Salmos 63:7","Salmos 115:9","Salmos 146:5"]},18:{thematic:"Fidelidad",options:["Lamentaciones 3:23","2 Tesalonicenses 3:3","1 Corintios 1:9","Deuteronomio 7:9","Salmos 36:5","Éxodo 34:6","Números 23:19","Deuteronomio 32:4","Salmos 89:1","1 Tesalonicenses 5:24"]},19:{thematic:"Victoria",options:["Romanos 8:37","1 Corintios 15:57","1 Juan 5:4","Salmos 60:12","Proverbios 21:31","Josué 10:25","1 Samuel 17:47","Salmos 20:5","San Juan 16:33","1 Juan 5:5"]},20:{thematic:"Corazón",options:["Proverbios 4:23","Salmos 51:10","San Mateo 5:8","Ezequiel 36:26","Salmos 119:11","Salmos 19:14","Salmos 119:2","Efesios 3:17","Filipenses 4:7","Hebreos 10:22"]},21:{thematic:"Palabra",options:["Hebreos 4:12","San Mateo 4:4","Isaías 40:8","Salmos 19:7","Josué 1:8","Salmos 119:11","Salmos 119:89","Isaías 55:11","San Lucas 8:11","San Juan 1:1"]},22:{thematic:"Luz",options:["San Mateo 5:14","San Juan 8:12","Salmos 27:1","Efesios 5:8","1 Juan 1:7","2 Samuel 22:29","Salmos 18:28","Salmos 36:9","Salmos 119:105","San Juan 12:46"]},23:{thematic:"Oración",options:["Jeremías 33:3","San Mateo 7:7","1 Juan 5:14","Salmos 145:18","San Lucas 11:9","Salmos 5:3","Salmos 6:9","San Marcos 1:35","Hechos 4:31","Colosenses 4:2"]},24:{thematic:"Identidad",options:["San Juan 1:12","1 Pedro 2:9","2 Corintios 5:17","Gálatas 2:20","Efesios 1:4","Romanos 8:15","1 Corintios 6:19","2 Corintios 5:21","Gálatas 3:26","Efesios 2:19"]},25:{thematic:"Fruto",options:["Gálatas 5:22","San Juan 15:5","Filipenses 1:11","Salmos 1:3","Santiago 3:17","Isaías 32:17","San Lucas 13:9","San Juan 15:8","San Juan 15:16","Efesios 5:9"]},26:{thematic:"Humildad",options:["Santiago 4:10","1 Pedro 5:6","Proverbios 22:4","Miqueas 6:8","Filipenses 2:3","Proverbios 3:34","Proverbios 11:2","Proverbios 15:33","Salmos 25:9","Efesios 4:2"]},27:{thematic:"Esperanza",options:["Romanos 15:13","Salmos 130:5","Hebreos 10:23","Isaías 40:31","Job 14:7","Salmos 33:18","Salmos 42:11","Salmos 147:11","Lamentaciones 3:24","Hebreos 6:19"]},28:{thematic:"Verdad",options:["San Juan 14:6","San Juan 8:32","Salmos 25:5","Efesios 4:25","3 Juan 1:4","Salmos 51:6","Salmos 119:142","San Juan 4:24","San Juan 17:17","1 Juan 5:6"]},29:{thematic:"Servicio",options:["Gálatas 5:13","San Mateo 20:28","Colosenses 3:23","Hebreos 6:10","1 Pedro 4:10","Josué 24:15","Deuteronomio 10:12","San Marcos 9:35","Efesios 6:7","Colosenses 3:24"]},30:{thematic:"Justicia",options:["San Mateo 5:6","Salmos 37:6","Proverbios 21:21","Isaías 32:17","Romanos 1:17","Salmos 11:7","Salmos 119:137","Proverbios 10:2","Amós 5:24","San Mateo 6:33"]},31:{thematic:"Bendición",options:["Números 6:24","Salmos 67:1","Deuteronomio 28:2","Salmos 1:1","Proverbios 10:22","Génesis 12:2","Salmos 24:5","Salmos 115:12","Efesios 1:3","Hebreos 6:14"]}};class K{constructor(){this.bibleData=null,this.dictionaryData=null,this.pericopesData=null,this.favorites=JSON.parse(localStorage.getItem("bible_favorites")||"[]"),this.notes=JSON.parse(localStorage.getItem("bible_notes")||"[]"),this.highlights=JSON.parse(localStorage.getItem("bible_highlights")||"[]"),this.devotionalFavorites=JSON.parse(localStorage.getItem("bible_devotional_favorites")||"[]");const e={last_book:"Génesis",last_chapter:"1",theme:"classic",tts_voice:0,tts_voice_name:"",skip_verse_numbers:!1,editor_mode_enabled:!1,editor_warning_shown:!1},t=JSON.parse(localStorage.getItem("bible_settings")||"{}");this.settings={...e,...t};let i=!1;this.notes.forEach(n=>{n.title===void 0&&(n.title="Nota sin nombre",i=!0),n.pinned===void 0&&(n.pinned=!1,i=!0),n.dateCreated||(n.dateCreated=n.date||new Date().toISOString(),i=!0),n.dateUpdated||(n.dateUpdated=n.dateCreated,i=!0)}),this.favorites.forEach(n=>{n.dateCreated||(n.dateCreated=n.date||new Date().toISOString(),i=!0),n.dateUpdated||(n.dateUpdated=n.dateCreated,i=!0)});const o={"#fee2e2":"#fecaca","#ffedd5":"#fed7aa","#f3f4f6":"#f9fafb","#fde68a":"#fef3c7","#86efac":"#dcfce7","#93c5fd":"#dbeafe","#d8b4fe":"#fae8ff","#fca5a5":"#fecaca","#fdba74":"#fed7aa","#9ca3af":"#f9fafb"};this.highlights.forEach(n=>{n.dateCreated||(n.dateCreated=n.date||new Date().toISOString(),i=!0),n.dateUpdated||(n.dateUpdated=n.dateCreated,i=!0),o[n.color]&&(n.color=o[n.color],i=!0)}),i&&(localStorage.setItem("bible_notes",JSON.stringify(this.notes)),localStorage.setItem("bible_favorites",JSON.stringify(this.favorites)),localStorage.setItem("bible_highlights",JSON.stringify(this.highlights)),localStorage.setItem("bible_devotional_favorites",JSON.stringify(this.devotionalFavorites)))}async init(){try{const e=await fetch("./bibles_rv1960.json");this.bibleData=await e.json();const t=await fetch("./dictionary.json");this.dictionaryData=await t.json();try{const i=await fetch("./pericopes.json");i.ok&&(this.pericopesData=await i.json())}catch{console.warn("Pericopes not found, ignoring.")}return!0}catch(e){return console.error("Error loading bible data:",e),!1}}getBooks(e=null){if(!this.bibleData)return[];const t=["Génesis","Éxodo","Levítico","Números","Deuteronomio","Josué","Jueces","Rut","1 Samuel","2 Samuel","1 Reyes","2 Reyes","1 Crónicas","2 Crónicas","Esdras","Nehemías","Ester","Job","Salmos","Proverbios","Eclesiastés","Cantares","Isaías","Jeremías","Lamentaciones","Ezequiel","Daniel","Oseas","Joel","Amós","Abdías","Jonás","Miqueas","Nahúm","Habacuc","Sofonías","Hageo","Zacarías","Malaquías","San Mateo","San Marcos","San Lucas","San Juan","Hechos","Romanos","1 Corintios","2 Corintios","Gálatas","Efesios","Filipenses","Colosenses","1 Tesalonicenses","2 Tesalonicenses","1 Timoteo","2 Timoteo","Tito","Filemón","Hebreos","Santiago","1 Pedro","2 Pedro","1 Juan","2 Juan","3 Juan","Judas","Apocalipsis"],i=Object.keys(this.bibleData),o=t.filter(n=>i.includes(n));return e==="old"?o.slice(0,39):e==="new"?o.slice(39):o}getChapters(e){return!this.bibleData||!this.bibleData[e]?[]:Object.keys(this.bibleData[e]).sort((t,i)=>parseInt(t)-parseInt(i))}getVerses(e,t){if(!this.bibleData||!this.bibleData[e]||!this.bibleData[e][t])return[];const i=this.bibleData[e][t];return Object.entries(i).sort((o,n)=>parseInt(o[0])-parseInt(n[0])).map(([o,n])=>[o,this.sanitizeVerseText(n)])}getPericope(e,t,i){if(!this.pericopesData)return null;if(this.pericopesData[e]&&this.pericopesData[e][t])return this.pericopesData[e][t][i]||null;let o=[e.replace("San ","S. "),e.replace("San ",""),e.replace("S. ",""),e.replace("1 ","1"),e.replace("2 ","2"),e.replace("3 ","3")];for(let l of o)if(this.pericopesData[l]&&this.pericopesData[l][t])return this.pericopesData[l][t][i]||null;const n=Object.keys(this.pericopesData),r=e.toLowerCase().replace(/[^a-z0-9]/g,""),a=n.find(l=>l.toLowerCase().replace(/[^a-z0-9]/g,"")===r);return a&&this.pericopesData[a][t]&&this.pericopesData[a][t][i]||null}search(e){if(!this.bibleData)return[];const t=e.toLowerCase(),i=[];for(const[o,n]of Object.entries(this.bibleData))for(const[r,a]of Object.entries(n))for(const[l,c]of Object.entries(a))c.toLowerCase().includes(t)&&i.push({book:o,chapter:r,vNum:l,text:this.sanitizeVerseText(c)});return i}isFavorite(e,t,i){const o=`${e} ${t}:${i}`;return this.favorites.some(n=>n.id===o)}toggleFavorite(e,t,i,o){const n=`${e} ${t}:${i}`,r=this.favorites.findIndex(a=>a.id===n);if(r>-1)this.favorites.splice(r,1);else{const a=new Date().toISOString();this.favorites.push({id:n,book:e,chapter:t,verse:i,text:o,dateCreated:a,dateUpdated:a,pinned:!1})}return localStorage.setItem("bible_favorites",JSON.stringify(this.favorites)),r===-1}togglePinFavorite(e){return this.favorites[e]?(this.favorites[e].pinned=!this.favorites[e].pinned,this.favorites[e].dateUpdated=new Date().toISOString(),localStorage.setItem("bible_favorites",JSON.stringify(this.favorites)),this.favorites[e].pinned):!1}deleteFavorite(e){this.favorites.splice(e,1),localStorage.setItem("bible_favorites",JSON.stringify(this.favorites))}addNote(e,t,i,o,n,r){const a=new Date().toISOString();this.notes.push({book:e,chapter:t,verse:i,text:o,note:n,title:r||"Nota sin nombre",dateCreated:a,dateUpdated:a,pinned:!1}),localStorage.setItem("bible_notes",JSON.stringify(this.notes))}deleteNote(e){this.notes.splice(e,1),localStorage.setItem("bible_notes",JSON.stringify(this.notes))}updateNote(e,t,i){this.notes[e]&&(this.notes[e].note=t,i!==void 0&&(this.notes[e].title=i),this.notes[e].dateUpdated=new Date().toISOString(),localStorage.setItem("bible_notes",JSON.stringify(this.notes)))}togglePinNote(e){return this.notes[e]?(this.notes[e].pinned=!this.notes[e].pinned,localStorage.setItem("bible_notes",JSON.stringify(this.notes)),this.notes[e].pinned):!1}isHighlighted(e,t,i){const o=`${e} ${t}:${i}`;return this.highlights.find(n=>n.id===o)}addHighlight(e,t,i,o,n){const r=`${e} ${t}:${i}`;let a=null;const l=this.highlights.findIndex(h=>h.id===r);l>-1&&(a=this.highlights[l].dateCreated,this.highlights.splice(l,1));const c=new Date().toISOString();this.highlights.push({id:r,book:e,chapter:t,verse:i,text:o,color:n,dateCreated:a||c,dateUpdated:c}),localStorage.setItem("bible_highlights",JSON.stringify(this.highlights))}removeHighlight(e,t,i){const o=`${e} ${t}:${i}`,n=this.highlights.findIndex(r=>r.id===o);n>-1&&(this.highlights.splice(n,1),localStorage.setItem("bible_highlights",JSON.stringify(this.highlights)))}deleteHighlight(e){this.highlights.splice(e,1),localStorage.setItem("bible_highlights",JSON.stringify(this.highlights))}isDevotionalFavorite(e){return this.devotionalFavorites.some(t=>t.titulo===e)}toggleDevotionalFavorite(e){const t=this.devotionalFavorites.findIndex(i=>i.titulo===e.titulo);if(t>-1)this.devotionalFavorites.splice(t,1);else{const i=new Date().toISOString();this.devotionalFavorites.push({...e,dateFavorited:i})}return localStorage.setItem("bible_devotional_favorites",JSON.stringify(this.devotionalFavorites)),t===-1}deleteDevotionalFavorite(e){this.devotionalFavorites.splice(e,1),localStorage.setItem("bible_devotional_favorites",JSON.stringify(this.devotionalFavorites))}setLastRead(e,t){this.settings.last_book=e,this.settings.last_chapter=t,this.saveSettings()}setTheme(e){this.settings.theme=e,this.saveSettings()}saveSettings(){localStorage.setItem("bible_settings",JSON.stringify(this.settings))}searchDictionary(e){if(!this.dictionaryData)return[];const t=e.toLowerCase();return Object.entries(this.dictionaryData).filter(([i,o])=>i.toLowerCase().includes(t)||o.toLowerCase().includes(t)).map(([i,o])=>({term:i,definition:o}))}getRandomVerse(){if(!this.bibleData)return null;const e=Object.keys(this.bibleData),t=e[Math.floor(Math.random()*e.length)],i=Object.keys(this.bibleData[t]),o=i[Math.floor(Math.random()*i.length)],n=Object.keys(this.bibleData[t][o]),r=n[Math.floor(Math.random()*n.length)],a=this.sanitizeVerseText(this.bibleData[t][o][r]);return{book:t,chapter:o,verse:r,text:a}}sanitizeVerseText(e){return e?e.replace(/,([^\s])/g,", $1").replace(/\.([^\s])/g,". $1").replace(/;([^\s])/g,"; $1").replace(/:([^\s])/g,": $1").replace(/\?([^\s])/g,"? $1").replace(/!([^\s])/g,"! $1").replace(/\s+/g," ").trim():""}getVerseOfDay(){if(!this.bibleData)return null;const e=X;if(!e)return this.getRandomVerse();const t=new Date,i=t.getDate(),o=t.getMonth()+1,n=t.getFullYear(),r=e[i];if(!r)return this.getRandomVerse();const a=(n+o+i)%10,c=r.options[a].split(" ");let h,d;c.length===3?(h=`${c[0]} ${c[1]}`,d=c[2]):(h=c[0],d=c[1]);const[p,f]=d.split(":"),u=this.normalizeBookName(h);if(this.bibleData[u]&&this.bibleData[u][p]){const g=this.bibleData[u][p][f];if(g){const v=this.sanitizeVerseText(g);return{book:u,chapter:p,verse:f,text:v,thematic:r.thematic,ref:`${u} ${p}:${f}`}}}return this.getRandomVerse()}normalizeBookName(e){const t={Josué:"Josué",Salmo:"Salmos",Salmos:"Salmos","Is.":"Isaías",Isaías:"Isaías","2 Tim.":"2 Timoteo","2 Timoteo":"2 Timoteo","Fil.":"Filipenses",Filipenses:"Filipenses",Mateo:"San Mateo","San Mateo":"San Mateo","San Marcos":"San Marcos","San Lucas":"San Lucas","San Juan":"San Juan","Hab.":"Habacuc",Habacuc:"Habacuc","Jer.":"Jeremías",Jeremías:"Jeremías","Sof.":"Sofonías",Sofonías:"Sofonías","Luc.":"San Lucas",Lucas:"San Lucas",Marcos:"San Marcos","Heb.":"Hebreos",Hebreos:"Hebreos",Santiago:"Santiago","Sant.":"Santiago","1 Pedro":"1 Pedro","2 Pedro":"2 Pedro","Prov.":"Proverbios",Proverbios:"Proverbios","2 Cor.":"2 Corintios","2 Corintios":"2 Corintios","1 Cor.":"1 Corintios","1 Corintios":"1 Corintios","Lam.":"Lamentaciones",Lamentaciones:"Lamentaciones","2 Tes.":"2 Tesalonicenses","2 Tesalonicenses":"2 Tesalonicenses","1 Tes.":"1 Tesalonicenses","1 Tesalonicenses":"1 Tesalonicenses","Deut.":"Deuteronomio",Deuteronomio:"Deuteronomio","1 Juan":"1 Juan","2 Juan":"2 Juan","3 Juan":"3 Juan","Ezeq.":"Ezequiel",Ezequiel:"Ezequiel","Gál.":"Gálatas",Gálatas:"Gálatas","Gal.":"Gálatas","Miq.":"Miqueas",Miqueas:"Miqueas",Job:"Job","Núm.":"Números",Números:"Números",Éxodo:"Éxodo","Col.":"Colosenses",Colosenses:"Colosenses"};if(t[e])return t[e];const i=e.replace(".","").replace("San ","").replace("S. ","").trim();return t[i]?t[i]:this.getBooks().find(n=>n.toLowerCase().startsWith(i.toLowerCase()))||e}exportUserData(){return{version:"1.0",export_date:new Date().toISOString(),app_version:"1.2.3",data:{favorites:this.favorites,notes:this.notes,highlights:this.highlights,devotional_favorites:this.devotionalFavorites,settings:this.settings}}}importUserData(e){if(!e.version||!e.data)throw new Error("Formato de backup inválido");this.favorites=e.data.favorites||[],this.notes=e.data.notes||[],this.highlights=e.data.highlights||[],this.devotionalFavorites=e.data.devotional_favorites||[],this.settings={...this.settings,...e.data.settings},localStorage.setItem("bible_favorites",JSON.stringify(this.favorites)),localStorage.setItem("bible_notes",JSON.stringify(this.notes)),localStorage.setItem("bible_highlights",JSON.stringify(this.highlights)),localStorage.setItem("bible_devotional_favorites",JSON.stringify(this.devotionalFavorites)),localStorage.setItem("bible_settings",JSON.stringify(this.settings))}}var I;(function(m){m.Unimplemented="UNIMPLEMENTED",m.Unavailable="UNAVAILABLE"})(I||(I={}));class A extends Error{constructor(e,t,i){super(e),this.message=e,this.code=t,this.data=i}}const Q=m=>{var e,t;return m?.androidBridge?"android":!((t=(e=m?.webkit)===null||e===void 0?void 0:e.messageHandlers)===null||t===void 0)&&t.bridge?"ios":"web"},Z=m=>{const e=m.CapacitorCustomPlatform||null,t=m.Capacitor||{},i=t.Plugins=t.Plugins||{},o=()=>e!==null?e.name:Q(m),n=()=>o()!=="web",r=d=>{const p=c.get(d);return!!(p?.platforms.has(o())||a(d))},a=d=>{var p;return(p=t.PluginHeaders)===null||p===void 0?void 0:p.find(f=>f.name===d)},l=d=>m.console.error(d),c=new Map,h=(d,p={})=>{const f=c.get(d);if(f)return console.warn(`Capacitor plugin "${d}" already registered. Cannot register plugins twice.`),f.proxy;const u=o(),g=a(d);let v;const x=async()=>(!v&&u in p?v=typeof p[u]=="function"?v=await p[u]():v=p[u]:e!==null&&!v&&"web"in p&&(v=typeof p.web=="function"?v=await p.web():v=p.web),v),C=(b,y)=>{var S,k;if(g){const $=g?.methods.find(w=>y===w.name);if($)return $.rtype==="promise"?w=>t.nativePromise(d,y.toString(),w):(w,D)=>t.nativeCallback(d,y.toString(),w,D);if(b)return(S=b[y])===null||S===void 0?void 0:S.bind(b)}else{if(b)return(k=b[y])===null||k===void 0?void 0:k.bind(b);throw new A(`"${d}" plugin is not implemented on ${u}`,I.Unimplemented)}},T=b=>{let y;const S=(...k)=>{const $=x().then(w=>{const D=C(w,b);if(D){const V=D(...k);return y=V?.remove,V}else throw new A(`"${d}.${b}()" is not implemented on ${u}`,I.Unimplemented)});return b==="addListener"&&($.remove=async()=>y()),$};return S.toString=()=>`${b.toString()}() { [capacitor code] }`,Object.defineProperty(S,"name",{value:b,writable:!1,configurable:!1}),S},_=T("addListener"),j=T("removeListener"),G=(b,y)=>{const S=_({eventName:b},y),k=async()=>{const w=await S;j({eventName:b,callbackId:w},y)},$=new Promise(w=>S.then(()=>w({remove:k})));return $.remove=async()=>{console.warn("Using addListener() without 'await' is deprecated."),await k()},$},z=new Proxy({},{get(b,y){switch(y){case"$$typeof":return;case"toJSON":return()=>({});case"addListener":return g?G:_;case"removeListener":return j;default:return T(y)}}});return i[d]=z,c.set(d,{name:d,proxy:z,platforms:new Set([...Object.keys(p),...g?[u]:[]])}),z};return t.convertFileSrc||(t.convertFileSrc=d=>d),t.getPlatform=o,t.handleError=l,t.isNativePlatform=n,t.isPluginAvailable=r,t.registerPlugin=h,t.Exception=A,t.DEBUG=!!t.DEBUG,t.isLoggingEnabled=!!t.isLoggingEnabled,t},ee=m=>m.Capacitor=Z(m),H=ee(typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{}),E=H.registerPlugin;class F{constructor(){this.listeners={},this.retainedEventArguments={},this.windowListeners={}}addListener(e,t){let i=!1;this.listeners[e]||(this.listeners[e]=[],i=!0),this.listeners[e].push(t);const n=this.windowListeners[e];n&&!n.registered&&this.addWindowListener(n),i&&this.sendRetainedArgumentsForEvent(e);const r=async()=>this.removeListener(e,t);return Promise.resolve({remove:r})}async removeAllListeners(){this.listeners={};for(const e in this.windowListeners)this.removeWindowListener(this.windowListeners[e]);this.windowListeners={}}notifyListeners(e,t,i){const o=this.listeners[e];if(!o){if(i){let n=this.retainedEventArguments[e];n||(n=[]),n.push(t),this.retainedEventArguments[e]=n}return}o.forEach(n=>n(t))}hasListeners(e){var t;return!!(!((t=this.listeners[e])===null||t===void 0)&&t.length)}registerWindowListener(e,t){this.windowListeners[t]={registered:!1,windowEventName:e,pluginEventName:t,handler:i=>{this.notifyListeners(t,i)}}}unimplemented(e="not implemented"){return new H.Exception(e,I.Unimplemented)}unavailable(e="not available"){return new H.Exception(e,I.Unavailable)}async removeListener(e,t){const i=this.listeners[e];if(!i)return;const o=i.indexOf(t);this.listeners[e].splice(o,1),this.listeners[e].length||this.removeWindowListener(this.windowListeners[e])}addWindowListener(e){window.addEventListener(e.windowEventName,e.handler),e.registered=!0}removeWindowListener(e){e&&(window.removeEventListener(e.windowEventName,e.handler),e.registered=!1)}sendRetainedArgumentsForEvent(e){const t=this.retainedEventArguments[e];t&&(delete this.retainedEventArguments[e],t.forEach(i=>{this.notifyListeners(e,i)}))}}const R=m=>encodeURIComponent(m).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape),O=m=>m.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent);class te extends F{async getCookies(){const e=document.cookie,t={};return e.split(";").forEach(i=>{if(i.length<=0)return;let[o,n]=i.replace(/=/,"CAP_COOKIE").split("CAP_COOKIE");o=O(o).trim(),n=O(n).trim(),t[o]=n}),t}async setCookie(e){try{const t=R(e.key),i=R(e.value),o=e.expires?`; expires=${e.expires.replace("expires=","")}`:"",n=(e.path||"/").replace("path=",""),r=e.url!=null&&e.url.length>0?`domain=${e.url}`:"";document.cookie=`${t}=${i||""}${o}; path=${n}; ${r};`}catch(t){return Promise.reject(t)}}async deleteCookie(e){try{document.cookie=`${e.key}=; Max-Age=0`}catch(t){return Promise.reject(t)}}async clearCookies(){try{const e=document.cookie.split(";")||[];for(const t of e)document.cookie=t.replace(/^ +/,"").replace(/=.*/,`=;expires=${new Date().toUTCString()};path=/`)}catch(e){return Promise.reject(e)}}async clearAllCookies(){try{await this.clearCookies()}catch(e){return Promise.reject(e)}}}E("CapacitorCookies",{web:()=>new te});const ie=async m=>new Promise((e,t)=>{const i=new FileReader;i.onload=()=>{const o=i.result;e(o.indexOf(",")>=0?o.split(",")[1]:o)},i.onerror=o=>t(o),i.readAsDataURL(m)}),oe=(m={})=>{const e=Object.keys(m);return Object.keys(m).map(o=>o.toLocaleLowerCase()).reduce((o,n,r)=>(o[n]=m[e[r]],o),{})},ne=(m,e=!0)=>m?Object.entries(m).reduce((i,o)=>{const[n,r]=o;let a,l;return Array.isArray(r)?(l="",r.forEach(c=>{a=e?encodeURIComponent(c):c,l+=`${n}=${a}&`}),l.slice(0,-1)):(a=e?encodeURIComponent(r):r,l=`${n}=${a}`),`${i}&${l}`},"").substr(1):null,re=(m,e={})=>{const t=Object.assign({method:m.method||"GET",headers:m.headers},e),o=oe(m.headers)["content-type"]||"";if(typeof m.data=="string")t.body=m.data;else if(o.includes("application/x-www-form-urlencoded")){const n=new URLSearchParams;for(const[r,a]of Object.entries(m.data||{}))n.set(r,a);t.body=n.toString()}else if(o.includes("multipart/form-data")||m.data instanceof FormData){const n=new FormData;if(m.data instanceof FormData)m.data.forEach((a,l)=>{n.append(l,a)});else for(const a of Object.keys(m.data))n.append(a,m.data[a]);t.body=n;const r=new Headers(t.headers);r.delete("content-type"),t.headers=r}else(o.includes("application/json")||typeof m.data=="object")&&(t.body=JSON.stringify(m.data));return t};class ae extends F{async request(e){const t=re(e,e.webFetchExtra),i=ne(e.params,e.shouldEncodeUrlParams),o=i?`${e.url}?${i}`:e.url,n=await fetch(o,t),r=n.headers.get("content-type")||"";let{responseType:a="text"}=n.ok?e:{};r.includes("application/json")&&(a="json");let l,c;switch(a){case"arraybuffer":case"blob":c=await n.blob(),l=await ie(c);break;case"json":l=await n.json();break;default:l=await n.text()}const h={};return n.headers.forEach((d,p)=>{h[p]=d}),{data:l,headers:h,status:n.status,url:n.url}}async get(e){return this.request(Object.assign(Object.assign({},e),{method:"GET"}))}async post(e){return this.request(Object.assign(Object.assign({},e),{method:"POST"}))}async put(e){return this.request(Object.assign(Object.assign({},e),{method:"PUT"}))}async patch(e){return this.request(Object.assign(Object.assign({},e),{method:"PATCH"}))}async delete(e){return this.request(Object.assign(Object.assign({},e),{method:"DELETE"}))}}E("CapacitorHttp",{web:()=>new ae});var q;(function(m){m.Dark="DARK",m.Light="LIGHT",m.Default="DEFAULT"})(q||(q={}));var U;(function(m){m.StatusBar="StatusBar",m.NavigationBar="NavigationBar"})(U||(U={}));class se extends F{async setStyle(){this.unavailable("not available for web")}async setAnimation(){this.unavailable("not available for web")}async show(){this.unavailable("not available for web")}async hide(){this.unavailable("not available for web")}}E("SystemBars",{web:()=>new se});function le(m){m.CapacitorUtils.Synapse=new Proxy({},{get(e,t){return new Proxy({},{get(i,o){return(n,r,a)=>{const l=m.Capacitor.Plugins[t];if(l===void 0){a(new Error(`Capacitor plugin ${t} not found`));return}if(typeof l[o]!="function"){a(new Error(`Method ${o} not found in Capacitor plugin ${t}`));return}(async()=>{try{const c=await l[o](n);r(c)}catch(c){a(c)}})()}}})}})}function ce(m){m.CapacitorUtils.Synapse=new Proxy({},{get(e,t){return m.cordova.plugins[t]}})}function de(m=!1){typeof window>"u"||(window.CapacitorUtils=window.CapacitorUtils||{},window.Capacitor!==void 0&&!m?le(window):window.cordova!==void 0&&ce(window))}var L;(function(m){m.Documents="DOCUMENTS",m.Data="DATA",m.Library="LIBRARY",m.Cache="CACHE",m.External="EXTERNAL",m.ExternalStorage="EXTERNAL_STORAGE",m.ExternalCache="EXTERNAL_CACHE",m.LibraryNoCloud="LIBRARY_NO_CLOUD",m.Temporary="TEMPORARY"})(L||(L={}));var B;(function(m){m.UTF8="utf8",m.ASCII="ascii",m.UTF16="utf16"})(B||(B={}));const N=E("Filesystem",{web:()=>P(()=>import("./web-BgfdJ1w7.js"),[],import.meta.url).then(m=>new m.FilesystemWeb)});de();const pe=E("Share",{web:()=>P(()=>import("./web-BGf0i85e.js"),[],import.meta.url).then(m=>new m.ShareWeb)});class he extends F{constructor(){super(...arguments),this.ERROR_PICK_FILE_CANCELED="pickFiles canceled."}async checkPermissions(){throw this.unimplemented("Not implemented on web.")}async convertHeicToJpeg(e){throw this.unimplemented("Not implemented on web.")}async copyFile(e){throw this.unimplemented("Not implemented on web.")}async pickFiles(e){const t=await this.openFilePicker(e);if(!t)throw new Error(this.ERROR_PICK_FILE_CANCELED);const i={files:[]};for(const o of t){const n={blob:o,modifiedAt:o.lastModified,mimeType:this.getMimeTypeFromUrl(o),name:this.getNameFromUrl(o),path:void 0,size:this.getSizeFromUrl(o)};e?.readData&&(n.data=await this.getDataFromFile(o)),i.files.push(n)}return i}async pickDirectory(){throw this.unimplemented("Not implemented on web.")}async pickImages(e){return this.pickFiles(Object.assign({types:["image/*"]},e))}async pickMedia(e){return this.pickFiles(Object.assign({types:["image/*","video/*"]},e))}async pickVideos(e){return this.pickFiles(Object.assign({types:["video/*"]},e))}async requestPermissions(e){throw this.unimplemented("Not implemented on web.")}async openFilePicker(e){var t;const i=((t=e?.types)===null||t===void 0?void 0:t.join(","))||"",o=e?.limit===void 0?0:e.limit;return new Promise(n=>{let r=!1;const a=document.createElement("input");a.type="file",a.accept=i,a.multiple=o===0;const l="oncancel"in a,c=()=>{r=!0,p();const f=Array.from(a.files||[]);n(f)},h=()=>{p(),n(void 0)},d=async()=>{await this.wait(500),!r&&(p(),n(void 0))},p=()=>{a.removeEventListener("change",c),l?a.removeEventListener("cancel",h):window.removeEventListener("focus",d)};a.addEventListener("change",c,{once:!0}),l?a.addEventListener("cancel",h,{once:!0}):window.addEventListener("focus",d,{once:!0}),a.click()})}async getDataFromFile(e){return new Promise((t,i)=>{const o=new FileReader;o.readAsDataURL(e),o.onload=()=>{const a=(typeof o.result=="string"?o.result:"").split("base64,")[1]||"";t(a)},o.onerror=n=>{i(n)}})}getNameFromUrl(e){return e.name}getMimeTypeFromUrl(e){return e.type}getSizeFromUrl(e){return e.size}async wait(e){return new Promise(t=>setTimeout(t,e))}}const me=E("FilePicker",{web:()=>new he}),J=E("App",{web:()=>P(()=>import("./web-Ca0OGwPn.js"),[],import.meta.url).then(m=>new m.AppWeb)}),s=m=>`<i data-lucide="${m}"></i>`;class ue{constructor(){this.db=new K,this.appEl=document.querySelector("#app"),this.currentView="home",this.selectedVerse=null,this.selectedFavoriteIndex=null,this.selectedNoteIndex=null,this.editingNoteIndex=void 0,this.currentVod=null,this.currentVodBg="/img/bg-verse-1.png",this.currentVodDesign=1,this.dictionary=[],this.isSpeaking=!1,this.isPaused=!1,this.currentVerseIndex=0,this.currentChapterVerses=[],this.aboutClickCount=0,this.appVersion="1.3.1",this.repo="krafairus/biblia-cristiana-rv1960-app",this.currentHighlightFilter="all",this.searchFilter="all",this.searchBook=null,this.notesSortOrder="desc",this.favoritesSortOrder="desc",this.highlightsSortOrder="desc",this.devotionalSortOrder="desc",this.selectedNoteIndex=null,this.isNoteSearching=!1,this.editorLogoClickCount=0,this.editorSearchQuery="",this.editorSortOrder="desc",this.editorCurrentTab="devocional",this.editorCurrentView="list",this.navigationHistory=[],this.init()}async canShareData(e){if(!navigator.share||!navigator.canShare)return!1;const t={};let i=!1;for(const[o,n]of Object.entries(e))navigator.canShare({[o]:n})&&(t[o]=n,i=!0);return i?t:!1}async init(){document.addEventListener("click",t=>{t.target.closest(".toolbar-dropdown")||document.querySelectorAll(".toolbar-dropdown.active").forEach(i=>i.classList.remove("active"))}),await this.db.init()?(this.migrateThemes(),this.applyTheme(),this.watchSystemTheme(),this.renderHome(),this.renderFloatingNav(),this.updateFloatingNavState(),this.initNativeNavigation(),this.checkForUpdates(!0)):this.appEl.innerHTML='<div class="error" style="height: 100vh; display: flex; align-items: center; justify-content: center; color: white;">Error al cargar la Biblia. Por favor recarga.</div>'}migrateThemes(){const e=this.db.settings;if(!e.theme_style){const t=e.theme||"classic";t==="dark"?(e.theme_style="classic",e.theme_mode="dark"):t==="light"?(e.theme_style="classic",e.theme_mode="light"):t==="floral"?(e.theme_style="floral",e.theme_mode="light"):t==="pastel-blue"?(e.theme_style="pastel-blue",e.theme_mode="light"):t==="ink"?(e.theme_style="ink",e.theme_mode="light"):(e.theme_style="classic",e.theme_mode="light"),e.system_theme===void 0&&(e.system_theme=!1),this.db.saveSettings()}}applyTheme(e,t){const i=this.db.settings;e&&(i.theme_style=e),t&&(i.theme_mode=t),i.theme_style==="ink"&&(i.theme_mode="light");let o=i.theme_mode||"light";i.system_theme&&(o=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"),document.documentElement.setAttribute("data-style",i.theme_style),document.documentElement.setAttribute("data-mode",o),this.db.saveSettings(),this.currentView==="settings"&&this.renderSettings()}toggleMode(){const e=this.db.settings;if(e.system_theme){this.showToast("La sincronización con el sistema está activa");return}const t=e.theme_mode==="light"?"dark":"light";this.applyTheme(null,t)}watchSystemTheme(){window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",e=>{this.db.settings.system_theme&&this.applyTheme()})}refreshIcons(){if(window.lucide)window.lucide.createIcons();else{const e=document.createElement("script");e.src="/libs/lucide.min.js",e.onload=()=>{window.lucide&&window.lucide.createIcons()},document.head.appendChild(e)}}render(e){this.isSpeaking&&this.stopTTS(),document.getElementById("app").innerHTML=e,this.refreshIcons(),this.appEl.style.height="",this.appEl.style.overflow="",document.body.style.overflow="",window.scrollTo({top:0,behavior:"instant"}),this.appEl.scrollTo(0,0)}showToast(e,t=3e3){const i=document.querySelector("#toast-container");if(!i)return;const o=document.createElement("div");o.className="toast",o.innerText=e,i.appendChild(o),setTimeout(()=>{o.classList.add("removing"),setTimeout(()=>o.remove(),300)},t)}renderHome(){this.currentView="home";const e=this.db.getVerseOfDay(),i=(new Date().getFullYear()*1e4+(new Date().getMonth()+1)*100+new Date().getDate())%11+1,o=`
      <header>
        <div style="display:flex; flex-direction:column;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 1.5rem; line-height:1.1;">BIBLIA CRISTIANA</h1>
          <div style="font-size: 0.7rem; opacity: 0.6; color: var(--accent); font-weight: 800; letter-spacing: 2px; margin-top:2px;">REINA VALERA 1960</div>
        </div>
        <div style="margin-left:auto; display:flex; gap:0.5rem;">
          ${this.db.settings.theme_style!=="ink"?`
          <button class="btn-icon" onclick="window.app.toggleMode()" id="theme-toggle-btn">
            ${s(this.db.settings.theme_mode==="dark"?"sun":"moon")}
          </button>
          `:""}
          <button class="btn-icon" onclick="window.app.navigate('settings')">${s("settings")}</button>
        </div>
      </header>

      <div class="view-container with-main-nav animate-entrance">
        ${e?`
          <div class="home-vod-card" onclick="window.pendingVerseScroll = '${e.verse}'; window.app.renderReader('${e.book}', '${e.chapter}')"
               style="background-image: url('/img/bg-verse-${i}.png'); border-radius: 28px; box-shadow: 0 12px 30px rgba(0,0,0,0.25);">
            <div class="vod-thematic" style="background:none; border:none; padding:0; font-size:0.75rem; color:white; opacity:0.85; font-weight:800; letter-spacing:2px; margin-bottom:0.25rem; text-transform:uppercase;">${e.thematic}</div>
            <div class="vod-text">"${e.text}"</div>
            <div class="vod-ref">${e.book} ${e.chapter}:${e.verse}</div>
          </div>
        `:""}

        <h2 class="home-section-title">${s("book")} Testamentos</h2>
        <div class="home-grid" style="grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="premium-card" onclick="window.app.navigate('old')" style="flex-direction:column; justify-content:center; gap:0.75rem; padding: 1.5rem 1rem;">
            <div class="icon-wrapper" style="background:var(--accent-soft); color:var(--accent); width:42px; height:42px;">${s("book")}</div>
            <div style="font-weight:700; font-size:0.95rem; text-align:center;">Antiguo T.</div>
          </div>
          <div class="premium-card" onclick="window.app.navigate('new')" style="flex-direction:column; justify-content:center; gap:0.75rem; padding: 1.5rem 1rem;">
            <div class="icon-wrapper" style="background:var(--accent-soft); color:var(--accent); width:42px; height:42px;">${s("book-open")}</div>
            <div style="font-weight:700; font-size:0.95rem; text-align:center;">Nuevo T.</div>
          </div>
        </div>

        <h2 class="home-section-title">${s("bookmark")} Accesos Rápidos</h2>
        <div class="home-grid" style="grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="premium-card" onclick="window.app.navigate('last')" style="flex-direction:column; justify-content:center; gap:0.75rem; padding: 1.5rem 1rem;">
            <div class="icon-wrapper" style="background:var(--accent-soft); color:var(--accent); width:38px; height:38px;">${s("history")}</div>
            <span style="font-size:0.85rem; font-weight:700; text-align:center;">Última lectura</span>
          </div>
          <div class="premium-card" onclick="window.app.navigate('vod')" style="flex-direction:column; justify-content:center; gap:0.75rem; padding: 1.5rem 1rem;">
            <div class="icon-wrapper" style="background:var(--accent-soft); color:var(--accent); width:38px; height:38px;">${s("sun")}</div>
            <span style="font-size:0.85rem; font-weight:700; text-align:center;">Vr del día</span>
          </div>
          <div class="premium-card" onclick="window.app.navigate('crecimiento')" style="flex-direction:column; justify-content:center; gap:0.75rem; padding: 1.5rem 1rem;">
            <div class="icon-wrapper" style="background:var(--accent-soft); color:var(--accent); width:38px; height:38px;">${s("trending-up")}</div>
            <span style="font-size:0.85rem; font-weight:700; text-align:center;">Crecimiento</span>
          </div>
          <div class="premium-card" onclick="window.app.navigate('dict')" style="flex-direction:column; justify-content:center; gap:0.75rem; padding: 1.5rem 1rem;">
            <div class="icon-wrapper" style="background:var(--accent-soft); color:var(--accent); width:38px; height:38px;">${s("book-a")}</div>
            <span style="font-size:0.85rem; font-weight:700; text-align:center;">Diccionario</span>
          </div>
        </div>
      </div>
    `;this.render(o),this.updateFloatingNavState()}navigate(e,t=!1){if(t||this.addToHistory(this.currentView),this._isNavigatingBack=t,this.clearSelection(),this.clearFavoriteSelection(),this.clearHighlightSelection(),this.clearNoteSelection(),this.closeShareModal(),e!=="search"&&(this.searchFilter="all",this.searchBook=null),e==="home")this.renderHome();else if(e==="old")this.renderBookList("old");else if(e==="new")this.renderBookList("new");else if(e==="favorites")this.renderFavorites();else if(e==="notes")this.renderNotes();else if(e==="highlights")this.renderHighlights();else if(e==="search")this.renderSearch();else if(e==="dict")this.renderDictionary();else if(e==="about")this.renderAbout();else if(e==="settings")this.renderSettings();else if(e==="vod")this.renderVerseOfDay();else if(e==="crecimiento")this.renderCrecimiento();else if(e==="devocional")this.renderDevotionalHistory();else if(e==="preguntas")this.renderPreguntasHistory();else if(e==="devotional-favorites")this.renderDevotionalFavorites();else if(e==="editor-admin")this.renderEditorAdmin();else if(e!=="note-editor"){if(e==="last"){const{last_book:i,last_chapter:o}=this.db.settings;this.renderReader(i,o)}}this.updateFloatingNavState()}updateFloatingNavState(){const e=document.getElementById("main-floating-nav");if(!e)return;const i=["reader","note-editor","old","new","chapters","verses","settings","about","crecimiento","devocional","preguntas","devotional-favorites","devotional-history","devotional-detail","vod","share-verse","dict","editor-admin"].includes(this.currentView);e.classList.toggle("hidden",i),e.querySelectorAll(".nav-item").forEach(o=>{const n=o.getAttribute("onclick")?.match(/'([^']+)'/)?.[1];let r=this.currentView===n;n==="home"&&this.currentView==="home"&&(r=!0),o.classList.toggle("active",r)})}renderFloatingNav(){let e=document.getElementById("main-floating-nav");const t=`
      <a class="nav-item" onclick="window.app.navigate('home')">
        ${s("home")}
        <span style="font-size: 0.78rem;">Inicio</span>
      </a>
      <a class="nav-item" onclick="window.app.navigate('search')">
        ${s("search")}
        <span style="font-size: 0.78rem;">Buscar</span>
      </a>
      <a class="nav-item" onclick="window.app.navigate('highlights')">
        ${s("highlighter")}
        <span style="font-size: 0.78rem;">Resaltos</span>
      </a>
      <a class="nav-item" onclick="window.app.navigate('favorites')">
        ${s("heart")}
        <span style="font-size: 0.78rem;">Favoritos</span>
      </a>
      <a class="nav-item" onclick="window.app.navigate('notes')">
        ${s("sticky-note")}
        <span style="font-size: 0.78rem;">Notas</span>
      </a>
    `;e?e.innerHTML=t:(e=document.createElement("div"),e.id="main-floating-nav",e.className="floating-nav hidden",e.innerHTML=t,this.appEl.after(e)),this.refreshIcons()}renderBookList(e,t=!1){t||this.addToHistory(this.currentView),this._isNavigatingBack=t,this.currentView=e==="old"?"old":"new";const i=this.db.getBooks(e),o=`
      <header>
        <button class="btn-icon" onclick="window.app.navigate('home')">${s("chevron-left")}</button>
        <h1>${e==="old"?"Antiguo Testamento":"Nuevo Testamento"}</h1>
      </header>
      <div class="view-container animate-entrance">
        <div style="display: grid; grid-template-columns: 1fr; gap: 0.75rem;">
          ${i.map(n=>`
            <div class="premium-card" onclick="window.app.renderChapterList('${n}')" 
                 style="flex-direction: row; justify-content: space-between; padding: 1.25rem;">
              <span style="font-size: 1.1rem;">${n}</span>
              <div style="color: var(--accent); opacity: 0.5;">${s("chevron-right")}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `;this.render(o),this.updateFloatingNavState()}renderChapterList(e,t=!1){t||this.addToHistory(this.currentView),this._isNavigatingBack=t,this.currentView="chapters";const i=this.db.getChapters(e),r=`
      <header>
        <div style="display: flex; align-items: center; gap: 1rem;">
          <button class="btn-icon" onclick="window.app.renderBookList('${this.db.getBooks("old").includes(e)?"old":"new"}', true)">${s("chevron-left")}</button>
          <h1 style="font-size: 1.5rem; margin: 0;">${e}</h1>
        </div>
      </header>
      <div class="view-container animate-entrance">
        <p style="opacity: 0.6; font-size: 0.9rem; margin-bottom: 1.5rem; font-weight: 600; text-transform: uppercase; text-align: center;">Seleccionar Capítulo</p>
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.75rem;">
          ${i.map(a=>`
            <div class="premium-card" onclick="window.app.renderVerseList('${e.replace(/'/g,"\\'")}', '${a}')" 
                 style="aspect-ratio: 1/1; justify-content: center; align-items: center; padding: 0; font-size: 1.1rem; font-weight: 700; border-radius: 12px;">
              ${a}
            </div>
          `).join("")}
        </div>
      </div>
    `;this.render(r),this.updateFloatingNavState()}renderVerseList(e,t,i=!1){i||this.addToHistory(this.currentView,{book:e,chapter:t}),this._isNavigatingBack=i,this.currentView="verses";const o=this.db.getVerses(e,t),n=`
      <header>
        <div style="display: flex; align-items: center; gap: 1rem;">
          <button class="btn-icon" onclick="window.app.renderChapterList('${e.replace(/'/g,"\\'")}', true)">${s("chevron-left")}</button>
          <h1 style="font-size: 1.5rem; margin: 0;">${e} ${t}</h1>
        </div>
      </header>
      <div class="view-container animate-entrance">
        <p style="opacity: 0.6; font-size: 0.9rem; margin-bottom: 1.5rem; font-weight: 600; text-transform: uppercase; text-align: center;">Seleccionar Versículo</p>
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.75rem;">
          ${o.map(([r])=>`
            <div class="premium-card" onclick="window.pendingVerseScroll='${r}'; window.app.renderReader('${e.replace(/'/g,"\\'")}', '${t}')" 
                 style="aspect-ratio: 1/1; justify-content: center; align-items: center; padding: 0; font-size: 1.1rem; font-weight: 700; border-radius: 12px;">
              ${r}
            </div>
          `).join("")}
        </div>
      </div>
    `;this.render(n),this.updateFloatingNavState()}renderReader(e,t,i=!1){i||this.addToHistory(this.currentView,{book:e,chapter:t}),this._isNavigatingBack=i,this.currentView="reader",this.db.setLastRead(e,t);const o=this.db.getChapters(e),n=this.db.getVerses(e,t),r=document.getElementById("main-floating-nav");r&&r.classList.add("hidden");const a=document.getElementById("fav-selection-bar");a&&(a.style.display="none");const l=document.getElementById("highlight-selection-bar");l&&(l.style.display="none");const c=`
      <header style="flex-direction: column; align-items: flex-start; gap: 0.5rem; padding-bottom: 0;">
        <div style="display: flex; align-items: center; gap: 1rem; width: 100%;">
          <button class="btn-icon" onclick="window.app.renderVerseList('${e.replace(/'/g,"\\'")}', '${t}')">${s("chevron-left")}</button>
          <h1 style="flex-grow: 1; font-size: 1.4rem;">${e}</h1>
          <button class="btn-icon ${this.isSpeaking?"active":""}" id="tts-btn" 
                  style="${this.isSpeaking?"background: var(--accent); color: white;":""}"
                  onclick="window.app.toggleTTS('${e.replace(/'/g,"\\'")}', '${t}')" title="Leer capítulo">
            ${s(this.isSpeaking?this.isPaused?"play":"pause":"volume-2")}
          </button>
          <button class="btn-icon" id="tts-controls-btn" 
                  style="display: ${this.isSpeaking?"flex":"none"}; background: var(--card-bg); border: 1px solid var(--glass-border); width: 40px; height: 40px; margin-left: -0.5rem;"
                  onclick="window.app.openTTSDialog()" title="Controles de Audio">
             ${s("sliders-horizontal")}
          </button>
        </div>
        <div id="chapter-tabs" style="display: flex; overflow-x: auto; gap: 0.5rem; width: 100%; padding: 0.5rem 0 1rem 0; scrollbar-width: none;">
          ${o.map(d=>`
            <button class="${d===t?"premium-card":""}" 
                    style="padding: 0.4rem 1rem; border: ${d===t?"none":"1px solid var(--glass-border)"}; 
                           background: ${d===t?"var(--accent)":"var(--card-bg)"}; 
                           color: ${d===t?"white":"var(--text-main)"};
                           border-radius: 20px; white-space: nowrap; font-size: 0.9rem; font-weight: 600;"
                    onclick="window.app.renderReader('${e}', '${d}')">
              ${d}
            </button>
          `).join("")}
        </div>
      </header>
      <div class="view-container with-selection-bar animate-entrance">
        ${n.map(([d,p])=>{const f=this.db.isFavorite(e,t,d),u=this.db.isHighlighted(e,t,d),g=this.db.getPericope(e,t,d),v=u?`background-color: ${u.color}; color: #333; border-radius: 4px; padding: 2px 4px; box-decoration-break: clone; -webkit-box-decoration-break: clone;`:"";return`
              ${g?`<div class="pericope">${g}</div>`:""}
              <div class="verse-item ${f?"favorite":""}" 
                   id="v-${d}" onclick="window.app.toggleVerseSelection('${e}', '${t}', '${d}', '${p.replace(/'/g,"\\'")}')">
                <span class="verse-num">${d}</span>
                <span class="verse-text" style="${v}">${p}</span>
              </div>
            `}).join("")}
      </div>
      <div id="selection-bar" class="floating-toolbar animate-entrance" style="display: none;">
        <button class="tool-btn" onclick="window.app.handleFavorite()" title="Favorito">${s("heart")}</button>
        <button class="tool-btn" onclick="window.app.handleNote()" title="Nota">${s("edit-3")}</button>
        <button class="tool-btn" onclick="window.app.handleHighlight()" title="Marcador">${s("highlighter")}</button>
        <button class="tool-btn" onclick="window.app.handleVerseMenu()" title="Menú">${s("menu")}</button>
        <button class="tool-btn" onclick="window.app.clearSelection()" title="Cerrar">${s("x")}</button>
      </div>

      <div id="highlight-bar" class="floating-toolbar animate-entrance" style="display: none; top: auto; bottom: 80px; justify-content: center; gap: 10px; flex-wrap: wrap; padding: 10px;">
        ${["#fef3c7","#dcfce7","#dbeafe","#fae8ff","#fecaca","#fed7aa","#f9fafb","transparent"].map(d=>`
            <div data-color="${d}" onclick="window.app.applyHighlight('${d}')" style="width: 30px; height: 30px; border-radius: 50%; background: ${d==="transparent"?"white":d}; border: 1px solid #ccc; cursor: pointer; display: flex; align-items: center; justify-content: center; color: ${d==="transparent"?"#333":"inherit"};">
                ${d==="transparent"?s("ban"):""}
            </div>
        `).join("")}
      </div>

      <!-- TTS Controls Dialog -->
      <div id="tts-dialog" class="floating-toolbar animate-entrance" 
           style="display: none; flex-direction: column; align-items: center; padding: 1rem; width: 85%; max-width: 350px; bottom: 100px; border-radius: 24px; gap: 1rem; background: var(--bg-color); border: 1px solid var(--glass-border);">
          <div style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 0.9rem; color: var(--accent);">Control de Lectura</span>
            <button class="btn-icon" onclick="window.app.closeTTSDialog()" style="width: 30px; height: 30px; background: transparent; color: var(--text-main);">${s("x")}</button>
          </div>
          
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 1rem; background: var(--card-bg); padding: 0.5rem; border-radius: 16px;">
             <button class="btn-icon" onclick="window.app.prevVerseTTS()" style="width: 40px; height: 40px;">${s("chevron-left")}</button>
             <div style="text-align: center; flex: 1;">
                <span id="tts-current-verse" style="font-weight: 700; font-size: 1.1rem; display: block;">Verso -</span>
             </div>
             <button class="btn-icon" onclick="window.app.nextVerseTTS()" style="width: 40px; height: 40px;">${s("chevron-right")}</button>
          </div>
          
          <button onclick="window.app.stopTTS()" style="width: 100%; padding: 0.8rem; border-radius: 12px; background: #ef4444; color: white; border: none; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            ${s("square")} Detener Reproducción
          </button>
      </div>
    `;this.render(c);const h=document.querySelector("#chapter-tabs .premium-card");h&&h.scrollIntoView({behavior:"auto",block:"nearest",inline:"center"}),window.pendingVerseScroll&&setTimeout(()=>{const d=document.getElementById(`v-${window.pendingVerseScroll}`);d&&d.scrollIntoView({behavior:"auto",block:"center"}),window.pendingVerseScroll=null},100),this.setupSwipeNavigation(e,t)}setupSwipeNavigation(e,t){let i=0,o=0;const n=document.querySelector(".view-container");n&&(n.ontouchstart=r=>{i=r.touches[0].clientX,o=r.touches[0].clientY},n.ontouchend=r=>{const a=r.changedTouches[0].clientX,l=r.changedTouches[0].clientY,c=i-a,h=o-l;if(Math.abs(c)>80&&Math.abs(c)>Math.abs(h)*1.8)if(c>0){const p=parseInt(t)+1;p<=this.db.getChapters(e).length&&(n.classList.add("swipe-left"),setTimeout(()=>this.renderReader(e,p.toString()),200))}else{const p=parseInt(t)-1;p>=1&&(n.classList.add("swipe-right"),setTimeout(()=>this.renderReader(e,p.toString()),200))}})}toggleVerseSelection(e,t,i,o){const n=document.getElementById(`v-${i}`);if(this.selectedVerse&&this.selectedVerse.vNum===i)this.clearSelection();else{this.clearSelection(),this.selectedVerse={book:e,chapter:t,vNum:i,text:o},n.classList.add("selected"),document.querySelector("#selection-bar").style.display="flex";const r=this.db.isFavorite(e,t,i),a=document.querySelector("#selection-bar .tool-btn:first-child");a.style.color=r?"var(--accent)":"var(--text-main)",r?a.innerHTML=s("heart-off"):a.innerHTML=s("heart"),this.refreshIcons()}}clearSelection(){if(this.selectedVerse){const i=document.getElementById(`v-${this.selectedVerse.vNum}`);i&&i.classList.remove("selected")}this.selectedVerse=null;const e=document.querySelector("#selection-bar");e&&(e.style.display="none");const t=document.querySelector("#highlight-bar");t&&(t.style.display="none")}handleFavorite(){if(!this.selectedVerse)return;const{book:e,chapter:t,vNum:i,text:o}=this.selectedVerse,n=this.db.toggleFavorite(e,t,i,o),r=document.getElementById(`v-${i}`);n?r.classList.add("favorite"):r.classList.remove("favorite"),this.clearSelection()}handleNote(){this.renderNoteEditor(null,"reader")}createNewNote(){this.renderNoteEditor(null,"notes")}renderNoteEditor(e=null,t="notes",i=!1){i||this.addToHistory(this.currentView,{index:e,source:t}),this._isNavigatingBack=i,this.currentNoteIndex=e,this.currentView="note-editor",this.updateFloatingNavState(),this.editingNoteIndex=e!==null?e:void 0,this.noteSource=t;let o={title:"",note:"",book:"",chapter:"",verse:"",text:""};e!==null?o=this.db.notes[e]:this.selectedVerse?o={...this.selectedVerse,verse:this.selectedVerse.vNum,title:"",note:""}:o={book:"Proverbios",chapter:"2",verse:"6",text:"Porque Jehová da la sabiduría, y de su boca viene el conocimiento y la inteligencia.",title:"",note:""};const n=`
      <header style="position: relative; top: auto; flex-shrink: 0;">
        <button class="btn-icon" onclick="window.app.cancelNoteEditor()">${s("chevron-left")}</button>
        <div class="note-title-container">
          <input type="text" id="editor-note-title" class="note-title-input"
                 placeholder="${e!==null?"Título de la nota...":"Nueva nota..."}"
                 value="${(o.title||"").replace(/"/g,"&quot;")}">
        </div>
        <div class="toolbar-dropdown">
          <button class="btn-icon dropdown-trigger" onclick="event.stopPropagation(); this.parentElement.classList.toggle('active')" title="Acciones">
            ${s("more-vertical")}
          </button>
          <div class="dropdown-content right" style="min-width:160px;">
            <button onclick="window.app.confirmSaveNoteFromEditor()" style="display:flex;align-items:center;gap:0.5rem;width:100%;padding:0.6rem 0.8rem;text-align:left;background:none;border:none;color:var(--accent);font-size:0.9rem;font-weight:600;">
              ${s("check")} Guardar Nota
            </button>
            ${e!==null?`
            <button onclick="window.app.exportNoteToPDF(${e})" style="display:flex;align-items:center;gap:0.5rem;width:100%;padding:0.6rem 0.8rem;text-align:left;background:none;border:none;color:var(--text-main);font-size:0.9rem;font-weight:500;">
              ${s("file-text")} Exportar a PDF
            </button>
            <button onclick="window.app.confirmDeleteNote(${e})" style="display:flex;align-items:center;gap:0.5rem;width:100%;padding:0.6rem 0.8rem;text-align:left;background:none;border:none;color:#ef4444;font-size:0.9rem;font-weight:500;">
              ${s("trash-2")} Eliminar Nota
            </button>`:""}
          </div>
        </div>
      </header>

      <!-- Layout del editor -->
      <div id="editor-wrapper" style="display:flex; flex-direction:column; flex:1; min-height:0; position:relative;">

        <!-- Área de texto -->
        <div style="flex:1; min-height:0; position:relative; margin-top:0.5rem; display:flex; flex-direction:column;">

          <!-- Paneles integrados (Rediseñados como Bottom Sheets Globales) -->
          <div id="editor-header-panel" class="editor-inline-panel">
            <div class="editor-inline-backdrop" onclick="window.app.closeEditorPanel('editor-header-panel')"></div>
            <div class="editor-inline-panel-content">
              <p class="editor-panel-label">Formato de Texto</p>
              <div class="editor-panel-grid">
                <button type="button" onclick="window.app.editorPanelCmd('formatBlock','H1')" class="panel-item"><span style="font-size:1.2rem;font-weight:900;">H1</span><small>Título</small></button>
                <button type="button" onclick="window.app.editorPanelCmd('formatBlock','H2')" class="panel-item"><span style="font-size:1.05rem;font-weight:800;">H2</span><small>Subtítulo</small></button>
                <button type="button" onclick="window.app.editorPanelCmd('formatBlock','H3')" class="panel-item"><span style="font-size:0.95rem;font-weight:700;">H3</span><small>Sección</small></button>
                <button type="button" onclick="window.app.editorPanelCmd('formatBlock','p')" class="panel-item"><span>P</span><small>Párrafo</small></button>
              </div>
            </div>
          </div>

          <div id="editor-more-panel" class="editor-inline-panel">
            <div class="editor-inline-backdrop" onclick="window.app.closeEditorPanel('editor-more-panel')"></div>
            <div class="editor-inline-panel-content">
              <p class="editor-panel-label">Herramientas Avanzadas</p>
              <div class="editor-panel-grid">
                <button type="button" onclick="window.app.editorPanelAction('link')" class="panel-item">${s("link")}<small>Enlace</small></button>
                <button type="button" onclick="window.app.editorPanelCmd('insertHorizontalRule')" class="panel-item">${s("minus")}<small>Divisor</small></button>
                <button type="button" onclick="window.app.editorPanelCmd('formatBlock','blockquote')" class="panel-item">${s("quote")}<small>Cita</small></button>
                <button type="button" onclick="window.app.editorPanelCmd('formatBlock','pre')" class="panel-item">${s("code")}<small>Código</small></button>
              </div>
            </div>
          </div>

          <div id="editor-link-panel" class="editor-inline-panel">
            <div class="editor-inline-backdrop" onclick="window.app.closeEditorPanel('editor-link-panel')"></div>
            <div class="editor-inline-panel-content">
              <div class="editor-link-panel-header">
                <p class="editor-panel-label" id="editor-link-title">Insertar Enlace</p>
                <button type="button" class="panel-close-btn" onclick="window.app.closeEditorPanel('editor-link-panel')">${s("x")}</button>
              </div>
              <div class="editor-link-input-group">
                <input type="url" id="editor-link-input" class="editor-link-input-field" placeholder="https://ejemplo.com">
              </div>
              <div class="editor-link-actions" id="editor-link-actions-container">
                <!-- Botones inyectados dinámicamente -->
              </div>
            </div>
          </div>

          <div id="verse-card-editor" style="
            z-index: 50;
            margin: 0.5rem 0.75rem 0.75rem;
            background: var(--bg-color);
            border-radius: 16px;
            border: 1px solid var(--glass-border);
            border-left: 4px solid var(--accent);
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);
            overflow: hidden;
            flex-shrink: 0;
          ">
            <div style="padding:0.65rem 0.85rem; display:flex; align-items:center; gap:0.5rem; background: var(--header-bg);">
              <div style="flex:1; min-width:0;">
                <div style="color:var(--accent); font-size:0.78rem; font-weight:700; letter-spacing:0.03em;">${o.book} ${o.chapter}:${o.verse}</div>
              </div>
              <button type="button" id="verse-toggle-btn" onclick="window.app.toggleVerseText()"
                style="flex-shrink:0; background:var(--accent-soft); border:none; color:var(--accent); padding:0.25rem 0.5rem; border-radius:8px; cursor:pointer; display:flex; align-items:center; gap:0.2rem; font-size:0.7rem; font-weight:600; transition:transform 0.25s ease;">
                ${s("chevron-up")}
              </button>
            </div>
            <div id="verse-text-editor" style="
              font-size:0.88rem; opacity:0.75; font-style:italic; line-height:1.5;
              padding:0 0.85rem 0.65rem;
              overflow:hidden;
              max-height:300px;
              transition:all 0.4s ease;
            ">"${o.text}"</div>
          </div>
          <!-- Área de scroll dedicada -->
          <div id="editor-scroll-container" style="flex:1; min-height:0; overflow-y:auto; overflow-x:hidden; position:relative; -webkit-overflow-scrolling:touch; padding-top:0.25rem; scroll-padding-bottom: 80px;">
            <div id="editor-note-text" class="rich-editor" contenteditable="true"
                 placeholder="¿Qué te inspira Dios a escribir aquí?..."
                  oncontextmenu="return true"
                 style="min-height:200px; outline:none; padding:0 1.25rem;">${o.note||""}</div>
            
            <div class="editor-bottom-spacer" style="height:120px; pointer-events:none;"></div>
          </div>
        </div>

        <!-- ═══ TOOLBAR PILL FLOTANTE PREMIUM ═══ -->
        <div id="editor-toolbar-wrap" class="editor-toolbar-pill-container" style="transition: bottom 0.2s ease-out;">
          
          <!-- Fila secundaria (Oculta por defecto) -->
          <div id="toolbar-secondary-row" class="editor-toolbar-floating editor-toolbar-secondary" style="display:none;">
            <button type="button" data-command="insertUnorderedList" onclick="window.app.execEditorCommand('insertUnorderedList')" class="tb-btn" title="Lista">${s("list")}</button>
            <button type="button" data-command="insertOrderedList" onclick="window.app.execEditorCommand('insertOrderedList')" class="tb-btn" title="Lista Numerada">${s("list-ordered")}</button>
            <div class="tb-sep"></div>
            <button type="button" onclick="window.app.execEditorCommand('removeFormat')" class="tb-btn" title="Limpiar Formato">${s("eraser")}</button>
            <div class="tb-sep"></div>
            <button type="button" onclick="window.app.execEditorCommand('undo')" class="tb-btn" title="Deshacer">${s("undo-2")}</button>
            <button type="button" onclick="window.app.execEditorCommand('redo')" class="tb-btn" title="Rehacer">${s("redo-2")}</button>
            <div class="tb-sep"></div>
            <button type="button" onclick="window.app.toggleSubToolbar(null)" class="tb-btn" title="Cerrar" style="color:var(--accent);">${s("x")}</button>
          </div>

          <!-- Fila de Encabezados (Sustituye a la principal) -->
          <div id="toolbar-header-row" class="editor-toolbar-floating" style="display:none;">
            <button type="button" onclick="window.app.execEditorCommand('formatBlock','H1')" class="tb-btn"><b>H1</b></button>
            <button type="button" onclick="window.app.execEditorCommand('formatBlock','H2')" class="tb-btn"><b>H2</b></button>
            <button type="button" onclick="window.app.execEditorCommand('formatBlock','H3')" class="tb-btn"><b>H3</b></button>
            <button type="button" onclick="window.app.execEditorCommand('formatBlock','p')" class="tb-btn"><b>P</b></button>
            <div class="tb-sep"></div>
            <button type="button" onclick="window.app.toggleSubToolbar(null)" class="tb-btn" title="Volver">${s("chevron-left")}</button>
          </div>

          <!-- Fila de Herramientas Avanzadas -->
          <div id="toolbar-more-row" class="editor-toolbar-floating" style="display:none;">
            <button type="button" onclick="window.app.showLinkDialog()" class="tb-btn">${s("link")}</button>
            <button type="button" onclick="window.app.execEditorCommand('insertHorizontalRule')" class="tb-btn">${s("minus")}</button>
            <button type="button" onclick="window.app.execEditorCommand('formatBlock','blockquote')" class="tb-btn">${s("quote")}</button>
            <button type="button" onclick="window.app.execEditorCommand('formatBlock','pre')" class="tb-btn">${s("code")}</button>
            <div class="tb-sep"></div>
            <button type="button" onclick="window.app.toggleSubToolbar(null)" class="tb-btn" title="Volver">${s("chevron-left")}</button>
          </div>

          <!-- Fila principal -->
          <div id="note-rich-toolbar" class="editor-toolbar-floating" style="display:flex;">
            <button type="button" data-command="bold" onclick="window.app.execEditorCommand('bold')" class="tb-btn" title="Negrita">${s("bold")}</button>
            <button type="button" data-command="italic" onclick="window.app.execEditorCommand('italic')" class="tb-btn" title="Cursiva">${s("italic")}</button>
            <button type="button" data-command="underline" onclick="window.app.execEditorCommand('underline')" class="tb-btn" title="Subrayado">${s("underline")}</button>
            <button type="button" data-command="strikethrough" onclick="window.app.execEditorCommand('strikethrough')" class="tb-btn" title="Tachado">${s("strikethrough")}</button>
            <div class="tb-sep"></div>
            <button type="button" id="align-toggle-btn" onclick="window.app.toggleAlignment(event)" class="tb-btn" title="Alineación">${s("align-left")}</button>
            <button type="button" id="header-open-btn" onclick="window.app.toggleSubToolbar('toolbar-header-row')" class="tb-btn" title="Encabezados"><b>H</b></button>
            <button type="button" id="more-open-btn" onclick="window.app.toggleSubToolbar('toolbar-more-row')" class="tb-btn" title="Más herramientas">${s("layout-grid")}</button>
            <div style="width: 8px;"></div>
            <button type="button" id="toolbar-expand-btn" onclick="window.app.toggleSubToolbar('toolbar-secondary-row')" class="tb-btn" title="Más" style="color:var(--accent); background: var(--accent-soft); border-radius: 50%;">${s("plus")}</button>
          </div>
        </div>
      </div>
    `;this.render(n),this.appEl.style.height="100vh",this.appEl.style.overflow="hidden",document.body.style.overflow="hidden",this.refreshIcons(),document.execCommand("defaultParagraphSeparator",!1,"p");const r=document.getElementById("editor-toolbar-wrap"),a=()=>{const h=window.visualViewport;if(!h)return;const d=window.innerHeight-h.height,p=d>60;r&&(p?(r.style.bottom=d+"px",r.style.paddingBottom="0.5rem"):(r.style.bottom="0px",r.style.paddingBottom="0.6rem")),document.querySelectorAll(".editor-inline-panel-content").forEach(u=>{p?(u.style.paddingBottom="1rem",u.style.marginBottom=d+"px"):(u.style.paddingBottom="",u.style.marginBottom="0")});const f=document.getElementById("editor-wrapper");f&&(f.style.height=h.height+"px")};window.visualViewport&&(this._vpResizeHandler&&window.visualViewport.removeEventListener("resize",this._vpResizeHandler),this._vpResizeHandler=a,window.visualViewport.addEventListener("resize",this._vpResizeHandler),window.visualViewport.addEventListener("scroll",this._vpResizeHandler),a());const l=()=>{["bold","italic","underline","strikethrough"].forEach(p=>{const f=document.querySelector(`.tb-btn[data-command="${p}"]`);if(f){const u=document.queryCommandState(p);f.classList.toggle("active",u)}});const d=window.getSelection();if(d&&d.rangeCount>0){let p=d.anchorNode;p.nodeType===3&&(p=p.parentNode);const f=!!p.closest("blockquote"),u=!!p.closest("pre")||!!p.closest("code"),g=!!p.closest("h1"),v=!!p.closest("h2"),x=!!p.closest("h3");document.getElementById("align-toggle-btn");const C=document.getElementById("header-panel-btn"),T=document.getElementById("more-panel-btn");C&&C.classList.toggle("active",g||v||x),T&&T.classList.toggle("active",f||u)}};this._updateToolbarState=l;const c=document.getElementById("editor-note-text");c&&(c.addEventListener("keyup",l),c.addEventListener("mouseup",l),c.addEventListener("touchend",l),c.addEventListener("input",l))}async copySelection(){const e=window.getSelection().toString();if(e)try{await navigator.clipboard.writeText(e),this.showToast("Copiado al portapapeles")}catch{document.execCommand("copy"),this.showToast("Copiado")}}async pasteToEditor(){try{const e=await navigator.clipboard.readText();e&&document.execCommand("insertText",!1,e)}catch{this.showToast("No se pudo acceder al portapapeles. Use el menú de Android si es necesario.")}}execEditorCommand(e,t=null){if(e==="formatBlock"){const o=window.getSelection();if(!o.rangeCount)return;const n=document.queryCommandValue("formatBlock"),r=t.toLowerCase(),a=n.toLowerCase();if(a===r||a==="address"&&r==="blockquote")document.execCommand("formatBlock",!1,"p");else if(/^h[1-6]|blockquote|pre$/.test(r)){let h=o.getRangeAt(0).commonAncestorContainer;h.nodeType===3&&(h=h.parentNode);const d=document.getElementById("editor-note-text");for(;h&&h.parentNode!==d&&h!==d;)h=h.parentNode;const p=h&&h!==d?h.style.textAlign:null;document.execCommand("formatBlock",!1,t);let u=window.getSelection().getRangeAt(0).commonAncestorContainer;for(u.nodeType===3&&(u=u.parentNode);u&&u.parentNode!==d&&u!==d;)u=u.parentNode;u&&u!==d&&p&&(u.style.textAlign=p)}else document.execCommand("formatBlock",!1,t)}else e==="removeFormat"?(document.execCommand("removeFormat",!1,null),document.execCommand("formatBlock",!1,"p")):document.execCommand(e,!1,t);document.querySelectorAll(".toolbar-dropdown.active").forEach(o=>o.classList.remove("active")),this.updateToolbarState();const i=document.getElementById("editor-note-text");i&&i.focus()}showLinkDialog(){const e=window.getSelection();if(!e||e.rangeCount===0||e.toString().trim()===""&&!e.anchorNode.parentElement.closest("a")){this.showToast("Por favor, seleccione el texto que desea convertir en enlace");return}const t=e.anchorNode.parentElement.closest("a");document.getElementById("editor-link-panel");const i=document.getElementById("editor-link-input"),o=document.getElementById("editor-link-title"),n=document.getElementById("editor-link-actions-container");this.savedRange=e.getRangeAt(0),t?(o.innerText="Editar Enlace",i.value=t.href,n.innerHTML=`
        <button type="button" class="editor-link-btn editor-link-btn-delete" onclick="window.app.removeLink()">${s("trash-2")} Eliminar</button>
        <button type="button" class="editor-link-btn editor-link-btn-save" onclick="window.app.applyLink()">Guardar</button>
      `):(o.innerText="Insertar Enlace",i.value="https://",n.innerHTML=`
        <button type="button" class="editor-link-btn editor-link-btn-cancel" onclick="window.app.closeEditorPanel('editor-link-panel')">Cancelar</button>
        <button type="button" class="editor-link-btn editor-link-btn-save" onclick="window.app.applyLink()">Insertar</button>
      `),this.toggleEditorPanel("editor-link-panel"),setTimeout(()=>{i.focus(),i.select()},350)}applyLink(){const e=document.getElementById("editor-link-input"),t=e?e.value.trim():"";if(!t||t==="https://"){this.showToast("Por favor, ingrese una URL válida");return}const i=window.getSelection();i.removeAllRanges(),i.addRange(this.savedRange),document.execCommand("createLink",!1,t),this.closeEditorPanel("editor-link-panel"),this._updateToolbarState()}removeLink(){const e=window.getSelection();e.removeAllRanges(),e.addRange(this.savedRange),document.execCommand("unlink",!1,null),this.closeEditorPanel("editor-link-panel"),this._updateToolbarState()}async exportNoteToPDF(e){document.querySelectorAll(".toolbar-dropdown.active").forEach(n=>n.classList.remove("active"));const t=document.getElementById("editor-note-title").value.trim()||"Nota sin título",i=document.getElementById("editor-note-text").innerHTML,o=e!==null?this.db.notes[e]:null;o?(this._tempExportData={title:t,content:o.note||"",current:i},this.openConfirmModal("Exportar PDF","Selecciona qué versión deseas exportar:",()=>{},null,null,`
        <div class="modal-choice-list">
          <button class="modal-choice-btn primary" onclick="window.app.generatePDF(window.app._tempExportData.title, window.app._tempExportData.current); window.app.closeConfirmModal();">
            <i data-lucide="edit-3"></i> Cambios Actuales
          </button>
          <button class="modal-choice-btn" onclick="window.app.generatePDF(window.app._tempExportData.title, window.app._tempExportData.content); window.app.closeConfirmModal();">
            <i data-lucide="save"></i> Versión Guardada
          </button>
        </div>
      `),this.refreshIcons()):this.generatePDF(t,i)}async generatePDF(e,t){try{this.showToast("Generando PDF...");const i=document.querySelector("#verse-card-editor div div div"),o=document.getElementById("verse-text-editor"),n=i?i.innerText:"",r=o?o.innerText.replace(/^"|"$/g,""):"",a=`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body { 
              font-family: 'Inter', 'Helvetica', 'Arial', sans-serif; 
              padding: 50px; 
              color: #1f2937; 
              line-height: 1.7;
              background: #ffffff;
            }
            .header { 
              margin-bottom: 40px; 
              padding-bottom: 20px;
              border-bottom: 1px solid #e5e7eb;
            }
            .title { 
              font-size: 32px; 
              font-weight: 700; 
              margin-bottom: 8px; 
              color: #111827;
              line-height: 1.2;
            }
            .date { 
              font-size: 14px; 
              color: #6b7280; 
              font-weight: 500;
            }
            .verse-card { 
              background: #f8fafc; 
              border-left: 5px solid #6366f1; 
              padding: 24px; 
              margin-bottom: 40px; 
              border-radius: 12px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            }
            .verse-ref { 
              font-weight: 700; 
              color: #6366f1; 
              font-size: 14px; 
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 8px;
            }
            .verse-content { 
              font-style: italic; 
              color: #475569; 
              font-size: 17px;
              line-height: 1.6;
            }
            .content { 
              font-size: 17px; 
              word-wrap: break-word; 
              color: #334155;
            }
            .footer { 
              margin-top: 60px; 
              font-size: 13px; 
              color: #94a3b8; 
              text-align: center; 
              border-top: 1px solid #f1f5f9; 
              padding-top: 25px;
              font-weight: 500;
            }
            /* Estilos para contenido enriquecido */
            h1, h2, h3 { color: #1e1b4b; margin-top: 30px; margin-bottom: 15px; }
            h1 { font-size: 26px; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; }
            h2 { font-size: 22px; }
            h3 { font-size: 20px; }
            blockquote { 
              border-left: 4px solid #6366f1; 
              background: #f5f7ff; 
              padding: 15px 25px; 
              font-style: italic; 
              margin: 25px 0;
              border-radius: 0 12px 12px 0;
              color: #4338ca;
            }
            pre { 
              background: #0f172a; 
              color: #f8fafc; 
              padding: 20px; 
              border-radius: 12px; 
              font-family: 'Courier New', monospace; 
              font-size: 15px;
              overflow-x: auto; 
              white-space: pre-wrap;
              margin: 25px 0;
            }
            hr { border: none; border-top: 2px solid #f1f5f9; margin: 30px 0; }
            a { color: #6366f1; text-decoration: none; font-weight: 600; }
            ul, ol { padding-left: 25px; margin: 20px 0; }
            li { margin-bottom: 8px; }
            .editor-bottom-spacer { display: none; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${e}</div>
            <div class="date">${new Date().toLocaleDateString("es-ES",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
          </div>
          
          <div class="verse-card">
            <div class="verse-ref">${n}</div>
            <div class="verse-content">"${r}"</div>
          </div>
          
          <div class="content">
            ${t}
          </div>
          
          <div class="footer">
            Documento espiritual generado desde BIBLIA CRISTIANA RV1960
          </div>
        </body>
        </html>
      `,{PdfGenerator:l}=await P(async()=>{const{PdfGenerator:g}=await import("./index-CX9seMxZ.js");return{PdfGenerator:g}},[],import.meta.url),c=new Date,h=c.toLocaleDateString("es-ES").replace(/\//g,"_"),d=c.getHours().toString().padStart(2,"0")+"_"+c.getMinutes().toString().padStart(2,"0"),p=`${e.replace(/[^a-z0-9]/gi,"_")}_${h}_${d}.pdf`,f=await l.fromData({data:a,documentSize:"A4",orientation:"portrait",type:"base64",fileName:p}),u=f.data||f.pdf||f.base64;if(u){const g=`temp_${Date.now()}.pdf`;await N.writeFile({path:g,data:u,directory:L.Cache});const v=await N.getUri({path:g,directory:L.Cache});await pe.share({title:"Exportar Nota",text:e,url:v.uri,dialogTitle:"Compartir Nota como PDF"})}else throw new Error("El generador de PDF no devolvió datos válidos")}catch(i){console.error("Error al exportar PDF:",i),this.showToast("Error al generar PDF: "+i.message)}}async saveNoteFromEditor(){const e=document.getElementById("editor-note-title").value.trim();let t=document.getElementById("editor-note-text").innerHTML;(t==="<p><br></p>"||t==="<p></p>")&&(t="");const i=this.currentNoteIndex;if(i!==null)await this.db.updateNote(i,t,e);else if(this.selectedVerse){const{book:o,chapter:n,vNum:r,text:a}=this.selectedVerse;await this.db.addNote(o,n,r,a,t,e||"Nueva Nota"),this.currentNoteIndex=this.db.notes.length-1}}updateToolbarState(){const e=document.getElementById("editor-toolbar-wrap");if(!e)return;["bold","italic","underline","strikethrough","insertUnorderedList","insertOrderedList"].forEach(r=>{e.querySelectorAll(`[data-command="${r}"]`).forEach(l=>{document.queryCommandState(r)?l.classList.add("active"):l.classList.remove("active")})});const i=document.queryCommandValue("formatBlock").toLowerCase();e.querySelectorAll("#toolbar-header-row .tb-btn").forEach(r=>{const l=(r.getAttribute("onclick")||"").match(/formatBlock','([^']+)'/i);if(l){const c=l[1].toLowerCase(),h=c===i||c==="p"&&(i===""||i==="div");r.classList.toggle("active",h)}});const o={blockquote:["blockquote","address"],pre:["pre"]};e.querySelectorAll("#toolbar-more-row .tb-btn").forEach(r=>{const l=(r.getAttribute("onclick")||"").match(/formatBlock','([^']+)'/i);if(l){const c=l[1].toLowerCase(),h=o[c];h&&r.classList.toggle("active",h.includes(i))}});const n=document.getElementById("align-toggle-btn");n&&(document.queryCommandState("justifyCenter")?(n.innerHTML=s("align-center"),this._currentAlignment="center"):document.queryCommandState("justifyRight")?(n.innerHTML=s("align-right"),this._currentAlignment="right"):document.queryCommandState("justifyFull")?(n.innerHTML=s("align-justify"),this._currentAlignment="justify"):(n.innerHTML=s("align-left"),this._currentAlignment="left")),this.refreshIcons()}toggleSubToolbar(e){const t=["note-rich-toolbar","toolbar-secondary-row","toolbar-header-row","toolbar-more-row"],i=document.getElementById("editor-toolbar-wrap"),o=t.find(c=>{const h=document.getElementById(c);return h?window.getComputedStyle(h).display!=="none":!1}),n=e||"note-rich-toolbar";if(o===n)return;const r=document.getElementById(o),a=document.getElementById(n);r?(r.classList.remove("tb-slide-in"),r.classList.add("tb-slide-out"),setTimeout(()=>{r.style.display="none",r.classList.remove("tb-slide-out"),a&&(a.style.display="flex",a.classList.add("tb-slide-in"),e?i?.classList.add("sub-active"):i?.classList.remove("sub-active")),this.updateToolbarState()},150)):a&&(a.style.display="flex",a.classList.add("tb-slide-in"));const l=document.getElementById("editor-note-text");l&&l.focus(),this.refreshIcons()}toggleEditorPanel(e){this.toggleSubToolbar(e)}closeEditorPanel(e){this.toggleSubToolbar(null)}toggleSecondaryToolbar(){const e=document.getElementById("toolbar-secondary-row")?.style.display==="flex";this.toggleSubToolbar(e?null:"toolbar-secondary-row")}editorPanelCmd(e,t=null){this.toggleSubToolbar(null),this.execEditorCommand(e,t)}editorPanelAction(e){this.toggleSubToolbar(null),e==="link"&&this.showLinkDialog()}toggleAlignment(e){e&&e.preventDefault();const t=["left","center","right","justify"];let i="left";document.queryCommandState("justifyCenter")?i="center":document.queryCommandState("justifyRight")?i="right":document.queryCommandState("justifyFull")&&(i="justify");let o=(t.indexOf(i)+1)%t.length;const n=t[o],r=window.getSelection();if(!r.rangeCount)return;let l=r.getRangeAt(0).commonAncestorContainer;l.nodeType===3&&(l=l.parentNode);const c=document.getElementById("editor-note-text");for(;l&&l.parentNode!==c&&l!==c;)l=l.parentNode;if(l===c)for(document.execCommand("formatBlock",!1,"p"),l=window.getSelection().getRangeAt(0).commonAncestorContainer,l.nodeType===3&&(l=l.parentNode);l&&l.parentNode!==c&&l!==c;)l=l.parentNode;if(l&&l!==c)l.style.textAlign=n==="left"?"":n,l.querySelectorAll('div[style*="text-align"]').forEach(d=>{const p=d.parentNode;for(;d.firstChild;)p.insertBefore(d.firstChild,d);p.removeChild(d)});else{const h={left:"justifyLeft",center:"justifyCenter",right:"justifyRight",justify:"justifyFull"};document.execCommand(h[n],!1,null)}this._currentAlignment=n,this.updateToolbarState(),c.focus()}toggleVerseText(){const e=document.getElementById("verse-card-editor"),t=document.getElementById("verse-text-editor"),i=document.getElementById("verse-toggle-btn");!t||!i||(t.classList.toggle("collapsed"),i.classList.toggle("rotated"),t.classList.contains("collapsed")?e.style.opacity="0.9":e.style.opacity="1")}cancelNoteEditor(){this.noteSource==="reader"&&this.selectedVerse?(window.pendingVerseScroll=this.selectedVerse.vNum,this.renderReader(this.selectedVerse.book,this.selectedVerse.chapter)):this.renderNotes(),this.clearSelection()}confirmSaveNoteFromEditor(){const e=document.querySelector("#editor-note-title").value.trim(),t=document.querySelector("#editor-note-text").innerHTML.trim();if(!e||!t||t==="<br>"){this.showToast("Ambos campos son obligatorios");return}this.openConfirmModal("Guardar Nota","¿Deseas guardar los cambios?",()=>{if(this.editingNoteIndex!==void 0)this.db.updateNote(this.editingNoteIndex,t,e);else{const i=this.selectedVerse||{book:"Proverbios",chapter:"2",vNum:"6",text:"Porque Jehová da la sabiduría, y de su boca viene el conocimiento y la inteligencia."};this.db.addNote(i.book,i.chapter,i.vNum,i.text,t,e)}if(this.showToast("Nota guardada con éxito"),this.noteSource==="reader"&&this.selectedVerse){const{book:i,chapter:o,vNum:n}=this.selectedVerse;this.clearSelection(),window.pendingVerseScroll=n,this.renderReader(i,o)}else this.clearSelection(),this.renderNotes()},"Guardar","var(--accent)")}confirmDeleteNote(e){this.openConfirmModal("Eliminar Nota","¿Estás seguro de que quieres eliminar esta nota? Esta acción no se puede deshacer.",()=>{this.db.deleteNote(e),this.renderNotes()})}confirmDeleteFavorite(e){this.openConfirmModal("Eliminar Favorito","¿Estás seguro de que quieres eliminar este versículo de tus favoritos?",()=>{this.db.deleteFavorite(e),this.renderFavorites()})}openConfirmModal(e,t,i,o="Eliminar",n="#ef4444",r=null){const a=document.querySelector("#confirm-modal"),l=document.querySelector("#confirm-title"),c=document.querySelector("#confirm-msg"),h=document.querySelector("#confirm-btn-ok"),d=document.querySelector("#confirm-modal .modal-btn.secondary"),p=document.querySelector("#confirm-extra");document.querySelector("#confirm-modal .modal-actions"),l.innerText=e,c.innerText=t,r&&p?(p.innerHTML=r,p.className="confirm-extra-panel active",p.style.display="block"):p&&(p.style.display="none",p.className="confirm-extra-panel",p.innerHTML=""),o===null?(h&&(h.style.display="none"),d&&(d.innerText="Cerrar")):(h&&(h.innerText=o,h.style.background=n,h.style.display="block"),d&&(d.innerText="Cancelar")),a.classList.add("active"),h&&(h.onclick=()=>{i(),this.closeConfirmModal()})}closeConfirmModal(){const e=document.querySelector("#confirm-modal");e&&e.classList.remove("active")}openEditNote(e){const t=this.db.notes[e];if(!t)return;this.editingNoteIndex=e;const i=document.querySelector("#note-modal"),o=document.querySelector("#note-verse-ref"),n=document.querySelector("#note-title"),r=document.querySelector("#note-text");o.innerText=`${t.book} ${t.chapter}:${t.verse}`,n&&(n.value=t.title||""),r.innerHTML=t.note,i.classList.add("active"),r.focus()}handleCopy(){if(!this.selectedVerse)return;const{book:e,chapter:t,vNum:i,text:o}=this.selectedVerse,n=`${e} ${t}:${i}
${o}`;navigator.clipboard.writeText(n).then(()=>{this.showToast("Texto copiado al portapapeles.")}),this.clearSelection()}handleVerseMenu(){this.selectedVerse&&this.showShareOptions()}async renderSettings(){this.currentView="settings";const e=`
      <header>
        <button class="btn-icon" onclick="window.app.navigate('home')">${s("chevron-left")}</button>
        <h1>Configuración</h1>
      </header>
      <div class="view-container animate-entrance">
        
        <!-- SECCIÓN: LECTURA -->
        <div style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1.25rem; opacity: 0.6; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; color:var(--accent);">Lectura de texto a voz</h3>
          
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div class="premium-card" onclick="window.app.openVoiceModal()" style="padding: 1.25rem; flex-direction: row; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="color: var(--accent);">${s("user")}</div>
                <div style="display: flex; flex-direction: column; text-align:left;">
                  <span style="font-size: 0.9rem; font-weight: 700;">Voz Seleccionada</span>
                  <span style="font-size: 0.8rem; opacity: 0.6;">${this.db.settings.tts_voice_name||"Predeterminada"}</span>
                </div>
              </div>
              <div style="opacity: 0.4;">${s("chevron-right")}</div>
            </div>

            <label class="premium-card" style="padding: 1.25rem; flex-direction: row; justify-content: space-between; align-items: center; cursor: pointer; display: flex !important;">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="color: var(--accent);">${s("hash")}</div>
                <div style="display: flex; flex-direction: column; text-align:left;">
                  <span style="font-size: 0.9rem; font-weight: 700;">Leer números de verso</span>
                  <span style="font-size: 0.8rem; opacity: 0.6;">Menciona "Verso X" en el audio</span>
                </div>
              </div>
              <div class="switch">
                <input type="checkbox" ${this.db.settings.skip_verse_numbers?"":"checked"} onchange="window.app.toggleVerseNumbers(this.checked)">
                <span class="slider round"></span>
              </div>
            </label>
          </div>
        </div>

        <!-- SECCIÓN: APARIENCIA -->
        <div style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1.25rem; opacity: 0.6; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; color:var(--accent);">Apariencia</h3>
          
          <div style="margin-bottom: 1.5rem;">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
              ${[{id:"classic",name:"Clásico",color:"#f4ece1"},{id:"floral",name:"Floral",color:"#fff5f7"},{id:"pastel-blue",name:"Pastel",color:"#ebf5ff"},{id:"forest",name:"Bosque",color:"#388e3c"},{id:"gold",name:"Oro",color:"#d4af37"},{id:"ink",name:"Tinta",color:"#ffffff"}].map(t=>`
                <div class="premium-card" onclick="window.app.applyTheme('${t.id}')" 
                     style="padding: 0.85rem; flex-direction: row; gap: 0.6rem; border: ${this.db.settings.theme_style===t.id?"2px solid var(--accent)":"1px solid var(--glass-border)"}; justify-content:flex-start;">
                  <div class="color-preview" style="background: ${t.color}; width:20px; height:20px; border-radius:6px;"></div>
                  <span style="font-size: 0.8rem; font-weight: 700;">${t.name}</span>
                </div>
              `).join("")}
            </div>
          </div>

          <label class="premium-card" style="padding: 1.25rem; flex-direction: row; justify-content: space-between; align-items: center; cursor: pointer; display: flex !important; margin-bottom:1rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="color: var(--accent);">${s("refresh-cw")}</div>
              <div style="display: flex; flex-direction: column; text-align: left;">
                <span style="font-size: 0.9rem; font-weight: 700;">Sincronizar sistema</span>
                <span style="font-size: 0.8rem; opacity: 0.6;">Sigue el modo de Android</span>
              </div>
            </div>
            <div class="switch">
              <input type="checkbox" ${this.db.settings.system_theme?"checked":""} onchange="window.app.toggleSystemTheme(this.checked)">
              <span class="slider round"></span>
            </div>
          </label>

          ${!this.db.settings.system_theme&&this.db.settings.theme_style!=="ink"?`
          <label class="premium-card" style="padding: 1.25rem; flex-direction: row; justify-content: space-between; align-items: center; cursor: pointer; display: flex !important;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="color: var(--accent);">${s(this.db.settings.theme_mode==="dark"?"moon":"sun")}</div>
              <div style="display: flex; flex-direction: column; text-align: left;">
                <span style="font-size: 0.9rem; font-weight: 700;">Modo Oscuro</span>
                <span style="font-size: 0.8rem; opacity: 0.6;">Alternar claro/oscuro</span>
              </div>
            </div>
            <div class="switch">
              <input type="checkbox" ${this.db.settings.theme_mode==="dark"?"checked":""} onchange="window.app.toggleMode()">
              <span class="slider round"></span>
            </div>
          </label>
          `:""}
        </div>

        <!-- SECCIÓN: ACTUALIZACIONES -->
        <div style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1.25rem; opacity: 0.6; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; color:var(--accent);">Actualizaciones</h3>
          <div class="premium-card" onclick="window.app.checkForUpdates()" style="padding: 1.25rem; flex-direction: row; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="color: var(--accent);">${s("download-cloud")}</div>
                <div style="display: flex; flex-direction: column; text-align:left;">
                  <span style="font-size: 0.9rem; font-weight: 700;">Buscar Actualizaciones</span>
                  <span style="font-size: 0.8rem; opacity: 0.6;">Versión actual: v${this.appVersion}</span>
                </div>
              </div>
              <div style="opacity: 0.4;">${s("chevron-right")}</div>
          </div>
        </div>

        <!-- SECCIÓN: ACERCA DE -->
        <div style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1.25rem; opacity: 0.6; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; color:var(--accent);">Información</h3>
          <div class="premium-card" onclick="window.app.navigate('about')" style="padding: 1.25rem; flex-direction: row; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="color: var(--accent);">${s("info")}</div>
                <div style="display: flex; flex-direction: column; text-align:left;">
                  <span style="font-size: 0.9rem; font-weight: 700;">Acerca de la Aplicación</span>
                  <span style="font-size: 0.8rem; opacity: 0.6;">Créditos, Redes y Soporte</span>
                </div>
              </div>
              <div style="opacity: 0.4;">${s("chevron-right")}</div>
          </div>
        </div>

        <!-- RESPALDO -->
        <div style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1.25rem; opacity: 0.6; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; color:var(--accent);">Respaldo de Datos</h3>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
            <div class="premium-card" onclick="window.app.exportUserData()" style="padding: 1rem; flex-direction: column; gap:0.5rem;">
              <div style="color: var(--accent);">${s("download")}</div>
              <span style="font-size: 0.8rem; font-weight: 700;">Exportar</span>
            </div>
            <div class="premium-card" onclick="window.app.importUserData()" style="padding: 1rem; flex-direction: column; gap:0.5rem;">
              <div style="color: var(--accent);">${s("upload")}</div>
              <span style="font-size: 0.8rem; font-weight: 700;">Importar</span>
            </div>
          </div>
        </div>
      </div>
    `;this.render(e),this.updateFloatingNavState()}toggleSystemTheme(e){this.db.settings.system_theme=e,this.db.saveSettings(),this.applyTheme()}toggleVerseNumbers(e){this.db.settings.skip_verse_numbers=!e,this.db.saveSettings(),this.renderSettings()}async checkForUpdates(e=!1){e||this.showToast("Buscando actualizaciones...");try{const t=await fetch(`https://api.github.com/repos/${this.repo}/releases/latest`);if(!t.ok)throw new Error("Error buscando versión");const i=await t.json(),o=i.tag_name.replace("v",""),n=this.appVersion;if(this.compareVersions(o,n)>0){const r=i.assets.find(a=>a.name.endsWith(".apk"));r?this.confirmUpdate(o,r.browser_download_url,i.body):e||this.showToast("Nueva versión detectada pero sin APK disponible.")}else e||this.showToast("Ya tienes la última versión.")}catch(t){console.error(t),e||this.showToast("Error al buscar actualizaciones.")}}compareVersions(e,t){const i=e.split(".").map(Number),o=t.split(".").map(Number);for(let n=0;n<Math.max(i.length,o.length);n++){const r=i[n]||0,a=o[n]||0;if(r>a)return 1;if(r<a)return-1}return 0}confirmUpdate(e,t,i=""){let o="";if(i){const n=i.replace(/\n/g,"<br>");o=`
        <div style="font-weight: 700; color: var(--accent); margin-bottom: 0.5rem; font-size: 0.8rem; text-transform: uppercase;">Novedades de v${e}:</div>
        <div style="color: var(--text-main); opacity:0.9;">${n}</div>
      `}this.openConfirmModal("Actualización Disponible",`La versión v${e} está lista. ¿Deseas descargarla e instalarla?`,()=>this.downloadAndInstall(t),"Instalar","var(--accent)",o)}async downloadAndInstall(e){this.showToast("Iniciando descarga en segundo plano..."),window.ApkUpdater?window.ApkUpdater.download(e,{onDownloadProgress:t=>{console.log(`Progreso: ${t.progress}%`)}},()=>{this.showToast("Descarga lista. Instalando..."),window.ApkUpdater.install()},t=>{console.error(t),this.showToast("Error: "+(t.message||"Fallo en descarga"))}):(alert("Plugin de actualización no activo. Abriendo navegador..."),window.open(e,"_blank"))}applyVoice(e,t){this.db.settings.tts_voice=e,this.db.settings.tts_voice_name=t,this.db.saveSettings(),this.closeVoiceModal(),this.renderSettings()}toggleFavoriteSelection(e){const t=document.querySelector(`.fav-card[data-index="${e}"]`);if(this.selectedFavoriteIndex===e)this.clearFavoriteSelection();else{this.clearFavoriteSelection(),this.selectedFavoriteIndex=e,t&&t.classList.add("selected");const i=document.querySelector("#fav-selection-bar");if(i){i.style.display="flex";const o=document.getElementById("main-floating-nav");o&&o.classList.add("hidden");const n=this.db.favorites[e],r=i.querySelector('button[onclick*="togglePinFavorite"]');r&&(r.innerHTML=n&&n.pinned?s("pin-off"):s("pin"),this.refreshIcons())}}}clearFavoriteSelection(e=!1){if(this.selectedFavoriteIndex!==null){const i=document.querySelector(`.fav-card[data-index="${this.selectedFavoriteIndex}"]`);i&&i.classList.remove("selected")}this.selectedFavoriteIndex=null;const t=document.querySelector("#fav-selection-bar");if(t&&(t.style.display="none",!e&&this.currentView==="favorites")){const i=document.getElementById("main-floating-nav");i&&i.classList.remove("hidden")}}navigateToSelectedFavorite(){if(this.selectedFavoriteIndex===null)return;const e=this.db.favorites[this.selectedFavoriteIndex];e&&(this.clearFavoriteSelection(!0),window.pendingVerseScroll=e.verse,this.renderReader(e.book,e.chapter))}confirmDeleteFavoriteFromBar(){if(this.selectedFavoriteIndex===null)return;const e=this.selectedFavoriteIndex;this.openConfirmModal("Eliminar Favorito","¿Estás seguro de que quieres eliminar este versículo de tus favoritos?",()=>{this.db.deleteFavorite(e),this.clearFavoriteSelection(),this.renderFavorites()})}toggleFavoritesSort(){this.favoritesSortOrder=this.favoritesSortOrder==="asc"?"desc":"asc",this.renderFavorites()}renderFavorites(){this.currentView="favorites",this.selectedFavoriteIndex=null;let e=this.db.favorites.map((i,o)=>({...i,originalIndex:o}));e.sort((i,o)=>{if(i.pinned!==o.pinned)return o.pinned?1:-1;const n=new Date(i.dateCreated||i.date),r=new Date(o.dateCreated||o.date);return this.favoritesSortOrder==="asc"?n-r:r-n});const t=`
      <header>
        <button class="btn-icon" onclick="window.app.navigate('home')">${s("chevron-left")}</button>
        <h1 style="flex-grow: 1;">Favoritos</h1>
        <button class="btn-icon" onclick="window.app.toggleFavoritesSort()" title="Ordenar">
          ${s(this.favoritesSortOrder==="asc"?"sort-asc":"sort-desc")}
        </button>
      </header>
      <div class="view-container with-selection-bar animate-entrance">
        ${e.length===0?'<p style="text-align: center; opacity: 0.5;">No tienes favoritos aún.</p>':e.map(i=>`
              <div class="premium-card fav-card fav-card-item" 
                   data-index="${i.originalIndex}"
                   style="margin-bottom: 1.25rem; border-left: 4px solid ${i.pinned?"var(--accent)":"var(--glass-border)"}; align-items: flex-start; text-align: left;"
                   onclick="window.app.toggleFavoriteSelection(${i.originalIndex})"
                   ondblclick="window.pendingVerseScroll='${i.verse}'; window.app.renderReader('${i.book}', '${i.chapter}')">
                <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    ${i.pinned?`<div style="color: var(--accent);">${s("pin")}</div>`:""}
                    <div style="color: var(--accent); font-size: 0.95rem; font-weight: 700; cursor: pointer; padding: 0.5rem 0;"
                         onclick="event.stopPropagation(); window.pendingVerseScroll='${i.verse}'; window.app.renderReader('${i.book}', '${i.chapter}')">
                      ${i.book} ${i.chapter}:${i.verse}
                    </div>
                  </div>
                </div>
                <div style="font-size: 1.05rem; line-height: 1.6; opacity: 0.9; text-align: left; width: 100%;">
                  ${i.text}
                </div>
              </div>
          `).join("")}
      </div>
      
      <!-- Specialized selection bar for favorites -->
      <div id="fav-selection-bar" class="floating-toolbar animate-entrance" style="display: none;">
          <button class="tool-btn" onclick="window.app.confirmDeleteFavoriteFromBar()" title="Eliminar Favorito" style="color: #ef4444;">
              ${s("trash-2")}
          </button>
          <button class="tool-btn" onclick="window.app.togglePinFavorite()" title="Fijar/Desfijar">
              ${s("pin")}
          </button>
          <button class="tool-btn" onclick="window.app.navigateToSelectedFavorite()" title="Ir al Versículo" style="color: var(--accent);">
              ${s("external-link")}
          </button>
          <button class="tool-btn" onclick="window.app.clearFavoriteSelection()" title="Cerrar">
              ${s("x")}
          </button>
      </div>
    `;this.render(t),this.refreshIcons()}togglePinFavorite(e){const t=e!==void 0?e:this.selectedFavoriteIndex;t!==null&&(this.db.togglePinFavorite(t),this.clearFavoriteSelection(),this.renderFavorites(),this.showToast("Estado de fijación actualizado"))}handleHighlight(){const e=document.querySelector("#highlight-bar");if(e&&(e.style.display=e.style.display==="flex"?"none":"flex",e.style.display==="flex"&&this.selectedVerse)){const{book:t,chapter:i,vNum:o}=this.selectedVerse,n=this.db.isHighlighted(t,i,o),r=e;if(Array.from(r.children).forEach(a=>a.style.border="1px solid #ccc"),n){const a=n.color;Array.from(r.children).forEach(l=>{l.dataset.color===a&&(l.style.border="3px solid var(--accent)")})}}}applyHighlight(e){if(!this.selectedVerse)return;const{book:t,chapter:i,vNum:o,text:n}=this.selectedVerse;e==="transparent"?this.db.removeHighlight(t,i,o):this.db.addHighlight(t,i,o,n,e);const r=document.getElementById(`v-${o}`);if(r){const a=r.querySelector(".verse-text");a&&(e==="transparent"?(a.style.backgroundColor="transparent",a.style.color="inherit",a.style.padding="0",a.style.borderRadius="0"):(a.style.backgroundColor=e,a.style.color="#333",a.style.padding="2px 4px",a.style.borderRadius="4px",a.style.boxDecorationBreak="clone",a.style.webkitBoxDecorationBreak="clone"))}this.clearSelection()}toggleHighlightsSort(){this.highlightsSortOrder=this.highlightsSortOrder==="asc"?"desc":"asc",this.renderHighlights()}renderHighlights(){this.currentView="highlights";let e=[...this.db.highlights];e.sort((o,n)=>{const r=new Date(o.dateCreated||o.date),a=new Date(n.dateCreated||n.date);return this.highlightsSortOrder==="asc"?r-a:a-r}),this.currentHighlightFilter!=="all"&&(e=e.filter(o=>o.color===this.currentHighlightFilter));const t=["#fef3c7","#dcfce7","#dbeafe","#fae8ff","#fecaca","#fed7aa","#f9fafb"],i=`
      <header>
        <button class="btn-icon" onclick="window.app.navigate('home')">${s("chevron-left")}</button>
        <h1 style="flex-grow: 1;">Marcadores</h1>
        <button class="btn-icon" onclick="window.app.toggleHighlightsSort()" title="Ordenar">
          ${s(this.highlightsSortOrder==="asc"?"sort-asc":"sort-desc")}
        </button>
      </header>
      <div class="view-container with-selection-bar animate-entrance">
        <!-- Barra de filtros -->
        <div id="highlights-color-bar" style="display: flex; gap: 0.5rem; overflow-x: auto; padding: 0 0 1.5rem 0; margin-bottom: 0.5rem; scrollbar-width: none; scroll-behavior: smooth;">
          <button id="color-filter-all" onclick="window.app.applyHighlightFilter('all')" 
                  style="flex-shrink: 0; padding: 0.5rem 1rem; border-radius: 20px; border: 1px solid ${this.currentHighlightFilter==="all"?"var(--accent)":"var(--glass-border)"}; 
                         background: ${this.currentHighlightFilter==="all"?"var(--accent)":"var(--card-bg)"}; 
                         color: ${this.currentHighlightFilter==="all"?"white":"var(--text-main)"}; font-size: 0.85rem; font-weight: 600;">
            Todos
          </button>
          ${t.map((o,n)=>`
            <button id="color-filter-${n}" onclick="window.app.applyHighlightFilter('${o}')" 
                    style="flex-shrink: 0; width: 34px; height: 34px; border-radius: 50%; background: ${o}; 
                           border: ${this.currentHighlightFilter===o?"3px solid var(--accent)":"1px solid #ccc"}; padding: 0;">
            </button>
          `).join("")}
        </div>

        ${e.length===0?`
          <div style="text-align: center; padding: 3rem 1rem; opacity: 0.5;">
            ${s("highlighter")}
            <p style="margin-top: 1rem;">No hay marcadores ${this.currentHighlightFilter==="all"?"":"de este color"}.</p>
          </div>
        `:e.map((o,n)=>{const r=this.db.highlights.findIndex(a=>a===o);return`
            <div class="premium-card highlight-card" data-index="${r}" style="margin-bottom: 1rem; border-left: 8px solid ${o.color};" onclick="window.app.toggleHighlightSelection(${r})">
                <div style="flex: 1;">
                     <div style="color: var(--accent); font-size: 0.9rem; font-weight: 700; margin-bottom: 0.25rem;">
                        ${o.book} ${o.chapter}:${o.verse}
                     </div>
                     <div style="font-size: 1rem; opacity: 0.9;">${o.text}</div>
                </div>
            </div>
          `}).join("")}
      </div>
      <!-- Barra flotante para marcadores -->
      <div id="highlight-selection-bar" class="floating-toolbar animate-entrance" style="display: none;">
          <button class="tool-btn" onclick="window.app.confirmDeleteHighlightFromBar()" title="Eliminar Marcador"
              style="color: #ef4444;">
              ${s("trash-2")}
          </button>
          <button class="tool-btn" onclick="window.app.navigateToSelectedHighlight()" title="Ir al Versículo"
              style="color: var(--accent);">
              ${s("external-link")}
          </button>
          <button class="tool-btn" onclick="window.app.clearHighlightSelection()" title="Cerrar">
              ${s("x")}
          </button>
      </div>
    `;this.render(i),this.refreshIcons(),setTimeout(()=>{let o="color-filter-all";if(this.currentHighlightFilter!=="all"){const a=t.indexOf(this.currentHighlightFilter);a!==-1&&(o=`color-filter-${a}`)}const n=document.getElementById(o),r=document.getElementById("highlights-color-bar");if(n&&r){const a=n.offsetLeft-r.offsetWidth/2+n.offsetWidth/2;r.scrollTo({left:a,behavior:"smooth"})}},50)}applyHighlightFilter(e){this.currentHighlightFilter=e,this.clearHighlightSelection(),this.renderHighlights()}toggleHighlightSelection(e){const t=document.querySelector(`.highlight-card[data-index="${e}"]`);if(this.selectedHighlightIndex===e)this.clearHighlightSelection();else{this.clearHighlightSelection(),this.selectedHighlightIndex=e,t&&t.classList.add("selected");const i=document.querySelector("#highlight-selection-bar");if(i){i.style.display="flex";const o=document.getElementById("main-floating-nav");o&&o.classList.add("hidden")}}}clearHighlightSelection(e=!1){if(this.selectedHighlightIndex!==null){const i=document.querySelector(`.highlight-card[data-index="${this.selectedHighlightIndex}"]`);i&&i.classList.remove("selected")}this.selectedHighlightIndex=null;const t=document.querySelector("#highlight-selection-bar");if(t&&(t.style.display="none",!e&&this.currentView==="highlights")){const i=document.getElementById("main-floating-nav");i&&i.classList.remove("hidden")}}navigateToSelectedHighlight(){if(this.selectedHighlightIndex===null)return;const e=this.db.highlights[this.selectedHighlightIndex];e&&(this.clearHighlightSelection(!0),window.pendingVerseScroll=e.verse,this.renderReader(e.book,e.chapter))}confirmDeleteHighlightFromBar(){if(this.selectedHighlightIndex===null)return;const e=this.selectedHighlightIndex;this.openConfirmModal("Eliminar Marcador","¿Quieres eliminar este marcador?",()=>{this.db.deleteHighlight(e),this.clearHighlightSelection(),this.renderHighlights()})}confirmDeleteHighlight(e){this.openConfirmModal("Eliminar Marcador","¿Quieres eliminar este marcador?",()=>{this.db.deleteHighlight(e),this.renderHighlights()})}toggleNotesSort(){this.notesSortOrder=this.notesSortOrder==="desc"?"asc":"desc",this.renderNotes()}renderNotes(){this.currentView="notes";let e=this.db.notes.map((i,o)=>({...i,originalIndex:o}));e.sort((i,o)=>{if(i.pinned!==o.pinned)return i.pinned?-1:1;const n=new Date(i.dateCreated||i.date),r=new Date(o.dateCreated||o.date);return this.notesSortOrder==="asc"?n-r:r-n});const t=`
      <header>
        <button class="btn-icon" onclick="window.app.navigate('home')">${s("chevron-left")}</button>
        <h1 style="flex-grow: 1;">Mis Notas</h1>
        <div style="display: flex; gap: 0.25rem;">
          <button class="btn-icon search-trigger" onclick="window.app.openNoteSearch()" title="Buscar Notas">
            ${s("search")}
          </button>
          <button class="btn-icon" onclick="window.app.toggleNotesSort()" title="Ordenar">
            ${s(this.notesSortOrder==="asc"?"sort-asc":"sort-desc")}
          </button>
          <button class="btn-icon" onclick="window.app.createNewNote()" title="Nueva Nota" style="color: var(--accent);">
            ${s("plus-circle")}
          </button>
        </div>
      </header>
      <div class="view-container with-main-nav animate-entrance">
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${e.length===0?'<p style="text-align: center; opacity: 0.5; margin-top: 2rem;">No tienes notas guardadas.</p>':""}
          ${e.map(i=>`
            <div class="note-swipe-wrapper" id="swipe-wrapper-${i.originalIndex}">
              <!-- Fondo izquierda: Eliminar -->
              <div class="note-swipe-action-bg note-swipe-delete-bg" id="swipe-delete-bg-${i.originalIndex}" style="left: 0; right: auto; background: #ef4444; justify-content: flex-start; padding-left: 1.2rem;">
                ${s("trash-2")}
              </div>
              <!-- Fondo derecha: Fijar/Desfijar -->
              <div class="note-swipe-action-bg" id="swipe-bg-${i.originalIndex}">
                ${i.pinned?s("pin-off"):s("pin")}
              </div>
              <div class="premium-card note-card" 
                   id="note-card-${i.originalIndex}"
                   onclick="window.app.renderNoteEditor(${i.originalIndex}, 'notes')"
                   ontouchstart="window.app.handleNoteSwipeStart(event, ${i.originalIndex})"
                   ontouchmove="window.app.handleNoteSwipeMove(event, ${i.originalIndex})"
                   ontouchend="window.app.handleNoteSwipeEnd(event, ${i.originalIndex})"
                   style="text-align: left; align-items: center; justify-content: space-between; padding: 1.15rem; flex-direction: row; position: relative; cursor: pointer; gap: 1rem;">
                <div style="display: flex; flex-direction: column; gap: 0.2rem; text-align: left; flex: 1; min-width: 0;">
                  <span style="font-weight: 700; font-size: 1.05rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem; width: 100%;">
                    ${i.pinned?`<span style="color: var(--accent); scale: 0.8; display: flex; flex-shrink: 0;">${s("pin")}</span>`:""}
                    <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">${i.title}</span>
                  </span>
                  <span style="font-size: 0.8rem; opacity: 0.5; font-weight: 600;">${new Date(i.dateCreated||i.date).toLocaleDateString()}</span>
                </div>
                <div style="color: var(--accent); opacity: 0.3; flex-shrink: 0; display: flex;">${s("chevron-right")}</div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;this.render(t),this.refreshIcons(),this.updateFloatingNavState()}stripHtml(e){const t=document.createElement("DIV");return t.innerHTML=e,t.textContent||t.innerText||""}handleNoteClick(e){this.renderNoteDetail(e)}handleNoteSwipeStart(e,t){const i=e.touches[0];this.swipeStartX=i.clientX,this.swipeStartY=i.clientY,this.swipeCurrentIndex=t,this.swipeDirectionLocked=null;const o=document.querySelector(`#note-card-${t}`);o&&o.classList.add("swiping"),this.isSwiping=!0}handleNoteSwipeMove(e,t){if(!this.isSwiping||this.swipeCurrentIndex!==t)return;const i=e.touches[0],o=i.clientX-this.swipeStartX,n=i.clientY-this.swipeStartY;if(!this.swipeDirectionLocked)if(Math.abs(o)>10||Math.abs(n)>10)if(Math.abs(n)>Math.abs(o)){this.swipeDirectionLocked="vertical",this.isSwiping=!1;const c=document.querySelector(`#note-card-${t}`);c&&c.classList.remove("swiping");return}else this.swipeDirectionLocked="horizontal";else return;if(this.swipeDirectionLocked==="vertical")return;const r=document.querySelector(`#note-card-${t}`),a=document.querySelector(`#swipe-bg-${t}`),l=document.querySelector(`#swipe-delete-bg-${t}`);if(o<0){const c=Math.max(o,-120);r&&(r.style.transform=`translateX(${c}px)`),l?.classList.remove("active"),Math.abs(o)>70?(a?.classList.add("active"),window.vibrate&&!this.swipeVibrated&&(window.vibrate(20),this.swipeVibrated=!0)):(a?.classList.remove("active"),this.swipeVibrated=!1)}else{const c=Math.min(o,120);r&&(r.style.transform=`translateX(${c}px)`),a?.classList.remove("active"),Math.abs(o)>70?(l?.classList.add("active"),window.vibrate&&!this.swipeVibrated&&(window.vibrate(20),this.swipeVibrated=!0)):(l?.classList.remove("active"),this.swipeVibrated=!1)}}handleNoteSwipeEnd(e,t){if(!this.isSwiping||this.swipeCurrentIndex!==t)return;this.isSwiping=!1,this.swipeVibrated=!1;const i=document.querySelector(`#note-card-${t}`),o=document.querySelector(`#swipe-bg-${t}`),n=document.querySelector(`#swipe-delete-bg-${t}`);if(!i)return;const r=i.style.transform,a=r?parseInt(r.replace("translateX(","").replace("px)","")):0;if(i.classList.remove("swiping"),i.classList.add("snap-back"),i.style.transform="",o?.classList.remove("active"),n?.classList.remove("active"),a<-70){const l=this.db.togglePinNote(t);window.vibrate&&window.vibrate(40),this.showToast(l?"Nota fijada":"Nota desfijada"),this.renderNotes()}else a>70&&(window.vibrate&&window.vibrate(40),this.confirmDeleteNote(t));setTimeout(()=>{i&&i.classList.remove("snap-back")},400)}clearNoteSelection(){this.selectedNoteIndex=null}confirmDeleteNote(e){this.openConfirmModal("Eliminar Nota","¿Estás seguro de que deseas eliminar esta nota?",()=>{this.db.deleteNote(e),this.renderNotes()})}openNoteSearch(){const e=document.getElementById("note-search-dialog");e&&e.remove();const t=`
      <div id="note-search-dialog" class="modal-overlay active" style="display: flex; z-index: 1000000; align-items: flex-start; padding-top: 5vh;">
        <div class="modal-box animate-entrance" style="padding: 1.25rem; max-width: 92vw; width: 500px; max-height: 80vh; display: flex; flex-direction: column; overflow: hidden; align-items: stretch;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; width: 100%;">
            <h2 class="modal-title" style="margin: 0; font-size: 1.25rem;">Buscar Notas</h2>
            <button class="btn-icon" onclick="window.app.closeNoteSearch()" style="background: var(--accent-soft); border-radius: 50%; width: 32px; height: 32px;">
              ${s("x")}
            </button>
          </div>
          
          <div style="position: relative; margin-bottom: 1rem; width: 100%;">
            <input type="text" id="note-search-input-field" class="search-box" 
                   placeholder="Título, contenido o versículo..." 
                   oninput="window.app.performNoteSearch(this.value)"
                   style="width: 100%; border-radius: 12px; height: 48px; padding-left: 2.75rem; margin-bottom: 0; font-size: 1rem; border: 1px solid var(--glass-border); box-sizing: border-box;">
            <div style="position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); opacity: 0.5; pointer-events: none;">
              ${s("search")}
            </div>
          </div>

          <div id="note-search-dialog-results" class="search-results-list" 
               style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 0.75rem; padding: 0.25rem; min-height: 150px; width: 100%; align-items: stretch; box-sizing: border-box;">
            <div style="text-align: center; padding: 2rem 1rem; opacity: 0.4; width: 100%;">
              ${s("edit-3")}
              <p style="margin-top: 1rem; font-size: 0.85rem;">Busca por título o contenido...</p>
            </div>
          </div>
        </div>
      </div>
    `;document.body.insertAdjacentHTML("beforeend",t),this.refreshIcons(),setTimeout(()=>{const i=document.getElementById("note-search-input-field");i&&i.focus()},150)}closeNoteSearch(){const e=document.getElementById("note-search-dialog");e&&e.remove()}performNoteSearch(e){const t=document.getElementById("note-search-dialog-results");if(!t)return;if(!e.trim()||e.length<2){t.innerHTML=`
        <div style="text-align: center; padding: 3rem 1rem; opacity: 0.4;">
          ${s("edit-3")}
          <p style="margin-top: 1rem; font-size: 0.9rem;">Escribe al menos 2 letras...</p>
        </div>
      `,this.refreshIcons();return}const i=e.toLowerCase(),o=this.db.notes.map((n,r)=>({...n,originalIndex:r})).filter(n=>n.title.toLowerCase().includes(i)||n.note.toLowerCase().includes(i)||n.book.toLowerCase().includes(i)||n.text.toLowerCase().includes(i));if(o.length===0){t.innerHTML=`
        <div style="text-align: center; padding: 3rem 1rem; opacity: 0.5;">
          <p>No encontramos notas con "${e}"</p>
        </div>
      `;return}t.innerHTML=o.map(n=>`
      <div onclick="window.app.closeNoteSearch(); window.app.renderNoteEditor(${n.originalIndex}, 'notes')" 
           style="background: var(--card-bg); border: 1px solid var(--glass-border); border-radius: 16px; padding: 1.15rem; gap: 0.4rem; cursor: pointer; display: flex; flex-direction: column; width: 100%; align-items: stretch; text-align: left; box-sizing: border-box; box-shadow: var(--shadow);">
        <div style="color: var(--accent); font-size: 0.75rem; font-weight: 800; text-transform: uppercase;">
          ${n.book} ${n.chapter}:${n.verse}
        </div>
        <div style="font-weight: 700; font-size: 1.05rem; color: var(--text-main); line-height: 1.3;">
          ${n.title||"Sin título"}
        </div>
        <div style="font-size: 0.9rem; opacity: 0.6; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.4;">
          ${this.stripHtml(n.note)||"Sin contenido adicional"}
        </div>
      </div>
    `).join(""),this.refreshIcons()}renderSearch(e="",t=!1){t||this.addToHistory(this.currentView,{initialQuery:e}),this._isNavigatingBack=t,this.currentView="search";const i=`
      <header>
        <button class="btn-icon" onclick="window.app.navigate('home')">${s("chevron-left")}</button>
        <h1>Buscador</h1>
      </header>
      <div class="view-container with-main-nav animate-entrance">
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;">
          <input type="text" id="search-input" placeholder="¿Qué estás buscando?..." class="search-box" style="flex: 1; margin-bottom: 0;" value="${e}">
          <button class="btn-icon" onclick="window.app.openSearchBookModal()" 
                  style="background: var(--card-bg); border: 1px solid var(--glass-border); border-radius: 14px; width: 50px; height: 50px; flex-shrink: 0; position: relative; display: flex; align-items: center; justify-content: center; color: var(--text-main);">
            ${s("filter")}
            ${this.searchBook?'<div style="position: absolute; top: 8px; right: 8px; background: var(--accent); width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--bg-color);"></div>':""}
          </button>
        </div>
        ${this.searchBook?`
          <div style="margin-top: -1rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; opacity: 0.8;">
            <span style="color: var(--accent); font-weight: 700;">Filtrado por:</span> ${this.searchBook}
            <button onclick="window.app.setSearchFilter('all')" style="background: none; border: none; color: #ef4444; font-size: 0.75rem; text-decoration: underline; padding: 0; cursor: pointer;">Limpiar</button>
          </div>
        `:""}
        <div id="search-results">
        </div>
      </div>

      <!-- Modal de Selección de Libro para Búsqueda -->
      <div id="search-book-modal" class="modal-overlay">
        <div class="modal-box" style="padding: 1.5rem; display: flex; flex-direction: column; max-height: 85vh;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 class="modal-title" style="font-size: 1.2rem; margin-bottom: 0;">Filtrar por Libro</h3>
            <button class="btn-icon" onclick="window.app.closeSearchBookModal()" style="color: var(--text-main); opacity: 0.6;">${s("x")}</button>
          </div>
          <p class="modal-subtitle" style="margin-bottom: 1rem;">Selecciona el libro para filtrar la búsqueda</p>
          
          <div style="display: flex; flex-direction: column; gap: 0.5rem; overflow-y: auto; flex: 1; padding-right: 0.5rem;">
            <!-- Opción para buscar en todo -->
            <div class="premium-card" onclick="window.app.setSearchFilter('all')" 
                 style="padding: 1rem; flex-direction: row; justify-content: center; background: var(--accent-soft); border: 1px dashed var(--accent); min-height: auto; flex-shrink: 0;">
              <span style="font-weight: 700; color: var(--accent);">Buscar en Todo</span>
            </div>

            ${this.db.getBooks().map(n=>`
              <div class="premium-card" onclick="window.app.selectSearchBook('${n.replace(/'/g,"\\'")}')" 
                   style="padding: 1rem; flex-direction: row; justify-content: space-between; min-height: auto; flex-shrink: 0;">
                <span style="font-weight: 600; text-align: left;">${n}</span>
                <div style="color: var(--accent); opacity: 0.5;">${s("chevron-right")}</div>
              </div>
            `).join("")}
          </div>
          <button class="modal-btn secondary" style="width: 100%; margin-top: 1.25rem;" onclick="window.app.closeSearchBookModal()">Cancelar</button>
        </div>
      </div>
    `;this.render(i);const o=document.querySelector("#search-input");o.addEventListener("input",n=>{const r=n.target.value;r.length>2?this.performSearch(r):r.length===0&&(document.querySelector("#search-results").innerHTML="")}),e&&(this.performSearch(e),o.setSelectionRange(e.length,e.length)),o.focus()}setSearchFilter(e){const t=document.querySelector("#search-input")?.value||"";this.searchFilter=e,e==="book"?this.openSearchBookModal():(this.searchBook=null,this.renderSearch(t))}openSearchBookModal(){const e=document.querySelector("#search-book-modal");e&&e.classList.add("active")}closeSearchBookModal(){const e=document.querySelector("#search-book-modal");e&&e.classList.remove("active")}selectSearchBook(e){const t=document.querySelector("#search-input")?.value||"";this.searchBook=e,this.searchFilter="book",this.closeSearchBookModal(),this.renderSearch(t)}performSearch(e){let t=this.db.search(e);this.searchFilter==="book"&&this.searchBook&&(t=t.filter(o=>o.book===this.searchBook));const i=document.querySelector("#search-results");i.innerHTML=`
      <p style="margin-bottom: 1.25rem; opacity: 0.5; font-size: 0.9rem;">${t.length} coincidencias encontradas</p>
      ${t.map(o=>`
        <div class="premium-card" style="margin-bottom: 1rem; align-items: flex-start; text-align: left;" 
             onclick="window.pendingVerseScroll = '${o.vNum}'; window.app.renderReader('${o.book}', '${o.chapter}')">
          <div style="color: var(--accent); font-size: 0.85rem; margin-bottom: 0.4rem; font-weight: 700;">${o.book} ${o.chapter}:${o.vNum}</div>
          <div style="font-size: 1rem; line-height: 1.5;">${o.text}</div>
        </div>
      `).join("")}
    `}renderDictionary(){this.currentView="dict";const e=`
      <header>
        <button class="btn-icon" onclick="window.app.navigate('home')">${s("chevron-left")}</button>
        <h1>Diccionario</h1>
      </header>
      <div class="view-container animate-entrance">
        <div style="position: relative; margin-bottom: 1.5rem;">
          <input type="text" id="dict-input" placeholder="¿Qué término buscas?..." class="search-box" style="margin-bottom: 0;">
          <button id="clear-dict" style="position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--accent); cursor: pointer; display: none;">
            ${s("x-circle")}
          </button>
        </div>
        <div id="dict-results">
            <div style="text-align: center; opacity: 0.5; margin-top: 3rem;">
                ${s("book-a")}
                <p style="margin-top: 1rem;">Busca palabras bíblicas y significados</p>
            </div>
        </div>
      </div>
    `;this.render(e);const t=document.querySelector("#dict-input"),i=document.querySelector("#clear-dict");t.addEventListener("input",o=>{this.performDictSearch(o.target.value),i.style.display=o.target.value?"block":"none"}),i.addEventListener("click",()=>{t.value="",i.style.display="none",this.performDictSearch("")}),this.updateFloatingNavState()}performDictSearch(e){const t=document.querySelector("#dict-results");if(!e){t.innerHTML=`
            <div style="text-align: center; opacity: 0.5; margin-top: 3rem;">
                ${s("book-a")}
                <p style="margin-top: 1rem;">Busca palabras bíblicas y significados</p>
            </div>
        `;return}const i=this.db.searchDictionary(e);t.innerHTML=`
      <p style="margin-bottom: 1rem; opacity: 0.5; font-size: 0.85rem;">${i.length} definiciones encontradas</p>
      ${i.map(o=>`
        <div class="premium-card animate-entrance" style="margin-bottom: 1.25rem; align-items: flex-start; text-align: left; padding: 1.5rem; background: var(--bg-color); border-color: var(--accent-soft);">
          <h3 style="color: var(--accent); margin-bottom: 0.75rem; font-size: 1.2rem; font-family: 'Playfair Display', serif;">${o.term}</h3>
          <p style="font-size: 1rem; line-height: 1.7; color: var(--text-main); font-weight: 400;">${o.definition}</p>
        </div>
      `).join("")}
    `}renderAbout(){this.currentView="about";const e=`
      <header>
        <button class="btn-icon" onclick="window.app.navigate('settings')">${s("chevron-left")}</button>
        <h1>Acerca de</h1>
      </header>
      <div class="view-container animate-entrance" style="text-align: center; display: flex; flex-direction: column; gap: 1.5rem; padding-top: 2rem;">
        <div style="margin: 0 auto; width: 100px; height: 100px; position: relative;">
          <img src="/icon.png" alt="Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); border: 3px solid var(--accent-soft);">
        </div>
        
        <div>
          <h2 style="font-size: 1.8rem; margin-bottom: 0.25rem; color: var(--text-main);">Biblia Cristiana</h2>
          <p style="opacity: 0.5; font-weight: 600; letter-spacing: 1px; font-size: 0.8rem;">REINA VALERA 1960</p>
        </div>

        <div class="premium-card" style="background: var(--accent-soft); border-color: var(--accent); padding: 1.25rem;">
          <p style="font-style: italic; font-size: 1.1rem; line-height: 1.6; font-family: 'Playfair Display', serif;">
            "Lámpara es a mis pies tu palabra, y lumbrera a mi camino."
          </p>
          <p style="margin-top: 0.75rem; color: var(--accent); font-weight: 800; font-size: 0.85rem;">SALMOS 119:105</p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="display: flex; flex-direction: column; gap: 0.75rem; align-items: center;">
            <p style="font-size: 0.95rem; opacity: 0.8;">Desarrollado por <b style="color: var(--text-main);">Life Code Studios</b></p>
            <p style="font-size: 0.85rem; opacity: 0.6; margin-top: -0.5rem;">Developer: <span onclick="window.app.handleAboutClick()" style="cursor: pointer; color: var(--accent); font-weight: 700;">krafairus</span></p>
            
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; margin-top: 0.5rem;">
              <a href="https://www.facebook.com/profile.php?id=61587882503975" target="_blank" class="about-action-btn" style="background: #1877F2; color: white; border: none;">
                ${s("facebook")} Facebook
              </a>
              <a href="https://github.com/krafairus/biblia-cristiana-rv1960-app" target="_blank" class="about-action-btn">
                ${s("github")} GitHub
              </a>
            </div>
          </div>

          <div style="height: 1px; background: var(--glass-border); width: 40%; margin: 0.5rem auto;"></div>

          <div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
            <p style="opacity: 0.6; font-size: 0.85rem;">Dedicada a la congregación:</p>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;" onclick="window.app.handleEditorActivationClick()">
                <img src="/img/logo-congregacion.png" alt="" onerror="this.style.display='none'" style="max-height: 80px; width: auto; border-radius: 12px;">
                <h3 style="color: var(--accent); font-size: 1.2rem;">Sembradores de luz y esperanza</h3>
            </div>
            <a href="https://www.facebook.com/p/Sembradores-de-luz-y-esperanza-100079821227480/" target="_blank" class="about-action-btn" style="background: #1877F2; color: white;">
              ${s("facebook")} Ir a Facebook
            </a>
          </div>
          
          <p style="font-size: 0.95rem; opacity: 0.8; padding: 0.5rem 1.5rem; line-height: 1.6; font-style: italic;">
            Y para todo aquel que busque en las Escrituras el camino hacia la verdad y la vida eterna.
          </p>

          <!-- Donaciones -->
          <div style="margin-top: 2rem; padding: 1.5rem; background: linear-gradient(135deg, rgba(41, 171, 224, 0.1), rgba(255, 94, 94, 0.1)); border-radius: 16px; border: 1px solid var(--glass-border); text-align: center;">
              <h4 style="color: var(--accent); margin-bottom: 0.5rem;">Apoya este proyecto</h4>
              <p style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 1rem;">Tu donación nos ayuda a seguir mejorando y creando más herramientas gratuitas.</p>
              <a href="https://ko-fi.com/lifecodestudios/goal?g=0" target="_blank" class="btn-primary" style="background: #29abe0; color: white; display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; justify-content: center; width: auto; padding: 0.75rem 1.5rem; border-radius: 12px;">
                  ${s("coffee")} Donar en Ko-fi
              </a>
          </div>

          <div style="margin-top: 2rem; padding: 1.5rem; background: var(--card-bg); border-radius: 16px; font-size: 0.85rem; text-align: left; border: 1px solid var(--glass-border);">
            <h4 style="color: var(--accent); margin-bottom: 0.5rem;">Licencia y Garantía</h4>
            <p style="opacity: 0.7; margin-bottom: 0.75rem;">Esta aplicación se distribuye bajo la <b>Licencia Pública General de GNU v3.0 (GPLv3)</b>.</p>
            <p style="opacity: 0.7; margin-bottom: 0.75rem;">Esto garantiza que el software sea siempre libre y de código abierto, incluso en sus versiones derivadas.</p>
            <p style="opacity: 0.6; font-size: 0.8rem; line-height: 1.4;">
                EL SOFTWARE SE PROPORCIONA "TAL CUAL", SIN GARANTÍA DE NINGÚN TIPO. 
                Creado sin fines de lucro para apoyar a la comunidad cristiana y facilitar el acceso a la Palabra de Dios. 
            </p>
          </div>
        </div>

        <p style="font-size: 0.8rem; opacity: 0.3; margin-top: 1rem;">VERSIÓN ${this.appVersion}</p>
      </div>
    `;this.render(e),this.updateFloatingNavState()}handleEditorActivationClick(){this.editorLogoClickCount++,this.editorLogoClickCount>=5&&(this.editorLogoClickCount=0,this.db.settings.editor_mode_enabled=!this.db.settings.editor_mode_enabled,this.db.saveSettings(),this.db.settings.editor_mode_enabled?this.showToast("Se activaron las opciones del editor"):this.showToast("Opciones del editor desactivadas"))}async renderEditorAdmin(){if(this.currentView="editor-admin",this.updateFloatingNavState(),!this.db.settings.editor_warning_shown){if(!await this.showEditorSecurityWarning()){this.navigate("crecimiento");return}this.db.settings.editor_warning_shown=!0,this.db.saveSettings()}const e=`
      <header>
        <button id="editor-header-back" class="btn-icon" onclick="window.app.navigate('crecimiento')">${s("arrow-left")}</button>
        <h1 id="editor-header-title">Panel Editor</h1>
        <div id="editor-header-actions" style="margin-left:auto; display:flex; gap:0.5rem;">
          <button id="editor-btn-logout" class="btn-icon" style="display:none; color: #ef4444;">${s("log-out")}</button>
        </div>
      </header>

      <div class="view-container animate-entrance" style="padding-bottom: 110px;">
        <div id="editor-status-msg" class="status-msg"></div>

        <!-- Capa de Autenticación -->
        <div id="editor-auth-container" style="display: none; padding: 2rem 0;">
          <div class="premium-container" style="text-align: center; flex-direction: column; padding: 2rem; border-radius: 28px; margin: 0 auto; max-width: 450px;">
            <div class="icon-wrapper" style="background:var(--accent-soft); color:var(--accent); width:64px; height:64px; margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: center;">${s("lock")}</div>
            <h2 style="margin-bottom: 0.5rem;">Acceso Restringido</h2>
            <p style="opacity: 0.6; margin-bottom: 2rem; font-size: 0.9rem;">Ingresa tus credenciales de administrador para continuar.</p>
            
            <form id="editor-login-form" style="width: 100%; display: flex; flex-direction: column; gap: 1rem;">
              <div class="form-group" style="text-align: left;">
                <label style="font-size: 0.8rem; font-weight: 700; opacity: 0.6; margin-bottom: 0.5rem; display: block; margin-left: 0.5rem;">EMAIL</label>
                <input type="email" id="editor-login-email" placeholder="admin@ejemplo.com" required 
                       style="width: 100%; padding: 1rem; border-radius: 16px; border: 1px solid var(--glass-border); background: var(--bg-secondary); color: var(--text-main);">
              </div>
              <div class="form-group" style="text-align: left;">
                <label style="font-size: 0.8rem; font-weight: 700; opacity: 0.6; margin-bottom: 0.5rem; display: block; margin-left: 0.5rem;">CONTRASEÑA</label>
                <div style="position: relative; width: 100%;">
                  <input type="password" id="editor-login-password" placeholder="••••••••" required autocomplete="current-password"
                         style="width: 100%; padding: 1rem; padding-right: 3.5rem; border-radius: 16px; border: 1px solid var(--glass-border); background: var(--bg-secondary); color: var(--text-main);">
                  <button type="button" id="toggle-editor-password" class="btn-icon" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); opacity: 0.5;">
                    ${s("eye")}
                  </button>
                </div>
              </div>
              <button type="submit" class="btn-primary" style="margin-top: 1.5rem; padding: 1.1rem; border-radius: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; border: none; background: var(--accent); color: #fff; box-shadow: 0 8px 20px var(--accent-soft); width: 100%; cursor: pointer; transition: all 0.3s ease;">
                Entrar al Panel
              </button>
              <p id="editor-login-error" style="color: #ef4444; margin-top: 1rem; display: none; font-size: 0.85rem; font-weight: 600;"></p>
            </form>
          </div>
        </div>

        <!-- Capa de Aplicación -->
        <div id="editor-app-container" style="display: none;">
          
          <!-- Vista de Listado -->
          <div id="editor-view-list" class="animate-entrance">
            <div class="editor-action-bar">
              <div class="editor-search-wrapper">
                <input type="text" id="editor-search-input" class="editor-search-input" placeholder="Escribe para buscar..." oninput="window.app.handleEditorSearch(this.value)" value="${this.editorSearchQuery||""}">
              </div>
              <button class="editor-header-btn ${this.editorSortOrder==="asc"?"active":""}" onclick="window.app.toggleEditorSort()" title="Ordenar por fecha">
                ${s("arrow-down-up")}
              </button>
              <button class="editor-header-btn" style="background: var(--accent); color: white; border-color: var(--accent);" onclick="window.app.switchEditorSubTab('form')" title="Crear nuevo">
                ${s("plus")}
              </button>
            </div>
            
            <div id="editor-list-container" style="display: flex; flex-direction: column; gap: 0.75rem;">
              <!-- Items inyectados aquí -->
            </div>
          </div>

          <!-- Vista de Formulario -->
          <div id="editor-view-form" style="display: none;" class="animate-entrance">
            <div class="premium-container" style="padding: 1.5rem; flex-direction: column; border-radius: 20px;">
              <form id="editor-entry-form" style="width: 100%; display: flex; flex-direction: column; gap: 1.25rem;">
                <input type="hidden" id="editor-input-tipo" value="${this.editorCurrentTab||"devocional"}">
                <input type="hidden" id="editor-input-id" value="">
                <input type="hidden" id="editor-input-filename" value="">

                <div class="form-group">
                  <label style="font-size: 0.75rem; font-weight: 800; opacity: 0.6; margin-bottom: 0.5rem; display: block; text-transform: uppercase;">TÍTULO</label>
                  <input type="text" id="editor-input-titulo" placeholder="Ej: Dios es Amor" required 
                         style="width: 100%; padding: 0.85rem; border-radius: 12px; border: 1px solid var(--glass-border); background: var(--bg-secondary); color: var(--text-main);">
                </div>

                <div id="editor-group-versiculo" class="form-group" style="display: ${this.editorCurrentTab==="devocional"?"block":"none"};">
                  <label style="font-size: 0.75rem; font-weight: 800; opacity: 0.6; margin-bottom: 0.5rem; display: block; text-transform: uppercase;">REFERENCIA BÍBLICA</label>
                  <textarea id="editor-input-versiculo" rows="2" placeholder="Ej: Mateo 5:1-12" 
                            style="width: 100%; padding: 0.85rem; border-radius: 12px; border: 1px solid var(--glass-border); background: var(--bg-secondary); color: var(--text-main); font-family: inherit; resize: vertical;"></textarea>
                </div>

                <div class="form-group">
                  <label id="editor-label-texto" style="font-size: 0.75rem; font-weight: 800; opacity: 0.6; margin-bottom: 0.5rem; display: block; text-transform: uppercase;">CONTENIDO</label>
                  <div id="editor-quill-container" style="height: 300px; border-radius: 12px;"></div>
                </div>

                <div id="editor-group-oracion" class="form-group" style="display: ${this.editorCurrentTab==="devocional"?"block":"none"};">
                  <label style="font-size: 0.75rem; font-weight: 800; opacity: 0.6; margin-bottom: 0.5rem; display: block; text-transform: uppercase;">ORACIÓN FINAL</label>
                  <textarea id="editor-input-oracion" rows="3" placeholder="Escribe la oración..." 
                            style="width: 100%; padding: 0.85rem; border-radius: 12px; border: 1px solid var(--glass-border); background: var(--bg-secondary); color: var(--text-main); font-family: inherit; resize: none;"></textarea>
                </div>

                <div id="editor-group-autor" class="form-group" style="display: ${this.editorCurrentTab==="devocional"?"block":"none"};">
                  <label style="font-size: 0.75rem; font-weight: 800; opacity: 0.6; margin-bottom: 0.5rem; display: block; text-transform: uppercase;">AUTOR</label>
                  <input type="text" id="editor-input-autor" placeholder="Nombre del autor" 
                         style="width: 100%; padding: 0.85rem; border-radius: 12px; border: 1px solid var(--glass-border); background: var(--bg-secondary); color: var(--text-main);">
                </div>
                <button type="submit" style="display:none;"></button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Nav (Fuera de view-container para estar siempre fija) -->
      <nav id="editor-bottom-nav" class="editor-floating-nav" style="display: none;">
        <button onclick="window.app.switchEditorMainTab('devocional')" class="editor-nav-item ${this.editorCurrentTab==="devocional"?"active":""}" id="editor-nav-devocional">
          ${s("book-open")}
          <span class="editor-nav-label">Devocional</span>
        </button>
        <button onclick="window.app.switchEditorMainTab('pregunta')" class="editor-nav-item ${this.editorCurrentTab==="pregunta"?"active":""}" id="editor-nav-pregunta">
          ${s("help-circle")}
          <span class="editor-nav-label">Preguntas</span>
        </button>
      </nav>

        <!-- Modales -->
        <div id="editor-config-modal" class="modal-overlay" style="display: none; align-items: center; justify-content: center;">
          <form id="editor-config-form" class="premium-container" style="width: 90%; max-width: 400px; flex-direction: column; padding: 2rem; border-radius: 28px;">
            <h3 style="color: var(--accent); margin-bottom: 1rem;">Configuración GitHub</h3>
            <p style="font-size: 0.85rem; opacity: 0.7; margin-bottom: 1.5rem;">Configura el acceso al repositorio de datos para poder publicar.</p>
            <div style="display: flex; flex-direction: column; gap: 1rem; width: 100%;">
              <input type="password" id="editor-input-gh-token" placeholder="GitHub PAT (token)" autocomplete="new-password"
                     style="width: 100%; padding: 0.85rem 1rem; border-radius: 12px; border: 1px solid var(--glass-border); background: var(--bg-secondary); color: var(--text-main);">
              <input type="text" id="editor-input-gh-repo" placeholder="usuario/repo" 
                     style="width: 100%; padding: 0.85rem 1rem; border-radius: 12px; border: 1px solid var(--glass-border); background: var(--bg-secondary); color: var(--text-main);">
              <button type="submit" id="editor-btn-save-config" class="btn-primary" style="margin-top: 1rem; padding: 1rem; border-radius: 14px; font-weight: 800; text-transform: uppercase;">Guardar Configuración</button>
            </div>
          </form>
        </div>

        <div id="editor-url-modal" class="modal-overlay" style="display: none; align-items: center; justify-content: center; z-index: 1100;">
          <div class="premium-card" style="width: 85%; max-width: 350px; flex-direction: column; padding: 1.5rem; border-radius: 24px;">
            <h3 style="color: var(--accent); margin-bottom: 1rem;">Insertar Enlace</h3>
            <div style="width: 100%; display: flex; flex-direction: column; gap: 1rem;">
              <input type="url" id="editor-input-link-url" placeholder="https://ejemplo.com" required 
                     style="width: 100%; padding: 0.85rem; border-radius: 12px; border: 1px solid var(--glass-border); background: var(--bg-secondary); color: var(--text-main);">
              <div style="display: flex; gap: 0.75rem;">
                <button onclick="window.app.closeEditorUrlModal()" class="btn-primary secondary" style="flex: 1; padding: 0.85rem; border-radius: 14px; font-weight: 700; background: var(--bg-secondary); border: 1px solid var(--glass-border); color: var(--text-main);">Cancelar</button>
                <button onclick="window.app.confirmEditorLinkInsertion()" class="btn-primary" style="flex: 1; padding: 0.85rem; border-radius: 14px; font-weight: 800;">Insertar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;this.render(e),await this.initEditorPanel()}showEditorSecurityWarning(){return new Promise(e=>{const t=document.createElement("div");t.className="modal-overlay active",t.setAttribute("style","display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 1.5rem;"),t.innerHTML=`
        <div class="animate-entrance" style="width: 100%; max-width: 400px; background: var(--bg-color); border: 1px solid var(--glass-border); flex-direction: column; padding: 2rem 1.5rem; border-radius: 28px; text-align: center; box-shadow: var(--shadow); position: relative; overflow: hidden; display: flex;">
          <div class="icon-wrapper" style="background: #fef2f2; color: #ef4444; width: 60px; height: 60px; margin: 0 auto 1.25rem; border-radius: 18px; display: flex; align-items: center; justify-content: center;">${s("shield-alert")}</div>
          <h2 style="font-size: 1.35rem; margin-bottom: 0.75rem; color: var(--text-main); font-family: 'Playfair Display', serif;">Aviso de Seguridad</h2>
          <p style="opacity: 0.8; line-height: 1.5; margin-bottom: 1.5rem; font-size: 0.95rem;">
            Este apartado es exclusivo para editores autorizados. Requiere credenciales de acceso especiales.
            <br><br>
            <b>¿Tienes las credenciales necesarias?</b> Si no las tienes, el acceso no tendrá sentido.
          </p>
          <div style="display: flex; flex-direction: column; gap: 0.75rem; width: 100%;">
            <button id="warning-btn-yes" class="btn-primary" style="padding: 1rem; border-radius: 14px; font-weight: 700;">Tengo credenciales, continuar</button>
            <button id="warning-btn-no" class="btn-primary secondary" style="padding: 1rem; border-radius: 14px; font-weight: 700; background: var(--bg-secondary); border: 1px solid var(--glass-border); color: var(--text-main);">Volver atrás</button>
          </div>
        </div>
      `,document.body.appendChild(t),this.refreshIcons();const i=t.querySelector("#warning-btn-yes"),o=t.querySelector("#warning-btn-no");i.onclick=n=>{n.stopPropagation(),t.remove(),e(!0)},o.onclick=n=>{n.stopPropagation(),t.remove(),e(!1)}})}async initEditorPanel(){await this.loadEditorLibraries();const e={apiKey:"AIzaSyBc8KBYmk7bt9s-9IpAbpZ2I3OdD_oYJWs",authDomain:"dataconnect-kohl.firebaseapp.com",projectId:"dataconnect-kohl",storageBucket:"dataconnect-kohl.firebasestorage.app",messagingSenderId:"933989214288",appId:"1:933989214288:web:e062be2463e238a3028955",measurementId:"G-SM4YCPEGKZ"};window.firebase_admin_initialized?(this.editorAuth=firebase.auth(),this.editorDb=firebase.firestore()):(firebase.apps.length||firebase.initializeApp(e),this.editorAuth=firebase.auth(),this.editorDb=firebase.firestore(),window.firebase_admin_initialized=!0);const t=Quill.import("ui/icons");t.undo=s("undo-2"),t.redo=s("redo-2"),this.editorQuill=new Quill("#editor-quill-container",{theme:"snow",placeholder:"Escribe el contenido aquí...",modules:{toolbar:{container:[[{header:[1,2,3,!1]},"bold","italic","underline","blockquote",{list:"ordered"},{list:"bullet"},"clean","undo","redo"]],handlers:{undo:()=>{this.editorQuill.history.undo()},redo:()=>{this.editorQuill.history.redo()},blockquote:function(i){this.quill.format("blockquote",i)}}},history:{delay:1e3,maxStack:100,userOnly:!0},keyboard:{bindings:{"blockquote-backspace":{key:"Backspace",format:["blockquote"],handler:function(i,o){return o.offset===0&&this.quill.getText(i.index,i.length).length===0?(this.quill.format("blockquote",!1),!1):!0}}}}}}),setTimeout(()=>this.refreshIcons(),100),this.githubConfig={token:null,repo:null},this.setupEditorEvents(),this.editorAuth.onAuthStateChanged(async i=>{const o=document.getElementById("editor-auth-container"),n=document.getElementById("editor-app-container"),r=document.getElementById("editor-btn-logout");if(i){o&&(o.style.display="none"),n&&(n.style.display="block"),r&&(r.style.display="flex");const a=document.getElementById("editor-bottom-nav");a&&(a.style.display="flex"),await this.loadEditorGHConfig(),this.switchEditorMainTab(this.editorCurrentTab||"devocional")}else{o&&(o.style.display="block"),n&&(n.style.display="none"),r&&(r.style.display="none");const a=document.getElementById("editor-bottom-nav");a&&(a.style.display="none"),document.getElementById("editor-config-modal").style.display="none"}})}async loadEditorLibraries(){const e=["https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js","https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js","https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js","https://cdn.quilljs.com/1.3.6/quill.min.js"],t=["https://cdn.quilljs.com/1.3.6/quill.snow.css"];for(const o of t)if(!document.querySelector(`link[href="${o}"]`)){const n=document.createElement("link");n.rel="stylesheet",n.href=o,document.head.appendChild(n)}const i=o=>new Promise(n=>{if(document.querySelector(`script[src="${o}"]`))return n();const r=document.createElement("script");r.src=o,r.onload=n,document.head.appendChild(r)});for(const o of e)await i(o)}setupEditorEvents(){const e=document.getElementById("editor-login-form");if(e){e.onsubmit=r=>{r.preventDefault();const a=document.getElementById("editor-login-email").value,l=document.getElementById("editor-login-password").value;this.editorAuth.signInWithEmailAndPassword(a,l).catch(c=>{const h=document.getElementById("editor-login-error");h.textContent="Error: "+c.message,h.style.display="block"})};const n=document.getElementById("toggle-editor-password");n&&(n.onclick=()=>{const r=document.getElementById("editor-login-password"),a=r.type==="password"?"text":"password";r.type=a,n.innerHTML=s(a==="password"?"eye":"eye-off"),this.refreshIcons()})}const t=document.getElementById("editor-btn-logout");t&&(t.onclick=()=>this.editorAuth.signOut());const i=document.getElementById("editor-entry-form");i&&(i.onsubmit=n=>this.handleEditorEntrySubmit(n));const o=document.getElementById("editor-config-form");o&&(o.onsubmit=n=>{n.preventDefault(),this.saveEditorGHConfig()})}closeEditorUrlModal(){document.getElementById("editor-url-modal").style.display="none",document.getElementById("editor-url-modal").classList.remove("active")}confirmEditorLinkInsertion(){const e=document.getElementById("editor-input-link-url").value.trim();e&&this.editorLastRange&&(this.editorQuill.formatText(this.editorLastRange.index,this.editorLastRange.length,"link",e),this.closeEditorUrlModal())}async loadEditorGHConfig(){try{const e=await this.editorDb.collection("config").doc("github").get();if(e.exists){const t=e.data();this.githubConfig.token=t.pat||t.token,this.githubConfig.repo=t.repo}else document.getElementById("editor-config-modal").style.display="flex"}catch(e){this.showEditorStatus("Error cargando config GH: "+e.message,"error")}}async saveEditorGHConfig(){const e=document.getElementById("editor-input-gh-token").value.trim(),t=document.getElementById("editor-input-gh-repo").value.trim();if(!e||!t)return alert("Completa ambos campos");try{await this.editorDb.collection("config").doc("github").set({pat:e,repo:t}),this.githubConfig.token=e,this.githubConfig.repo=t,document.getElementById("editor-config-modal").style.display="none",this.showEditorStatus("Configuración guardada","success")}catch(i){alert("Error: "+i.message)}}switchEditorMainTab(e){this.editorCurrentTab=e,document.querySelectorAll(".editor-nav-item").forEach(n=>{n.classList.toggle("active",n.id===`editor-nav-${e}`)});const t=e==="devocional";document.getElementById("editor-input-tipo").value=e,document.getElementById("editor-group-versiculo").style.display=t?"block":"none",document.getElementById("editor-group-oracion").style.display=t?"block":"none",document.getElementById("editor-group-autor").style.display=t?"block":"none";const i=document.getElementById("editor-label-texto");i&&(i.innerText=t?"CONTENIDO DEL DEVOCIONAL":"RESPUESTA BÍBLICA");const o=document.getElementById("editor-header-title");o&&(o.innerText="Panel Editor"),this.resetEditorForm(),this.switchEditorSubTab("list")}switchEditorSubTab(e){const t=document.getElementById("editor-view-list"),i=document.getElementById("editor-view-form"),o=document.getElementById("editor-header-actions"),n=document.getElementById("editor-header-back"),r=document.getElementById("editor-bottom-nav");e==="list"?(t&&(t.style.display="block"),i&&(i.style.display="none"),r&&(r.style.display="flex"),n&&(n.onclick=()=>window.app.navigate("crecimiento")),o&&(o.innerHTML=`
          <button id="editor-btn-logout" class="btn-icon" style="color: #ef4444;" onclick="window.app.editorAuth.signOut()">${s("log-out")}</button>
        `),this.loadEditorEntryList()):(t&&(t.style.display="none"),i&&(i.style.display="block"),r&&(r.style.display="none"),n&&(n.onclick=()=>window.app.confirmEditorCancel()),o&&(o.innerHTML=`
          <div class="toolbar-dropdown">
            <button class="btn-icon dropdown-trigger" onclick="event.stopPropagation(); this.parentElement.classList.toggle('active')" title="Acciones">
              ${s("more-vertical")}
            </button>
            <div class="dropdown-content right" style="min-width:180px;">
              <button onclick="window.app.confirmEditorPublish()" style="display:flex;align-items:center;gap:0.5rem;width:100%;padding:0.75rem 1rem;text-align:left;background:none;border:none;color:var(--accent);font-size:0.95rem;font-weight:700;">
                ${s("check")} Publicar Ahora
              </button>
              <button onclick="window.app.confirmEditorCancel()" style="display:flex;align-items:center;gap:0.5rem;width:100%;padding:0.75rem 1rem;text-align:left;background:none;border:none;color:#ef4444;font-size:0.95rem;font-weight:600;">
                ${s("x")} Cancelar Cambios
              </button>
            </div>
          </div>
        `)),this.refreshIcons()}async confirmEditorPublish(){if(!document.getElementById("editor-input-titulo").value.trim())return this.showToast("El título es obligatorio","error");this.showConfirmDialog({title:"Publicar Contenido",text:"¿Estás seguro de que deseas publicar este contenido en el repositorio?",icon:"upload-cloud",confirmText:"Sí, publicar",onConfirm:()=>{const t=document.getElementById("editor-entry-form");if(t){const i=new Event("submit",{cancelable:!0});t.dispatchEvent(i)}}})}confirmEditorCancel(){this.showConfirmDialog({title:"Cancelar Cambios",text:"¿Deseas salir del editor? Se perderán los cambios que no hayas publicado.",icon:"alert-circle",confirmText:"Sí, salir",confirmClass:"danger",onConfirm:()=>{this.resetEditorForm(),this.switchEditorSubTab("list")}})}showConfirmDialog({title:e,text:t,icon:i="help-circle",confirmText:o="Aceptar",confirmClass:n="",onConfirm:r}){const a=document.createElement("div");a.className="modal-overlay active",a.style.zIndex="3500",a.innerHTML=`
      <div class="animate-entrance" style="width: 90%; max-width: 380px; background: var(--bg-color); border: 1px solid var(--glass-border); flex-direction: column; padding: 2.25rem 1.75rem; border-radius: 28px; text-align: center; box-shadow: var(--shadow-lg); display: flex; position: relative; overflow: hidden;">
        <div class="icon-wrapper" style="background: var(--accent-soft); color: var(--accent); width: 64px; height: 64px; margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: center; border-radius: 20px;">${s(i)}</div>
        <h2 style="font-size: 1.35rem; margin-bottom: 0.75rem; color: var(--text-main); font-family: 'Playfair Display', serif;">${e}</h2>
        <p style="opacity: 0.8; font-size: 0.95rem; line-height: 1.6; margin-bottom: 2rem; color: var(--text-main);">${t}</p>
        <div style="display: flex; gap: 0.85rem; width: 100%;">
          <button id="confirm-modal-cancel" class="btn-primary secondary" style="flex: 1; padding: 1rem; border-radius: 16px; font-weight: 700; background: var(--bg-secondary); border: 1px solid var(--glass-border); color: var(--text-main);">Volver</button>
          <button id="confirm-modal-ok" class="btn-primary ${n}" style="flex: 1; padding: 1rem; border-radius: 16px; font-weight: 800; ${n==="danger"?"background:#ef4444; color:white; border:none;":""}">${o}</button>
        </div>
      </div>
    `,document.body.appendChild(a),this.refreshIcons(),a.querySelector("#confirm-modal-cancel").onclick=l=>{l.stopPropagation(),a.remove()},a.querySelector("#confirm-modal-ok").onclick=l=>{l.stopPropagation(),a.remove(),r&&r()},a.firstElementChild.onclick=l=>l.stopPropagation()}handleEditorSearch(e){this.editorSearchQuery=e.toLowerCase(),this.loadEditorEntryList()}toggleEditorSort(){this.editorSortOrder=this.editorSortOrder==="asc"?"desc":"asc";const e=document.querySelector('.editor-header-btn[onclick*="toggleEditorSort"]');e&&e.classList.toggle("active",this.editorSortOrder==="asc"),this.loadEditorEntryList()}async loadEditorEntryList(){if(!this.githubConfig.repo||!this.githubConfig.token)return;const e=document.getElementById("editor-list-container"),i=document.getElementById("editor-input-tipo").value==="devocional"?"devocional-index.json":"preguntas-index.json";e.innerHTML='<div style="text-align: center; padding: 2rem;"><div class="spinner"></div></div>';try{const o=`https://api.github.com/repos/${this.githubConfig.repo}/contents/biblia-cristiana-rv1960-app/${i}?ts=${Date.now()}`,n=await fetch(o,{headers:{Authorization:`token ${this.githubConfig.token}`}});if(n.status===404){e.innerHTML='<p style="text-align: center; opacity: 0.5; padding: 2rem;">No hay registros aún.</p>';return}const r=await n.json(),a=decodeURIComponent(escape(atob(r.content)));let l=JSON.parse(a);if(this.editorSearchQuery&&(l=l.filter(c=>c.titulo.toLowerCase().includes(this.editorSearchQuery))),this.editorSortOrder==="asc"?l.sort((c,h)=>c.id-h.id):l.sort((c,h)=>h.id-c.id),l.length===0){e.innerHTML='<p style="text-align: center; opacity: 0.5; padding: 2rem;">No se encontraron resultados.</p>';return}e.innerHTML=l.map(c=>`
        <div class="editor-entry-item animate-entrance">
          <div class="entry-info">
            <span class="entry-title">${c.titulo}</span>
            <div class="entry-meta">
              ${s("calendar",12)}
              <span>${c.fecha}</span>
            </div>
          </div>
          <div class="entry-actions">
            <button class="action-btn edit" onclick='event.stopPropagation(); window.app.prepareEditorEdit(${JSON.stringify(c).replace(/'/g,"&quot;")})'>
              ${s("edit-2",18)}
            </button>
            <button class="action-btn delete" onclick="event.stopPropagation(); window.app.deleteEditorEntry('${c.file}', ${c.id}, '${i}')">
              ${s("trash-2",18)}
            </button>
          </div>
        </div>
      `).join(""),this.refreshIcons()}catch(o){e.innerHTML=`<p style="color:#ef4444; padding: 2rem; text-align: center;">Error: ${o.message}</p>`}}async prepareEditorEdit(e){this.switchEditorSubTab("form"),this.showEditorStatus("Cargando datos...","normal"),document.getElementById("editor-input-id").value=e.id,document.getElementById("editor-input-filename").value=e.file;const t=document.getElementById("editor-input-tipo").value;try{const i=`https://api.github.com/repos/${this.githubConfig.repo}/contents/${e.file}?ts=${Date.now()}`,n=await(await fetch(i,{headers:{Authorization:`token ${this.githubConfig.token}`}})).json(),r=JSON.parse(decodeURIComponent(escape(atob(n.content))));this.editorOriginalDate=r.fecha_hora||r.fecha,document.getElementById("editor-input-titulo").value=r.titulo||"",this.editorQuill.root.innerHTML=r.devocional||r.respuesta||r.contenido||"",t==="devocional"&&(document.getElementById("editor-input-versiculo")&&(document.getElementById("editor-input-versiculo").value=r.versiculo||""),document.getElementById("editor-input-oracion")&&(document.getElementById("editor-input-oracion").value=r.oracion||""),document.getElementById("editor-input-autor")&&(document.getElementById("editor-input-autor").value=r.autor||"")),this.showEditorStatus("","normal")}catch(i){this.showEditorStatus("Error: "+i.message,"error")}}async handleEditorEntrySubmit(e){if(e.preventDefault(),!this.githubConfig.token||!this.githubConfig.repo)return alert("Configura GitHub.");this.showEditorStatus("Procesando...","normal");const t=document.querySelector('button[onclick*="confirmEditorPublish"]');t&&(t.disabled=!0);const i=document.getElementById("editor-input-tipo").value,o=document.getElementById("editor-input-id").value,n=document.getElementById("editor-input-filename").value,r=document.getElementById("editor-input-titulo").value.trim();try{const a=o&&this.editorOriginalDate?this.editorOriginalDate:new Date().toLocaleDateString("es-ES",{weekday:"long",year:"numeric",month:"long",day:"numeric"});let l={titulo:r,fecha_hora:a},c=i==="devocional"?"devocionales":"preguntas";const h=i==="devocional"?"devocional-index.json":"preguntas-index.json";i==="devocional"?(l.versiculo=document.getElementById("editor-input-versiculo").value.trim(),l.devocional=this.editorQuill.root.innerHTML,l.oracion=document.getElementById("editor-input-oracion").value.trim(),l.autor=document.getElementById("editor-input-autor").value.trim()):l.respuesta=this.editorQuill.root.innerHTML;const d=JSON.stringify(l,null,2);let p=n;if(!o){const f=new Date().toISOString().split("T")[0];p=`biblia-cristiana-rv1960-app/${c}/${i}-${f}-${Date.now()}.json`}await this.uploadToGithubAdmin(p,d,`Publicación ${i}: ${r}`,!!o),i==="devocional"&&await this.uploadToGithubAdmin("biblia-cristiana-rv1960-app/devocional-last.json",d,`Last devocional: ${r}`,!0),await this.updateEditorIndexAdmin(r,a,p,o,h),this.showEditorStatus("¡Publicado con éxito!","success"),this.resetEditorForm(),setTimeout(()=>this.switchEditorSubTab("list"),1500)}catch(a){this.showEditorStatus("Error: "+a.message,"error")}finally{const a=document.querySelector('button[onclick*="confirmEditorPublish"]');a&&(a.disabled=!1)}}async uploadToGithubAdmin(e,t,i,o){const n=`https://api.github.com/repos/${this.githubConfig.repo}/contents/${e}`;let r=null;if(o){const c=await fetch(n,{headers:{Authorization:`token ${this.githubConfig.token}`}});c.ok&&(r=(await c.json()).sha)}const a={message:i,content:btoa(unescape(encodeURIComponent(t))),branch:"main"};r&&(a.sha=r);const l=await fetch(n,{method:"PUT",headers:{Authorization:`token ${this.githubConfig.token}`,"Content-Type":"application/json"},body:JSON.stringify(a)});if(!l.ok)throw new Error(`GH Error: ${l.status}`)}async updateEditorIndexAdmin(e,t,i,o,n){const r=`biblia-cristiana-rv1960-app/${n}`,a=`https://api.github.com/repos/${this.githubConfig.repo}/contents/${r}`;let l=[],c=null;try{const d=await fetch(a,{headers:{Authorization:`token ${this.githubConfig.token}`}});if(d.ok){const p=await d.json();c=p.sha,l=JSON.parse(decodeURIComponent(escape(atob(p.content))))}}catch{}const h={titulo:e,fecha:t,file:i,id:o?parseInt(o):Date.now()};if(o){const d=l.findIndex(p=>p.id==o);d>=0?l[d]=h:l.push(h)}else l.push(h);await this.uploadToGithubAdmin(r,JSON.stringify(l,null,2),"Update index",!0)}async deleteEditorEntry(e,t,i){this.showConfirmDialog({title:"Eliminar Contenido",text:"¿Deseas eliminar este registro permanentemente? No se puede deshacer.",icon:"trash-2",confirmText:"Sí, eliminar",confirmClass:"danger",onConfirm:async()=>{this.showEditorStatus("Eliminando...","normal");try{const o=`https://api.github.com/repos/${this.githubConfig.repo}/contents/${e}`,n=await fetch(o,{headers:{Authorization:`token ${this.githubConfig.token}`}});if(n.ok){const l=await n.json();await fetch(o,{method:"DELETE",headers:{Authorization:`token ${this.githubConfig.token}`,"Content-Type":"application/json"},body:JSON.stringify({message:"Delete entry",sha:l.sha,branch:"main"})})}const r=`https://api.github.com/repos/${this.githubConfig.repo}/contents/biblia-cristiana-rv1960-app/${i}`,a=await fetch(r,{headers:{Authorization:`token ${this.githubConfig.token}`}});if(a.ok){const l=await a.json();let c=JSON.parse(decodeURIComponent(escape(atob(l.content))));if(c=c.filter(h=>h.id!=t),await this.uploadToGithubAdmin(`biblia-cristiana-rv1960-app/${i}`,JSON.stringify(c,null,2),"Remove from index",!0),i==="devocional-index.json"&&c.length>0){const h=c[0],d=`https://api.github.com/repos/${this.githubConfig.repo}/contents/${h.file}?ts=${Date.now()}`,p=await fetch(d,{headers:{Authorization:`token ${this.githubConfig.token}`}});if(p.ok){const f=await p.json(),u=atob(f.content);await this.uploadToGithubAdmin("biblia-cristiana-rv1960-app/devocional-last.json",decodeURIComponent(escape(u)),"Sync devocional-last after delete",!0)}}}this.showEditorStatus("Eliminado con éxito","success"),this.loadEditorEntryList()}catch(o){this.showToast("Error al eliminar: "+o.message,"error")}}})}resetEditorForm(){const e=document.getElementById("editor-entry-form");e&&e.reset(),this.editorQuill&&(this.editorQuill.root.innerHTML=""),document.getElementById("editor-input-id").value="",document.getElementById("editor-input-filename").value="",this.editorOriginalDate=null}showEditorStatus(e,t){const i=document.getElementById("editor-status-msg");if(i){if(!e){i.style.display="none",i.textContent="";return}i.textContent=e,i.className="status-msg status-"+t+" active",i.style.display="block",t!=="normal"&&setTimeout(()=>{i&&(i.style.display="none")},4e3)}}async renderVerseOfDay(){this.currentView="vod";const e=`
      <header>
        <button class="btn-icon" onclick="window.app.navigate('home')">${s("chevron-left")}</button>
        <h1 style="flex-grow: 1;">Versículo del Día</h1>
        <button class="btn-icon" onclick="window.app.navigateToCurrentVod()" title="Ir a la ubicación del versículo" style="color: var(--accent);">
          ${s("map-pin")}
        </button>
      </header>
      <div class="view-container animate-entrance" style="display: flex; flex-direction: column; gap: 1.5rem; align-items: center;">
        <div id="vod-card" class="premium-card" style="width: 100%; min-height: 300px; justify-content: center; background-size: cover; background-position: center; color: white; text-shadow: 0 2px 10px rgba(0,0,0,0.5); padding: 2.5rem; position: relative; border: none;">
            <div style="position: absolute; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.3); z-index: 1; border-radius: var(--radius);"></div>
            <div id="vod-content" style="z-index: 2; position: relative;">
                <p style="font-size: 1.25rem; font-style: italic; line-height: 1.6; margin-bottom: 1.5rem; font-family: 'Playfair Display', serif;">Cargando versículo...</p>
                <div style="font-weight: 700; color: var(--accent); font-size: 0.9rem;">REINA VALERA 1960</div>
            </div>
        </div>

        <div style="width: 100%;">
          <p style="font-size: 0.8rem; opacity: 0.6; margin-bottom: 0.75rem; font-weight: 600; text-transform: uppercase;">Seleccionar Fondo</p>
          <div id="bg-selector" style="display: flex; overflow-x: auto; gap: 0.75rem; padding-bottom: 0.5rem; scrollbar-width: none;">
            ${[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(t=>`
              <div class="bg-thumb" onclick="window.app.changeVodBg(${t})" 
                   style="min-width: 60px; height: 60px; border-radius: 12px; background-image: url('/img/bg-verse-${t}.png'); background-size: cover; border: 2px solid var(--glass-border); flex-shrink: 0;">
              </div>
            `).join("")}
            <div class="bg-thumb premium-card" onclick="window.app.openCustomBgDisclaimer()" 
                 style="min-width: 60px; height: 60px; border-radius: 12px; border: 2px dashed var(--accent); flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: var(--card-bg); color: var(--accent); padding:0;">
              ${s("plus")}
            </div>
            <input type="file" id="custom-bg-input" accept="image/*" style="display:none" onchange="window.app.handleCustomBgChange(event)">
          </div>
        </div>
        
        <div style="width: 100%;">
          <p style="font-size: 0.8rem; opacity: 0.6; margin-bottom: 0.75rem; font-weight: 600; text-transform: uppercase;">Diseño y Acciones</p>
          <div style="display: flex; align-items: center; justify-content: space-between; background: var(--card-bg); padding: 0.75rem 1rem; border-radius: 20px; border: 1px solid var(--glass-border);">
            <div style="display: flex; gap: 0.5rem;">
              <button class="design-btn ${this.currentVodDesign===1?"active":""}" onclick="window.app.changeVodDesign(1)" title="Clásico" style="width:36px; height:36px; border-radius:10px; border:none; background:${this.currentVodDesign===1?"var(--accent)":"var(--accent-soft)"}; color:${this.currentVodDesign===1?"white":"var(--accent)"}; display:flex; align-items:center; justify-content:center;">${s("align-center")}</button>
              <button class="design-btn ${this.currentVodDesign===2?"active":""}" onclick="window.app.changeVodDesign(2)" title="Moderno" style="width:36px; height:36px; border-radius:10px; border:none; background:${this.currentVodDesign===2?"var(--accent)":"var(--accent-soft)"}; color:${this.currentVodDesign===2?"white":"var(--accent)"}; display:flex; align-items:center; justify-content:center;">${s("align-left")}</button>
              <button class="design-btn ${this.currentVodDesign===3?"active":""}" onclick="window.app.changeVodDesign(3)" title="Elegante" style="width:36px; height:36px; border-radius:10px; border:none; background:${this.currentVodDesign===3?"var(--accent)":"var(--accent-soft)"}; color:${this.currentVodDesign===3?"white":"var(--accent)"}; display:flex; align-items:center; justify-content:center;">${s("square-dashed-bottom-code")}</button>
            </div>
            <div style="width:1px; height:24px; background:var(--glass-border); margin:0 0.5rem;"></div>
            <div style="display: flex; gap: 0.5rem;">
              <button onclick="window.app.handleCopyVod()" title="Copiar Texto" style="width:40px; height:40px; border-radius:50%; border:1px solid var(--accent); background:none; color:var(--accent); display:flex; align-items:center; justify-content:center;">${s("copy")}</button>
              <button onclick="window.app.showShareOptions()" title="Compartir Imagen" style="width:40px; height:40px; border-radius:50%; border:none; background:var(--accent); color:white; display:flex; align-items:center; justify-content:center;">${s("share-2")}</button>
            </div>
          </div>
        </div>
      </div>
    `;this.render(e),this.loadDailyVerse()}renderShareVerse(e,t=!1){t||this.addToHistory(this.currentView,{verseData:e}),this._isNavigatingBack=t,this.currentView="share-verse",this.currentVod=e;const i=`
      <header>
        <button class="btn-icon" onclick="window.pendingVerseScroll='${e.vNum}'; window.app.renderReader('${e.book}', '${e.chapter}')">${s("chevron-left")}</button>
        <h1>Compartir</h1>
      </header>
      <div class="view-container animate-entrance" style="display: flex; flex-direction: column; gap: 1.5rem; align-items: center;">
        <div id="vod-card" class="premium-card" style="width: 100%; min-height: 300px; justify-content: center; background-size: cover; background-position: center; color: white; text-shadow: 0 2px 10px rgba(0,0,0,0.5); padding: 2.5rem; position: relative; border: none;">
            <div style="position: absolute; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.3); z-index: 1; border-radius: var(--radius);"></div>
            <div id="vod-content" style="z-index: 2; position: relative;">
                 <p style="font-size: 1.4rem; font-style: italic; line-height: 1.6; margin-bottom: 1.5rem; font-family: 'Playfair Display', serif;">
                    "${e.text}"
                </p>
                <div style="font-weight: 700; color: #fff; font-size: 1.1rem; margin-bottom: 0.25rem;">${e.ref}</div>
                <div style="font-weight: 700; color: var(--accent); font-size: 0.8rem; letter-spacing: 1px;">REINA VALERA 1960</div>
            </div>
        </div>

        <div style="width: 100%;">
          <p style="font-size: 0.8rem; opacity: 0.6; margin-bottom: 0.75rem; font-weight: 600; text-transform: uppercase;">Seleccionar Fondo</p>
          <div id="bg-selector" style="display: flex; overflow-x: auto; gap: 0.75rem; padding-bottom: 0.5rem; scrollbar-width: none;">
            ${[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(o=>`
              <div class="bg-thumb" onclick="window.app.changeVodBg(${o})" 
                   style="min-width: 60px; height: 60px; border-radius: 12px; background-image: url('/img/bg-verse-${o}.png'); background-size: cover; border: 2px solid var(--glass-border); flex-shrink: 0;">
              </div>
            `).join("")}
            <div class="bg-thumb premium-card" onclick="window.app.openCustomBgDisclaimer()" 
                 style="min-width: 60px; height: 60px; border-radius: 12px; border: 2px dashed var(--accent); flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: var(--card-bg); color: var(--accent); padding:0;">
              ${s("plus")}
            </div>
            <input type="file" id="custom-bg-input" accept="image/*" style="display:none" onchange="window.app.handleCustomBgChange(event)">
          </div>
        </div>
        
        <div style="width: 100%;">
          <p style="font-size: 0.8rem; opacity: 0.6; margin-bottom: 0.75rem; font-weight: 600; text-transform: uppercase;">Diseño y Compartir</p>
          <div style="display: flex; align-items: center; justify-content: space-between; background: var(--card-bg); padding: 0.75rem 1rem; border-radius: 20px; border: 1px solid var(--glass-border);">
            <div style="display: flex; gap: 0.5rem;">
              <button class="design-btn ${this.currentVodDesign===1?"active":""}" onclick="window.app.changeVodDesign(1)" title="Clásico" style="width:36px; height:36px; border-radius:10px; border:none; background:${this.currentVodDesign===1?"var(--accent)":"var(--accent-soft)"}; color:${this.currentVodDesign===1?"white":"var(--accent)"}; display:flex; align-items:center; justify-content:center;">${s("align-center")}</button>
              <button class="design-btn ${this.currentVodDesign===2?"active":""}" onclick="window.app.changeVodDesign(2)" title="Moderno" style="width:36px; height:36px; border-radius:10px; border:none; background:${this.currentVodDesign===2?"var(--accent)":"var(--accent-soft)"}; color:${this.currentVodDesign===2?"white":"var(--accent)"}; display:flex; align-items:center; justify-content:center;">${s("align-left")}</button>
              <button class="design-btn ${this.currentVodDesign===3?"active":""}" onclick="window.app.changeVodDesign(3)" title="Elegante" style="width:36px; height:36px; border-radius:10px; border:none; background:${this.currentVodDesign===3?"var(--accent)":"var(--accent-soft)"}; color:${this.currentVodDesign===3?"white":"var(--accent)"}; display:flex; align-items:center; justify-content:center;">${s("square-dashed-bottom-code")}</button>
            </div>
            
            <div style="display: flex; gap: 0.75rem; justify-content: flex-end; align-items: center;">
              <button onclick="window.app.copyVodToClipboard()" title="Copiar Texto" style="width:40px; height:40px; border-radius:50%; border:1px solid var(--accent); background:none; color:var(--accent); display:flex; align-items:center; justify-content:center;">
                ${s("copy")}
              </button>
              <button onclick="window.app.showShareOptions()" title="Compartir Imagen" style="width:40px; height:40px; border-radius:50%; border:none; background:var(--accent); color:white; display:flex; align-items:center; justify-content:center;">
                ${s("share-2")}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;this.render(i),this.refreshIcons(),this.updateVodUI(),this.changeVodBg(1)}changeVodDesign(e){this.currentVodDesign=e,this.updateVodUI(),document.querySelectorAll(".design-btn").forEach((t,i)=>{const o=i+1===e;t.style.background=o?"var(--accent)":"var(--accent-soft)",t.style.color=o?"white":"var(--accent)"})}changeVodBg(e,t=null){t?this.currentVodBg=t:this.currentVodBg=`/img/bg-verse-${e}.png`;const i=document.querySelector("#vod-card");i&&(i.style.backgroundImage=`url('${this.currentVodBg}')`),document.querySelectorAll(".bg-thumb").forEach((o,n)=>{t?o.style.borderColor=o.onclick?.toString().includes("openCustomBgDisclaimer")?"var(--accent)":"var(--glass-border)":o.style.borderColor=n+1===e?"var(--accent)":"var(--glass-border)"})}openCustomBgDisclaimer(){this.openConfirmModal("Imagen Personalizada","Para una mejor calidad al compartir, te recomendamos usar una imagen con una resolución mínima de 1080x1080 píxeles.",()=>{document.getElementById("custom-bg-input").click()},"Seleccionar","var(--accent)")}handleCustomBgChange(e){const t=e.target.files[0];if(t){const i=new FileReader;i.onload=o=>{this.changeVodBg(null,o.target.result)},i.readAsDataURL(t)}}async copyVodToClipboard(){if(!this.currentVod)return;const e=`"${this.currentVod.text}" - ${this.currentVod.ref}`;try{await navigator.clipboard.writeText(e),this.showToast("Versículo copiado al portapapeles")}catch(t){console.error("Error al copiar:",t),this.showToast("No se pudo copiar el versículo")}}handleCopyVod(){if(!this.currentVod)return;const e=`"${this.currentVod.text}" - ${this.currentVod.ref}

Enviado desde BIBLIA CRISTIANA RV1960`;navigator.clipboard.writeText(e).then(()=>this.showToast("Copiado al portapapeles"))}showShareOptions(){const e=document.querySelector("#share-modal");if(!e)return;const t=document.querySelector("#share-modal-img-text"),i=document.querySelector("#share-modal-txt-text"),o=document.querySelector("#share-modal-txt-icon");t&&(t.innerText="Compartir Imagen"),i&&(i.innerText=this.currentView==="reader"?"Copiar Texto":"Compartir como Texto"),o&&o.setAttribute("data-lucide",this.currentView==="reader"?"copy":"share-2"),this.refreshIcons(),e.classList.add("active")}closeShareModal(){const e=document.querySelector("#share-modal");e&&e.classList.remove("active")}async loadDailyVerse(){try{const e=this.db.getVerseOfDay();if(!e)throw new Error("No Bible data");this.currentVod={text:e.text,ref:`${e.book} ${e.chapter}:${e.verse}`,thematic:e.thematic,book:e.book,chapter:e.chapter,verse:e.verse},this.updateVodUI()}catch(e){console.error("Error loading VOD:",e);const t=document.querySelector("#vod-content p");t&&(t.innerText="No se pudo cargar el versículo.")}}navigateToCurrentVod(){if(!this.currentVod||!this.currentVod.book)return;const{book:e,chapter:t,verse:i}=this.currentVod;this.openConfirmModal("Ir al Versículo",`¿Deseas ir a la ubicación de este versículo en ${e} ${t}:${i}?`,()=>{window.pendingVerseScroll=i,this.renderReader(e,t)},"Ir","var(--accent)")}updateVodUI(){const e=document.querySelector("#vod-card");if(!e||!this.currentVod)return;e.style.backgroundImage=`url('${this.currentVodBg}')`,e.style.display="flex",e.style.padding="2rem",e.style.position="relative",e.style.height="400px";let t="";const i=this.currentVodDesign,o=this.currentVod.text.length;let n=1.35;o>180?n=1.05:o>120&&(n=1.2),i===1?(e.style.alignItems="center",e.style.justifyContent="center",t=`
        <div style="position: absolute; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.45); z-index: 1; border-radius: 24px;"></div>
        <div id="vod-content" style="z-index: 2; position: relative; text-align: center; width: 100%;">
          <div style="font-weight: 800; letter-spacing: 2px; text-transform: uppercase; font-size: 0.7rem; margin-bottom: 0.75rem; opacity: 0.8; color: white;">${this.currentVod.thematic||""}</div>
          <p style="font-size: ${n}rem; font-style: italic; line-height: 1.6; margin-bottom: 1.5rem; font-family: 'Playfair Display', serif; color: white;">"${this.currentVod.text}"</p>
          <div style="font-weight: 700; color: #fff; font-size: 1.05rem; margin-bottom: 0.2rem;">${this.currentVod.ref}</div>
          <div style="font-weight: 800; color: var(--accent); font-size: 0.8rem; letter-spacing: 1px;">REINA VALERA 1960</div>
        </div>
      `):i===2?(e.style.alignItems="center",e.style.justifyContent="flex-start",t=`
        <div style="position: absolute; top:0; left:0; right:0; bottom:0; background: linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 70%, transparent 100%); z-index: 1; border-radius: 24px;"></div>
        <div id="vod-content" style="z-index: 2; position: relative; text-align: left; width: 90%;">
          <p style="font-size: ${n-.15}rem; font-style: italic; line-height: 1.4; margin-bottom: 0.8rem; font-family: 'Playfair Display', serif; color: white;">"${this.currentVod.text}"</p>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 30px; height: 2px; background: var(--accent);"></div>
            <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">${this.currentVod.ref}</div>
          </div>
          <div style="font-weight: 800; color: var(--accent); font-size: 0.7rem; letter-spacing: 1px; margin-top: 0.25rem;">REINA VALERA 1960</div>
        </div>
      `):i===3&&(e.style.alignItems="center",e.style.justifyContent="center",t=`
        <div id="vod-content" style="z-index: 2; position: relative; background: rgba(0, 0, 0, 0.75); border: 1px solid rgba(255,255,255,0.1); padding: 1.75rem; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); width: 92%; margin: 0 auto; text-align: center;">
          <div style="font-weight: 800; letter-spacing: 2px; text-transform: uppercase; font-size: 0.65rem; margin-bottom: 0.5rem; opacity: 0.7; color: white;">${this.currentVod.thematic||""}</div>
          <p style="font-size: ${n-.15}rem; font-style: italic; line-height: 1.5; margin-bottom: 1.25rem; font-family: 'Playfair Display', serif; color: white;">"${this.currentVod.text}"</p>
          <div style="font-weight: 700; color: var(--accent); font-size: 0.95rem; margin-bottom: 0.2rem;">${this.currentVod.ref}</div>
          <div style="font-weight: 400; color: rgba(255,255,255,0.5); font-size: 0.7rem; letter-spacing: 1px;">REINA VALERA 1960</div>
        </div>
      `),e.innerHTML=t}async generateVerseCanvas(){return new Promise((e,t)=>{const i=document.createElement("canvas");i.width=1080,i.height=1080;const o=i.getContext("2d"),n=new Image;n.src=this.currentVodBg.startsWith("data:")?this.currentVodBg:window.location.origin+this.currentVodBg,n.crossOrigin="anonymous",n.onload=()=>{try{const r=this.currentVodDesign;if(o.drawImage(n,0,0,1080,1080),r===1)o.fillStyle="rgba(0,0,0,0.48)",o.fillRect(0,0,1080,1080);else if(r===2){const g=o.createLinearGradient(0,0,1080,0);g.addColorStop(0,"rgba(0,0,0,0.95)"),g.addColorStop(.6,"rgba(0,0,0,0.4)"),g.addColorStop(1,"rgba(0,0,0,0.1)"),o.fillStyle=g,o.fillRect(0,0,1080,1080)}else if(r===3){o.fillStyle="rgba(0,0,0,0.15)",o.fillRect(0,0,1080,1080);const g=940,v=680,x=(1080-g)/2,C=(1080-v)/2;o.fillStyle="rgba(0,0,0,0.78)",this.drawRoundedRect(o,x,C,g,v,40),o.fill(),o.strokeStyle="rgba(255,255,255,0.15)",o.lineWidth=2,o.stroke()}o.fillStyle="white",o.textBaseline="middle";let a=56;const l=this.currentVod.text.length;l>200?a=44:l>150?a=48:l>100&&(a=52);let c="serif";document.fonts.check(`italic ${a}px "Playfair Display"`)&&(c='"Playfair Display", serif'),o.font=`italic ${a}px ${c}`;const h=`"${this.currentVod.text}"`.split(" ");let d="",p=[];const f=r===3?840:880;for(let g=0;g<h.length;g++){let v=d+h[g]+" ";o.measureText(v).width>f&&g>0?(p.push(d),d=h[g]+" "):d=v}p.push(d);let u;if(r===2?(o.textAlign="left",u=540-p.length*a*1.3/2):(o.textAlign="center",u=540-p.length*a*1.3/2),p.forEach((g,v)=>{const x=r===2?110:540;o.fillText(g.trim(),x,u+v*a*1.3)}),r===2){const g=u+p.length*a*1.3+40;o.fillStyle="#c29958",o.fillRect(110,g-24,60,4),o.fillStyle="white",o.font="bold 48px sans-serif",o.fillText(this.currentVod.ref.toUpperCase(),190,g),o.fillStyle="rgba(255,255,255,0.6)",o.font="30px sans-serif",o.fillText("BIBLIA CRISTIANA RV1960",110,1020)}else{const g=u+p.length*a*1.3+80;o.fillStyle="#c29958",o.font="bold 48px sans-serif",o.fillText(this.currentVod.ref.toUpperCase(),540,g),o.fillStyle="rgba(255,255,255,0.6)",o.font="30px sans-serif",o.fillText("BIBLIA CRISTIANA RV1960",540,1020)}e(i)}catch(r){t(r)}},n.onerror=()=>t(new Error("Error al cargar el fondo"))})}drawRoundedRect(e,t,i,o,n,r){e.beginPath(),e.moveTo(t+r,i),e.lineTo(t+o-r,i),e.quadraticCurveTo(t+o,i,t+o,i+r),e.lineTo(t+o,i+n-r),e.quadraticCurveTo(t+o,i+n,t+o-r,i+n),e.lineTo(t+r,i+n),e.quadraticCurveTo(t,i+n,t,i+n-r),e.lineTo(t,i+r),e.quadraticCurveTo(t,i,t+r,i),e.closePath()}async shareVerse(e){if(this.closeShareModal(),this.currentView==="reader"&&this.selectedVerse){if(e==="image"){const i=this.selectedVerse;this.renderShareVerse({text:i.text,ref:`${i.book} ${i.chapter}:${i.vNum}`,book:i.book,chapter:i.chapter,vNum:i.vNum});return}else if(e==="text"){this.handleCopy();return}}if(!this.currentVod)return;const t=`"${this.currentVod.text}" 

- ${this.currentVod.ref}
Enviado desde BIBLIA CRISTIANA RV1960`;if(e==="text"){const i={title:"Compartir Versículo",text:t},o=window.Capacitor;if(o&&o.Plugins&&o.Plugins.Share)try{await o.Plugins.Share.share({title:"Compartir Versículo",text:t});return}catch(r){console.error("Capacitor share error:",r)}const n=await this.canShareData(i);if(n)try{await navigator.share(n)}catch(r){r.name!=="AbortError"&&this.handleCopyVod()}else this.handleCopyVod()}else if(e==="image"){this.showToast("Preparando imagen...");try{const i=await this.generateVerseCanvas(),o=i.toDataURL("image/jpeg",.9).split(",")[1],n=window.Capacitor;if(n&&n.Plugins&&n.Plugins.Filesystem&&n.Plugins.Share){const r=n.Plugins.Filesystem,a=n.Plugins.Share,l=await r.writeFile({path:"temp_share.jpg",data:o,directory:"CACHE"});await a.share({title:"Compartir Versículo",text:t,url:l.uri,dialogTitle:"Compartir Imagen"})}else this.fallbackDownload(i)}catch(i){console.error("Share error:",i),this.showToast("Error al compartir imagen.")}}}async saveImageDirectly(){if(this.closeShareModal(),!!this.currentVod){this.showToast("Preparando guardado...");try{const e=await this.generateVerseCanvas(),t=e.toDataURL("image/jpeg",.9).split(",")[1],i=window.Capacitor;if(i&&i.Plugins&&i.Plugins.Filesystem){const o=i.Plugins.Filesystem;(await o.checkPermissions()).publicStorage!=="granted"&&await o.requestPermissions();const r=await o.writeFile({path:"temp_save.jpg",data:t,directory:"CACHE"});i.Plugins.Share?(await i.Plugins.Share.share({title:"Guardar Versículo",url:r.uri,dialogTitle:"Guardar Versículo como..."}),this.showToast("Cargando opciones de guardado...")):this.fallbackDownload(e)}else this.fallbackDownload(e)}catch(e){console.error("Save error:",e),this.showToast("Error al procesar la imagen.")}}}fallbackDownload(e){e.toBlob(t=>{const i=URL.createObjectURL(t),o=document.createElement("a"),n=new Date().getTime();o.download=`bendicion_${n}.jpg`,o.href=i,document.body.appendChild(o),o.click(),document.body.removeChild(o),this.showToast("Intento de descarga iniciado..."),setTimeout(()=>URL.revokeObjectURL(i),5e3)},"image/jpeg",.9)}handleAboutClick(){this.aboutClickCount++,this.aboutClickCount>=5&&(this.aboutClickCount=0,this.openLoveModal()),clearTimeout(this.aboutClickTimeout),this.aboutClickTimeout=setTimeout(()=>{this.aboutClickCount=0},2e3)}openLoveModal(){const e=document.querySelector("#love-modal");e&&e.classList.add("active")}closeLoveModal(){const e=document.querySelector("#love-modal");e&&e.classList.remove("active")}async toggleTTS(e,t){if(this.isSpeaking){this.isPaused?this.resumeTTS():this.pauseTTS();return}this.stopTTS();const i=this.db.getVerses(e,t);!i||i.length===0||(this.currentChapterVerses=[],this.currentChapterVerses.push({text:`${e}, capítulo ${t}.`,vNum:null,type:"title"}),i.forEach(([o,n])=>{const r=this.db.getPericope(e,t,o);r&&this.currentChapterVerses.push({text:r+".",vNum:null,type:"pericope"});let a=n;this.db.settings.skip_verse_numbers||(a=`Verso ${o}. ${n}`),this.currentChapterVerses.push({text:a,vNum:o,type:"verse"})}),this.currentVerseIndex=0,this.isSpeaking=!0,this.isPaused=!1,this.updateTTSButton(),this.playNextChunk())}async playNextChunk(){if(!this.isSpeaking||this.isPaused)return;if(this.currentVerseIndex>=this.currentChapterVerses.length){this.stopTTS();return}const e=this.currentChapterVerses[this.currentVerseIndex];this.updateTTSDialogUI(),e.type==="verse"&&e.vNum?this.highlightReadingVerse(e.vNum):this.clearReadingHighlight();const t=window.Capacitor;if(t&&t.Plugins&&t.Plugins.TextToSpeech)try{let i="es-ES",o=this.db.settings.tts_voice;await t.Plugins.TextToSpeech.speak({text:e.text,lang:i,rate:1,pitch:1,volume:1,voice:o,category:"playback"}),this.currentVerseIndex++,this.playNextChunk()}catch(i){console.error("TTS Error in chunk:",i),this.stopTTS(),this.showToast("Error al reproducir audio")}else console.warn("TTS Plugin not available"),this.stopTTS()}highlightReadingVerse(e){this.clearReadingHighlight();const t=document.getElementById(`v-${e}`);t&&t.classList.add("reading-active")}clearReadingHighlight(){const e=document.querySelector(".verse-item.reading-active");e&&e.classList.remove("reading-active")}async nextVerseTTS(){this.currentVerseIndex+1<this.currentChapterVerses.length?(await this.stopTTSUtils(),this.currentVerseIndex++,this.isPaused=!1,this.updateTTSButton(),this.playNextChunk()):this.showToast("Último versículo")}async prevVerseTTS(){this.currentVerseIndex>0?(await this.stopTTSUtils(),this.currentVerseIndex--,this.currentVerseIndex<0&&(this.currentVerseIndex=0),this.isPaused=!1,this.updateTTSButton(),this.playNextChunk()):this.showToast("Inicio del capítulo")}async stopTTSUtils(){const e=window.Capacitor;e&&e.Plugins&&e.Plugins.TextToSpeech&&await e.Plugins.TextToSpeech.stop()}openTTSDialog(){const e=document.getElementById("tts-dialog");e&&(e.style.display="flex"),this.updateTTSDialogUI()}closeTTSDialog(){const e=document.getElementById("tts-dialog");e&&(e.style.display="none")}updateTTSDialogUI(){const e=document.getElementById("tts-current-verse");if(!e)return;const t=this.currentChapterVerses[this.currentVerseIndex];t&&(t.type==="title"?e.innerText="Título":t.type==="pericope"?e.innerText="Lectura":t.type==="verse"?e.innerText=`Verso ${t.vNum}`:e.innerText="Lectura")}async pauseTTS(){this.isPaused=!0;const e=window.Capacitor;e&&e.Plugins&&e.Plugins.TextToSpeech&&await e.Plugins.TextToSpeech.stop(),this.updateTTSButton()}async resumeTTS(){this.isPaused=!1,this.updateTTSButton(),this.playNextChunk()}async stopTTS(){this.isSpeaking=!1,this.isPaused=!1,this.currentVerseIndex=0,this.currentChapterVerses=[],this.clearReadingHighlight();const e=window.Capacitor;e&&e.Plugins&&e.Plugins.TextToSpeech&&await e.Plugins.TextToSpeech.stop(),this.updateTTSButton(),this.closeTTSDialog()}updateTTSButton(){const e=document.getElementById("tts-btn"),t=document.getElementById("tts-controls-btn");if(e){let i="volume-2";this.isSpeaking&&(this.isPaused?i="play":i="pause"),e.innerHTML=s(i),this.isSpeaking?(e.classList.add("active"),e.style.background="var(--accent)",e.style.color="white",this.isPaused?e.style.opacity="0.7":e.style.opacity="1",t&&(t.style.display="flex")):(e.classList.remove("active"),e.style.background="",e.style.color="",e.style.opacity="1",t&&(t.style.display="none")),this.refreshIcons()}}toggleVerseNumbers(e){this.db.settings.skip_verse_numbers=!e,this.db.saveSettings(),this.showToast(this.db.settings.skip_verse_numbers?"Lectura fluida activada":"Los versos se leerán con números")}async openVoiceModal(){const e=window.Capacitor;if(e&&e.Plugins&&e.Plugins.TextToSpeech)try{const i=(await e.Plugins.TextToSpeech.getSupportedVoices()).voices.map((n,r)=>({...n,originalIndex:r}));let o=i.filter(n=>n.lang.toLowerCase().startsWith("es"));if(o.length===0&&(o=i),(this.db.settings.tts_voice===0&&!this.db.settings.tts_voice_name||!o.find(n=>n.originalIndex===this.db.settings.tts_voice))&&o.length>0){const n=o[0];this.db.settings.tts_voice=n.originalIndex,this.db.settings.tts_voice_name=n.name,this.db.saveSettings()}this.renderVoiceModal(o)}catch(t){console.error("Error fetching voices:",t),this.showToast("No se pudieron cargar las voces")}else this.showToast("TTS no disponible")}renderVoiceModal(e){const t=document.createElement("div");t.id="voice-modal",t.className="modal-overlay animate-entrance",t.style.zIndex="2000",t.innerHTML=`
      <div class="modal-content" style="max-width: 95%; width: 440px; border-radius: 24px; padding: 1.5rem; background: var(--bg-color); box-shadow: var(--shadow); border: 1px solid var(--glass-border);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2 style="font-family: 'Playfair Display', serif; font-size: 1.4rem; color: var(--text-main); margin: 0;">Elegir Voz</h2>
          <button class="btn-icon" onclick="window.app.closeVoiceModal()" style="background: var(--verse-hover); width: 32px; height: 32px;">${s("x")}</button>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 0.75rem; max-height: 55vh; overflow-y: auto; padding-right: 0.5rem;">
          ${e.map(i=>{const o=this.db.settings.tts_voice===i.originalIndex;let n=i.name.replace(/español/gi,"").replace(/\(.*\)/g,"").trim();return n||(n=i.name),`
              <div class="premium-card" onclick="window.app.applyVoice(${i.originalIndex}, '${i.name.replace(/'/g,"\\'")}')" 
                   style="padding: 1.15rem 1.25rem; flex-direction: row; justify-content: space-between; align-items: center; text-align: left; border: ${o?"2px solid var(--accent)":"1px solid var(--glass-border)"}; background: ${o?"var(--accent-soft)":"var(--card-bg)"}; cursor: pointer; display: flex !important;">
                <div style="display: flex; flex-direction: column; gap: 0.25rem; flex-grow: 1; align-items: flex-start; min-width: 0;">
                    <span style="font-size: 1rem; font-weight: 700; color: var(--text-main); width: 100%;">${n}</span>
                    <span style="font-size: 0.75rem; opacity: 0.6; color: var(--text-muted); font-weight: 600;">${i.lang.toUpperCase()}</span>
                </div>
                ${o?`<div style="color: var(--accent); flex-shrink: 0; margin-left: 1rem;">${s("check-circle")}</div>`:""}
              </div>
            `}).join("")}
        </div>
      </div>
    `,document.body.appendChild(t),setTimeout(()=>t.classList.add("active"),10),this.refreshIcons()}closeVoiceModal(){const e=document.getElementById("voice-modal");e&&e.remove()}cleanText(e){return e.replace(/<[^>]*>?/gm,"")}async renderCrecimiento(){this.currentView="crecimiento";const e=`
      <header>
        <button class="btn-icon" onclick="window.app.renderHome()">${s("arrow-left")}</button>
        <h1 style="flex-grow: 1;">Crecimiento</h1>
      </header>
      <div class="view-container animate-entrance">
        <div id="crecimiento-dashboard" style="display: flex; flex-direction: column; gap: 1.5rem; width: 100%; max-width: 800px; margin: 0 auto; padding: 1rem;">
          <!-- Card de Último Devocional (Summary) -->
          <div id="latest-crecimiento-card">
            <div style="text-align: center; padding: 2rem; opacity: 0.7;">
              <div class="spinner"></div>
              <p style="margin-top: 1rem;">Cargando...</p>
            </div>
          </div>

          <!-- Botones de Secciones -->
          <div id="crecimiento-categories-grid" class="home-grid" style="grid-template-columns: 1fr; gap: 1rem;">
            <button class="premium-card" onclick="window.app.navigate('devocional')" style="flex-direction: row; justify-content: flex-start; gap: 1.5rem; padding: 1.25rem 1.5rem; border-radius: 20px;">
              <div class="icon-wrapper" style="background:var(--accent-soft); color:var(--accent); width:45px; height:45px;">${s("coffee")}</div>
              <div style="text-align: left;">
                <div style="font-weight:700; font-size:1.1rem;">Devocionales</div>
                <div style="font-size:0.85rem; opacity:0.6;">Reflexiones diarias para tu alma</div>
              </div>
            </button>

            <button class="premium-card" onclick="window.app.navigate('preguntas')" style="flex-direction: row; justify-content: flex-start; gap: 1.5rem; padding: 1.25rem 1.5rem; border-radius: 20px;">
              <div class="icon-wrapper" style="background:#e0f2fe; color:#0369a1; width:45px; height:45px;">${s("help-circle")}</div>
              <div style="text-align: left;">
                <div style="font-weight:700; font-size:1.1rem;">Preguntas</div>
                <div style="font-size:0.85rem; opacity:0.6;">Respuestas a tus dudas bíblicas</div>
              </div>
            </button>
              </div>
            </button>

            ${this.db.settings.editor_mode_enabled?`
            <button class="premium-card" onclick="window.app.navigate('editor-admin')" style="flex-direction: row; justify-content: flex-start; gap: 1.5rem; padding: 1.25rem 1.5rem; border-radius: 20px; border: 1px dashed var(--accent);">
              <div class="icon-wrapper" style="background:var(--accent-soft); color:var(--accent); width:45px; height:45px;">${s("edit-3")}</div>
              <div style="text-align: left;">
                <div style="font-weight:700; font-size:1.1rem;">Acceso Editor</div>
                <div style="font-size:0.85rem; opacity:0.6;">Panel de administración de contenido</div>
              </div>
            </button>
            `:""}
          </div>
        </div>
      </div>
    `;this.render(e),this.loadCrecimientoSummary()}async loadCrecimientoSummary(){const e=document.getElementById("latest-crecimiento-card"),t=document.getElementById("crecimiento-categories-grid");if(!navigator.onLine){t&&(t.style.display="none"),e.innerHTML=`
        <div class="premium-card" style="flex-direction: column; gap: 0.8rem; padding: 1.5rem; border-radius: 20px; background: rgba(var(--accent-rgb), 0.05); border: 1px dashed var(--accent-soft); text-align: center;">
          <div style="font-size: 2rem; color: var(--accent); opacity: 0.8;">${s("wifi-off")}</div>
          <p style="font-size: 0.9rem; opacity: 0.8; margin: 0; line-height: 1.4;">No hay conexión a internet para acceder a este apartado extra que requiere internet</p>
          <button class="btn-primary" onclick="window.app.loadCrecimientoSummary()" style="padding: 0.5rem 1.2rem; font-size: 0.85rem; border-radius: 100px; margin-top: 0.5rem;">Reintentar</button>
        </div>
      `,this.refreshIcons();return}t&&(t.style.display="grid");try{const i=await fetch(`https://dataconnect-kohl.vercel.app/biblia-cristiana-rv1960-app/devocional-last.json?${Date.now()}`);if(!i.ok)throw new Error;const o=await i.json(),n=o.devocional.substring(0,120)+"...";e.innerHTML=`
        <div class="premium-card" onclick="window.app.renderDevotionalView(${JSON.stringify(o).replace(/"/g,"&quot;")}, false)" 
             style="flex-direction: column; gap: 0.5rem; padding: 1.25rem; border-radius: 20px; background: var(--bg-secondary); border: 1px solid var(--accent-soft); text-align: center; position: relative; overflow: hidden;">
          <div style="position: absolute; top: -10px; right: -10px; opacity: 0.03; transform: rotate(15deg);">${s("coffee",80)}</div>
          <div class="icon-wrapper" style="background:var(--accent); color:white; width:42px; height:42px; margin: 0 auto; box-shadow: 0 4px 8px var(--accent-soft); scale: 0.9;">${s("coffee")}</div>
          <div style="font-size: 0.75rem; font-weight: 600; color: var(--accent); text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.8;">Último Devocional</div>
          <h2 style="font-size: 1.25rem; color: var(--text-main); margin: 0; line-height: 1.2;">${o.titulo}</h2>
          <p style="font-size: 0.85rem; opacity: 0.7; line-height: 1.4; margin: 0.25rem 0;">"${n}"</p>
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--accent); padding: 0.4rem 1rem; border-radius: 100px; display: inline-block; margin: 0.25rem auto 0; border: 1px solid var(--accent-soft);">Leer completo</div>
        </div>
      `}catch{e.innerHTML=`
        <div class="premium-card" onclick="window.app.loadCrecimientoSummary()" style="padding: 2rem; text-align: center; opacity: 0.7; cursor: pointer;">
          <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">${s("refresh-cw")}</div>
          <p>No se pudo cargar el resumen. Toca para reintentar.</p>
        </div>
      `}this.refreshIcons()}async renderDevotional(){this.currentView="devotional";const e=`
      <header>
        <button class="btn-icon" onclick="window.app.renderCrecimiento()">${s("arrow-left")}</button>
        <h1>Devocional Semanal</h1>
        <button class="btn-icon" onclick="window.app.renderDevotionalHistory()">${s("history")}</button>
      </header>
      <div class="view-container animate-entrance">
        <div id="devotional-content" style="display: flex; flex-direction: column; gap: 1.5rem; width: 100%; max-width: 800px; margin: 0 auto;">
          <div style="text-align: center; padding: 2rem; color: var(--text-main); opacity: 0.7;">
            <div class="spinner"></div>
            <p style="margin-top: 1rem;">Cargando devocional...</p>
          </div>
        </div>
      </div>
    `;this.render(e),this.loadDevotionalData()}async loadDevotionalData(){const e=document.getElementById("devotional-content");if(!navigator.onLine){e.innerHTML=`
            <div class="error-state" style="text-align: center; padding: 3rem 1rem;">
                <div style="font-size: 3rem; color: var(--accent); margin-bottom: 1rem;">${s("wifi-off")}</div>
                <h3 style="margin-bottom: 0.5rem;">Sin Conexión</h3>
                <p style="opacity: 0.7; margin-bottom: 1.5rem;">Revise su conexión a internet y pruebe nuevamente.</p>
                <button class="btn-primary" onclick="window.app.loadDevotionalData()">Reintentar</button>
            </div>
        `,this.refreshIcons();return}try{const t=await fetch("https://dataconnect-kohl.vercel.app/biblia-cristiana-rv1960-app/devocional-last.json?"+new Date().getTime());if(!t.ok)throw new Error("No se pudo cargar el devocional");const i=await t.json();this.renderDevotionalView(i,!1)}catch(t){console.error(t),e.innerHTML=`
            <div class="error-state" style="text-align: center; padding: 3rem 1rem;">
                <div style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;">${s("alert-circle")}</div>
                <h3 style="margin-bottom: 0.5rem;">Error al Cargar</h3>
                <p style="opacity: 0.7; margin-bottom: 1.5rem;">Revise su conexión a internet y pruebe nuevamente.<br>Si el error persiste, puede reportarlo en GitHub.</p>
                <div style="display: flex; flex-direction: column; gap: 0.75rem; align-items: center;">
                  <button class="btn-primary" onclick="window.app.loadDevotionalData()">Reintentar</button>
                  <button class="btn-secondary" onclick="window.open('https://github.com/${this.repo}/issues', '_blank')" style="background: var(--card-bg); color: var(--text-main); border: 1px solid var(--glass-border); padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 700; cursor: pointer;">
                    ${s("github")} Reportar en GitHub
                  </button>
                </div>
            </div>
        `,this.refreshIcons()}}toggleDevotionalSort(){this.devotionalSortOrder=this.devotionalSortOrder==="asc"?"desc":"asc",this.renderDevotionalHistory()}async renderPreguntasHistory(e=!1){e||this.addToHistory(this.currentView),this._isNavigatingBack=e,this.currentView="preguntas",this.renderGenericHistoryView("Preguntas","help-circle","preguntas-index.json","preguntas")}async renderGenericHistoryView(e,t,i,o){const n=`
      <header>
        <button class="btn-icon" onclick="window.app.navigate('crecimiento')">${s("chevron-left")}</button>
        <input type="text" class="search-header" placeholder="Buscar ${e.toLowerCase()}..." oninput="window.app.filterGenericList(this.value, '${o}')" style="flex: 1; min-width: 0;">
        <div style="display: flex; gap: 0.25rem; flex-shrink: 0;">
          <button class="btn-icon" onclick="window.app.toggleGenericSort('${o}')" title="Ordenar">
            ${s(this[`${o}SortOrder`]==="asc"?"sort-asc":"sort-desc")}
          </button>
        </div>
      </header>
      <div class="view-container animate-entrance">
         <div id="${o}-history-content" style="padding: 1rem; display: flex; flex-direction: column; gap: 1rem;">
            <div style="text-align: center; padding: 2rem; color: var(--text-main); opacity: 0.7;">
              <div class="spinner"></div>
              <p style="margin-top: 1rem;">Cargando ${e.toLowerCase()}...</p>
            </div>
         </div>
      </div>
    `;this.render(n);const r=document.getElementById(`${o}-history-content`);try{const a=await fetch(`https://dataconnect-kohl.vercel.app/biblia-cristiana-rv1960-app/${i}?${Date.now()}`);if(!a.ok)throw new Error;const l=await a.json();if(l.length===0){r.innerHTML=`<div style="text-align: center; padding: 2rem; opacity: 0.6;">No hay ${e.toLowerCase()} aún.</div>`;return}const c=this[`${o}SortOrder`]||"desc",h={enero:0,febrero:1,marzo:2,abril:3,mayo:4,junio:5,julio:6,agosto:7,septiembre:8,octubre:9,noviembre:10,diciembre:11},d=p=>{if(!p)return 0;if(p.match(/(\d{4})-(\d{2})-(\d{2})/))return new Date(p).getTime();const u=p.match(/(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/i);if(u){const g=parseInt(u[1]),v=h[u[2].toLowerCase()]??0,x=parseInt(u[3]);return new Date(x,v,g).getTime()}return 0};l.sort((p,f)=>{const u=d(p.fecha),g=d(f.fecha);return c==="asc"?u-g:g-u}),r.innerHTML=l.map(p=>`
          <div class="premium-card" onclick="window.app.loadGenericItem('${p.file}', '${o}')" 
               style="padding: 1rem; flex-direction: row; align-items: center; justify-content: space-between; text-align: left;"
               data-search="${p.titulo.toLowerCase()}">
              <div style="text-align: left;">
                  <h3 style="font-size: 1rem; margin-bottom: 0.25rem;">${p.titulo}</h3>
                  <span style="font-size: 0.8rem; opacity: 0.6;">${p.fecha||""}</span>
              </div>
              <div style="opacity: 0.4;">${s("chevron-right")}</div>
          </div>
        `).join(""),this.refreshIcons()}catch{r.innerHTML=`
        <div class="error-state" style="text-align: center; padding: 3rem 1rem;">
          <div style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;">${s("alert-circle")}</div>
          <h3 style="margin-bottom: 0.5rem;">Error al cargar</h3>
          <button class="btn-primary" onclick="window.app.render${o.charAt(0).toUpperCase()+o.slice(1)}History()">Reintentar</button>
        </div>
      `,this.refreshIcons()}}filterGenericList(e,t){const i=document.getElementById(`${t}-history-content`),o=i.querySelectorAll(".premium-card"),n=e.toLowerCase().trim();o.forEach(l=>{(l.dataset.search||l.querySelector("h3").textContent).toLowerCase().includes(n)?l.style.display="flex":l.style.display="none"});const r=Array.from(o).filter(l=>l.style.display!=="none");let a=document.getElementById("no-search-results");r.length===0?a||(a=document.createElement("div"),a.id="no-search-results",a.style.cssText="text-align: center; padding: 2rem; opacity: 0.6;",a.textContent="No se encontraron coincidencias.",i.appendChild(a)):a&&a.remove()}toggleGenericSort(e){this[`${e}SortOrder`]=this[`${e}SortOrder`]==="asc"?"desc":"asc",e==="preguntas"?this.renderPreguntasHistory():e==="devocional"&&this.renderDevotionalHistory()}async loadGenericItem(e,t){this.showToast("Cargando...");try{const i=e.startsWith("biblia-cristiana-rv1960-app/")?e:`biblia-cristiana-rv1960-app/${e}`,o=await fetch(`https://dataconnect-kohl.vercel.app/${i}`);if(!o.ok)throw new Error;const n=await o.json();t==="preguntas"?this.renderPreguntaDetail(n):this.renderDevotionalView(n,!0)}catch{this.showToast("No se pudo cargar el contenido.")}}renderPreguntaDetail(e){this.currentView="devotional-detail",this._detailType="preguntas";const t=`
      <header>
        <button class="btn-icon" onclick="window.app.renderPreguntasHistory()">${s("chevron-left")}</button>
        <h1 style="flex-grow: 1;">Pregunta</h1>
      </header>
      <div class="view-container animate-entrance">
        <div class="qa-container">
          <div class="question-box">
             <p class="question-text">${e.titulo}</p>
          </div>
          
          <div class="answer-bubble">
            <span class="answer-label">Respuesta</span>
            <div class="answer-content" style="white-space: pre-wrap; word-break: break-word; margin-top: 1rem;">${e.respuesta||e.contenido||"No hay respuesta disponible en este momento."}</div>
          </div>

          <div class="qa-metadata">
            Publicado el ${e.fecha_hora||e.fecha||""}
          </div>
        </div>
      </div>
    `;this.render(t),this.refreshIcons()}async renderDevotionalHistory(e=!1){e||this.addToHistory(this.currentView),this._isNavigatingBack=e,this.currentView="devotional-history";try{const t=`
      <header>
        <button class="btn-icon" onclick="window.app.navigate('crecimiento')">${s("chevron-left")}</button>
        <input type="text" class="search-header" placeholder="Buscar devocionales..." oninput="window.app.filterGenericList(this.value, 'devotional')" style="flex: 1; min-width: 0;">
        <div style="display: flex; gap: 0.25rem; flex-shrink: 0;">
          <button class="btn-icon" onclick="window.app.renderDevotionalFavorites()" title="Ver Favoritos">${s("heart")}</button>
          <button class="btn-icon" onclick="window.app.toggleDevotionalSort()" title="Ordenar">
            ${s(this.devotionalSortOrder==="asc"?"sort-asc":"sort-desc")}
          </button>
        </div>
      </header>
      <div class="view-container animate-entrance">
         <div id="devotional-history-content" style="padding: 1rem; display: flex; flex-direction: column; gap: 1rem;">
            <div style="text-align: center; padding: 2rem; color: var(--text-main); opacity: 0.7;">
              <div class="spinner"></div>
              <p style="margin-top: 1rem;">Cargando historial...</p>
            </div>
         </div>
      </div>
      `;this.render(t);const i=document.getElementById("devotional-history-content");try{const o=await fetch("https://dataconnect-kohl.vercel.app/biblia-cristiana-rv1960-app/devocional-index.json?"+new Date().getTime());let n=[];if(o.ok)n=await o.json();else throw new Error("No se pudo cargar el historial.");if(n.length===0){i.innerHTML='<div style="text-align: center; padding: 2rem; opacity: 0.6;">No hay devocionales anteriores.</div>';return}n.sort((r,a)=>{const l=r.fecha||"",c=a.fecha||"";return this.devotionalSortOrder==="asc"?l.localeCompare(c):c.localeCompare(l)}),i.innerHTML=n.map(r=>`
            <div class="premium-card" onclick="window.app.loadDevotionalFromHistory('${r.file}')" style="padding: 1rem; flex-direction: row; align-items: center; justify-content: space-between; text-align: left;" data-search="${r.titulo.toLowerCase()}">
                <div style="text-align: left;">
                    <h3 style="font-size: 1rem; margin-bottom: 0.25rem;">${r.titulo}</h3>
                    <span style="font-size: 0.8rem; opacity: 0.6;">${r.fecha||""}</span>
                </div>
                <div style="opacity: 0.4;">${s("chevron-right")}</div>
            </div>
          `).join(""),this.refreshIcons()}catch(o){console.error(o),i.innerHTML=`
        <div class="error-state" style="text-align: center; padding: 3rem 1rem;">
          <div style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;">${s("alert-circle")}</div>
          <h3 style="margin-bottom: 0.5rem;">No se pudo cargar el historial</h3>
          <p style="opacity: 0.7; margin-bottom: 1.5rem;">Revise su conexión a internet y pruebe nuevamente.</p>
          <button class="btn-primary" onclick="window.app.renderDevotionalHistory()">Reintentar</button>
        </div>
      `,this.refreshIcons()}}catch(t){console.error("Error reading devotionals directory:",t)}}async loadDevotionalFromHistory(e){this.showToast("Cargando devocional...");try{const t=e.startsWith("biblia-cristiana-rv1960-app/")?e:`biblia-cristiana-rv1960-app/${e}`,i=await fetch(`https://dataconnect-kohl.vercel.app/${t}`);if(!i.ok)throw new Error("No encontrado");const o=await i.json();this.renderDevotionalView(o,!0)}catch{this.showToast("No se pudo abrir este devocional.")}}renderDevotionalView(e,t=!1){this._devotionalFromHistory=t,this._detailType="devocional",this.currentDevotionalData=e,t&&(this.currentView="devotional-detail");const i=this.db.isDevotionalFavorite(e.titulo),o=`
      <header>
        <button class="btn-icon" onclick="${t?"window.app.renderDevotionalHistory()":"window.app.renderCrecimiento()"}">${s("arrow-left")}</button>
        <h1 style="flex-grow: 1;">${t?"Devocional":"Devocional Semanal"}</h1>
      </header>
      <div class="view-container animate-entrance" style="padding-bottom: calc(7rem + env(safe-area-inset-bottom));">
        <div style="width: 100%; max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="background: var(--card-bg); border: 1px solid var(--glass-border); border-radius: var(--radius); box-shadow: var(--shadow); padding: 0; overflow: hidden;">
                <div style="background: var(--accent); padding: 1.5rem; color: white; text-align: center;">
                    <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">${e.fecha_hora||"Devocional"}</span>
                    <h2 style="font-family: 'Playfair Display', serif; font-size: 1.8rem; margin: 0.5rem 0;">${e.titulo}</h2>
                    <span style="font-size: 0.9rem; font-style: italic;">Por ${e.autor}</span>
                </div>
                <div style="padding: 2rem;">
                    <div style="background: rgba(var(--accent-rgb), 0.1); border-left: 4px solid var(--accent); padding: 1rem; margin-bottom: 2rem; font-style: italic; color: var(--text-main); text-align: center;">
                        "${e.versiculo}"
                    </div>
                    <div style="font-size: 1.1rem; line-height: 1.8; color: var(--text-main); margin-bottom: 2rem; white-space: pre-wrap; text-align: center;">${e.devocional}</div>
                    <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 12px; border: 1px dashed var(--glass-border); margin-bottom: 2rem; text-align: center;">
                        <h4 style="color: var(--accent); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; justify-content: center;">${s("heart-handshake")} Oración</h4>
                        <p style="font-style: italic; opacity: 0.9;">${e.oracion}</p>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <button class="premium-card" id="devotional-fav-btn" onclick="event.stopPropagation(); window.app.toggleDevotionalFavorite()" 
                                style="flex-direction: row; justify-content: center; gap: 0.5rem; padding: 1rem; border: 1px solid var(--accent); color: ${i?"white":"var(--text-main)"}; background: ${i?"var(--accent)":"transparent"};">
                            ${s(i?"heart-off":"heart")} <span style="font-weight: 700;">Favorito</span>
                        </button>
                        <button class="premium-card" onclick="event.stopPropagation(); window.app.shareDevotionalFromCurrent()" 
                                style="flex-direction: row; justify-content: center; gap: 0.5rem; padding: 1rem; background: var(--accent); color: white; border: none;">
                            ${s("share-2")} <span style="font-weight: 700;">Compartir</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    `;this.render(o)}openDevotionalFromFavorite(e){const t=this.db.devotionalFavorites[e];t&&this.renderDevotionalView(t,!0)}renderDevotionalFavorites(e=!1){e||this.addToHistory(this.currentView),this._isNavigatingBack=e,this.currentView="devotional-favorites";const t=this.db.devotionalFavorites,i=`
      <header>
        <button class="btn-icon" onclick="window.app.renderDevotionalHistory()">${s("chevron-left")}</button>
        <h1 style="flex-grow: 1;">Favoritos</h1>
      </header>
      <div class="view-container animate-entrance">
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${t.length===0?`
            <div style="text-align: center; padding: 3rem 1rem; opacity: 0.5;">
              <div style="font-size: 3rem; margin-bottom: 1rem;">${s("heart")}</div>
              <p>No tienes devocionales guardados como favoritos.</p>
            </div>
          `:t.map((o,n)=>`
            <div class="premium-card" 
                 onclick="window.app.openDevotionalFromFavorite(${n})"
                 style="padding: 1.25rem; flex-direction: row; justify-content: space-between; align-items: center; text-align: left; cursor: pointer; gap: 1rem;">
              <div style="flex-grow: 1; min-width: 0; overflow: hidden;">
                <h3 style="font-size: 1.1rem; margin-bottom: 0.25rem; color: var(--text-main); line-height: 1.3;">${o.titulo}</h3>
                <div style="font-size: 0.85rem; opacity: 0.6; color: var(--text-main);">
                  <span>${o.fecha_hora||""}</span>
                </div>
              </div>
              <button class="btn-icon" onclick="event.stopPropagation(); window.app.confirmDeleteDevotionalFavorite(event, ${n})" 
                      style="color: #ef4444; position: relative; z-index: 10; padding: 0.5rem; background: var(--verse-hover); border-radius: 50%; flex-shrink: 0;">
                ${s("trash-2")}
              </button>
            </div>
          `).join("")}
        </div>
      </div>
    `;this.render(i)}confirmDeleteDevotionalFavorite(e,t){e&&e.stopPropagation(),this.openConfirmModal("Eliminar Favorito","¿Deseas eliminar este devocional de tus favoritos?",()=>{this.db.deleteDevotionalFavorite(t),this.renderDevotionalFavorites()})}async exportUserData(){this.showToast("Preparando exportación...");try{const e=this.db.exportUserData(),t=JSON.stringify(e,null,2),o=`biblia_backup_${new Date().toISOString().replace(/[:.]/g,"-").slice(0,-5).replace("T","_")}.json`;await N.writeFile({path:o,data:t,directory:L.Documents,encoding:B.UTF8}),this.showToast(`Respaldo guardado en Documentos: ${o}`)}catch(e){console.error("Error exportando datos:",e);let t="Error al exportar datos";e.message&&(e.message.includes("permission")?t="Permisos insuficientes para guardar el archivo":t=e.message),this.showToast(t)}}async importUserData(){this.openConfirmModal("Importar Datos","Seleccione un archivo JSON de respaldo. Sus datos actuales (favoritos, notas, marcadores) serán reemplazados. ¿Desea continuar?",()=>{this.selectBackupFile()},"Importar","var(--accent)")}async selectBackupFile(){try{const e=await me.pickFiles({types:["application/json"],readData:!1});if(e.files.length>0){const t=e.files[0];if(!t.name.toLowerCase().endsWith(".json")){this.showToast("Por favor seleccione un archivo .json");return}const i=t.path||t.uri;i?await this.performImport(i):this.showToast("No se pudo acceder al archivo seleccionado")}}catch(e){e&&e.message!=="User cancelled"&&(console.error("Error seleccionando archivo:",e),this.showToast("Error al seleccionar archivo"))}}async performImport(e){this.showToast("Restaurando datos...");try{const t=await N.readFile({path:e,encoding:B.UTF8});if(!t||!t.data)throw new Error("El archivo está vacío o no se pudo leer");const i=JSON.parse(t.data);this.db.importUserData(i),this.showToast("Restauración exitosa. Reiniciando aplicación..."),setTimeout(()=>window.location.reload(),1500)}catch(t){console.error("Error en importación:",t),this.showToast("Error al importar: "+(t.message||t))}}toggleDevotionalFavorite(){if(!this.currentDevotionalData)return;const e=this.db.toggleDevotionalFavorite(this.currentDevotionalData);this.showToast(e?"Añadido a favoritos":"Eliminado de favoritos");const t=document.getElementById("devotional-fav-btn");t&&(t.style.background=e?"var(--accent)":"transparent",t.style.color=e?"white":"var(--text-main)",t.innerHTML=`${s(e?"heart-off":"heart")} <span style="font-weight: 700;">Favorito</span>`,this.refreshIcons())}shareDevotionalFromCurrent(){this.currentDevotionalData&&this.shareDevotional(this.currentDevotionalData)}async shareDevotional(e){const t=`*${e.titulo}*

"${e.versiculo}"

${e.devocional}

_Oración:_
${e.oracion}

Compartido desde Biblia Cristiana RV 1960`,i=window.Capacitor;if(i&&i.Plugins&&i.Plugins.Share)try{await i.Plugins.Share.share({title:e.titulo,text:t});return}catch(o){console.error("Capacitor share error:",o)}if(navigator.share)try{const o={title:e.titulo,text:t};if(navigator.canShare&&navigator.canShare(o)){await navigator.share(o);return}}catch(o){if(o.name!=="AbortError")console.error("Navigator share error:",o);else return}this.copyToClipboard(t)}copyToClipboard(e){navigator.clipboard.writeText(e).then(()=>{this.showToast("Contenido copiado al portapapeles")})}parseVerseReference(e){const t=e.replace(/["']/g,"").trim(),i=t.match(/^(\d?\s?[A-Za-zÁéíóú\s]+)\s(\d+):(\d+)$/);if(i)return{book:i[1].trim(),chapter:i[2],verse:i[3]};const o=t.lastIndexOf(" ");if(o===-1)return null;const n=t.substring(0,o).trim(),r=t.substring(o+1),[a,l]=r.split(":");return n&&a&&l?{book:n,chapter:a,verse:l}:null}initNativeNavigation(){J.addListener("backButton",()=>{const e=document.getElementById("selection-bar"),t=document.getElementById("highlight-bar"),i=document.getElementById("tts-dialog"),o=document.getElementById("config-modal"),n=document.querySelector(".toolbar-dropdown.active"),r=document.getElementById("share-modal");if(n){n.classList.remove("active");return}if(e&&e.style.display==="flex"){this.clearSelection();return}if(t&&t.style.display==="flex"){this.clearSelection();return}if(i&&i.style.display==="flex"){this.closeTTSDialog();return}if(o&&o.style.display==="block"){o.style.display="none";return}if(r&&r.style.display==="flex"){this.closeShareModal();return}const{last_book:a,last_chapter:l}=this.db.settings;switch(this.currentView){case"note-editor":this.cancelNoteEditor();break;case"reader":this.renderVerseList(a,l,!0);break;case"verses":this.renderChapterList(a,!0);break;case"chapters":const c=this.db.getBooks("old");this.renderBookList(c.includes(a)?"old":"new",!0);break;case"old":case"new":case"favorites":case"notes":case"highlights":case"search":case"dict":case"about":case"settings":case"vod":this.navigate("home",!0);break;case"crecimiento":case"devocional":this.navigate("home",!0);break;case"devotional-favorites":case"devotional-history":case"preguntas":this.navigate("crecimiento",!0);break;case"devotional-detail":this._detailType==="preguntas"?this.renderPreguntasHistory(!0):this._devotionalFromHistory?this.renderDevotionalHistory(!0):this.navigate("crecimiento",!0);break;case"share-verse":this.currentVod?(window.pendingVerseScroll=this.currentVod.vNum,this.renderReader(this.currentVod.book,this.currentVod.chapter,!0)):this.navigate("home",!0);break;case"editor-admin":this.navigate("crecimiento",!0);break;case"home":this.openConfirmModal("Salir de la App","¿Estás seguro de que deseas salir de la aplicación?",()=>{J.exitApp()},"Salir","var(--accent)");break;default:if(this.navigationHistory.length>0){const h=this.navigationHistory.pop();this.navigate(h.view,!0)}else this.navigate("home",!0)}})}addToHistory(e,t=null){if(this._isNavigatingBack)return;const i=this.navigationHistory[this.navigationHistory.length-1];i&&i.view===e||(this.navigationHistory.length>20&&this.navigationHistory.shift(),this.navigationHistory.push({view:e,params:t}))}}window.app=new ue;export{B as E,F as W,P as _,re as b,E as r};
