// Where to load the data from.
const TOP_OVERALL_URL = 'https://cdn.glitch.com/b078d442-623b-41f0-a809-48f5f1ec1cbf%2Ftop_overall.json?1559164437281';
const TOP_PER_COUNTRY_URL = 'https://cdn.glitch.com/b078d442-623b-41f0-a809-48f5f1ec1cbf%2Ftop_per_country.json?1559164216772';
const DATAPOINTS_URL = 'https://cdn.glitch.com/b078d442-623b-41f0-a809-48f5f1ec1cbf%2Fdataset_samples.json?1559248203882';

const isoCountries = {"af":"Afghanistan","ax":"AlandIslands","al":"Albania","dz":"Algeria","as":"AmericanSamoa","ad":"Andorra","ao":"Angola","ai":"Anguilla","aq":"Antarctica","ag":"AntiguaAndBarbuda","ar":"Argentina","am":"Armenia","aw":"Aruba","au":"Australia","at":"Austria","az":"Azerbaijan","bs":"Bahamas","bh":"Bahrain","bd":"Bangladesh","bb":"Barbados","by":"Belarus","be":"Belgium","bz":"Belize","bj":"Benin","bm":"Bermuda","bt":"Bhutan","bo":"Bolivia","ba":"BosniaAndHerzegovina","bw":"Botswana","bv":"BouvetIsland","br":"Brazil","io":"BritishIndianOceanTerritory","bn":"BruneiDarussalam","bg":"Bulgaria","bf":"BurkinaFaso","bi":"Burundi","kh":"Cambodia","cm":"Cameroon","ca":"Canada","cv":"CapeVerde","ky":"CaymanIslands","cf":"CentralAfricanRepublic","td":"Chad","cl":"Chile","cn":"China","cx":"ChristmasIsland","cc":"Cocos(Keeling)Islands","co":"Colombia","km":"Comoros","cg":"Congo","cd":"Congo,DemocraticRepublic","ck":"CookIslands","cr":"CostaRica","ci":"CoteD'Ivoire","hr":"Croatia","cu":"Cuba","cy":"Cyprus","cz":"CzechRepublic","dk":"Denmark","dj":"Djibouti","dm":"Dominica","do":"DominicanRepublic","ec":"Ecuador","eg":"Egypt","sv":"ElSalvador","gq":"EquatorialGuinea","er":"Eritrea","ee":"Estonia","et":"Ethiopia","fk":"FalklandIslands(Malvinas)","fo":"FaroeIslands","fj":"Fiji","fi":"Finland","fr":"France","gf":"FrenchGuiana","pf":"FrenchPolynesia","tf":"FrenchSouthernTerritories","ga":"Gabon","gm":"Gambia","ge":"Georgia","de":"Germany","gh":"Ghana","gi":"Gibraltar","gr":"Greece","gl":"Greenland","gd":"Grenada","gp":"Guadeloupe","gu":"Guam","gt":"Guatemala","gg":"Guernsey","gn":"Guinea","gw":"Guinea-Bissau","gy":"Guyana","ht":"Haiti","hm":"HeardIsland&McdonaldIslands","va":"HolySee(VaticanCityState)","hn":"Honduras","hk":"HongKong","hu":"Hungary","is":"Iceland","in":"India","id":"Indonesia","ir":"Iran,IslamicRepublicOf","iq":"Iraq","ie":"Ireland","im":"IsleOfMan","il":"Israel","it":"Italy","jm":"Jamaica","jp":"Japan","je":"Jersey","jo":"Jordan","kz":"Kazakhstan","ke":"Kenya","ki":"Kiribati","kr":"Korea","kw":"Kuwait","kg":"Kyrgyzstan","la":"LaoPeople'sDemocraticRepublic","lv":"Latvia","lb":"Lebanon","ls":"Lesotho","lr":"Liberia","ly":"LibyanArabJamahiriya","li":"Liechtenstein","lt":"Lithuania","lu":"Luxembourg","mo":"Macao","mk":"Macedonia","mg":"Madagascar","mw":"Malawi","my":"Malaysia","mv":"Maldives","ml":"Mali","mt":"Malta","mh":"MarshallIslands","mq":"Martinique","mr":"Mauritania","mu":"Mauritius","yt":"Mayotte","mx":"Mexico","fm":"Micronesia,FederatedStatesOf","md":"Moldova","mc":"Monaco","mn":"Mongolia","me":"Montenegro","ms":"Montserrat","ma":"Morocco","mz":"Mozambique","mm":"Myanmar","na":"Namibia","nr":"Nauru","np":"Nepal","nl":"Netherlands","an":"NetherlandsAntilles","nc":"NewCaledonia","nz":"NewZealand","ni":"Nicaragua","ne":"Niger","ng":"Nigeria","nu":"Niue","nf":"NorfolkIsland","mp":"NorthernMarianaIslands","no":"Norway","om":"Oman","pk":"Pakistan","pw":"Palau","ps":"PalestinianTerritory,Occupied","pa":"Panama","pg":"PapuaNewGuinea","py":"Paraguay","pe":"Peru","ph":"Philippines","pn":"Pitcairn","pl":"Poland","pt":"Portugal","pr":"PuertoRico","qa":"Qatar","re":"Reunion","ro":"Romania","ru":"RussianFederation","rw":"Rwanda","bl":"SaintBarthelemy","sh":"SaintHelena","kn":"SaintKittsAndNevis","lc":"SaintLucia","mf":"SaintMartin","pm":"SaintPierreAndMiquelon","vc":"SaintVincentAndGrenadines","ws":"Samoa","sm":"SanMarino","st":"SaoTomeAndPrincipe","sa":"SaudiArabia","sn":"Senegal","rs":"Serbia","sc":"Seychelles","sl":"SierraLeone","sg":"Singapore","sk":"Slovakia","si":"Slovenia","sb":"SolomonIslands","so":"Somalia","za":"SouthAfrica","gs":"SouthGeorgiaAndSandwichIsl.","es":"Spain","lk":"SriLanka","sd":"Sudan","sr":"Suriname","sj":"SvalbardAndJanMayen","sz":"Swaziland","se":"Sweden","ch":"Switzerland","sy":"SyrianArabRepublic","tw":"Taiwan","tj":"Tajikistan","tz":"Tanzania","th":"Thailand","tl":"Timor-Leste","tg":"Togo","tk":"Tokelau","to":"Tonga","tt":"TrinidadAndTobago","tn":"Tunisia","tr":"Turkey","tm":"Turkmenistan","tc":"TurksAndCaicosIslands","tv":"Tuvalu","ug":"Uganda","ua":"Ukraine","ae":"UnitedArabEmirates","gb":"UnitedKingdom","us":"UnitedStates","um":"UnitedStatesOutlyingIslands","uy":"Uruguay","uz":"Uzbekistan","vu":"Vanuatu","ve":"Venezuela","vn":"VietNam","vg":"VirginIslands,British","vi":"VirginIslands,U.S.","wf":"WallisAndFutuna","eh":"WesternSahara","ye":"Yemen","zm":"Zambia","zw":"Zimbabwe"};

