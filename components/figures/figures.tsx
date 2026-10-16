import type { FigureId } from "@/lib/content/types";

/*
 * Engineering diagrams drawn as theme-aware inline SVG.
 * Conventions: structure = --fg-muted, highlighted quantity = --primary,
 * secondary geometry = --iris, dimensions = --fg-subtle; variable labels use
 * the KaTeX math font so they match the typeset equations.
 */

const S = {
  line: { stroke: "var(--fg-muted)", strokeWidth: 1.6, fill: "none" },
  thin: { stroke: "var(--fg-subtle)", strokeWidth: 1, fill: "none" },
  dash: { stroke: "var(--fg-subtle)", strokeWidth: 1, fill: "none", strokeDasharray: "5 4" },
  accent: { stroke: "var(--primary)", strokeWidth: 2.2, fill: "none" },
  iris: { stroke: "var(--iris)", strokeWidth: 1.6, fill: "none" },
} as const;

function V({ x, y, children, anchor = "middle", size = 15, color = "var(--fg)" }: { x: number; y: number; children: React.ReactNode; anchor?: "start" | "middle" | "end"; size?: number; color?: string }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fill={color} style={{ fontFamily: "KaTeX_Math, 'Times New Roman', serif", fontStyle: "italic" }}>
      {children}
    </text>
  );
}
function Sub({ b, s }: { b: string; s: string }) {
  return (
    <>
      {b}
      <tspan dy={4} fontSize="0.72em">
        {s}
      </tspan>
    </>
  );
}
function T({ x, y, children, anchor = "middle", size = 11, color = "var(--fg-subtle)" }: { x: number; y: number; children: React.ReactNode; anchor?: "start" | "middle" | "end"; size?: number; color?: string }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fill={color} style={{ fontFamily: "var(--font-mono)" }}>
      {children}
    </text>
  );
}
function Arrow({ x1, y1, x2, y2, color = "var(--primary)", w = 2 }: { x1: number; y1: number; x2: number; y2: number; color?: string; w?: number }) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = 8;
  const p1 = [x2 - h * Math.cos(a - 0.4), y2 - h * Math.sin(a - 0.4)];
  const p2 = [x2 - h * Math.cos(a + 0.4), y2 - h * Math.sin(a + 0.4)];
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} />
      <path d={`M${x2} ${y2} L${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]} Z`} fill={color} />
    </g>
  );
}
function Dim({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: React.ReactNode }) {
  return (
    <g>
      <line x1={x1} x2={x2} y1={y} y2={y} {...S.thin} />
      <line x1={x1} x2={x1} y1={y - 6} y2={y + 6} {...S.thin} />
      <line x1={x2} x2={x2} y1={y - 6} y2={y + 6} {...S.thin} />
      <rect x={(x1 + x2) / 2 - 16} y={y - 10} width={32} height={20} fill="var(--card)" />
      <V x={(x1 + x2) / 2} y={y + 5}>
        {label}
      </V>
    </g>
  );
}
function Pin({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x} ${y} L${x - 11} ${y + 16} L${x + 11} ${y + 16} Z`} fill="var(--subtle)" stroke="var(--fg-muted)" strokeWidth={1.4} />
      <line x1={x - 16} x2={x + 16} y1={y + 16} y2={y + 16} {...S.line} />
      {[-12, -4, 4, 12].map((d) => (
        <line key={d} x1={x + d} y1={y + 16} x2={x + d - 5} y2={y + 22} {...S.thin} />
      ))}
    </g>
  );
}
function Roller({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y + 7} r={7} fill="var(--subtle)" stroke="var(--fg-muted)" strokeWidth={1.4} />
      <line x1={x - 16} x2={x + 16} y1={y + 15} y2={y + 15} {...S.line} />
    </g>
  );
}
function RightTriangle() {
  return (
    <svg viewBox="0 0 480 260">
      <path d="M90 210 L390 210 L390 50 Z" {...S.line} fill="var(--primary-soft)" />
      <path d="M372 210 V192 H390" {...S.thin} />
      <path d="M140 210 A50 50 0 0 0 134 186" {...S.accent} />
      <V x={152} y={198}>θ</V>
      <V x={240} y={236}>b</V>
      <V x={410} y={136}>a</V>
      <V x={222} y={116}>c</V>
      <T x={240} y={252}>adjacent</T>
      <T x={448} y={152}>opposite</T>
      <T x={196} y={98}>hypotenuse</T>
    </svg>
  );
}

function SimpleCurve() {
  // tangents meet at PI; circle center O below
  const O = [240, 330];
  const R = 230;
  const I = (64 * Math.PI) / 180;
  const pc = [O[0] - R * Math.sin(I / 2), O[1] - R * Math.cos(I / 2)];
  const pt = [O[0] + R * Math.sin(I / 2), O[1] - R * Math.cos(I / 2)];
  const pi = [240, O[1] - R / Math.cos(I / 2)];
  const mid = [240, O[1] - R];
  const back = [pc[0] - (pi[0] - pc[0]) * 0.45, pc[1] - (pi[1] - pc[1]) * 0.45];
  const fwd = [pt[0] + (pt[0] - pi[0]) * 0.45, pt[1] + (pt[1] - pi[1]) * 0.45];
  return (
    <svg viewBox="0 0 480 300">
      <line x1={back[0]} y1={back[1]} x2={pi[0]} y2={pi[1]} {...S.line} />
      <line x1={pi[0]} y1={pi[1]} x2={fwd[0]} y2={fwd[1]} {...S.line} />
      <line x1={pi[0]} y1={pi[1]} x2={pi[0] + (pi[0] - back[0]) * 0.5} y2={pi[1] + (pi[1] - back[1]) * 0.5} {...S.dash} />
      <path d={`M${pc[0]} ${pc[1]} A${R} ${R} 0 0 1 ${pt[0]} ${pt[1]}`} {...S.accent} />
      <line x1={pc[0]} y1={pc[1]} x2={pt[0]} y2={pt[1]} {...S.dash} />
      <line x1={pc[0]} y1={pc[1]} x2={O[0]} y2={290} {...S.iris} strokeDasharray="2 4" />
      <line x1={pt[0]} y1={pt[1]} x2={O[0]} y2={290} {...S.iris} strokeDasharray="2 4" />
      <line x1={pi[0]} y1={pi[1]} x2={mid[0]} y2={mid[1]} stroke="var(--warning)" strokeWidth={1.4} />
      {[pc, pt, pi].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={4} fill="var(--card)" stroke="var(--primary)" strokeWidth={2} />
      ))}
      <T x={pc[0] - 16} y={pc[1] + 4} anchor="end" color="var(--fg)">PC</T>
      <T x={pt[0] + 16} y={pt[1] + 4} anchor="start" color="var(--fg)">PT</T>
      <T x={pi[0]} y={pi[1] - 12} color="var(--fg)">PI</T>
      <V x={(pc[0] + pi[0]) / 2 - 14} y={(pc[1] + pi[1]) / 2 - 6}>T</V>
      <V x={(pt[0] + pi[0]) / 2 + 14} y={(pt[1] + pi[1]) / 2 - 6}>T</V>
      <V x={252} y={(pi[1] + mid[1]) / 2 + 5} anchor="start" size={13}>E</V>
      <V x={240} y={mid[1] + 34} size={13}>M</V>
      <V x={240} y={mid[1] - 12 + 0} size={13} color="var(--primary-text)">L</V>
      <V x={(pc[0] + O[0]) / 2 - 12} y={250}>R</V>
      <V x={pi[0] + 52} y={pi[1] + 2} size={13}>I</V>
      <T x={240} y={292}>O</T>
    </svg>
  );
}

function DifferentialLeveling() {
  return (
    <svg viewBox="0 0 480 260">
      <path d="M20 220 C120 214 160 196 240 200 S380 168 460 160" {...S.line} />
      {/* BM rod */}
      <rect x={70} y={70} width={10} height={145} fill="var(--subtle)" stroke="var(--fg-muted)" />
      {/* TP rod */}
      <rect x={390} y={40} width={10} height={124} fill="var(--subtle)" stroke="var(--fg-muted)" />
      {/* instrument */}
      <path d="M230 200 L240 140 L250 200 M240 140 V120" {...S.line} />
      <rect x={224} y={106} width={34} height={14} rx={3} fill="var(--card)" stroke="var(--fg-muted)" strokeWidth={1.4} />
      {/* line of sight */}
      <line x1={75} y1={113} x2={395} y2={113} {...S.accent} strokeDasharray="6 4" />
      <T x={75} y={232} color="var(--fg)">BM</T>
      <T x={395} y={182} color="var(--fg)">TP</T>
      <T x={128} y={104} color="var(--primary-text)">BS</T>
      <T x={350} y={104} color="var(--primary-text)">FS</T>
      <Arrow x1={30} y1={220} x2={30} y2={116} color="var(--iris)" w={1.4} />
      <T x={36} y={170} anchor="start" color="var(--iris-text)">HI</T>
      <line x1={86} y1={113} x2={86} y2={214} {...S.thin} />
      <line x1={384} y1={113} x2={384} y2={162} {...S.thin} />
      <T x={240} y={250}>HI = Elev(BM) + BS · Elev(TP) = HI − FS</T>
    </svg>
  );
}

function ClosedTraverse() {
  const pts = [
    [110, 200],
    [170, 70],
    [330, 60],
    [400, 170],
    [270, 230],
  ];
  return (
    <svg viewBox="0 0 480 270">
      <path d={`M${pts.map((p) => p.join(" ")).join(" L")} Z`} {...S.accent} fill="var(--primary-soft)" />
      {pts.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={5} fill="var(--card)" stroke="var(--primary)" strokeWidth={2} />
          <T x={x + (x < 240 ? -14 : 14)} y={y + (y < 140 ? -8 : 18)} color="var(--fg)">
            {String.fromCharCode(65 + i)}
          </T>
        </g>
      ))}
      {/* lat/dep on course AB */}
      <line x1={110} y1={200} x2={110} y2={70} {...S.dash} />
      <line x1={110} y1={70} x2={170} y2={70} {...S.dash} />
      <T x={96} y={140} anchor="end" color="var(--iris-text)">Lat</T>
      <T x={140} y={62} color="var(--iris-text)">Dep</T>
      {/* north arrow */}
      <Arrow x1={440} y1={70} x2={440} y2={22} color="var(--fg-muted)" w={1.4} />
      <T x={440} y={86} color="var(--fg)">N</T>
      <T x={240} y={262}>Σ Lat = 0 and Σ Dep = 0 for a closed traverse</T>
    </svg>
  );
}

function VerticalCurve() {
  const pvc = [80, 170];
  const pvi = [240, 80];
  const pvt = [400, 150];
  const curve = `M${pvc[0]} ${pvc[1]} Q${pvi[0]} ${pvi[1]} ${pvt[0]} ${pvt[1]}`;
  return (
    <svg viewBox="0 0 480 260">
      <line x1={20} y1={pvc[1] + 34} x2={pvi[0]} y2={pvi[1]} {...S.line} />
      <line x1={pvi[0]} y1={pvi[1]} x2={460} y2={pvt[1] + 13} {...S.line} />
      <path d={curve} {...S.accent} />
      {[pvc, pvi, pvt].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={4} fill="var(--card)" stroke="var(--primary)" strokeWidth={2} />
      ))}
      <T x={pvc[0]} y={pvc[1] + 22} color="var(--fg)">PVC</T>
      <T x={pvi[0]} y={pvi[1] - 12} color="var(--fg)">PVI</T>
      <T x={pvt[0]} y={pvt[1] + 22} color="var(--fg)">PVT</T>
      <V x={130} y={118}>g₁</V>
      <V x={350} y={100}>g₂</V>
      <line x1={pvc[0]} y1={220} x2={pvc[0]} y2={pvc[1] + 30} {...S.thin} />
      <line x1={pvt[0]} y1={220} x2={pvt[0]} y2={pvt[1] + 30} {...S.thin} />
      <Dim x1={pvc[0]} x2={pvt[0]} y={226} label="L" />
      <line x1={pvi[0]} y1={pvi[1]} x2={pvi[0]} y2={125} stroke="var(--warning)" strokeWidth={1.4} />
      <T x={250} y={112} anchor="start" color="var(--warning)">e</T>
    </svg>
  );
}

function SoilPhase() {
  const x = 150;
  const w = 120;
  return (
    <svg viewBox="0 0 480 280">
      <rect x={x} y={30} width={w} height={50} fill="var(--card)" stroke="var(--fg-muted)" strokeWidth={1.4} />
      <rect x={x} y={80} width={w} height={60} fill="var(--iris-soft)" stroke="var(--fg-muted)" strokeWidth={1.4} />
      <rect x={x} y={140} width={w} height={110} fill="var(--primary-soft)" stroke="var(--fg-muted)" strokeWidth={1.4} />
      <T x={x + w / 2} y={60} color="var(--fg)">Air</T>
      <T x={x + w / 2} y={115} color="var(--iris-text)">Water</T>
      <T x={x + w / 2} y={200} color="var(--primary-text)">Solids</T>
      {/* volumes left */}
      {[
        [30, 80, "a"],
        [80, 140, "w"],
        [140, 250, "s"],
      ].map(([a, b, l]) => (
        <g key={l as string}>
          <line x1={x - 20} x2={x - 20} y1={a as number} y2={b as number} {...S.thin} />
          <line x1={x - 26} x2={x - 14} y1={a as number} y2={a as number} {...S.thin} />
          <V x={x - 30} y={((a as number) + (b as number)) / 2 + 5} anchor="end" size={14}>
            <Sub b="V" s={l as string} />
          </V>
        </g>
      ))}
      <line x1={x - 80} x2={x - 80} y1={30} y2={140} {...S.iris} />
      <V x={x - 88} y={90} anchor="end" size={14}>
        <Sub b="V" s="v" />
      </V>
      <line x1={x - 112} x2={x - 112} y1={30} y2={250} {...S.line} />
      <V x={x - 118} y={145} anchor="end" size={14}>V</V>
      {/* weights right */}
      {[
        [80, 140, "w"],
        [140, 250, "s"],
      ].map(([a, b, l]) => (
        <g key={l as string}>
          <line x1={x + w + 20} x2={x + w + 20} y1={a as number} y2={b as number} {...S.thin} />
          <V x={x + w + 30} y={((a as number) + (b as number)) / 2 + 5} anchor="start" size={14}>
            <Sub b="W" s={l as string} />
          </V>
        </g>
      ))}
      <line x1={x + w + 80} x2={x + w + 80} y1={80} y2={250} {...S.line} />
      <V x={x + w + 88} y={170} anchor="start" size={14}>W</V>
      <T x={x + w + 40} y={56} anchor="start">Wₐ ≈ 0</T>
      <T x={240} y={274}>Volumes (left) · Weights (right)</T>
    </svg>
  );
}

function HydrostaticPlane() {
  return (
    <svg viewBox="0 0 480 280">
      <rect x={20} y={40} width={440} height={220} fill="var(--iris-soft)" />
      <line x1={20} y1={40} x2={460} y2={40} stroke="var(--iris)" strokeWidth={1.6} />
      <T x={30} y={32} anchor="start" color="var(--iris-text)">▽ free surface</T>
      {/* inclined plate */}
      <line x1={250} y1={90} x2={360} y2={240} stroke="var(--fg)" strokeWidth={5} strokeLinecap="round" />
      {/* centroid & cp */}
      <circle cx={305} cy={165} r={5} fill="var(--card)" stroke="var(--fg)" strokeWidth={2} />
      <circle cx={314} cy={178} r={4} fill="var(--primary)" />
      <line x1={120} y1={40} x2={120} y2={165} {...S.thin} />
      <line x1={114} y1={165} x2={300} y2={165} {...S.dash} />
      <V x={108} y={108} anchor="end">h̄</V>
      <T x={296} y={158} anchor="end" color="var(--fg)">CG</T>
      <T x={326} y={186} anchor="start" color="var(--primary-text)">CP</T>
      {/* pressure prism & resultant */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const px = 250 + 110 * t;
        const py = 90 + 150 * t;
        const len = 20 + 50 * t;
        return <Arrow key={t} x1={px - len * 0.81} y1={py + len * 0.59} x2={px - 3} y2={py + 2} color="var(--fg-subtle)" w={1.2} />;
      })}
      <Arrow x1={240} y1={226} x2={308} y2={180} color="var(--primary)" w={2.6} />
      <V x={232} y={240} anchor="end" color="var(--primary-text)">F</V>
      <T x={240} y={274}>F = γ h̄ A · acts at the center of pressure</T>
    </svg>
  );
}

function PipeFlow() {
  return (
    <svg viewBox="0 0 480 280">
      {/* reservoir */}
      <path d="M20 60 V200 H120 V60" {...S.line} />
      <rect x={21} y={80} width={98} height={119} fill="var(--iris-soft)" />
      <line x1={20} y1={80} x2={120} y2={80} stroke="var(--iris)" strokeWidth={1.6} />
      <T x={70} y={74} color="var(--iris-text)">▽</T>
      {/* pipe */}
      <path d="M120 180 L420 220" stroke="var(--fg-muted)" strokeWidth={14} strokeLinecap="butt" fill="none" opacity={0.35} />
      <path d="M120 180 L420 220" stroke="var(--fg-muted)" strokeWidth={1.4} fill="none" />
      <Arrow x1={240} y1={196} x2={300} y2={204} color="var(--primary)" w={2} />
      {/* EGL and HGL */}
      <line x1={70} y1={80} x2={430} y2={124} stroke="var(--primary)" strokeWidth={1.6} />
      <line x1={120} y1={100} x2={430} y2={150} stroke="var(--iris)" strokeWidth={1.6} strokeDasharray="6 4" />
      <T x={436} y={124} anchor="start" color="var(--primary-text)">EGL</T>
      <T x={436} y={152} anchor="start" color="var(--iris-text)">HGL</T>
      {/* points */}
      <circle cx={70} cy={80} r={4} fill="var(--card)" stroke="var(--fg)" strokeWidth={2} />
      <circle cx={420} cy={220} r={4} fill="var(--card)" stroke="var(--fg)" strokeWidth={2} />
      <V x={70} y={62}>1</V>
      <V x={420} y={246}>2</V>
      <line x1={420} y1={80} x2={420} y2={122} stroke="var(--warning)" strokeWidth={1.4} />
      <line x1={80} y1={80} x2={430} y2={80} {...S.dash} />
      <V x={410} y={104} anchor="end" size={13}>
        <Sub b="h" s="L" />
      </V>
      <line x1={20} y1={260} x2={460} y2={260} {...S.thin} />
      <T x={30} y={254} anchor="start">datum</T>
    </svg>
  );
}

function SimpleBeam() {
  return (
    <svg viewBox="0 0 480 240">
      {Array.from({ length: 13 }).map((_, i) => (
        <Arrow key={i} x1={60 + i * 30} y1={56} x2={60 + i * 30} y2={92} color="var(--primary)" w={1.4} />
      ))}
      <line x1={60} y1={56} x2={420} y2={56} stroke="var(--primary)" strokeWidth={1.6} />
      <V x={240} y={44} color="var(--primary-text)">w</V>
      <rect x={50} y={96} width={380} height={16} rx={2} fill="var(--subtle)" stroke="var(--fg-muted)" strokeWidth={1.4} />
      <Pin x={60} y={112} />
      <Roller x={420} y={112} />
      <Arrow x1={60} y1={186} x2={60} y2={150} color="var(--iris)" w={1.8} />
      <Arrow x1={420} y1={186} x2={420} y2={150} color="var(--iris)" w={1.8} />
      <V x={74} y={180} anchor="start" size={13} color="var(--iris-text)">R</V>
      <V x={406} y={180} anchor="end" size={13} color="var(--iris-text)">R</V>
      <Dim x1={60} x2={420} y={214} label="L" />
    </svg>
  );
}

function Cantilever() {
  return (
    <svg viewBox="0 0 480 230">
      <rect x={40} y={40} width={26} height={150} fill="var(--subtle)" stroke="var(--fg-muted)" strokeWidth={1.4} />
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={i} x1={40} y1={52 + i * 16} x2={66} y2={40 + i * 16} {...S.thin} />
      ))}
      <rect x={66} y={104} width={340} height={18} rx={2} fill="var(--subtle)" stroke="var(--fg-muted)" strokeWidth={1.4} />
      <Arrow x1={404} y1={36} x2={404} y2={100} color="var(--primary)" w={2.4} />
      <V x={418} y={52} anchor="start" color="var(--primary-text)">P</V>
      <path d="M66 136 Q240 150 406 176" {...S.iris} strokeDasharray="5 4" />
      <V x={414} y={186} anchor="start" size={13} color="var(--iris-text)">δ</V>
      <Dim x1={66} x2={406} y={210} label="L" />
      <T x={54} y={30}>fixed</T>
    </svg>
  );
}

function RcSection() {
  return (
    <svg viewBox="0 0 480 300">
      {/* section */}
      <rect x={50} y={30} width={130} height={220} rx={2} fill="var(--subtle)" stroke="var(--fg-muted)" strokeWidth={1.6} />
      <rect x={50} y={30} width={130} height={46} fill="var(--primary-soft)" />
      <line x1={50} y1={76} x2={180} y2={76} {...S.dash} />
      {[78, 115, 152].map((x) => (
        <circle key={x} cx={x} cy={214} r={8} fill="var(--fg-muted)" />
      ))}
      <Dim x1={50} x2={180} y={278} label="b" />
      <line x1={30} y1={30} x2={30} y2={214} {...S.thin} />
      <V x={24} y={126} anchor="end">d</V>
      <line x1={24} y1={214} x2={70} y2={214} {...S.thin} />
      <V x={115} y={242} size={13}>Aₛ</V>
      {/* strain */}
      <path d="M230 30 L270 30 L230 110 L190 214" {...S.iris} transform="translate(30 0)" />
      <line x1={260} y1={30} x2={260} y2={214} {...S.thin} />
      <T x={262} y={22}>εc = 0.003</T>
      <V x={238} y={230} size={13}>εₛ</V>
      <line x1={250} y1={110} x2={270} y2={110} {...S.dash} />
      <V x={276} y={114} anchor="start" size={13}>c</V>
      {/* stress block */}
      <rect x={340} y={30} width={56} height={46} fill="var(--primary-soft)" stroke="var(--primary)" strokeWidth={1.6} />
      <T x={368} y={22} color="var(--primary-text)">0.85f′c</T>
      <V x={406} y={58} anchor="start" size={13}>a</V>
      <Arrow x1={440} y1={53} x2={400} y2={53} color="var(--primary)" w={2.2} />
      <V x={448} y={58} anchor="start" color="var(--primary-text)">C</V>
      <Arrow x1={344} y1={214} x2={440} y2={214} color="var(--iris)" w={2.2} />
      <V x={448} y={219} anchor="start" color="var(--iris-text)">T</V>
      <line x1={330} y1={53} x2={330} y2={214} {...S.thin} />
      <T x={324} y={138} anchor="end">d − a/2</T>
      <T x={390} y={290}>C = 0.85 f′c a b = Aₛ fy = T</T>
    </svg>
  );
}

function ColumnBuckling() {
  return (
    <svg viewBox="0 0 480 300">
      <Arrow x1={240} y1={8} x2={240} y2={42} color="var(--primary)" w={2.4} />
      <V x={252} y={26} anchor="start" color="var(--primary-text)">P</V>
      <circle cx={240} cy={48} r={6} fill="var(--card)" stroke="var(--fg-muted)" strokeWidth={1.6} />
      <line x1={240} y1={54} x2={240} y2={252} {...S.dash} />
      <path d="M240 54 C300 110 300 196 240 252" stroke="var(--fg)" strokeWidth={5} fill="none" strokeLinecap="round" />
      <Pin x={240} y={258} />
      <line x1={312} y1={54} x2={312} y2={252} {...S.thin} />
      <line x1={306} y1={54} x2={318} y2={54} {...S.thin} />
      <line x1={306} y1={252} x2={318} y2={252} {...S.thin} />
      <V x={322} y={158} anchor="start">L</V>
      <T x={330} y={176} anchor="start">KL = L (K = 1)</T>
      <T x={140} y={150} anchor="middle" color="var(--iris-text)">half sine</T>
      <path d="M150 158 Q190 168 262 154" {...S.iris} strokeDasharray="3 3" />
      <T x={240} y={296}>Pcr = π²EI / (KL)²</T>
    </svg>
  );
}

const MAP: Record<FigureId, () => React.ReactElement> = {
  "right-triangle": RightTriangle,
  "simple-curve": SimpleCurve,
  "differential-leveling": DifferentialLeveling,
  "closed-traverse": ClosedTraverse,
  "vertical-curve": VerticalCurve,
  "soil-phase-diagram": SoilPhase,
  "hydrostatic-plane": HydrostaticPlane,
  "pipe-flow": PipeFlow,
  "simple-beam-udl": SimpleBeam,
  "cantilever-point-load": Cantilever,
  "rc-beam-section": RcSection,
  "column-buckling": ColumnBuckling,
};

export function EngineeringFigure({ id, className }: { id: FigureId; className?: string }) {
  const Fig = MAP[id];
  if (!Fig) return null;
  return (
    <div className={className} role="img" aria-label={id.replace(/-/g, " ") + " diagram"}>
      <div className="mx-auto max-w-[480px] [&_svg]:h-auto [&_svg]:w-full">
        <Fig />
      </div>
    </div>
  );
}
