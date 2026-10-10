import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FoodCard } from './components/FoodCard.jsx';
import { GameModal } from './components/GameModal.jsx';
import { IntroModal } from './components/IntroModal.jsx';
import { MissionRail } from './components/MissionRail.jsx';
import { NutritionPanel } from './components/NutritionPanel.jsx';
import { Sprite } from './components/Sprite.jsx';
import { useMenu } from './hooks/useMenu.js';
import { createRoundFoods, evaluateStack, MISSIONS, sumNutrition } from './lib/game.js';

const ROUND_SECONDS = 50;

function App() {
  const { foods, source, loading, message, refresh } = useMenu();
  const [phase, setPhase] = useState('intro');
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState([]);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [totalScore, setTotalScore] = useState(0);
  const [result, setResult] = useState(null);
  const [bestScore, setBestScore] = useState(() => Number(localStorage.getItem('mcstack-best') || 0));
  const [helpOpen, setHelpOpen] = useState(false);
  const timeRef = useRef(timeLeft);

  const mission = MISSIONS[roundIndex];
  const roundFoods = useMemo(() => createRoundFoods(foods, roundIndex), [foods, roundIndex]);
  const nutrition = useMemo(() => sumNutrition(selected), [selected]);

  useEffect(() => {
    timeRef.current = timeLeft;
  }, [timeLeft]);

  const finishRound = useCallback(() => {
    if (phase !== 'playing') return;
    const nextResult = evaluateStack(selected, mission, timeRef.current);
    setResult(nextResult);
    setTotalScore((score) => score + nextResult.score);
    setPhase('result');
  }, [mission, phase, selected]);

  const restart = useCallback(() => {
    setRoundIndex(0);
    setSelected([]);
    setTimeLeft(ROUND_SECONDS);
    setTotalScore(0);
    setResult(null);
    setPhase('playing');
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return undefined;
    const timer = window.setInterval(() => {
      setTimeLeft((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase, roundIndex]);

  useEffect(() => {
    if (phase === 'playing' && timeLeft === 0) finishRound();
  }, [finishRound, phase, timeLeft]);

  const toggleFood = useCallback((food) => {
    if (phase !== 'playing') return;
    setSelected((current) => {
      const exists = current.some((item) => item.id === food.id);
      if (exists) return current.filter((item) => item.id !== food.id);
      if (current.length >= 4) return current;
      return [...current, food];
    });
  }, [phase]);

  const nextRound = useCallback(() => {
    if (roundIndex === MISSIONS.length - 1) {
      const finalScore = totalScore;
      const nextBest = Math.max(bestScore, finalScore);
      setBestScore(nextBest);
      localStorage.setItem('mcstack-best', String(nextBest));
      setPhase('completed');
      return;
    }
    setRoundIndex((index) => index + 1);
    setSelected([]);
    setTimeLeft(ROUND_SECONDS);
    setResult(null);
    setPhase('playing');
  }, [bestScore, roundIndex, totalScore]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key.toLowerCase() === 'r') restart();
      if (phase !== 'playing') return;
      const index = Number(event.key) - 1;
      if (index >= 0 && index < roundFoods.length) toggleFood(roundFoods[index]);
      if (event.key === 'Enter') finishRound();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [finishRound, phase, restart, roundFoods, toggleFood]);

  const progress = ((ROUND_SECONDS - timeLeft) / ROUND_SECONDS) * 100;

  return (
    <main className="app-shell">
      <div className="ambient-bg" />
      <header className="topbar">
        <a className="brand" href="#game" aria-label="1024 能量栈首页">
          <Sprite index={9} className="brand-mascot" />
          <span><b>1024</b> 能量栈<small>MCP NUTRITION GAME</small></span>
        </a>
        <div className="scoreboard">
          <div><span>得分</span><strong>{totalScore.toLocaleString()}</strong></div>
          <div><span>最高</span><strong>{bestScore.toLocaleString()}</strong></div>
          <button type="button" className="help-button" onClick={() => setHelpOpen(true)}>玩法</button>
          <button type="button" className="new-game" onClick={restart}>新游戏</button>
        </div>
      </header>

      <section className="game-layout" id="game">
        <section className="game-stage" aria-label="配餐游戏区域">
          <div className="stage-head">
            <div>
              <span>SELECT YOUR STACK</span>
              <h1>选餐 · 配平 · 提交</h1>
            </div>
            <div className={`timer${timeLeft <= 10 ? ' is-urgent' : ''}`}>
              <span>TIME</span><strong>{String(timeLeft).padStart(2, '0')}</strong>
            </div>
          </div>
          <div className="timer-track"><span style={{ width: `${100 - progress}%` }} /></div>

          <div className="food-grid">
            {roundFoods.map((food, index) => (
              <FoodCard
                key={food.id}
                food={food}
                index={index}
                selected={selected.some((item) => item.id === food.id)}
                disabled={phase !== 'playing'}
                onToggle={toggleFood}
              />
            ))}
          </div>

          <section className="stack-builder">
            <div className="stack-visual" aria-label={`已选择 ${selected.length} 件餐品`}>
              <div className="tray">
                {selected.length === 0 ? <span className="empty-stack">点击餐品，构建你的能量栈</span> : null}
                {selected.map((food) => (
                  <button type="button" key={food.id} onClick={() => toggleFood(food)} title={`移除 ${food.name}`}>
                    <Sprite food={food} className="stack-sprite" />
                    <span>{food.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <button
              className="compile-button"
              type="button"
              onClick={finishRound}
              disabled={phase !== 'playing' || selected.length === 0}
            >
              <span>提交配餐</span>
              <b>COMPILE ↗</b>
            </button>
          </section>

          <NutritionPanel nutrition={nutrition} mission={mission} />
        </section>

        <MissionRail
          mission={mission}
          roundIndex={roundIndex}
          totalRounds={MISSIONS.length}
          source={source}
          message={message}
          loading={loading}
          onRefresh={refresh}
        />
      </section>

      <footer className="footer">
        <span>非官方参赛作品 · 数据仅供游戏体验，不构成营养建议</span>
        <a href="https://github.com/M-China/mcd-developer-innovation-challenge" target="_blank" rel="noreferrer">查看 2026 创意开发大赛规则 ↗</a>
      </footer>

      {phase === 'intro' ? <IntroModal source={source} loading={loading} onStart={restart} /> : null}
      {phase === 'result' ? (
        <GameModal result={result} totalScore={totalScore} bestScore={bestScore} onNext={nextRound} onRestart={restart} />
      ) : null}
      {phase === 'completed' ? (
        <GameModal completed totalScore={totalScore} bestScore={bestScore} onRestart={restart} />
      ) : null}
      {helpOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title">
            <button className="modal-close" type="button" onClick={() => setHelpOpen(false)} aria-label="关闭">×</button>
            <p>HOW TO PLAY</p>
            <h2 id="help-title">把配餐当成一道约束题</h2>
            <ol>
              <li><b>选餐</b><span>每轮从真实营养菜单里选择最多 4 件餐品。</span></li>
              <li><b>配平</b><span>命中目标能量，同时满足蛋白质下限和钠上限。</span></li>
              <li><b>冲分</b><span>越接近目标、速度越快，分数越高。</span></li>
            </ol>
            <button className="primary-action" type="button" onClick={() => setHelpOpen(false)}>明白，开吃</button>
          </section>
        </div>
      ) : null}
    </main>
  );
}

export default App;
