import React, { useEffect, useRef, useState } from 'react';
import styles from './App.module.css';
import {
  evaluateExpression,
  formatResult,
  sanitizeInputSequence
} from './lib/calcEngine';

// PUBLIC_INTERFACE
function App() {
  /** Single-page Calculator UI with keyboard support and accessible controls. */
  const [display, setDisplay] = useState('');
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState('');
  const containerRef = useRef(null);

  // Keyboard support
  useEffect(() => {
    const handler = (e) => {
      const key = e.key;

      if ((key >= '0' && key <= '9') || key === '.') {
        e.preventDefault();
        onInput(key);
        return;
      }

      if (['+', '-', '*', '/'].includes(key)) {
        e.preventDefault();
        onInput(key);
        return;
      }

      if (key === 'Enter' || key === '=') {
        e.preventDefault();
        onEquals();
        return;
      }

      if (key === 'Backspace') {
        e.preventDefault();
        onDelete();
        return;
      }

      if (key === 'Escape') {
        e.preventDefault();
        onClear();
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [display]);

  // Append sanitized input, clearing error as needed
  const onInput = (ch) => {
    setError('');
    setDisplay(prev => sanitizeInputSequence(prev, ch));
  };

  const onClear = () => {
    setDisplay('');
    setLastResult(null);
    setError('');
  };

  const onDelete = () => {
    setError('');
    setDisplay(prev => prev.slice(0, -1));
  };

  const onEquals = () => {
    if (!display) return;
    try {
      const result = evaluateExpression(display);
      const formatted = formatResult(result);
      if (formatted === 'Error') {
        setError('Error');
        return;
      }
      setLastResult(formatted);
      setDisplay(formatted);
      setError('');
    } catch (err) {
      const code = err?.message || 'ERROR';
      if (code === 'DIV_ZERO') {
        setError('Error: Division by zero');
      } else {
        setError('Error');
      }
    }
  };

  const buttons = [
    { label: 'C', onClick: onClear, className: styles.btnAction, aria: 'Clear' },
    { label: 'DEL', onClick: onDelete, className: styles.btnAction, aria: 'Delete' },
    { label: '/', onClick: () => onInput('/'), className: styles.btnOperator, aria: 'Divide' },
    { label: '*', onClick: () => onInput('*'), className: styles.btnOperator, aria: 'Multiply' },

    { label: '7', onClick: () => onInput('7') },
    { label: '8', onClick: () => onInput('8') },
    { label: '9', onClick: () => onInput('9') },
    { label: '-', onClick: () => onInput('-'), className: styles.btnOperator, aria: 'Subtract' },

    { label: '4', onClick: () => onInput('4') },
    { label: '5', onClick: () => onInput('5') },
    { label: '6', onClick: () => onInput('6') },
    { label: '+', onClick: () => onInput('+'), className: styles.btnOperator, aria: 'Add' },

    { label: '1', onClick: () => onInput('1') },
    { label: '2', onClick: () => onInput('2') },
    { label: '3', onClick: () => onInput('3') },
    { label: '=', onClick: onEquals, className: styles.btnEquals, aria: 'Equals' },

    { label: '0', onClick: () => onInput('0'), className: styles.btnZero },
    { label: '.', onClick: () => onInput('.') },
  ];

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <div className={styles.calculator} role="region" aria-label="Calculator">
        <div className={styles.header}>
          <p className={styles.title}>Ocean Professional Calculator</p>
        </div>

        <div className={styles.displayContainer}>
          {/* Display as read-only input for accessibility, aria-live to announce results */}
          <input
            className={styles.display}
            type="text"
            value={display || (lastResult !== null ? String(lastResult) : '')}
            readOnly
            aria-label="Calculator display"
            aria-live="polite"
            role="status"
          />
          <span className={styles.srOnly} aria-live="polite">
            {error ? 'Error' : 'OK'}
          </span>
        </div>

        <div className={styles.grid} role="grid" aria-label="Calculator keys">
          {buttons.map((b, idx) => (
            <button
              key={idx}
              type="button"
              className={[
                styles.btn,
                b.className ? b.className : ''
              ].join(' ').trim()}
              onClick={b.onClick}
              aria-label={b.aria || b.label}
            >
              {b.label}
            </button>
          ))}
        </div>

        <div className={styles.footer}>
          <span>{lastResult !== null ? `Last: ${lastResult}` : 'Ready'}</span>
          <span className={styles.errorText} role="alert" aria-live="polite">
            {error}
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;
