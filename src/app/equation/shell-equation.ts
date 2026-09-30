// The shell equation in MathML (#3): Atractor's Shell Model IV, the surface
// ShellViewer.surfaceFunction() draws (https://www.atractor.pt/mat/conchas/).
// Built as a string because Angular 17 gives template <math> elements the
// wrong namespace, so the browser wouldn't lay them out as MathML; the HTML
// parser gets it right from a string. Static text only, no user input.
//
// Written to need no math font: variables are <mi class="v"> (italic from CSS,
// not MathML's auto-italic, which maps letters to Unicode's math italics that
// only math fonts have), and nothing relies on stretched brackets. Browsers
// without a math font (some Linux and Android set-ups) then still draw it.

const APPLY = '<mo>&#x2061;</mo>';  // invisible function application
const TIMES = '<mo>&#x2062;</mo>';  // invisible times

const mi = (name: string) => `<mi>${name}</mi>`;      // a function name: sen, cos, cot
const v = (name: string) => `<mi class="v">${name}</mi>`; // a variable, in italics
const paren = (inner: string) => `<mrow><mo>(</mo>${inner}<mo>)</mo></mrow>`;
const call = (name: string, args: string) => `${v(name)}<mo>(</mo>${args}<mo>)</mo>`;
// A function of an argument, with the thin spaces typeset maths puts
// around it (MathML Core adds none): "sen β cos θ", not "senβcosθ".
const THIN = '<mspace width="0.17em"></mspace>';
const trig = (f: string, arg: string) => `<mrow>${THIN}${mi(f)}${APPLY}${THIN}${arg}</mrow>`;
// A factor right after "(" or a sign needs no space before it.
const tight = (factor: string) => factor.replace(`<mrow>${THIN}`, '<mrow>');
const tuple = (...parts: string[]) => paren(parts.map(tight).join('<mo>,</mo>'));
const squared = (f: string) => `<msup>${mi(f)}<mn>2</mn></msup>`;
// One row of the aligned system: name, "=", formula. A continued row leaves
// the first two cells empty.
const row = (lhs: string, rhs: string) => `<mtr><mtd>${lhs}</mtd><mtd><mo>=</mo></mtd><mtd>${rhs}</mtd></mtr>`;
const more = (rhs: string) => `<mtr><mtd></mtd><mtd></mtd><mtd>${rhs}</mtd></mtr>`;
const system = (rows: string) => `<math display="block" aria-hidden="true"><mtable>${rows}</mtable></math>`;

const THETA_S = `${v('θ')}<mo>,</mo>${v('s')}`;
const THETA = v('θ');
const RE = `<msub>${v('r')}${v('e')}</msub><mo>(</mo>${v('s')}<mo>)</mo>`;
const GROWTH = `<msup>${v('e')}<mrow>${THETA}${TIMES}${trig('cot', v('α'))}</mrow></msup>`;

// Spanish notation: "sen" for the sine.
const sen = (arg: string) => trig('sen', arg);
const cos = (arg: string) => trig('cos', arg);
const plus = (a: string, b: string) => paren(`${v(a)}<mo>+</mo>${v(b)}`);

// C(θ,s) = H(θ) + E(θ,s): the helix the shell coils along, plus the ellipse
// (its opening) swept along it. The app also turns the ellipse by φ, Ω and μ,
// which only the full system shows.
export const SHORT_EQUATION = system([
  row(call('C', THETA_S), `${call('H', THETA)}<mo>+</mo>${call('E', THETA_S)}`),
  row(call('H', THETA), `${v('A')}${GROWTH}`),
  more(tuple(sen(v('β')) + cos(THETA), sen(v('β')) + sen(THETA), '<mo>−</mo>' + tight(cos(v('β'))))),
  row(call('E', THETA_S), `${GROWTH}${RE}`),
  more(tuple(cos(v('s')) + cos(THETA), cos(v('s')) + sen(THETA), sen(v('s')))),
  row(RE, `<mfrac><mn>1</mn><msqrt>` +
    `${squared('cos')}${APPLY}${v('s')}<mo>/</mo><msup>${v('a')}<mn>2</mn></msup><mo>+</mo>` +
    `${squared('sen')}${APPLY}${v('s')}<mo>/</mo><msup>${v('b')}<mn>2</mn></msup>` +
    `</msqrt></mfrac>`),
].join(''));

// The full Model IV system, as in surfaceFunction(). D (coiling direction) is
// left out: the app always draws D = 1. Long rows are split by hand, since
// browsers don't line-break MathML.
export const FULL_EQUATION = system([
  row(call('x', THETA_S), `<mo>[</mo>${v('A')}${sen(v('β'))}${cos(THETA)}<mo>+</mo>${RE}${cos(plus('s', 'φ'))}${cos(plus('θ', 'Ω'))}`),
  more(`<mo>−</mo>${RE}${sen(plus('s', 'φ'))}${sen(v('μ'))}${sen(plus('θ', 'Ω'))}<mo>]</mo>${GROWTH}`),
  row(call('y', THETA_S), `<mo>[</mo>${v('A')}${sen(v('β'))}${sen(THETA)}<mo>+</mo>${RE}${cos(plus('s', 'φ'))}${sen(plus('θ', 'Ω'))}`),
  more(`<mo>+</mo>${RE}${sen(plus('s', 'φ'))}${sen(v('μ'))}${cos(plus('θ', 'Ω'))}<mo>]</mo>${GROWTH}`),
  row(call('z', THETA_S), `<mo>[</mo><mo>−</mo>${v('A')}${cos(v('β'))}<mo>+</mo>${RE}${sen(plus('s', 'φ'))}${cos(v('μ'))}<mo>]</mo>${GROWTH}`),
].join(''));
