const TEAMS = [
  { abbr: 'ATL', name: 'Atlanta Hawks' },
  { abbr: 'BOS', name: 'Boston Celtics' },
  { abbr: 'BKN', name: 'Brooklyn Nets' },
  { abbr: 'CHA', name: 'Charlotte Hornets' },
  { abbr: 'CHI', name: 'Chicago Bulls' },
  { abbr: 'CLE', name: 'Cleveland Cavaliers' },
  { abbr: 'DAL', name: 'Dallas Mavericks' },
  { abbr: 'DEN', name: 'Denver Nuggets' },
  { abbr: 'DET', name: 'Detroit Pistons' },
  { abbr: 'GSW', name: 'Golden State Warriors' },
  { abbr: 'HOU', name: 'Houston Rockets' },
  { abbr: 'IND', name: 'Indiana Pacers' },
  { abbr: 'LAC', name: 'LA Clippers' },
  { abbr: 'LAL', name: 'Los Angeles Lakers' },
  { abbr: 'MEM', name: 'Memphis Grizzlies' },
  { abbr: 'MIA', name: 'Miami Heat' },
  { abbr: 'MIL', name: 'Milwaukee Bucks' },
  { abbr: 'MIN', name: 'Minnesota Timberwolves' },
  { abbr: 'NOP', name: 'New Orleans Pelicans' },
  { abbr: 'NYK', name: 'New York Knicks' },
  { abbr: 'OKC', name: 'Oklahoma City Thunder' },
  { abbr: 'ORL', name: 'Orlando Magic' },
  { abbr: 'PHI', name: 'Philadelphia 76ers' },
  { abbr: 'PHX', name: 'Phoenix Suns' },
  { abbr: 'POR', name: 'Portland Trail Blazers' },
  { abbr: 'SAC', name: 'Sacramento Kings' },
  { abbr: 'SAS', name: 'San Antonio Spurs' },
  { abbr: 'TOR', name: 'Toronto Raptors' },
  { abbr: 'UTA', name: 'Utah Jazz' },
  { abbr: 'WAS', name: 'Washington Wizards' },
];

let bids = new Array(30).fill(100);
let simResults = null;
let isRunning = false;
let shouldStop = false;
let bidsSortField = 'team';
let bidsSortDir = 'asc';

function getBidsSortOrder() {
  const indices = Array.from({ length: 30 }, (_, i) => i);
  if (bidsSortField === 'team') {
    indices.sort((a, b) => { const c = TEAMS[a].abbr.localeCompare(TEAMS[b].abbr); return bidsSortDir === 'asc' ? c : -c; });
  } else {
    indices.sort((a, b) => { const c = bids[a] - bids[b]; if (c !== 0) return bidsSortDir === 'asc' ? c : -c; return TEAMS[a].abbr.localeCompare(TEAMS[b].abbr); });
  }
  return indices;
}

function sortBidsBy(field) {
  if (bidsSortField === field) bidsSortDir = bidsSortDir === 'asc' ? 'desc' : 'asc';
  else { bidsSortField = field; bidsSortDir = field === 'bid' ? 'desc' : 'asc'; }
  updateSortButtons(); renderBidsList();
}

function updateSortButtons() {
  document.getElementById('sortTeamBtn').classList.toggle('active', bidsSortField === 'team');
  document.getElementById('sortBidBtn').classList.toggle('active', bidsSortField === 'bid');
  document.getElementById('sortTeamArrow').innerHTML = bidsSortDir === 'asc' ? '&#9650;' : '&#9660;';
  document.getElementById('sortBidArrow').innerHTML = bidsSortDir === 'asc' ? '&#9650;' : '&#9660;';
}

function renderBidsList() {
  const list = document.getElementById('bidsList'); list.innerHTML = '';
  for (const i of getBidsSortOrder()) {
    const row = document.createElement('div'); row.className = 'bid-row';
    row.innerHTML = `<span class="team-abbr">${TEAMS[i].abbr}</span><span class="team-name">${TEAMS[i].name}</span><input class="bid-input" type="number" min="0" max="9999" value="${bids[i]}" data-idx="${i}" onchange="updateBid(this)" onfocus="this.select()">`;
    list.appendChild(row);
  }
  updateTotal();
}

function updateBid(el) { bids[parseInt(el.dataset.idx)] = Math.max(0, parseInt(el.value) || 0); updateTotal(); }