let player = new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/salamander');
let sequenceVisualizer;
player.callbackObject = {
  run: (note) => {
    sequenceVisualizer.redraw(note, true);
  },
  stop: () => {
    const els = document.getElementById('visualizer').querySelectorAll('.active');
    for (let i = 0; i < els.length; i++) {
      els[i].removeAttribute('class');
    }
  }
}

// Map delta interval -> color. This is how I generated it, but I'm saving it
// as an array so that I don't have to load d3 to have colours.
// const warms = d3.scaleOrdinal(d3.quantize(d3.interpolateRdPu, 12+10));
// const colds = d3.scaleOrdinal(d3.quantize(d3.interpolateYlGnBu, 12+4));
const warms = ["rgb(255, 247, 243)","rgb(254, 238, 235)","rgb(254, 229, 226)","rgb(253, 220, 216)","rgb(252, 210, 206)","rgb(252, 198, 197)","rgb(251, 185, 190)","rgb(251, 171, 184)","rgb(250, 154, 179)","rgb(248, 135, 172)","rgb(246, 115, 166)","rgb(240, 94, 160)","rgb(231, 74, 155)","rgb(219, 55, 149)","rgb(204, 35, 142)","rgb(187, 19, 134)","rgb(168, 7, 128)","rgb(149, 2, 123)","rgb(130, 1, 119)","rgb(111, 1, 115)","rgb(92, 0, 111)","rgb(73, 0, 106)"];
const colds = ["rgb(255, 255, 217)","rgb(245, 251, 197)","rgb(232, 246, 183)","rgb(213, 238, 179)","rgb(186, 228, 181)","rgb(151, 215, 185)","rgb(115, 201, 189)","rgb(83, 187, 193)","rgb(57, 171, 194)","rgb(40, 151, 191)","rgb(33, 127, 183)","rgb(33, 102, 172)","rgb(35, 78, 160)","rgb(32, 57, 144)","rgb(23, 42, 119)","rgb(8, 29, 88)"];
const color = d => (d < 0) ? colds[Math.abs(d)%12+3] : warms[d%12+10];

function visualizeNoteSequence(ns, el, minPitch, maxPitch) {
  const viz = document.getElementById(el);
  sequenceVisualizer = new mm.PianoRollSVGVisualizer(ns, viz, {noteHeight:16, pixelsPerTimeStep:60, minPitch:minPitch, maxPitch:maxPitch});

  // Colour each note according to its pitch.
  const rects = viz.querySelectorAll('rect');
  let previousPitch = ns.notes[0].pitch
  ns.notes.forEach((n,i) => {
    const text = pitchToNote(n.pitch);
    rects[i].style.fill = color(n.pitch - previousPitch);
    previousPitch = n.pitch;

    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textEl.setAttribute('x', parseInt(rects[i].getAttribute('x')) + 4);
    textEl.setAttribute('y', parseInt(rects[i].getAttribute('y')) + 12);
    textEl.setAttribute('fill', 'white');
    textEl.textContent = text;
    viz.appendChild(textEl);
  });
}

function pitchToNote(p) {
  const n = mm.NoteSequence.KeySignature.Key[(p-36)%12];
  return n.replace('_SHARP', '#');
}

function getNoteSequenceFromDeltasAndTiming(deltas, timing) {
  // Make a NoteSequence out of these timings and deltas.
  const ns = {notes: [], quantizationInfo: {stepsPerQuarter: 4}};
  let previousPitch = 60;
  for (let i = 0; i < deltas.length; i++) {
    const pitch = previousPitch + deltas[i];

    ns.notes.push({pitch: pitch,
      velocity: 80,
      quantizedStartStep: timing.length > 0 ? timing[i][1] : 0,
      quantizedEndStep: timing.length > 0 ? timing[i][2] : 0
    });
    previousPitch = pitch;
  }
  ns.totalQuantizedSteps = ns.notes[ns.notes.length-1].quantizedEndStep;
  return ns;
}

function loadAllSamples() {
  const samples = {notes: [], quantizationInfo: {stepsPerQuarter: 4}};
  for (let i = 60-13; i < 60+13; i++) {
    samples.notes.push({pitch: i,
      velocity: 80,
      quantizedStartStep: 0,
      quantizedEndStep: 1
    });
  }
  player.loadSamples(samples);
}
