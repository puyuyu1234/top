// 農奴たち（各要素がチューリップ数）
let serfs = Array(1000).fill(10);
let rounds = 0;
let chart = null;

// DOM要素
const roundCount = document.getElementById('roundCount');
const aliveCount = document.getElementById('aliveCount');
const deadCount = document.getElementById('deadCount');

// 1回の対戦を実行
function battle() {
  if (serfs.length < 2) return;

  // シャッフル（休む人もランダムになる）
  for (let i = serfs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [serfs[i], serfs[j]] = [serfs[j], serfs[i]];
  }

  // ペアで対戦
  for (let i = 0; i + 1 < serfs.length; i += 2) {
    if (Math.random() < 0.5) {
      serfs[i]++;
      serfs[i + 1]--;
    } else {
      serfs[i]--;
      serfs[i + 1]++;
    }
  }

  // 0になった農奴を削除
  serfs = serfs.filter(t => t > 0);

  rounds++;
}

// 複数回対戦
function battleMultiple(n) {
  for (let i = 0; i < n; i++) {
    battle();
  }
  updateUI();
}

// UI更新
function updateUI() {
  roundCount.textContent = rounds;
  aliveCount.textContent = serfs.length;
  deadCount.textContent = 1000 - serfs.length;
  drawChart();
}

// グラフ描画
function drawChart() {
  // チューリップ数ごとの人数を集計
  const counts = {};
  const deadCount = 1000 - serfs.length;
  if (deadCount > 0) {
    counts[0] = deadCount;
  }
  serfs.forEach(t => {
    counts[t] = (counts[t] || 0) + 1;
  });

  const maxTulips = serfs.length > 0 ? Math.max(...serfs) : 0;
  const labels = [];
  const data = [];

  const Y_MAX = 500;
  for (let t = 0; t <= maxTulips; t++) {
    labels.push(t);
    const count = counts[t] || 0;
    data.push(Math.min(count, Y_MAX)); // 表示用は100で打ち止め
  }

  // 実際の値（ラベル表示用）
  const realData = [];
  for (let t = 0; t <= maxTulips; t++) {
    realData.push(counts[t] || 0);
  }

  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.data.datasets[0].realData = realData;
    chart.update();
  } else {
    const ctx = document.getElementById('chart').getContext('2d');
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '人数',
          data: data,
          realData: realData,
          backgroundColor: '#4a7c59'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: 'チューリップ数' } },
          y: {
            title: { display: true, text: '人数' },
            beginAtZero: true,
            max: Y_MAX
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const real = context.dataset.realData[context.dataIndex];
                return `人数: ${real}`;
              }
            }
          }
        }
      },
      plugins: [{
        // 棒の上に実際の数値を表示
        afterDatasetsDraw: (chart) => {
          const ctx = chart.ctx;
          chart.data.datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);
            meta.data.forEach((bar, index) => {
              const real = dataset.realData[index];
              if (real > Y_MAX) {
                ctx.fillStyle = '#333';
                ctx.font = '10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(real, bar.x, bar.y - 5);
              }
            });
          });
        }
      }]
    });
  }
}

// リセット
function reset() {
  serfs = Array(1000).fill(10);
  rounds = 0;
  updateUI();
}

// 自動再生
let autoInterval = null;
const btnAuto = document.getElementById('btnAuto');
const speedInput = document.getElementById('speed');

function toggleAuto() {
  if (autoInterval) {
    clearInterval(autoInterval);
    autoInterval = null;
    btnAuto.textContent = '自動再生';
    btnAuto.classList.remove('active');
  } else {
    const speed = parseInt(speedInput.value) || 2;
    // 低速(≤10)は素直にinterval計算、高速(>10)は100ms固定でバトル数増加
    const interval = speed <= 10 ? 1000 / speed : 100;
    const battlesPerTick = speed <= 10 ? 1 : Math.ceil(speed / 10);
    autoInterval = setInterval(() => {
      for (let i = 0; i < battlesPerTick; i++) {
        battle();
      }
      updateUI();
      // 生存者が1人以下になったら停止
      if (serfs.length < 2) {
        toggleAuto();
      }
    }, interval);
    btnAuto.textContent = '停止';
    btnAuto.classList.add('active');
  }
}

// ボタンのイベント
document.getElementById('btn1').onclick = () => battleMultiple(1);
document.getElementById('btn10').onclick = () => battleMultiple(10);
document.getElementById('btn100').onclick = () => battleMultiple(100);
document.getElementById('btn1000').onclick = () => battleMultiple(1000);
document.getElementById('btnReset').onclick = reset;
btnAuto.onclick = toggleAuto;

// 初期描画
updateUI();