function updateTotal() { document.getElementById('totalCredits').textContent = `Total: ${bids.reduce((a, b) => a + b, 0).toLocaleString()}`; }

function loadPreset(type) {
  if (type === 'random') bids = TEAMS.map(() => Math.floor(Math.random() * 200) + 1);
  else if (type === 'uniform') bids = new Array(30).fill(100);
  else if (type === 'linear') {
    const s = Array.from({ length: 30 }, (_, i) => i);
    for (let i = 29; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [s[i], s[j]] = [s[j], s[i]]; }
    bids = new Array(30).fill(0); for (let r = 0; r < 30; r++) bids[s[r]] = 5 * r;
  } else if (type === 'skewed') {
    bids = TEAMS.map(() => { const z = (Math.random() + Math.random() + Math.random() - 1.5) / 0.5; return Math.max(0, Math.min(500, Math.round(Math.exp(3.8 + 0.9 * z)))); });
  }
  renderBidsList();
}

function shareConfig() {
  const params = new URLSearchParams();
  params.set('b', bids.join(',')); params.set('w', document.getElementById('windowSize').value); params.set('n', document.getElementById('numSims').value);
  const qs = '?' + params.toString();
  let url; try { const o = window.location.origin, p = window.location.pathname; url = (o && o !== 'null' && !p.includes('srcdoc')) ? o + p + qs : qs; } catch(e) { url = qs; }
  const input = document.getElementById('shareUrl'); input.value = url; input.select();
  navigator.clipboard.writeText(url).then(() => { const f = document.getElementById('copiedFlash'); f.classList.add('show'); setTimeout(() => f.classList.remove('show'), 1500); }).catch(() => {});
}

function loadFromUrl() {
  const p = new URLSearchParams(window.location.search);
  if (p.has('b')) { const v = p.get('b').split(',').map(Number); if (v.length === 30 && v.every(x => !isNaN(x) && x >= 0)) bids = v; }
  if (p.has('w')) { const w = parseInt(p.get('w')); if (w >= 1 && w <= 30) document.getElementById('windowSize').value = w; }
  if (p.has('n')) { const n = parseInt(p.get('n')); if (n >= 100 && n <= 1000000) document.getElementById('numSims').value = n; }
}

const HEATMAP = { cellW: 38, cellH: 32, labelW: 86, labelH: 68, bidColW: 60 };
let heatmapSortedTeams = [];

function simulateOnce(teamBids, windowSize) {
  const n = teamBids.length;
  const indices = Array.from({ length: n }, (_, i) => i);
  const tb = indices.map(() => Math.random());
  indices.sort((a, b) => teamBids[b] !== teamBids[a] ? teamBids[b] - teamBids[a] : tb[a] - tb[b]);
  const picks = new Array(n).fill(-1), costs = new Array(n).fill(0);
  const sB = indices.map(i => teamBids[i]);
  const zB = [], nzB = [];
  for (let j = 0; j < n; j++) { if (sB[j] === 0) zB.push(j); else nzB.push(j); }
  let pN = 0, wS = 0, w = [];
  for (let j = 0; j < Math.min(windowSize, nzB.length); j++) { w.push(nzB[j]); wS = j + 1; }
  while (w.length > 0 && pN < n) {
    const tot = w.reduce((s, j) => s + sB[j], 0); if (tot === 0) break;
    let r = Math.random() * tot, wi = w[0];
    for (const j of w) { r -= sB[j]; if (r <= 0) { wi = j; break; } }
    const mb = Math.min(...w.map(j => sB[j]));
    picks[indices[wi]] = pN; costs[indices[wi]] = mb; pN++;
    w = w.filter(j => j !== wi);
    if (wS < nzB.length) { w.push(nzB[wS]); wS++; }
    if (w.length === 0 && wS < nzB.length) { w.push(nzB[wS]); wS++; }
  }
  const sh = zB.sort(() => Math.random() - 0.5);
  for (const j of sh) { picks[indices[j]] = pN; costs[indices[j]] = 0; pN++; }
  return { picks, costs };
}

