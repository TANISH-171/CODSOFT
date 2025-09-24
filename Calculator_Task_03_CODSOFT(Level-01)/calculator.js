// Pure calculator logic — no DOM here.
// Reusable, testable, and easy to port to other UIs.

export class Calculator {
  #current = '0';
  #previous = '';
  #operator = null;
  #justEvaluated = false;

  get state() {
    return {
      current: this.#current,
      previous: this.#previous,
      operator: this.#operator,
      justEvaluated: this.#justEvaluated,
    };
  }

  /** Public API */
  inputDigit(d) {
    if (!/^\d$/.test(d)) return;
    if (this.#justEvaluated) {
      this.#current = d;
      this.#justEvaluated = false;
      return;
    }
    this.#current = this.#current === '0' ? d : this.#current + d;
  }

  inputDecimal() {
    if (this.#justEvaluated) {
      this.#current = '0.';
      this.#justEvaluated = false;
      return;
    }
    if (!this.#current.includes('.')) this.#current += '.';
  }

  chooseOperator(op) {
    if (!['+', '−', '×', '÷', '%'].includes(op)) return;
    if (this.#current === 'Error') return;

    if (this.#operator && this.#previous !== '' && this.#current !== '') {
      const res = this.#compute(this.#previous, this.#current, this.#operator);
      this.#previous = res;
      this.#current = '';
    } else if (this.#current !== '') {
      this.#previous = this.#current;
      this.#current = '';
    }
    this.#operator = op;
    this.#justEvaluated = false;
  }

  negate() {
    if (!this.#current || this.#current === '0' || this.#current === 'Error') return;
    this.#current = this.#current.startsWith('-')
      ? this.#current.slice(1)
      : '-' + this.#current;
  }

  equals() {
    if (this.#operator && this.#previous !== '' && this.#current !== '') {
      const res = this.#compute(this.#previous, this.#current, this.#operator);
      this.#current = this.#format(res);
      this.#previous = '';
      this.#operator = null;
      this.#justEvaluated = true;
    }
  }

  clearAll() {
    this.#current = '0';
    this.#previous = '';
    this.#operator = null;
    this.#justEvaluated = false;
  }

  deleteLast() {
    if (this.#justEvaluated) {
      this.#justEvaluated = false;
    }
    if (this.#current === 'Error') {
      this.clearAll();
      return;
    }
    this.#current = this.#current.length > 1 ? this.#current.slice(0, -1) : '0';
  }

  /** Helpers */
  #compute(aStr, bStr, op) {
    const a = parseFloat(aStr);
    const b = parseFloat(bStr);
    if (Number.isNaN(a) || Number.isNaN(b)) return aStr;

    switch (op) {
      case '÷':
        if (b === 0) return 'Error';
        return (a / b).toString();
      case '×':
        return (a * b).toString();
      case '−':
        return (a - b).toString();
      case '+':
        return (a + b).toString();
      case '%':
        // Interpret "a % b" as a * (b / 100)
        return (a * (b / 100)).toString();
      default:
        return aStr;
    }
  }

  #format(val) {
    if (val === 'Error') return val;
    const n = Number(val);
    if (!Number.isFinite(n)) return 'Error';

    // Keep 12 significant characters, then pretty-print with grouping if not exponential
    let s = n.toString();
    if (s.length > 12) s = n.toExponential(8);
    if (!s.includes('e')) {
      const [intPart, decPart] = s.split('.');
      const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      s = decPart ? `${grouped}.${decPart}` : grouped;
      s = s.replace(/\.?0+$/, ''); // trim trailing zeros
    }
    return s;
  }

  /** For UI trail */
  formatTrail() {
    const { previous, operator } = this.state;
    return previous ? `${previous} ${operator ?? ''}` : '';
  }
}
