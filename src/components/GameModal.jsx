import { Sprite } from './Sprite.jsx';

export function GameModal({ result, completed, totalScore, bestScore, onNext, onRestart }) {
  const passed = completed ? totalScore > 0 : result?.passed;
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="game-modal" role="dialog" aria-modal="true" aria-labelledby="result-title">
        <Sprite index={completed ? 11 : passed ? 9 : 10} className="modal-mascot" />
        <p className="modal-label">{completed ? 'BUILD COMPLETE' : passed ? 'ROUND PASSED' : 'STACK FAILED'}</p>
        <h2 id="result-title">{completed ? '1024 能量栈已上线' : passed ? '这份配餐能跑！' : '约束条件没通过'}</h2>
        {completed ? (
          <>
            <div className="final-score">{totalScore.toLocaleString()}<small>总分</small></div>
            <p>最高分 {bestScore.toLocaleString()}。真实营养数据，真正的选择题。</p>
            <button className="primary-action" type="button" onClick={onRestart}>再开一局</button>
          </>
        ) : (
          <>
            <div className="round-score">+{result.score}</div>
            <ul className="result-notes">
              {result.notes.map((note) => <li key={note}>{note}</li>)}
            </ul>
            <button className="primary-action" type="button" onClick={onNext}>进入下一轮</button>
          </>
        )}
      </section>
    </div>
  );
}