async function runSimulations() {
  const numSims = Math.min(1000000, Math.max(100, parseInt(document.getElementById('numSims').value) || 10000));
  const windowSize = Math.min(30, Math.max(1, parseInt(document.getElementById('windowSize').value) || 4));
  document.getElementById('numSims').value = numSims; document.getElementById('windowSize').value = windowSize;
  const teamBids = [...bids], n = 30;
  const pickDist = Array.from({ length: n }, () => new Array(n).fill(0)), totalCosts = new Array(n).fill(0);
  isRunning = true; shouldStop = false;
  document.getElementById('runBtn').disabled = true; document.getElementById('stopBtn').style.display = '';
  document.getElementById('progressOuter').style.display = '';
  const batch = 500; let done = 0;
  const st = document.getElementById('statusText'), pi = document.getElementById('progressInner');
  for (let b = 0; b < numSims && !shouldStop; b += batch) {
    const end = Math.min(b + batch, numSims);
    for (let s = b; s < end; s++) { const r = simulateOnce(teamBids, windowSize); for (let t = 0; t < n; t++) { pickDist[t][r.picks[t]]++; totalCosts[t] += r.costs[t]; } }
    done = end; st.innerHTML = `<span class="running">Running\u2026</span> ${done.toLocaleString()} / ${numSims.toLocaleString()}`;
    pi.style.width = (done / numSims * 100).toFixed(0) + '%'; await new Promise(r => setTimeout(r, 0));
  }
  isRunning = false; document.getElementById('runBtn').disabled = false; document.getElementById('stopBtn').style.display = 'none';
  st.innerHTML = shouldStop ? `<span class="done">Stopped</span> at ${done.toLocaleString()}` : `<span class="done">Done</span> \u2014 ${done.toLocaleString()} simulations`;
  simResults = { pickDist, totalCosts, numSims: done, teamBids, windowSize }; renderResults();
}

function stopSimulations() { shouldStop = true; }

function renderResults() {
  if (!simResults) return;
  const { pickDist, totalCosts, numSims, teamBids } = simResults; const n = 30;
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('heatmapArea').style.display = '';
  document.getElementById('summaryArea').style.display = '';
  document.getElementById('simCount').textContent = `(n = ${numSims.toLocaleString()})`;
  const sorted = Array.from({ length: n }, (_, i) => i);
  sorted.sort((a, b) => teamBids[b] - teamBids[a]);
  heatmapSortedTeams = sorted;
  renderHeatmap(sorted, pickDist, teamBids, numSims);
  renderSummary(sorted, pickDist, totalCosts, teamBids, numSims);
}

function renderHeatmap(sortedTeams, pickDist, teamBids, numSims) {
  const canvas = document.getElementById('heatmapCanvas'), ctx = canvas.getContext('2d'), n = 30;
  const { cellW, cellH, labelW, labelH, bidColW } = HEATMAP;
  const width = labelW + bidColW + n * cellW + 12, height = labelH + n * cellH + 12;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr; canvas.height = height * dpr;
  canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
  ctx.scale(dpr, dpr); ctx.clearRect(0, 0, width, height);

  let maxProb = 0;
  for (let t = 0; t < n; t++) for (let p = 0; p < n; p++) { const pr = pickDist[t][p] / numSims; if (pr > maxProb) maxProb = pr; }

  ctx.font = `500 13px 'IBM Plex Mono', monospace`; ctx.fillStyle = '#888'; ctx.textAlign = 'center';
  for (let p = 0; p < n; p++) ctx.fillText(String(p + 1), labelW + bidColW + p * cellW + cellW / 2, labelH - 14);
  ctx.font = `600 11px 'IBM Plex Mono', monospace`;
  ctx.fillText('Pick \u2192', labelW + bidColW + (n * cellW) / 2, labelH - 40);
  ctx.textAlign = 'right'; ctx.fillText('Bid', labelW + bidColW - 10, labelH - 14);

  for (let row = 0; row < n; row++) {
    const ti = sortedTeams[row], y = labelH + row * cellH;
    if (row % 2 === 0) { ctx.fillStyle = '#f7f5f0'; ctx.fillRect(0, y, width, cellH); }

    ctx.textAlign = 'left'; ctx.font = `600 13px 'IBM Plex Mono', monospace`; ctx.fillStyle = '#1a1a1a';
    ctx.fillText(TEAMS[ti].abbr, 8, y + cellH / 2 + 5);
    ctx.textAlign = 'right'; ctx.font = `400 12px 'IBM Plex Mono', monospace`; ctx.fillStyle = '#888';
    ctx.fillText(String(teamBids[ti]), labelW + bidColW - 10, y + cellH / 2 + 5);

    for (let p = 0; p < n; p++) {
      const prob = pickDist[ti][p] / numSims, x = labelW + bidColW + p * cellW;
      const raw = maxProb > 0 ? prob / maxProb : 0;
      const intensity = Math.sqrt(raw);

      if (intensity > 0.02) {
        const alpha = 0.05 + 0.75 * intensity;
        const r = Math.round(0 + (180 - 0) * (1 - intensity));
        const g = Math.round(122 + (210 - 122) * (1 - intensity));
        const b = Math.round(51 + (160 - 51) * (1 - intensity));
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fillRect(x + 0.0005, y + 0.0005, cellW - 0.0001, cellH - 0.0001);
      }

      if (prob >= 0.005) {
        const pctVal = Math.round(prob * 100);
        if (pctVal > 0) {
          ctx.textAlign = 'center'; ctx.font = `500 12px 'IBM Plex Mono', monospace`;
          ctx.fillStyle = intensity > 0.55 ? '#fff' : intensity > 0.25 ? '#1a4a2a' : '#aaa';
          ctx.fillText(String(pctVal), x + cellW / 2, y + cellH / 2 + 4);
        }
      }
    }
  }
}

