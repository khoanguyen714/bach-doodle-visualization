let tooltipIsExpanded = false;

/*********************
 * D3 -> Note Sequence
 *********************/
function getMostLikelyTiming(d) {
  const possibleTimings = d.descendants().map(d => d.data.timing ? [d.data.value, d.data.timing]: [0,[]]);
  possibleTimings.sort((a,b) => b[0] - a[0]);
  return possibleTimings[0][1];
}

function getNoteSequenceFromData(d) {
  let deltas, timing;
  if (d.deltas) {
    deltas = d.deltas;
    timing = d.timing;
  } else {
    deltas = d.ancestors().map(d => parseInt(d.data.name) || 0).reverse();
    timing = getMostLikelyTiming(d);
  }
  return getNoteSequenceFromDeltasAndTiming(deltas, timing);
}

/*********************
 * D3 viz drawing
 *********************/
function drawSunburst(data, radius) {
  // https://observablehq.com/@d3/sunburst with tons of changes
  const viewRadius = radius;
  const partition = data => d3.partition().size([2 * Math.PI, viewRadius])
                    (d3.hierarchy(data)
                      .sum(d => d.value)
                      .sort((a, b) => b.value - a.value))
  const root = partition(data);

  // Add an ID to every element so that we can find it later.
  let i = 0;
  root.each((d) => d.elementIndex = i++);

  const degree = 2 * Math.PI / 360 / 5;
  let arc, svg;

  svg = d3.select('#svg')
    .style('width', radius) // to fit right side labels a bit better
    .style('height', radius)
    .append('g');

  arc = d3.arc()
    .startAngle(d => d.x0 - degree)
    .endAngle(d => d.x1 + degree)
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(0)
    .innerRadius(d => d.y0)
    .outerRadius(d => d.y1 - 3)

  const paths = svg.selectAll('path')
      .data(root.descendants().filter(d => d.depth))
      .enter()
      .append('path')
      .attr('fill', fill)
      .attr('fill-opacity', 1)
      .style('cursor', 'pointer')
      .attr('id', (d) => `p${d.elementIndex}`)
      .attr('d', arc)

    paths
      .on('click', handleClick)
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut)
  svg.node();

  const el = document.getElementById('svg');
  const box = el.getBBox();
  el.setAttribute('viewBox', `${box.x} ${box.y} ${box.width} ${box.height}`);
}

let annotations, makeAnnotations;
function drawLabels(labels) {
  annotations = [];

  for (let i = 0; i < labels.length; i++) {
    const obj = {};
    obj.note = {title: labels[i].name, wrap: 300, bgPadding: 20};
    obj.connector = {end: 'dot', endScale: 4};

    const el = document.getElementById('p' + labels[i].id);
    if (!el) {
      debugger
    }
    const bbox = el.getBBox();
    obj.x = bbox.x + bbox.width/2;
    obj.y = bbox.y + bbox.height/2;

    obj.dx = (obj.x < 0) ? -50: 20;
    obj.dy = (obj.y > 0) ? 50 : -50
    annotations.push(obj);
  }

  makeAnnotations = d3.annotation()
    .type(d3.annotationCallout)
    .notePadding(15)
    .editMode(true)
    .annotations(annotations);

  d3.select('#svg')
    .append('g')
    .attr('class', 'annotation')
    .call(makeAnnotations);
}

function zoomPie(el) {
  const radius = (window.innerWidth - 100) / 2;
  const arc = d3.arc()
    .startAngle(d => d.x0 - 10/360)
    .endAngle(d => d.x1 + 10/360)
    .padAngle(d => Math.min((d.x1 - d.x0), 0.005))
    .padRadius(radius / 2)
    .innerRadius(d => d.y0 - 10)
    .outerRadius(d => d.y1 + 10)
  el
  .attr('d_', el.attr('d'))
  .attr('d', arc)
  .attr('fill-opacity', 1)
  .classed('zoom', true);
}

function unzoomPie() {
  d3.selectAll('.zoom').each(function (d,i) { // don't use fat arrow to keep the weird this.
    const el = d3.select(this);
    el.attr('d', el.attr('d_'))
      .attr('fill-opacity', 1)
      .classed('zoom', false);
  });
}


function fill(d) {
  if (!d.depth) return '#ccc';
  if (d.data.unseen) return '#FFD138';
  return color(parseInt(d.data.name));
}

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
    d3.select(viz).append('text')
      .text(text)
      .attr('x', parseInt(rects[i].getAttribute('x')) + 4)
      .attr('y', parseInt(rects[i].getAttribute('y')) + 12)
      .attr('fill', 'white');
  });
}

