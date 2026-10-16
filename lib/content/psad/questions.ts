import type { Question } from "@/lib/content/types";

export const questions: Question[] = [
  // ------------------------------------------------------------- Chapter 1
  {
    id: "psad-q01",
    subjectId: "psad",
    chapterId: "psad-ch1",
    topic: "Beam reactions",
    difficulty: "easy",
    stem: String.raw`A simply supported beam AB has a span of 6 m. A concentrated load of 30 kN acts 2 m from support A. Neglecting the beam's weight, what is the reaction at A?`,
    choices: [
      { id: "A", text: "10 kN" },
      { id: "B", text: "20 kN" },
      { id: "C", text: "15 kN" },
      { id: "D", text: "30 kN" },
    ],
    answer: "B",
    solution: {
      summary: String.raw`Moments about B give $R_A = Pb/L = 30(4)/6 = 20$ kN.`,
      steps: [
        {
          text: String.raw`The load is 2 m from A, so it is $b = 6 - 2 = 4$ m from B.`,
        },
        {
          text: String.raw`Take moments about B to eliminate $R_B$.`,
          tex: String.raw`\sum M_B = 0:\quad 6R_A - 30(4) = 0`,
        },
        {
          text: String.raw`Solve for the reaction at A.`,
          tex: String.raw`R_A = \frac{120}{6} = 20\text{ kN}`,
        },
      ],
      formulaIds: ["psad-f-equilibrium", "psad-f-ss-point-load"],
      commonErrors: [
        String.raw`Using the distance to the near support ($Pa/L = 10$ kN), which gives $R_B$ instead of $R_A$.`,
        String.raw`Splitting the load equally (15 kN) as if it were at midspan.`,
      ],
    },
    relatedLessonIds: ["psad-equilibrium-reactions"],
  },
  {
    id: "psad-q02",
    subjectId: "psad",
    chapterId: "psad-ch1",
    topic: "Axial stress",
    difficulty: "easy",
    stem: String.raw`A solid steel rod with a diameter of 20 mm carries an axial tensile load of 50 kN. What is the normal stress in the rod?`,
    choices: [
      { id: "A", text: "39.79 MPa" },
      { id: "B", text: "125.00 MPa" },
      { id: "C", text: "159.15 MPa" },
      { id: "D", text: "636.62 MPa" },
    ],
    answer: "C",
    solution: {
      summary: String.raw`$\sigma = P/A = 50\,000/(\pi \cdot 20^2/4) = 159.15$ MPa.`,
      steps: [
        {
          text: String.raw`Compute the cross-sectional area using the diameter.`,
          tex: String.raw`A = \frac{\pi}{4}(20)^2 = 314.16\text{ mm}^2`,
        },
        {
          text: String.raw`Divide the load in newtons by the area in mm² to get MPa.`,
          tex: String.raw`\sigma = \frac{50\,000}{314.16} = 159.15\text{ MPa}`,
        },
      ],
      formulaIds: ["psad-f-axial-stress"],
      commonErrors: [
        String.raw`Using the diameter as the radius ($A = \pi(20)^2$), giving 39.79 MPa.`,
        String.raw`Using a square area $d^2 = 400$ mm², giving 125 MPa.`,
      ],
    },
    relatedLessonIds: ["psad-axial-thermal-stress", "psad-equilibrium-reactions"],
  },
  {
    id: "psad-q03",
    subjectId: "psad",
    chapterId: "psad-ch1",
    topic: "Thermal stress",
    difficulty: "hard",
    stem: String.raw`A steel bar 5 m long is placed between two rigid walls with a gap of 1.0 mm at one end at the initial temperature. The temperature then rises by 50 °C. Use $\alpha = 11.7\times10^{-6}$ /°C and $E = 200$ GPa. What is the resulting compressive stress in the bar?`,
    choices: [
      { id: "A", text: "77.0 MPa" },
      { id: "B", text: "117.0 MPa" },
      { id: "C", text: "40.0 MPa" },
      { id: "D", text: "157.0 MPa" },
    ],
    answer: "A",
    solution: {
      summary: String.raw`Only the expansion in excess of the gap is restrained: $\sigma = E(\alpha L\Delta T - e)/L = 77.0$ MPa.`,
      steps: [
        {
          text: String.raw`Compute the free thermal expansion.`,
          tex: String.raw`\delta_T = \alpha L\,\Delta T = (11.7\times10^{-6})(5000)(50) = 2.925\text{ mm}`,
        },
        {
          text: String.raw`Since $2.925 > 1.0$ mm, the gap closes and the walls prevent the remaining expansion.`,
          tex: String.raw`\delta_{\text{restrained}} = 2.925 - 1.0 = 1.925\text{ mm}`,
        },
        {
          text: String.raw`The wall force must shorten the bar by 1.925 mm. From $\delta = \sigma L/E$:`,
          tex: String.raw`\sigma = \frac{E\,\delta}{L} = \frac{200\,000(1.925)}{5000} = 77.0\text{ MPa}`,
        },
      ],
      formulaIds: ["psad-f-thermal-stress", "psad-f-axial-deformation"],
      commonErrors: [
        String.raw`Ignoring the gap and using $E\alpha\Delta T = 117.0$ MPa.`,
        String.raw`Adding the gap to the thermal expansion instead of subtracting it (157.0 MPa).`,
        String.raw`Computing the stress from the gap alone, $E e/L = 40.0$ MPa.`,
      ],
    },
    relatedLessonIds: ["psad-axial-thermal-stress"],
  },
  {
    id: "psad-q04",
    subjectId: "psad",
    chapterId: "psad-ch1",
    topic: "Overhanging beam reactions",
    difficulty: "medium",
    stem: String.raw`Beam ABC is 8 m long, with a pin support at A ($x = 0$) and a roller at B ($x = 6$ m), so BC is a 2-m overhang. The beam carries a uniform load of 10 kN/m over its entire 8-m length and a concentrated load of 20 kN at the free end C. What is the vertical reaction at A?`,
    choices: [
      { id: "A", text: "80.0 kN" },
      { id: "B", text: "43.3 kN" },
      { id: "C", text: "30.0 kN" },
      { id: "D", text: "20.0 kN" },
    ],
    answer: "D",
    solution: {
      summary: String.raw`Moments about A give $R_B = 80$ kN; then $R_A = 100 - 80 = 20$ kN (check with moments about B).`,
      steps: [
        {
          text: String.raw`Resultant of the uniform load: $10(8) = 80$ kN acting at $x = 4$ m. Total load is $80 + 20 = 100$ kN.`,
        },
        {
          text: String.raw`Take moments about A.`,
          tex: String.raw`\sum M_A = 0:\quad 6R_B - 80(4) - 20(8) = 0 \;\Rightarrow\; R_B = \frac{480}{6} = 80\text{ kN}`,
        },
        {
          text: String.raw`Take moments about B (loads beyond B act on the opposite side).`,
          tex: String.raw`\sum M_B = 0:\quad 6R_A - 80(6 - 4) + 20(2) = 0 \;\Rightarrow\; R_A = \frac{160 - 40}{6} = 20\text{ kN}`,
        },
        {
          text: String.raw`Check: $R_A + R_B = 20 + 80 = 100$ kN, equal to the total load.`,
        },
      ],
      formulaIds: ["psad-f-equilibrium"],
      commonErrors: [
        String.raw`Reporting $R_B = 80$ kN as the reaction at A.`,
        String.raw`Including only the 60 kN of uniform load between the supports while still using the full total load for vertical equilibrium (43.3 kN).`,
        "Treating the beam as a simple span with symmetrical reactions and ignoring the overhang (30 kN).",
      ],
    },
    relatedLessonIds: ["psad-equilibrium-reactions"],
  },

  // ------------------------------------------------------------- Chapter 2
  {
    id: "psad-q05",
    subjectId: "psad",
    chapterId: "psad-ch2",
    topic: "Maximum moment, uniform load",
    difficulty: "easy",
    stem: String.raw`A simply supported beam with a span of 8 m carries a uniform load of 12 kN/m (including its own weight) over the entire span. What is the maximum bending moment?`,
    figure: "simple-beam-udl",
    choices: [
      { id: "A", text: String.raw`$48\text{ kN}\cdot\text{m}$` },
      { id: "B", text: String.raw`$96\text{ kN}\cdot\text{m}$` },
      { id: "C", text: String.raw`$192\text{ kN}\cdot\text{m}$` },
      { id: "D", text: String.raw`$384\text{ kN}\cdot\text{m}$` },
    ],
    answer: "B",
    solution: {
      summary: String.raw`$M_{\max} = wL^2/8 = 12(8)^2/8 = 96$ kN·m at midspan.`,
      steps: [
        {
          text: String.raw`Each reaction is $wL/2 = 48$ kN, and the shear is zero at midspan.`,
        },
        {
          text: String.raw`The maximum moment equals the area of the shear triangle from the support to midspan.`,
          tex: String.raw`M_{\max} = \frac{1}{2}(48)(4) = \frac{wL^2}{8} = \frac{12(64)}{8} = 96\text{ kN}\cdot\text{m}`,
        },
      ],
      formulaIds: ["psad-f-ss-udl", "psad-f-load-shear-moment"],
      commonErrors: [
        String.raw`Using the cantilever formula $wL^2/2$ (384 kN·m).`,
        String.raw`Reporting the reaction or maximum shear, $wL/2 = 48$, as the moment.`,
      ],
    },
    relatedLessonIds: ["psad-shear-moment-diagrams"],
  },
  {
    id: "psad-q06",
    subjectId: "psad",
    chapterId: "psad-ch2",
    topic: "Maximum moment, combined loads",
    difficulty: "hard",
    stem: String.raw`A simply supported beam with a span of 6 m carries a uniform load of 10 kN/m over the entire span and a concentrated load of 40 kN located 2 m from the left support A. What is the maximum bending moment in the beam?`,
    choices: [
      { id: "A", text: String.raw`$98.33\text{ kN}\cdot\text{m}$` },
      { id: "B", text: String.raw`$105.00\text{ kN}\cdot\text{m}$` },
      { id: "C", text: String.raw`$93.33\text{ kN}\cdot\text{m}$` },
      { id: "D", text: String.raw`$113.33\text{ kN}\cdot\text{m}$` },
    ],
    answer: "C",
    solution: {
      summary: String.raw`The shear changes sign under the 40-kN load, so $M_{\max} = M_{x=2} = 56.67(2) - 10(2)^2/2 = 93.33$ kN·m.`,
      steps: [
        {
          text: String.raw`Find $R_A$ by moments about B.`,
          tex: String.raw`R_A = \frac{60(3) + 40(4)}{6} = 56.67\text{ kN}`,
        },
        {
          text: String.raw`Locate zero shear. Just left of the load $V = 56.67 - 10(2) = 36.67$ kN; just right of it $V = 36.67 - 40 = -3.33$ kN. The shear changes sign at $x = 2$ m.`,
        },
        {
          text: String.raw`Compute the moment at $x = 2$ m.`,
          tex: String.raw`M_{\max} = 56.67(2) - \frac{10(2)^2}{2} = 113.33 - 20 = 93.33\text{ kN}\cdot\text{m}`,
        },
      ],
      formulaIds: ["psad-f-load-shear-moment", "psad-f-ss-point-load"],
      commonErrors: [
        String.raw`Adding $wL^2/8 = 45$ and $Pab/L = 53.33$ (98.33 kN·m) — these maxima occur at different sections.`,
        String.raw`Adding $wL^2/8$ and $PL/4$ (105 kN·m), treating the point load as if it were at midspan.`,
        String.raw`Forgetting the moment of the uniform load to the left of the section (113.33 kN·m).`,
      ],
    },
    relatedLessonIds: ["psad-shear-moment-diagrams"],
  },
  {
    id: "psad-q07",
    subjectId: "psad",
    chapterId: "psad-ch2",
    topic: "Cantilever deflection",
    difficulty: "medium",
    stem: String.raw`A steel cantilever beam 3 m long carries a concentrated load of 20 kN at its free end. $E = 200$ GPa and $I = 60\times10^6$ mm⁴. Neglecting the beam's weight, what is the deflection at the free end?`,
    figure: "cantilever-point-load",
    choices: [
      { id: "A", text: "15.00 mm" },
      { id: "B", text: "5.63 mm" },
      { id: "C", text: "45.00 mm" },
      { id: "D", text: "0.94 mm" },
    ],
    answer: "A",
    solution: {
      summary: String.raw`$\delta = PL^3/(3EI) = 20(3)^3/(3 \times 12\,000) = 0.015$ m $= 15.00$ mm.`,
      steps: [
        {
          text: String.raw`Convert the flexural rigidity to kN·m².`,
          tex: String.raw`EI = (200\times10^6\text{ kPa})(60\times10^{-6}\text{ m}^4) = 12\,000\text{ kN}\cdot\text{m}^2`,
        },
        {
          text: String.raw`Apply the tip-deflection formula for a cantilever with an end load.`,
          tex: String.raw`\delta = \frac{PL^3}{3EI} = \frac{20(3)^3}{3(12\,000)} = 0.015\text{ m} = 15.00\text{ mm}`,
        },
      ],
      formulaIds: ["psad-f-cantilever-point-deflection"],
      commonErrors: [
        String.raw`Using the uniform-load cantilever coefficient $1/8$ (5.63 mm).`,
        String.raw`Omitting the factor 3 in the denominator (45.00 mm).`,
        String.raw`Using the simple-beam midspan coefficient $1/48$ (0.94 mm).`,
      ],
    },
    relatedLessonIds: ["psad-beam-deflections", "psad-shear-moment-diagrams"],
  },
  {
    id: "psad-q08",
    subjectId: "psad",
    chapterId: "psad-ch2",
    topic: "Truss member forces",
    difficulty: "easy",
    stem: String.raw`A symmetrical triangular roof truss has a span of 8 m and a rise of 3 m. Its two rafters meet at the apex, and a horizontal tie connects the two supports (pin at one end, roller at the other). A single vertical load of 60 kN acts at the apex. What is the force in the horizontal tie?`,
    choices: [
      { id: "A", text: "50 kN compression" },
      { id: "B", text: "30 kN tension" },
      { id: "C", text: "22.5 kN tension" },
      { id: "D", text: "40 kN tension" },
    ],
    answer: "D",
    solution: {
      summary: String.raw`At a support joint, $F_{\text{rafter}}\sin\theta = 30$ kN gives 50 kN; the tie force is $50\cos\theta = 40$ kN tension.`,
      steps: [
        {
          text: String.raw`By symmetry each reaction is $60/2 = 30$ kN. Each rafter spans 4 m horizontally and 3 m vertically, so its length is 5 m.`,
          tex: String.raw`\sin\theta = \frac{3}{5},\qquad \cos\theta = \frac{4}{5}`,
        },
        {
          text: String.raw`Vertical equilibrium of the support joint gives the rafter force (compression).`,
          tex: String.raw`F_R \cdot \frac{3}{5} = 30 \;\Rightarrow\; F_R = 50\text{ kN (C)}`,
        },
        {
          text: String.raw`Horizontal equilibrium of the same joint gives the tie force (tension).`,
          tex: String.raw`F_T = F_R\cdot\frac{4}{5} = 40\text{ kN (T)}`,
        },
      ],
      formulaIds: ["psad-f-equilibrium"],
      commonErrors: [
        "Reporting the rafter force (50 kN compression) instead of the tie force.",
        String.raw`Swapping the sine and cosine of the rafter slope, giving $30(3/4) = 22.5$ kN.`,
      ],
    },
    relatedLessonIds: ["psad-determinate-trusses", "psad-equilibrium-reactions"],
  },

  // ------------------------------------------------------------- Chapter 3
  {
    id: "psad-q09",
    subjectId: "psad",
    chapterId: "psad-ch3",
    topic: "Slenderness ratio",
    difficulty: "easy",
    stem: String.raw`A solid circular steel strut has a diameter of 40 mm and a length of 2 m. Both ends are pinned. What is its slenderness ratio $KL/r$?`,
    choices: [
      { id: "A", text: "100" },
      { id: "B", text: "200" },
      { id: "C", text: "50" },
      { id: "D", text: "400" },
    ],
    answer: "B",
    solution: {
      summary: String.raw`For a solid circle $r = d/4 = 10$ mm, so $KL/r = 1.0(2000)/10 = 200$.`,
      steps: [
        {
          text: String.raw`Radius of gyration of a solid circular section:`,
          tex: String.raw`r = \sqrt{\frac{I}{A}} = \sqrt{\frac{\pi d^4/64}{\pi d^2/4}} = \frac{d}{4} = \frac{40}{4} = 10\text{ mm}`,
        },
        {
          text: String.raw`Pinned–pinned gives $K = 1.0$.`,
          tex: String.raw`\frac{KL}{r} = \frac{1.0(2000)}{10} = 200`,
        },
      ],
      formulaIds: ["psad-f-slenderness-ratio"],
      commonErrors: [
        String.raw`Using the geometric radius $d/2 = 20$ mm as the radius of gyration (100).`,
        String.raw`Using the diameter in place of $r$ (50).`,
      ],
    },
    relatedLessonIds: ["psad-column-buckling"],
  },
  {
    id: "psad-q10",
    subjectId: "psad",
    chapterId: "psad-ch3",
    topic: "Nominal moment of RC beam",
    difficulty: "medium",
    figure: "rc-beam-section",
    stem: String.raw`A rectangular concrete beam is 300 mm wide with a total depth of 560 mm and an effective depth of 500 mm. It is reinforced with three 25-mm diameter tension bars. Use $f'_c = 28$ MPa and $f_y = 420$ MPa, and assume the steel yields. What is the nominal moment strength $M_n$?`,
    choices: [
      { id: "A", text: String.raw`$254.2\text{ kN}\cdot\text{m}$` },
      { id: "B", text: String.raw`$319.6\text{ kN}\cdot\text{m}$` },
      { id: "C", text: String.raw`$282.5\text{ kN}\cdot\text{m}$` },
      { id: "D", text: String.raw`$309.3\text{ kN}\cdot\text{m}$` },
    ],
    answer: "C",
    solution: {
      summary: String.raw`$a = A_sf_y/(0.85f'_cb) = 86.62$ mm and $M_n = A_sf_y(d - a/2) = 282.5$ kN·m.`,
      steps: [
        {
          text: String.raw`Area of three 25-mm bars:`,
          tex: String.raw`A_s = 3\cdot\frac{\pi}{4}(25)^2 = 1472.6\text{ mm}^2`,
        },
        {
          text: String.raw`Depth of the Whitney stress block:`,
          tex: String.raw`a = \frac{1472.6(420)}{0.85(28)(300)} = 86.62\text{ mm}`,
        },
        {
          text: String.raw`Verify yielding: $c = 86.62/0.85 = 101.9$ mm and $\varepsilon_t = 0.003(500 - 101.9)/101.9 = 0.0117 > 0.0021$, so the steel yields.`,
        },
        {
          text: String.raw`Nominal moment using the effective depth:`,
          tex: String.raw`M_n = 1472.6(420)\left(500 - \frac{86.62}{2}\right) = 282.5\times10^6\text{ N}\cdot\text{mm} = 282.5\text{ kN}\cdot\text{m}`,
        },
      ],
      formulaIds: ["psad-f-whitney-depth", "psad-f-nominal-moment-singly", "psad-f-tensile-strain"],
      commonErrors: [
        String.raw`Reporting the design strength $\phi M_n = 0.90(282.5) = 254.2$ kN·m when $M_n$ was asked.`,
        String.raw`Using the total depth $h = 560$ mm instead of $d$ (319.6 kN·m).`,
        String.raw`Ignoring the stress-block depth and using a lever arm of $d$ (309.3 kN·m).`,
      ],
    },
    relatedLessonIds: ["psad-rc-singly-reinforced"],
  },
  {
    id: "psad-q11",
    subjectId: "psad",
    chapterId: "psad-ch3",
    topic: "Required tension steel",
    difficulty: "hard",
    stem: String.raw`A singly reinforced rectangular beam with $b = 300$ mm and $d = 500$ mm must resist a factored moment $M_u = 250$ kN·m. Use $f'_c = 28$ MPa, $f_y = 420$ MPa and $\phi = 0.90$ (verify that the section is tension-controlled). What is the required area of tension steel?`,
    choices: [
      { id: "A", text: String.raw`$1446\text{ mm}^2$` },
      { id: "B", text: String.raw`$1288\text{ mm}^2$` },
      { id: "C", text: String.raw`$1026\text{ mm}^2$` },
      { id: "D", text: String.raw`$1556\text{ mm}^2$` },
    ],
    answer: "A",
    solution: {
      summary: String.raw`Solve $M_u/\phi = A_sf_y\left(d - \dfrac{A_sf_y}{2(0.85f'_cb)}\right)$ for $A_s$, giving $A_s \approx 1446$ mm² ($\varepsilon_t \approx 0.012$, tension-controlled).`,
      steps: [
        {
          text: String.raw`Required nominal moment:`,
          tex: String.raw`M_n = \frac{M_u}{\phi} = \frac{250}{0.90} = 277.78\text{ kN}\cdot\text{m} = 277.78\times10^6\text{ N}\cdot\text{mm}`,
        },
        {
          text: String.raw`Express $a$ in terms of $A_s$: $a = A_s(420)/[0.85(28)(300)] = 0.058824A_s$. Substitute into $M_n = A_sf_y(d - a/2)$:`,
          tex: String.raw`277.78\times10^6 = 420A_s\left(500 - 0.029412A_s\right)`,
        },
        {
          text: String.raw`Rearrange into a quadratic and take the smaller root.`,
          tex: String.raw`12.353A_s^2 - 210\,000A_s + 277.78\times10^6 = 0 \;\Rightarrow\; A_s = 1445.7\text{ mm}^2`,
        },
        {
          text: String.raw`Verify $\phi$: $a = 85.04$ mm, $c = 85.04/0.85 = 100.05$ mm.`,
          tex: String.raw`\varepsilon_t = 0.003\,\frac{500 - 100.05}{100.05} = 0.0120 \ge 0.005\ \Rightarrow\ \phi = 0.90\ \checkmark`,
        },
      ],
      formulaIds: ["psad-f-nominal-moment-singly", "psad-f-whitney-depth", "psad-f-tensile-strain", "psad-f-beta1"],
      commonErrors: [
        String.raw`Designing for $M_u$ without dividing by $\phi$ (1288 mm²).`,
        String.raw`Multiplying by $\phi$ instead of dividing, i.e. using $0.90M_u$ as the nominal moment (1026 mm²).`,
        String.raw`Assuming a lever arm of $0.85d$ instead of solving for $a$ (1556 mm²).`,
      ],
    },
    relatedLessonIds: ["psad-rc-singly-reinforced"],
  },
  {
    id: "psad-q12",
    subjectId: "psad",
    chapterId: "psad-ch3",
    topic: "Euler buckling load",
    difficulty: "medium",
    figure: "column-buckling",
    stem: String.raw`A 5-m steel column is pinned at both ends and is unbraced about both axes. Its section has $I_x = 80\times10^6$ mm⁴ and $I_y = 25\times10^6$ mm⁴. With $E = 200$ GPa, what is the Euler critical load? Assume elastic buckling governs.`,
    choices: [
      { id: "A", text: "6316.5 kN" },
      { id: "B", text: "493.5 kN" },
      { id: "C", text: "7895.7 kN" },
      { id: "D", text: "1973.9 kN" },
    ],
    answer: "D",
    solution: {
      summary: String.raw`Buckling occurs about the weak axis: $P_{cr} = \pi^2(200\,000)(25\times10^6)/(5000)^2 = 1973.9$ kN.`,
      steps: [
        {
          text: String.raw`Both axes have the same effective length ($K = 1.0$, $KL = 5000$ mm), so the smaller moment of inertia governs: $I_{\min} = I_y = 25\times10^6$ mm⁴.`,
        },
        {
          text: String.raw`Apply Euler's formula in N and mm.`,
          tex: String.raw`P_{cr} = \frac{\pi^2(200\,000)(25\times10^6)}{(1.0 \times 5000)^2} = 1.974\times10^6\text{ N} = 1973.9\text{ kN}`,
        },
      ],
      formulaIds: ["psad-f-euler-load"],
      commonErrors: [
        String.raw`Using the strong-axis $I_x$ (6316.5 kN).`,
        String.raw`Using $K = 2.0$ (fixed–free) instead of 1.0 (493.5 kN).`,
        String.raw`Using $K = 0.5$ (fixed–fixed) instead of 1.0 (7895.7 kN).`,
      ],
    },
    relatedLessonIds: ["psad-column-buckling"],
  },

  // ------------------------------------------------------------- Chapter 4
  {
    id: "psad-q13",
    subjectId: "psad",
    chapterId: "psad-ch4",
    topic: "CPM total float",
    difficulty: "medium",
    stem: String.raw`A project network has the following activities (duration in days; predecessors in parentheses): P = 4 (none), Q = 3 (none), R = 5 (P), S = 2 (Q), T = 4 (R and S). What is the total float of activity S?`,
    choices: [
      { id: "A", text: "0 days" },
      { id: "B", text: "4 days" },
      { id: "C", text: "7 days" },
      { id: "D", text: "5 days" },
    ],
    answer: "B",
    solution: {
      summary: String.raw`Duration is 13 days (P–R–T); for S, $ES = 3$ and $LS = 9 - 2 = 7$, so $TF = 4$ days.`,
      steps: [
        {
          text: String.raw`Forward pass: P 0→4, Q 0→3, R 4→9, S 3→5, T starts at $\max(9, 5) = 9$ and finishes at 13. The project duration is 13 days.`,
        },
        {
          text: String.raw`Backward pass for S: its only successor T has $LS = 13 - 4 = 9$, so $LF_S = 9$.`,
          tex: String.raw`LS_S = LF_S - t_S = 9 - 2 = 7`,
        },
        {
          text: String.raw`Total float of S:`,
          tex: String.raw`TF_S = LS_S - ES_S = 7 - 3 = 4\text{ days}`,
        },
      ],
      formulaIds: ["psad-f-cpm-float"],
      commonErrors: [
        String.raw`Reporting the late start (7) or the early finish (5) of S instead of its float.`,
        "Assuming every activity that feeds the final activity is critical (0 days).",
      ],
    },
    relatedLessonIds: ["psad-cpm-scheduling"],
  },
  {
    id: "psad-q14",
    subjectId: "psad",
    chapterId: "psad-ch4",
    topic: "CPM effect of delay",
    difficulty: "hard",
    stem: String.raw`A project network has these activities (duration in days; predecessors in parentheses): A = 3 (none), B = 5 (none), C = 4 (A), D = 6 (A), E = 2 (B and C), F = 4 (D and E). If activity B is delayed by 4 days and everything else proceeds as planned, what will the new project duration be?`,
    choices: [
      { id: "A", text: "13 days" },
      { id: "B", text: "17 days" },
      { id: "C", text: "15 days" },
      { id: "D", text: "11 days" },
    ],
    answer: "C",
    solution: {
      summary: String.raw`The original duration is 13 days and B has 2 days of total float, so a 4-day delay extends the project by $4 - 2 = 2$ days, to 15 days.`,
      steps: [
        {
          text: String.raw`Original forward pass: A 0→3, B 0→5, C 3→7, D 3→9, E $\max(5,7) = 7$→9, F $\max(9,9) = 9$→13. Duration = 13 days; critical paths A–C–E–F and A–D–F.`,
        },
        {
          text: String.raw`Total float of B: its successor E has $LS = 9 - 2 = 7$, so $LF_B = 7$ and $TF_B = 7 - 5 = 2$ days.`,
        },
        {
          text: String.raw`With B taking 9 days, re-run the forward pass from B onward: E starts at $\max(9, 7) = 9$ and finishes at 11; F starts at $\max(9, 11) = 11$.`,
          tex: String.raw`EF_F = 11 + 4 = 15\text{ days}`,
        },
        {
          text: String.raw`Check: project delay $= \Delta - TF = 4 - 2 = 2$ days, and $13 + 2 = 15$ days. The new critical path is B–E–F.`,
        },
      ],
      formulaIds: ["psad-f-cpm-float"],
      commonErrors: [
        String.raw`Adding the full delay to the original duration without using the float (17 days).`,
        "Assuming the delay is absorbed because B is not on the original critical path (13 days).",
        "Taking the length of the original path B–E–F, 11 days, as the project duration.",
      ],
    },
    relatedLessonIds: ["psad-cpm-scheduling"],
  },
  {
    id: "psad-q15",
    subjectId: "psad",
    chapterId: "psad-ch4",
    topic: "Concrete quantity estimate",
    difficulty: "medium",
    stem: String.raw`A small structure has 4 isolated footings, each 1.5 m × 1.5 m × 0.40 m thick, and 4 columns, each 0.35 m × 0.35 m in section and 3.2 m high above the footing. For the concrete mix specified, use 9.0 bags of cement (40 kg) per cubic meter of concrete. How many bags of cement are required? Round up to the next whole bag.`,
    choices: [
      { id: "A", text: "47 bags" },
      { id: "B", text: "33 bags" },
      { id: "C", text: "23 bags" },
      { id: "D", text: "15 bags" },
    ],
    answer: "A",
    solution: {
      summary: String.raw`Total concrete $= 4(0.900) + 4(0.392) = 5.168$ m³; cement $= 9.0(5.168) = 46.51$, so 47 bags.`,
      steps: [
        {
          text: String.raw`Volume of the footings:`,
          tex: String.raw`V_f = 4(1.5)(1.5)(0.40) = 3.600\text{ m}^3`,
        },
        {
          text: String.raw`Volume of the columns:`,
          tex: String.raw`V_c = 4(0.35)(0.35)(3.2) = 1.568\text{ m}^3`,
        },
        {
          text: String.raw`Total volume and cement requirement:`,
          tex: String.raw`9.0\,(3.600 + 1.568) = 9.0\,(5.168) = 46.51 \;\Rightarrow\; 47\text{ bags}`,
        },
      ],
      formulaIds: ["psad-f-concrete-materials"],
      commonErrors: [
        "Estimating only the footings (32.4, so 33 bags) or only the columns (14.1, so 15 bags).",
        "Counting only one footing but all four columns, 0.900 + 1.568 = 2.468 m³ (23 bags).",
      ],
    },
    relatedLessonIds: ["psad-quantity-estimates", "psad-cpm-scheduling"],
  },
];