// Hover tooltip
(function() {
  const canvas = document.getElementById('heatmapCanvas'), tooltip = document.getElementById('heatmapTooltip'), container = canvas.parentElement;
  canvas.addEventListener('mousemove', function(e) {
    if (!simResults) { tooltip.style.display = 'none'; return; }
    const rect = canvas.getBoundingClientRect();
    const sx = parseFloat(canvas.style.width) / rect.width, sy = parseFloat(canvas.style.height) / rect.height;
    const mx = (e.clientX - rect.left) * sx, my = (e.clientY - rect.top) * sy;
    const { cellW, cellH, labelW, labelH, bidColW } = HEATMAP;
    const col = Math.floor((mx - labelW - bidColW) / cellW), row = Math.floor((my - labelH) / cellH);
    if (col < 0 || col >= 30 || row < 0 || row >= 30) { tooltip.style.display = 'none'; return; }
    const ti = heatmapSortedTeams[row], count = simResults.pickDist[ti][col], prob = count / simResults.numSims;
    tooltip.innerHTML = `<span class="tt-team">${TEAMS[ti].abbr}</span> ${TEAMS[ti].name}<br><span class="tt-label">Pick</span> #${col + 1} &middot; <span class="tt-label">Bid</span> ${simResults.teamBids[ti]}<br><span class="tt-prob">${(prob * 100).toFixed(2)}%</span> <span class="tt-label">(${count.toLocaleString()} / ${simResults.numSims.toLocaleString()})</span>`;
    tooltip.style.display = 'block';
    const cr = container.getBoundingClientRect();
    let tx = e.clientX - cr.left + 14, ty = e.clientY - cr.top - 8;
    if (tx + tooltip.offsetWidth + 4 > container.clientWidth) tx = e.clientX - cr.left - tooltip.offsetWidth - 10;
    if (ty + tooltip.offsetHeight + 4 > container.clientHeight) ty = e.clientY - cr.top - tooltip.offsetHeight - 10;
    if (ty < 0) ty = 4;
    tooltip.style.left = tx + 'px'; tooltip.style.top = ty + 'px';
  });
  canvas.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });
})();