/*********************
 * Tooltip
 *********************/
// el is a d3 element
function showTooltip(d, el) {
  // Display the value.
  document.getElementById('valueText').textContent = d.value;

  let totalSessions = 0;
  d.descendants().forEach(x => totalSessions += (x.data.sessions || 0));
  document.getElementById('sessionsText').textContent = totalSessions;

  unseenSession.hidden = !d.data.unseen;

  const tooltip = document.getElementById('tooltip');
  tooltip.removeAttribute('hidden');

  // Position and show the tooltip.
  const rekt = el.node().getBoundingClientRect();
  const tooltipRekt = tooltip.getBoundingClientRect();

  // Center them above the path.
  let newY = rekt.y - tooltipRekt.height - 10;
  let newX = rekt.x - rekt.width/2 - tooltipRekt.width/2;
  d3.select(tooltip)
    .style('top', newY + document.scrollingElement.scrollTop + 'px')
    .style('left', newX + document.scrollingElement.scrollLeft + 'px');
}

function hideTooltip() {
  if (tooltipIsExpanded) {
    return;
  }
  document.getElementById('tooltip').setAttribute('hidden', true);
}

function closeTooltip() {
  stopMelody();
  document.getElementById('tooltip').classList.remove('expanded');
  tooltipIsExpanded = false;
  hideTooltip();
  handleMouseOutForEl();
}
/*********************
 * Mouse events
 *********************/
function handleClick(d) {
  // If the tooltip is already expanded, close it (imagine someone clicked outside it).
  // otherwise, do the open dance.
  if (tooltipIsExpanded) {
    closeTooltip();
    window.location.hash = 'all'; // not the empty string so that it doesn't cause a page refresh
    return;
  }
  tooltipIsExpanded = true;

  // Expand the tooltip.
  document.getElementById('tooltip').classList.add('expanded');
  const ns = getNoteSequenceFromData(d);
  player.loadSamples(ns);
  visualizeNoteSequence(ns, 'visualizer');

  // Position it in the center of the svg.
  const parentRekt = svg.getBoundingClientRect();
  const tooltipRekt = tooltip.getBoundingClientRect();
  const y = parentRekt.top + (parentRekt.height - tooltipRekt.height) / 2;
  const x = parentRekt.left + (parentRekt.width - tooltipRekt.width) / 2;
  d3.select(tooltip)
    .style('top', y + document.scrollingElement.scrollTop + 'px')
    .style('left', x + document.scrollingElement.scrollLeft + 'px');
  tooltip.scrollIntoView();

  // So that we can hardlink.
  window.location.hash = d.elementIndex;
  melodyTweetLink.href = 'https://twitter.com/intent/tweet?text=' +
  encodeURI(`Listen to this melody from the Bach Doodle dataset! \
https://meowni.ca/doodle-data-explorer/overall.html#${d.elementIndex} #madewithmagenta`);
}

function handleMouseOver(d) {
  if (tooltipIsExpanded) {
    return;
  }
  handleMouseOverForEl(d, d3.select(this));
}

function handleMouseOut() {
  if (tooltipIsExpanded) {
    return;
  }
  handleMouseOutForEl(d3.select(this));
}

function handleMouseOverForEl(d, el) {
  window.location.hash = 'all'; // not the empty string so that it doesn't cause a page refresh

  // Fade all the segments.
  const ancestors = d.ancestors().reverse();
  const svg = d3.select('#svg');

  zoomPie(el);

  // Fade everything else.
  svg.selectAll('path').style('fill-opacity', 0.3);
  svg.selectAll('.annotation').style('fill-opacity', 0.3);
  svg.selectAll('.annotation').style('stroke-opacity', 0.3);

  // Highlight these ancestors.
  svg.selectAll('path')
    .filter((node) => ancestors.indexOf(node) >= 0)
    .style('fill-opacity', 1);

  requestAnimationFrame(() => {
    showTooltip(d, el);
  });

}

function handleMouseOutForEl() {
  hideTooltip();
  unzoomPie();
  restoreOpacities();
}

function restoreOpacities() {
  const svg = d3.select('#svg');
  svg.selectAll('path').style('fill-opacity', 1);
  svg.selectAll('.annotation').style('fill-opacity', 1);
  svg.selectAll('.annotation').style('stroke-opacity', 1);
}

function handleForceSelect(i, data) {
  const el = d3.select(`#p${i}`);
  const d = data || el.data()[0];

  if (!d) {
    return;
  }
  handleMouseOverForEl(d, el);
  handleClick(d, el);
}