function renderSummary(sortedTeams, pickDist, totalCosts, teamBids, numSims) {
  const n = 30, tbody = document.getElementById('summaryBody'); tbody.innerHTML = '';
  for (const ti of sortedTeams) {
    const dist = pickDist[ti], bid = teamBids[ti];
    let avg = 0; for (let p = 0; p < n; p++) avg += (p + 1) * dist[p]; avg /= numSims;
    let cum = 0, med = 30; for (let p = 0; p < n; p++) { cum += dist[p]; if (cum >= numSims / 2) { med = p + 1; break; } }
    let best = 30, worst = 1;
    for (let p = 0; p < n; p++) { if (dist[p] > 0) { best = p + 1; break; } }
    for (let p = n - 1; p >= 0; p--) { if (dist[p] > 0) { worst = p + 1; break; } }
    let t3 = 0, t10 = 0; for (let p = 0; p < 3; p++) t3 += dist[p]; for (let p = 0; p < 10; p++) t10 += dist[p];
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${TEAMS[ti].abbr}</td><td>${bid}</td><td>${avg.toFixed(1)}</td><td>${med}</td><td>${best}</td><td>${worst}</td><td>${(t3/numSims*100).toFixed(1)}%</td><td>${(t10/numSims*100).toFixed(1)}%</td><td>${(totalCosts[ti]/numSims).toFixed(1)}</td>`;
    tbody.appendChild(tr);
  }
  document.getElementById('exportCsvBtn').style.display = '';
}

function exportCsv() {
  if (!simResults) return;
  const { pickDist, totalCosts, numSims, teamBids } = simResults;
  const n = 30;
  const sorted = Array.from({ length: n }, (_, i) => i);
  sorted.sort((a, b) => teamBids[b] - teamBids[a]);
  const header = ['Team', 'Bid', 'Avg Pick', 'Median', 'Best', 'Worst', 'P(Top 3)', 'P(Top 10)', 'Avg Cost'];
  for (let p = 1; p <= 30; p++) header.push('P(Pick ' + p + ')');
  const rows = [header.join(',')];
  for (const ti of heatmapSortedTeams) {
    const dist = pickDist[ti], bid = teamBids[ti];
    let avg = 0; for (let p = 0; p < n; p++) avg += (p + 1) * dist[p]; avg /= numSims;
    let cum = 0, med = 30; for (let p = 0; p < n; p++) { cum += dist[p]; if (cum >= numSims / 2) { med = p + 1; break; } }
    let best = 30, worst = 1;
    for (let p = 0; p < n; p++) { if (dist[p] > 0) { best = p + 1; break; } }
    for (let p = n - 1; p >= 0; p--) { if (dist[p] > 0) { worst = p + 1; break; } }
    let t3 = 0, t10 = 0; for (let p = 0; p < 3; p++) t3 += dist[p]; for (let p = 0; p < 10; p++) t10 += dist[p];
    const row = [
      TEAMS[ti].abbr, bid, avg.toFixed(1), med, best, worst,
      (t3 / numSims * 100).toFixed(1) + '%',
      (t10 / numSims * 100).toFixed(1) + '%',
      (totalCosts[ti] / numSims).toFixed(1)
    ];
    for (let p = 0; p < n; p++) row.push((dist[p] / numSims * 100).toFixed(2) + '%');
    rows.push(row.join(','));
  }
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'lottery_simulation.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

// Step-through
let stepState = null;

function toggleStepthrough() {
  document.getElementById('stepBody').classList.toggle('open');
  document.getElementById('stepToggleArrow').classList.toggle('open');
}

function stepNew() {
  const windowSize = Math.min(30, Math.max(1, parseInt(document.getElementById('windowSize').value) || 4));
  const teamBids = [...bids], n = 30;
  const indices = Array.from({ length: n }, (_, i) => i);
  const tb = indices.map(() => Math.random());
  indices.sort((a, b) => teamBids[b] !== teamBids[a] ? teamBids[b] - teamBids[a] : tb[a] - tb[b]);
  const sB = indices.map(i => teamBids[i]);
  const zB = [], nzB = [];
  for (let j = 0; j < n; j++) { if (sB[j] === 0) zB.push(j); else nzB.push(j); }
  const steps = [];
  let pN = 0, wS = 0, w = [];
  for (let j = 0; j < Math.min(windowSize, nzB.length); j++) { w.push(nzB[j]); wS = j + 1; }
  while (w.length > 0 && pN < n) {
    const tot = w.reduce((s, j) => s + sB[j], 0); if (tot === 0) break;
    const wi = w.map(j => ({ sortIdx: j, teamIdx: indices[j], bid: sB[j], prob: sB[j] / tot }));
    let r = Math.random() * tot, ws = w[0];
    for (const j of w) { r -= sB[j]; if (r <= 0) { ws = j; break; } }
    const mb = Math.min(...w.map(j => sB[j])), wti = indices[ws];
    steps.push({ pickNum: pN, window: wi, winnerTeamIdx: wti, winnerBid: teamBids[wti], minBid: mb, cost: mb, refund: teamBids[wti] - mb });
    pN++; w = w.filter(j => j !== ws);
    if (wS < nzB.length) { w.push(nzB[wS]); wS++; }
    if (w.length === 0 && wS < nzB.length) { w.push(nzB[wS]); wS++; }
  }
  for (const j of [...zB].sort(() => Math.random() - 0.5)) {
    steps.push({ pickNum: pN, window: [{ sortIdx: j, teamIdx: indices[j], bid: 0, prob: 1 }], winnerTeamIdx: indices[j], winnerBid: 0, minBid: 0, cost: 0, refund: 0, isZeroBid: true });
    pN++;
  }
  stepState = { steps, teamBids, windowSize, currentStep: -1, indices, sortedBids: sB };
  document.getElementById('stepNextBtn').disabled = false;
  document.getElementById('stepAllBtn').disabled = false;
  document.getElementById('stepPrevBtn').disabled = true;
  document.getElementById('stepInfo').textContent = `Lottery ready \u2014 ${steps.length} picks`;
  renderStep();
}

function stepNext() { if (!stepState || stepState.currentStep >= stepState.steps.length - 1) return; stepState.currentStep++; updateStepBtns(); renderStep(); }
function stepPrev() { if (!stepState || stepState.currentStep < 0) return; stepState.currentStep--; updateStepBtns(); renderStep(); }
function stepAll() { if (!stepState) return; stepState.currentStep = stepState.steps.length - 1; updateStepBtns(); renderStep(); }

function updateStepBtns() {
  const s = stepState;
  document.getElementById('stepPrevBtn').disabled = s.currentStep < 0;
  document.getElementById('stepNextBtn').disabled = s.currentStep >= s.steps.length - 1;
  document.getElementById('stepAllBtn').disabled = s.currentStep >= s.steps.length - 1;
  document.getElementById('stepInfo').textContent = s.currentStep < 0 ? `Lottery ready \u2014 ${s.steps.length} picks` : `Pick ${s.currentStep + 1} of ${s.steps.length}`;
}

function renderStep() {
  const c = document.getElementById('stepContent'), s = stepState;
  if (!s) { c.innerHTML = ''; return; }
  if (s.currentStep < 0) { c.innerHTML = renderInitBidOrder(); return; }
  const step = s.steps[s.currentStep], alloc = s.steps.slice(0, s.currentStep + 1);
  let h = `<div class="step-pick-label">Pick #${step.pickNum + 1}${step.isZeroBid ? ' (zero-bid)' : ''}</div>`;
  const wt = TEAMS[step.winnerTeamIdx];
  h += `<div class="step-winner-banner"><span class="winner-team">${wt.abbr}</span> ${wt.name} wins pick #${step.pickNum + 1}<br><span class="winner-detail">Bid: ${step.winnerBid} \u2022 Charged: ${step.cost}</span></div>`;
  if (!step.isZeroBid) {
    h += `<div class="step-table-scroll"><table class="step-table"><thead><tr><th>Team</th><th>Bid</th><th class="r">Probability</th><th class="r">Result</th></tr></thead><tbody>`;
    for (const e of step.window) { const t = TEAMS[e.teamIdx], iw = e.teamIdx === step.winnerTeamIdx; h += `<tr class="${iw ? 'winner' : ''}"><td class="team-cell">${t.abbr}</td><td>${e.bid}</td><td class="r">${(e.prob * 100).toFixed(1)}%</td><td class="r">${iw ? '\u2713 Winner' : ''}</td></tr>`; }
    h += `</tbody></table></div>`;
  }
  h += `<div class="step-allocated"><div class="step-allocated-title">Picks allocated (${alloc.length} / ${s.steps.length})</div><div class="step-allocated-list">`;
  for (const a of alloc) h += `<span class="step-pick-chip"><span class="chip-pick">#${a.pickNum + 1}</span> <span class="chip-team">${TEAMS[a.winnerTeamIdx].abbr}</span></span>`;
  h += `</div></div>`; c.innerHTML = h;
}

function renderInitBidOrder() {
  const s = stepState;
  let h = `<div class="step-pick-label">Initial Bid Order</div><div class="step-table-scroll"><table class="step-table"><thead><tr><th>#</th><th>Team</th><th class="r">Bid</th></tr></thead><tbody>`;
  for (let i = 0; i < s.indices.length; i++) {
    const ti = s.indices[i], bid = s.teamBids[ti], inW = i < s.windowSize && bid > 0;
    h += `<tr class="${inW ? 'in-window' : ''} ${bid === 0 ? 'already-picked' : ''}"><td>${i + 1}</td><td class="team-cell">${TEAMS[ti].abbr}</td><td class="r">${bid}</td></tr>`;
  }
  h += `</tbody></table></div><div style="font-family:var(--mono);font-size:0.62rem;color:var(--text-tertiary);margin-top:0.4rem;">Highlighted = initial window (top ${s.windowSize} bidders). Click Next to draw pick #1.</div>`;
  return h;
}

loadFromUrl(); renderBidsList();
if (bids.every(b => b === 100)) loadPreset('linear');
