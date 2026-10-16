import type { Lesson } from "@/lib/content/types";

// ---------------------------------------------------------------------------
// Chapter 1 — Statics and Mechanics of Materials
// ---------------------------------------------------------------------------
const equilibriumReactions: Lesson = {
  id: "psad-equilibrium-reactions",
  subjectId: "psad",
  chapterId: "psad-ch1",
  title: "Equilibrium and Support Reactions",
  summary:
    "Draw correct free-body diagrams, replace distributed loads by their resultants, and solve beam reactions with the three equations of equilibrium.",
  minutes: 14,
  status: "available",
  topics: ["Free-body diagrams", "Support types", "Distributed load resultants", "Beam reactions", "Static determinacy"],
  blocks: [
    {
      type: "paragraph",
      text: String.raw`Almost every structural problem in the board exam starts with the same step: finding the support reactions. Shear and moment diagrams, deflections, truss member forces and even reinforced concrete design all depend on reactions that are computed correctly. This lesson builds a reliable routine — free-body diagram, load resultants, equilibrium equations, and an independent check — that you can run in under two minutes per problem.`,
    },
    { type: "heading", id: "free-body-diagrams", text: "Free-body diagrams and support types" },
    {
      type: "paragraph",
      text: String.raw`A **free-body diagram (FBD)** isolates the structure from its supports and replaces each support by the forces it can exert. The number of reaction components depends on what the support prevents: a support that prevents translation in a direction provides a force in that direction, and a support that prevents rotation provides a moment.`,
    },
    {
      type: "table",
      caption: "Common supports for planar structures",
      head: ["Support", "Prevents", "Reaction components", "Unknowns"],
      rows: [
        ["Roller / rocker / smooth surface", "Translation normal to the surface", String.raw`One force normal to the surface, $R$`, "1"],
        ["Cable or short link", "Translation along the cable or link", "One force along the member (cable in tension only)", "1"],
        ["Pin or hinge", "Translation in any direction", String.raw`Two forces, $R_x$ and $R_y$`, "2"],
        ["Fixed support", "Translation and rotation", String.raw`$R_x$, $R_y$ and a moment $M$`, "3"],
      ],
    },
    {
      type: "paragraph",
      text: String.raw`When you are unsure of the direction of a reaction, simply assume one. If the computed value comes out negative, the reaction acts opposite to the assumed direction — there is no need to redraw the diagram.`,
    },
    { type: "heading", id: "equations-of-equilibrium", text: "Equations of equilibrium" },
    {
      type: "paragraph",
      text: String.raw`For a body acted on by coplanar forces, static equilibrium requires the resultant force and the resultant moment to vanish. This gives exactly three independent scalar equations for each free body.`,
    },
    {
      type: "math",
      tex: String.raw`\sum F_x = 0,\qquad \sum F_y = 0,\qquad \sum M_O = 0`,
      label: "Equilibrium of a coplanar force system",
    },
    {
      type: "paragraph",
      text: String.raw`The moment center O can be any point, even one off the body. Choosing O at a support where two unknowns intersect eliminates both from the equation. For a simply supported beam, $\sum M_A = 0$ gives $R_B$ directly and $\sum M_B = 0$ gives $R_A$ directly; $\sum F_y = 0$ is then free to serve as a check.`,
    },
    {
      type: "paragraph",
      text: String.raw`**Distributed loads** must be replaced by their resultant before taking moments. The resultant equals the area of the load diagram and acts through the centroid of that area. A uniform load $w$ over a length $L$ has resultant $wL$ at $L/2$; a triangular load rising from zero to $w_0$ has resultant $w_0L/2$ located $L/3$ from the larger end.`,
    },
    {
      type: "math",
      tex: String.raw`W = \int_0^L w(x)\,dx,\qquad \bar{x} = \frac{\int_0^L x\,w(x)\,dx}{W}`,
      label: "Resultant of a distributed load and its location",
    },
    {
      type: "callout",
      tone: "tip",
      title: "The far-support rule for a single load",
      text: String.raw`For a simple beam with one concentrated load $P$, each reaction is $P$ times the distance to the **far** support divided by the span: $R_A = Pb/L$ and $R_B = Pa/L$. The support closer to the load always takes the larger share.`,
    },
    {
      type: "figure",
      figure: "simple-beam-udl",
      caption: "Simply supported beam of span L under a uniform load w. By symmetry each reaction is wL/2.",
    },
    { type: "heading", id: "determinacy", text: "Static determinacy and stability" },
    {
      type: "paragraph",
      text: String.raw`A beam with $r$ unknown reaction components is statically determinate when $r = 3$ and the supports are arranged so that the beam cannot move (the reactions are not all parallel and not all concurrent). When $r > 3$ the beam is statically indeterminate to degree $r - 3$; extra equations from deformation compatibility are required. When $r < 3$, or when the reactions are all parallel or all concurrent, the beam is unstable. A simple beam (pin + roller) and a cantilever (one fixed end) each have exactly three reactions; a propped cantilever (fixed + roller) has four and is indeterminate to the first degree.`,
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Draw the FBD: remove the supports and show every reaction component with an assumed direction.",
        "Replace each distributed load by its resultant at the centroid of the load diagram.",
        String.raw`Take moments about one support to get the reaction at the other support.`,
        String.raw`Take moments about the second support to get the first reaction.`,
        String.raw`Check with $\sum F_y = 0$ — the reactions must add up to the total vertical load.`,
      ],
    },
    { type: "heading", id: "worked-example", text: "Worked example" },
    {
      type: "example",
      title: "Simple beam with partial uniform load and a point load",
      problem: String.raw`A simply supported beam AB has a span of 8 m. It carries a uniform load of 15 kN/m over the left 4 m (from A) and a concentrated load of 40 kN located 6 m from A. Determine the reactions at A and B.`,
      given: [
        String.raw`$L = 8$ m, $w = 15$ kN/m over $0 \le x \le 4$ m`,
        String.raw`$P = 40$ kN at $x = 6$ m`,
      ],
      steps: [
        {
          text: String.raw`Replace the uniform load by its resultant, which acts at the middle of the loaded length.`,
          tex: String.raw`W = 15(4) = 60\text{ kN}\quad\text{at } x = 2\text{ m}`,
        },
        {
          text: String.raw`Take moments about A (counterclockwise positive) to eliminate $R_A$.`,
          tex: String.raw`\sum M_A = 0:\quad 8R_B - 60(2) - 40(6) = 0`,
        },
        {
          text: String.raw`Solve for the reaction at B.`,
          tex: String.raw`R_B = \frac{120 + 240}{8} = 45\text{ kN}`,
        },
        {
          text: String.raw`Take moments about B to find $R_A$ independently.`,
          tex: String.raw`\sum M_B = 0:\quad R_A = \frac{60(6) + 40(2)}{8} = \frac{440}{8} = 55\text{ kN}`,
        },
        {
          text: String.raw`Check vertical equilibrium: the reactions must equal the total load of $60 + 40 = 100$ kN.`,
          tex: String.raw`R_A + R_B = 55 + 45 = 100\text{ kN}\ \checkmark`,
        },
      ],
      answer: String.raw`$R_A = 55$ kN upward and $R_B = 45$ kN upward.`,
    },
    {
      type: "callout",
      tone: "exam",
      title: "Always use the second moment equation as your check",
      text: String.raw`Solving $R_A$ by subtraction ($R_A = \sum P - R_B$) propagates any error in $R_B$. Computing both reactions from separate moment equations and then checking $\sum F_y = 0$ catches lever-arm mistakes, such as measuring a distance from the wrong support or using the full length of a distributed load as its lever arm.`,
    },
    {
      type: "callout",
      tone: "warning",
      title: "Overhangs reverse the lever arm",
      text: String.raw`On a beam with an overhang, loads beyond a support produce moments about that support in the opposite sense to loads within the span. They can make the far reaction small or even negative (uplift), so keep careful track of signs.`,
    },
    { type: "check", questionId: "psad-q01" },
    { type: "check", questionId: "psad-q04" },
  ],
  formulaIds: ["psad-f-equilibrium", "psad-f-ss-point-load"],
  questionIds: ["psad-q01", "psad-q04", "psad-q08"],
};

// ---------------------------------------------------------------------------
// Chapter 2 — Structural Analysis
// ---------------------------------------------------------------------------
const shearMomentDiagrams: Lesson = {
  id: "psad-shear-moment-diagrams",
  subjectId: "psad",
  chapterId: "psad-ch2",
  title: "Shear and Moment Diagrams",
  summary:
    "Use the load–shear–moment relationships to sketch V and M diagrams quickly and to locate the maximum moment where the shear passes through zero.",
  minutes: 16,
  status: "available",
  topics: ["Sign convention", "Load–shear–moment relations", "Area method", "Maximum moment", "Standard beam cases"],
  blocks: [
    {
      type: "paragraph",
      text: String.raw`The maximum bending moment and the maximum shear are the two numbers that drive the design of every beam. Shear and moment diagrams show how these internal forces vary along the span, and the area method lets you construct them without writing a separate equation for every segment. Master this lesson and most beam questions reduce to a few multiplications.`,
    },
    { type: "heading", id: "sign-convention", text: "Sign convention" },
    {
      type: "paragraph",
      text: String.raw`Cut the beam at a section and look at the internal forces. The standard beam convention used in most Philippine references is:`,
    },
    {
      type: "list",
      items: [
        String.raw`**Positive shear**: the resultant of the forces to the left of the section acts upward (equivalently, forces to the right act downward).`,
        String.raw`**Positive moment**: the beam bends concave upward (sagging), with tension at the bottom fibers.`,
        String.raw`A simply supported beam under downward loads has positive moment everywhere; a cantilever under downward loads has negative (hogging) moment everywhere.`,
      ],
    },
    { type: "heading", id: "load-shear-moment", text: "Load–shear–moment relationships" },
    {
      type: "paragraph",
      text: String.raw`Equilibrium of a short beam element of length $dx$ carrying a downward load $w$ gives two differential relations. Integrating them produces the area method: going from left to right, the shear changes by minus the area of the load diagram, and the moment changes by the area of the shear diagram.`,
    },
    {
      type: "math",
      tex: String.raw`\frac{dV}{dx} = -w \quad\Longrightarrow\quad V_2 - V_1 = -\int_{x_1}^{x_2} w\,dx`,
      label: "Load and shear",
    },
    {
      type: "math",
      tex: String.raw`\frac{dM}{dx} = V \quad\Longrightarrow\quad M_2 - M_1 = \int_{x_1}^{x_2} V\,dx`,
      label: "Shear and moment",
    },
    {
      type: "table",
      caption: "Shape of the diagrams over a segment",
      head: ["Loading on the segment", "Shear diagram", "Moment diagram"],
      rows: [
        ["No load", "Horizontal line (constant)", "Straight sloping line"],
        ["Uniform load w", "Straight sloping line, slope −w", "Second-degree parabola"],
        ["Triangular (linearly varying) load", "Second-degree curve", "Third-degree curve"],
        ["Concentrated load P", "Sudden jump of magnitude P", "Change in slope (kink)"],
        ["Applied couple M₀", "No change", "Sudden jump of magnitude M₀"],
      ],
    },
    {
      type: "callout",
      tone: "concept",
      title: "Where is the maximum moment?",
      text: String.raw`Because $dM/dx = V$, the moment reaches a maximum or minimum where the shear is **zero** or **changes sign**. Under a uniform load this happens at a point inside the segment; at a concentrated load it happens where the jump carries the shear from positive to negative. Always check the free end of an overhang and fixed supports as well.`,
    },
    { type: "heading", id: "standard-cases", text: "Standard cases to memorize" },
    {
      type: "math",
      tex: String.raw`\begin{aligned} &\text{Simple beam, full uniform load:} && M_{\max} = \frac{wL^2}{8},\quad V_{\max} = \frac{wL}{2} \\ &\text{Simple beam, load P at a from A:} && M_{\max} = \frac{Pab}{L}\ \ \Big(= \tfrac{PL}{4}\text{ at midspan}\Big) \\ &\text{Cantilever, tip load P:} && M_{\max} = PL \\ &\text{Cantilever, full uniform load:} && M_{\max} = \frac{wL^2}{2} \end{aligned}`,
      label: "Maximum moments for common beams",
    },
    {
      type: "figure",
      figure: "simple-beam-udl",
      caption: "Simple beam with uniform load: the shear varies linearly from +wL/2 to −wL/2 and the moment is a parabola peaking at wL²/8 at midspan.",
    },
    {
      type: "figure",
      figure: "cantilever-point-load",
      caption: "Cantilever with a tip load P: the shear is constant (P) and the moment varies linearly to −PL at the fixed support.",
    },
    {
      type: "paragraph",
      text: String.raw`These closed-form results are worth memorizing because many exam problems are built from them, either directly or through superposition of reactions. When the loading is irregular, fall back on a systematic routine: compute the reactions, then walk along the beam from left to right, updating the shear at each load and accumulating the moment as the area under the shear diagram. The routine below works for simple beams, overhanging beams and cantilevers alike.`,
    },
    {
      type: "list",
      ordered: true,
      items: [
        String.raw`Solve all reactions and check them with $\sum F_y = 0$.`,
        "Start the shear diagram at zero at the left end. Jump up or down at every concentrated force; slope downward by w under distributed loads.",
        "The shear diagram must close back to zero at the right end — if it does not, a reaction is wrong.",
        "Start the moment diagram at zero at a free or simply supported end. Add the signed area of each shear segment to get the moment at its end.",
        "Mark every point where the shear crosses zero; the largest moment in magnitude is at one of these points, at a fixed support, or at a point where a couple is applied.",
      ],
    },
    {
      type: "paragraph",
      text: String.raw`On overhanging beams the moment over the interior support is usually negative while the moment within the span is positive, so the diagram crosses zero at a **point of inflection**. Designers need both the maximum positive and the maximum negative moment, because they govern the bottom and the top reinforcement respectively.`,
    },
    { type: "heading", id: "worked-example", text: "Worked example: maximum moment under combined loads" },
    {
      type: "example",
      title: "Uniform load plus a point load",
      problem: String.raw`A simply supported beam of span 10 m carries a uniform load of 6 kN/m over the entire span and a concentrated load of 30 kN located 7 m from the left support A. Determine the location and magnitude of the maximum moment.`,
      given: [
        String.raw`$L = 10$ m, $w = 6$ kN/m (full span)`,
        String.raw`$P = 30$ kN at $x = 7$ m from A`,
      ],
      steps: [
        {
          text: String.raw`Find $R_A$ by moments about B. The uniform-load resultant is $60$ kN at 5 m from B; the point load is 3 m from B.`,
          tex: String.raw`R_A = \frac{60(5) + 30(3)}{10} = 39\text{ kN},\qquad R_B = 90 - 39 = 51\text{ kN}`,
        },
        {
          text: String.raw`Write the shear in the segment left of the point load and set it to zero.`,
          tex: String.raw`V(x) = 39 - 6x = 0 \quad\Rightarrow\quad x = 6.5\text{ m}`,
        },
        {
          text: String.raw`Since $x = 6.5$ m is less than 7 m, the zero-shear point lies inside the segment where the expression is valid. (Just left of the load $V = 39 - 42 = -3$ kN, already negative.)`,
        },
        {
          text: String.raw`Compute the moment at $x = 6.5$ m. This equals the area of the shear triangle from A to the zero-shear point.`,
          tex: String.raw`M_{\max} = 39(6.5) - \frac{6(6.5)^2}{2} = \frac{1}{2}(39)(6.5) = 126.75\text{ kN}\cdot\text{m}`,
        },
        {
          text: String.raw`For comparison, the moment under the point load is slightly smaller, confirming the maximum is not at the load.`,
          tex: String.raw`M_{x=7} = 39(7) - \frac{6(7)^2}{2} = 126\text{ kN}\cdot\text{m}`,
        },
      ],
      answer: String.raw`$M_{\max} = 126.75$ kN·m at 6.5 m from A.`,
    },
    {
      type: "callout",
      tone: "warning",
      title: "Do not add maximum moments from different load cases",
      text: String.raw`Superposition is valid for moments **at the same section**. Adding $wL^2/8$ (which occurs at midspan) to $Pab/L$ (which occurs under the load) overestimates the maximum whenever the load is not at midspan. Superpose the reactions or the moment equations, then locate the maximum.`,
    },
    {
      type: "callout",
      tone: "exam",
      title: "Shortcut: maximum moment from the shear triangle",
      text: String.raw`For a segment that starts at a simple support and carries only a uniform load, $M_{\max} = R^2/(2w)$, where $R$ is the reaction at that support. In the example, $39^2/(2 \times 6) = 126.75$ kN·m.`,
    },
    { type: "check", questionId: "psad-q05" },
    { type: "check", questionId: "psad-q06" },
  ],
  formulaIds: ["psad-f-load-shear-moment", "psad-f-ss-udl", "psad-f-ss-point-load"],
  questionIds: ["psad-q05", "psad-q06", "psad-q07"],
};

// ---------------------------------------------------------------------------
// Chapter 3 — Reinforced Concrete and Steel Design
// ---------------------------------------------------------------------------
const rcSinglyReinforced: Lesson = {
  id: "psad-rc-singly-reinforced",
  subjectId: "psad",
  chapterId: "psad-ch3",
  title: "Singly Reinforced Rectangular Beams (USD)",
  summary:
    "Analyze a singly reinforced beam by the strength design method: Whitney stress block, β1, nominal moment, net tensile strain and the strength reduction factor.",
  minutes: 18,
  status: "available",
  topics: ["Strength design assumptions", "Whitney stress block", "β1 factor", "Nominal moment", "Net tensile strain and φ"],
  blocks: [
    {
      type: "paragraph",
      text: String.raw`Reinforced concrete beam analysis is one of the most heavily weighted topics in the structural part of the licensure exam. The strength design method (also called ultimate strength design, USD), used in NSCP 2015 and ACI 318, computes the moment a section can resist when the concrete reaches its crushing strain, then reduces it by a factor $\phi$. This lesson covers the singly reinforced rectangular section — tension steel only.`,
    },
    { type: "heading", id: "assumptions", text: "Design assumptions" },
    {
      type: "list",
      items: [
        "Plane sections remain plane: strain varies linearly with distance from the neutral axis.",
        String.raw`The maximum usable compressive strain in the concrete is $\varepsilon_{cu} = 0.003$.`,
        "The tensile strength of concrete is neglected in flexure.",
        String.raw`Steel is elastic–perfectly plastic: $f_s = E_s\varepsilon_s \le f_y$, with $E_s = 200\,000$ MPa.`,
        String.raw`The actual curved concrete stress distribution may be replaced by a uniform stress of $0.85f'_c$ acting over a depth $a = \beta_1 c$ (the Whitney rectangular stress block).`,
      ],
    },
    {
      type: "figure",
      figure: "rc-beam-section",
      caption: "Singly reinforced section: strain diagram, Whitney stress block of depth a = β1·c with uniform stress 0.85f′c, and the internal couple C = T.",
    },
    { type: "heading", id: "whitney-block", text: "The Whitney stress block and β1" },
    {
      type: "paragraph",
      text: String.raw`Assume the steel yields, so $T = A_sf_y$. The compression resultant is $C = 0.85f'_c\,ab$. Horizontal equilibrium ($C = T$) gives the depth of the stress block, and dividing by $\beta_1$ gives the neutral-axis depth.`,
    },
    {
      type: "math",
      tex: String.raw`0.85\,f'_c\,a\,b = A_s f_y \quad\Longrightarrow\quad a = \frac{A_s f_y}{0.85\,f'_c\,b},\qquad c = \frac{a}{\beta_1}`,
      label: "Depth of stress block and neutral axis",
    },
    {
      type: "math",
      tex: String.raw`\beta_1 = 0.85 - \frac{0.05\,(f'_c - 28)}{7},\qquad 0.65 \le \beta_1 \le 0.85`,
      label: "β1 for f′c above 28 MPa",
    },
    {
      type: "table",
      caption: "β1 for common concrete strengths",
      head: ["f′c (MPa)", "≤ 28", "35", "42", "49", "≥ 55"],
      rows: [["β1", "0.85", "0.80", "0.75", "0.70", "0.65"]],
    },
    { type: "heading", id: "nominal-moment", text: "Nominal moment strength" },
    {
      type: "paragraph",
      text: String.raw`$C$ acts at $a/2$ below the top fiber and $T$ acts at the centroid of the steel, a distance $d$ from the top. The lever arm of the internal couple is therefore $d - a/2$.`,
    },
    {
      type: "math",
      tex: String.raw`M_n = A_s f_y\left(d - \frac{a}{2}\right),\qquad M_u \le \phi M_n`,
      label: "Nominal and design moment strength",
    },
    { type: "heading", id: "strain-and-phi", text: "Net tensile strain and the strength reduction factor" },
    {
      type: "paragraph",
      text: String.raw`The assumption that the steel yields — and the value of $\phi$ — must be verified from the strain diagram. By similar triangles, the net tensile strain in the extreme tension steel is:`,
    },
    {
      type: "math",
      tex: String.raw`\varepsilon_t = 0.003\,\frac{d_t - c}{c}`,
      label: "Net tensile strain",
    },
    {
      type: "paragraph",
      text: String.raw`A large $\varepsilon_t$ means the steel stretches well beyond yield before the concrete crushes, so the beam cracks and deflects visibly before it fails — a ductile, warning-giving failure. That is why tension-controlled sections are rewarded with the highest reduction factor, while sections whose steel barely yields receive a smaller $\phi$. ACI 318-14, on which NSCP 2015 is based, also limits nonprestressed beams to $\varepsilon_t \ge 0.004$, so a beam can never be designed in the compression-controlled region.`,
    },
    {
      type: "table",
      caption: "Section classification by net tensile strain (strength design)",
      head: ["Classification", "Strain limit", "φ (tied / other transverse reinforcement)"],
      rows: [
        ["Tension-controlled", String.raw`$\varepsilon_t \ge 0.005$`, "0.90"],
        ["Transition", String.raw`$\varepsilon_{ty} < \varepsilon_t < 0.005$`, "Linear between 0.65 and 0.90"],
        ["Compression-controlled", String.raw`$\varepsilon_t \le \varepsilon_{ty} = f_y/E_s$`, "0.65"],
      ],
    },
    {
      type: "callout",
      tone: "exam",
      title: "Do not skip the strain check",
      text: String.raw`If $\varepsilon_t < \varepsilon_{ty}$, the steel has not yielded and $T = A_sf_y$ is wrong — the section must be re-analyzed with $f_s = 600(d - c)/c$ MPa. Well-proportioned beams are usually tension-controlled, but board problems with heavy reinforcement are designed to catch candidates who apply $\phi = 0.90$ automatically.`,
    },
    {
      type: "list",
      ordered: true,
      items: [
        String.raw`Compute $A_s$ from the bar count and diameter, and $\beta_1$ from $f'_c$.`,
        String.raw`Assume the steel yields and solve $a = A_sf_y/(0.85f'_cb)$; then $c = a/\beta_1$.`,
        String.raw`Compute $\varepsilon_t$. If $\varepsilon_t \ge f_y/E_s$, the yielding assumption holds.`,
        String.raw`Select $\phi$ from the strain classification (0.90 when $\varepsilon_t \ge 0.005$).`,
        String.raw`Compute $M_n = A_sf_y(d - a/2)$ and report $\phi M_n$ in kN·m.`,
      ],
    },
    {
      type: "paragraph",
      text: String.raw`The same equations run in reverse for design: given $M_u$, set $M_n = M_u/\phi$, express $a$ in terms of $A_s$, and solve the resulting quadratic for $A_s$. Always finish a design problem by confirming that the section is tension-controlled, so that the $\phi$ you assumed at the start is consistent with the steel you selected.`,
    },
    { type: "heading", id: "worked-example", text: "Worked example" },
    {
      type: "example",
      title: "Design moment strength of a singly reinforced beam",
      problem: String.raw`A rectangular beam has $b = 250$ mm and effective depth $d = 450$ mm. It is reinforced with four 20-mm diameter bars in one layer. Use $f'_c = 35$ MPa, $f_y = 420$ MPa and $E_s = 200$ GPa. Determine the design moment strength $\phi M_n$.`,
      given: [
        String.raw`$b = 250$ mm, $d = d_t = 450$ mm`,
        String.raw`$A_s = 4 \times \frac{\pi}{4}(20)^2$`,
        String.raw`$f'_c = 35$ MPa, $f_y = 420$ MPa`,
      ],
      steps: [
        {
          text: String.raw`Compute the steel area and $\beta_1$ (since $f'_c > 28$ MPa).`,
          tex: String.raw`A_s = 4\cdot\frac{\pi}{4}(20)^2 = 1256.6\text{ mm}^2,\qquad \beta_1 = 0.85 - \frac{0.05(35-28)}{7} = 0.80`,
        },
        {
          text: String.raw`Assume the steel yields and find the depth of the stress block.`,
          tex: String.raw`a = \frac{1256.6(420)}{0.85(35)(250)} = 70.96\text{ mm}`,
        },
        {
          text: String.raw`Locate the neutral axis and compute the net tensile strain.`,
          tex: String.raw`c = \frac{70.96}{0.80} = 88.70\text{ mm},\qquad \varepsilon_t = 0.003\,\frac{450 - 88.70}{88.70} = 0.0122`,
        },
        {
          text: String.raw`Since $\varepsilon_t = 0.0122 \ge 0.005$, the section is tension-controlled, the steel yields ($\varepsilon_t > 420/200\,000 = 0.0021$) and $\phi = 0.90$.`,
        },
        {
          text: String.raw`Compute the nominal and design moments.`,
          tex: String.raw`M_n = 1256.6(420)\left(450 - \frac{70.96}{2}\right) = 218.78\times10^6\text{ N}\cdot\text{mm},\qquad \phi M_n = 0.90(218.78) = 196.9\text{ kN}\cdot\text{m}`,
        },
      ],
      answer: String.raw`$\phi M_n \approx 196.9$ kN·m (tension-controlled, $\phi = 0.90$).`,
    },
    {
      type: "callout",
      tone: "warning",
      title: "Common unit and geometry slips",
      text: String.raw`Use the effective depth $d$, not the overall depth $h$. Divide N·mm by $10^6$ to obtain kN·m. And remember that $\beta_1$ only changes $c$ (and therefore $\varepsilon_t$ and $\phi$); it does not enter the equation for $a$.`,
    },
    { type: "check", questionId: "psad-q10" },
    { type: "check", questionId: "psad-q11" },
  ],
  formulaIds: ["psad-f-whitney-depth", "psad-f-beta1", "psad-f-nominal-moment-singly", "psad-f-tensile-strain"],
  questionIds: ["psad-q10", "psad-q11"],
};

const columnBuckling: Lesson = {
  id: "psad-column-buckling",
  subjectId: "psad",
  chapterId: "psad-ch3",
  title: "Euler Buckling of Columns",
  summary:
    "Compute the elastic critical load of slender columns, choose the effective length factor, check both principal axes and recognize when Euler's formula no longer applies.",
  minutes: 14,
  status: "available",
  topics: ["Euler critical load", "Effective length factor", "Radius of gyration", "Slenderness ratio", "Weak-axis bracing"],
  blocks: [
    {
      type: "paragraph",
      text: String.raw`A short column fails by crushing or yielding, but a slender column fails suddenly by **buckling** — a lateral instability that occurs at a load that can be far below the yield load. Leonhard Euler's formula gives this critical load for an ideal elastic column and remains the foundation of every steel column design curve.`,
    },
    { type: "heading", id: "critical-load", text: "The Euler critical load" },
    {
      type: "paragraph",
      text: String.raw`For a perfectly straight, pin-ended, concentrically loaded column, the smallest axial load that can hold the column in a slightly bent shape is:`,
    },
    {
      type: "math",
      tex: String.raw`P_{cr} = \frac{\pi^2 E I}{(KL)^2}`,
      label: "Euler buckling load",
    },
    {
      type: "figure",
      figure: "column-buckling",
      caption: "Pin-ended column of length L under axial load P, buckling into a half sine wave. Its effective length KL equals L.",
    },
    {
      type: "paragraph",
      text: String.raw`The formula rests on the assumptions of an **ideal column**: the member is perfectly straight, the load is applied exactly along the centroidal axis, the material is homogeneous and linearly elastic, and deflections are small. Real columns have initial crookedness, residual stresses and accidental eccentricity, so their strength falls somewhat below the Euler curve — design specifications account for this with reduced column curves. For board problems, however, Euler's formula is the expected tool whenever a column is described as long or slender and elastic behavior is stated or implied.`,
    },
    {
      type: "paragraph",
      text: String.raw`The critical load is proportional to the stiffness $EI$ and inversely proportional to the **square** of the effective length. Doubling the effective length cuts the capacity to one quarter, while the yield strength of the material does not appear at all — a high-strength steel buckles at the same load as an ordinary one if the column is slender.`,
    },
    {
      type: "paragraph",
      text: String.raw`This also explains why efficient compression members — pipes, tubes and wide-flange shapes — place their material far from the centroid. For the same area, a larger moment of inertia raises the buckling load without adding weight.`,
    },
    { type: "heading", id: "effective-length", text: "Effective length factor K" },
    {
      type: "paragraph",
      text: String.raw`The effective length $KL$ is the distance between points of zero moment (inflection points) in the buckled shape. End restraint shortens it; a free end lengthens it.`,
    },
    {
      type: "table",
      caption: "Theoretical effective length factors for ideal end conditions",
      head: ["End conditions", "Theoretical K", "Effect on P_cr relative to pinned–pinned"],
      rows: [
        ["Pinned – pinned", "1.0", "1×"],
        ["Fixed – free (flagpole)", "2.0", "1/4×"],
        ["Fixed – pinned", "0.7", "about 2.04×"],
        ["Fixed – fixed", "0.5", "4×"],
      ],
    },
    {
      type: "callout",
      tone: "tip",
      title: "Theoretical versus recommended K",
      text: String.raw`Real connections are never perfectly fixed, so steel design aids recommend larger design values (for example 0.65 for fixed–fixed, 0.80 for fixed–pinned and 2.1 for fixed–free). Use the theoretical values unless the problem says otherwise.`,
    },
    { type: "heading", id: "slenderness", text: "Slenderness ratio and the limit of Euler's formula" },
    {
      type: "paragraph",
      text: String.raw`Dividing $P_{cr}$ by the area and introducing the radius of gyration $r = \sqrt{I/A}$ gives the critical stress in terms of the slenderness ratio $KL/r$:`,
    },
    {
      type: "math",
      tex: String.raw`\sigma_{cr} = \frac{P_{cr}}{A} = \frac{\pi^2 E}{(KL/r)^2},\qquad r = \sqrt{\frac{I}{A}}`,
      label: "Euler critical stress",
    },
    {
      type: "paragraph",
      text: String.raw`Euler's formula is valid only while $\sigma_{cr}$ stays within the elastic range. For stocky columns it predicts stresses above yield, which is impossible; such columns buckle inelastically or yield. AISC 360-based column provisions treat a member as elastic-buckling governed when $KL/r > 4.71\sqrt{E/F_y}$ and use an inelastic curve below that limit.`,
    },
    {
      type: "callout",
      tone: "warning",
      title: "Check both axes when bracing differs",
      text: String.raw`A column buckles about the axis with the largest $KL/r$, which is usually — but not always — the weak axis. If intermediate bracing shortens the weak-axis unbraced length, compute $P_{cr}$ for each axis with its own $K$, $L$ and $I$, and take the smaller value.`,
    },
    { type: "heading", id: "worked-example", text: "Worked example" },
    {
      type: "example",
      title: "Column braced at mid-height about the weak axis",
      problem: String.raw`A 12-m steel W-section column is pinned at both ends. It is braced against weak-axis buckling at mid-height only. Properties: $A = 7500$ mm², $I_x = 110\times10^6$ mm⁴, $I_y = 20\times10^6$ mm⁴, $E = 200$ GPa, $F_y = 345$ MPa. Determine the Euler critical load and verify that elastic buckling governs.`,
      given: [
        String.raw`$(KL)_x = 1.0(12) = 12$ m, $(KL)_y = 1.0(6) = 6$ m`,
        String.raw`$I_x = 110\times10^6$ mm⁴, $I_y = 20\times10^6$ mm⁴, $A = 7500$ mm²`,
      ],
      steps: [
        {
          text: String.raw`Strong-axis buckling over the full 12 m:`,
          tex: String.raw`P_{cr,x} = \frac{\pi^2(200\,000)(110\times10^6)}{(12\,000)^2} = 1.508\times10^6\text{ N} = 1507.9\text{ kN}`,
        },
        {
          text: String.raw`Weak-axis buckling between the brace and an end (6 m):`,
          tex: String.raw`P_{cr,y} = \frac{\pi^2(200\,000)(20\times10^6)}{(6000)^2} = 1.097\times10^6\text{ N} = 1096.6\text{ kN}`,
        },
        {
          text: String.raw`The smaller value governs: weak-axis buckling at $P_{cr} = 1096.6$ kN.`,
        },
        {
          text: String.raw`Check the slenderness about the weak axis against the elastic limit.`,
          tex: String.raw`r_y = \sqrt{\frac{20\times10^6}{7500}} = 51.64\text{ mm},\quad \frac{KL}{r_y} = \frac{6000}{51.64} = 116.2 > 4.71\sqrt{\frac{200\,000}{345}} = 113.4`,
        },
        {
          text: String.raw`The column is in the elastic range, and the critical stress is well below yield.`,
          tex: String.raw`\sigma_{cr} = \frac{1\,096\,600}{7500} = 146.2\text{ MPa} < 345\text{ MPa}`,
        },
      ],
      answer: String.raw`$P_{cr} \approx 1097$ kN, governed by weak-axis buckling; Euler's formula applies.`,
    },
    {
      type: "callout",
      tone: "exam",
      title: "Units",
      text: String.raw`Keep $E$ in MPa, $I$ in mm⁴ and $KL$ in mm so that $P_{cr}$ comes out in newtons. Forgetting to convert the length from metres to millimetres changes the answer by a factor of $10^6$.`,
    },
    { type: "check", questionId: "psad-q12" },
    { type: "check", questionId: "psad-q09" },
  ],
  formulaIds: ["psad-f-euler-load", "psad-f-slenderness-ratio"],
  questionIds: ["psad-q09", "psad-q12"],
};

// ---------------------------------------------------------------------------
// Chapter 4 — Construction Management and Methods
// ---------------------------------------------------------------------------
const cpmScheduling: Lesson = {
  id: "psad-cpm-scheduling",
  subjectId: "psad",
  chapterId: "psad-ch4",
  title: "Critical Path Method (CPM) Scheduling",
  summary:
    "Run the forward and backward passes on an activity network, identify the critical path, and compute total and free float to judge the impact of delays.",
  minutes: 15,
  status: "available",
  topics: ["Activity-on-node networks", "Forward pass", "Backward pass", "Total and free float", "Critical path", "Effect of delays"],
  blocks: [
    {
      type: "paragraph",
      text: String.raw`The Critical Path Method (CPM) is the standard tool for planning and controlling construction schedules. It answers three questions every project engineer faces: how long the project will take, which activities cannot slip without delaying completion, and how much slack the remaining activities have. Exam problems typically give a small network in a table and ask for the project duration, the critical path, or the float of a particular activity.`,
    },
    { type: "heading", id: "network-basics", text: "Activity networks" },
    {
      type: "paragraph",
      text: String.raw`In an **activity-on-node (AON)** network each activity is a box and arrows show precedence: an activity may start only after all its predecessors finish (finish-to-start, zero lag). Each activity has a deterministic duration $t$. A **path** is any chain of activities from the start to the finish of the network; its length is the sum of the durations on it.`,
    },
    {
      type: "paragraph",
      text: String.raw`Older references draw the same logic as an **activity-on-arrow (AOA)** network, where activities are arrows between event nodes and dummy activities of zero duration preserve precedence. The arithmetic of the passes is identical; only the drawing differs. Whichever format a problem uses, first rewrite it as a simple table of activities, durations and predecessors before computing anything.`,
    },
    {
      type: "callout",
      tone: "concept",
      title: "The critical path",
      text: String.raw`The project duration equals the length of the **longest** path through the network. Activities on that path are critical: they have zero total float, and any delay to them delays the project by the same amount. A network can have more than one critical path.`,
    },
    { type: "heading", id: "forward-backward-pass", text: "Forward and backward passes" },
    {
      type: "paragraph",
      text: String.raw`The **forward pass** moves from start to finish and computes each activity's early start (ES) and early finish (EF). The **backward pass** starts from the project duration and moves back, computing late finish (LF) and late start (LS). The key rule: at a merge take the **largest** EF going forward; at a burst take the **smallest** LS going backward.`,
    },
    {
      type: "math",
      tex: String.raw`ES = \max\left(EF_{\text{predecessors}}\right),\qquad EF = ES + t`,
      label: "Forward pass",
    },
    {
      type: "math",
      tex: String.raw`LF = \min\left(LS_{\text{successors}}\right),\qquad LS = LF - t`,
      label: "Backward pass",
    },
    { type: "heading", id: "float", text: "Total float and free float" },
    {
      type: "math",
      tex: String.raw`TF = LS - ES = LF - EF,\qquad FF = \min\left(ES_{\text{successors}}\right) - EF`,
      label: "Float",
    },
    {
      type: "paragraph",
      text: String.raw`**Total float** is how long an activity can be delayed without delaying project completion. **Free float** is how long it can be delayed without delaying the early start of any successor. Free float never exceeds total float. Total float is shared along a path: if one activity uses it, the other activities on that path lose it.`,
    },
    { type: "heading", id: "worked-example", text: "Worked example" },
    {
      type: "example",
      title: "Six-activity network",
      problem: String.raw`A small building project has the following activities (duration in days; predecessors in parentheses): A = 2 (none), B = 4 (none), C = 3 (A), D = 5 (A, B), E = 2 (C), F = 3 (D, E). Find the project duration, the critical path, and the total and free float of each activity.`,
      steps: [
        {
          text: String.raw`Forward pass. A and B start at day 0. D waits for both A and B, so it takes the larger EF. F merges D and E.`,
          tex: String.raw`\begin{aligned} &A: 0\to2,\quad B: 0\to4,\quad C: 2\to5 \\ &D: \max(2,4)=4\to9,\quad E: 5\to7,\quad F: \max(9,7)=9\to12 \end{aligned}`,
        },
        {
          text: String.raw`The project duration is the largest EF: 12 days.`,
          tex: String.raw`T = 12\text{ days}`,
        },
        {
          text: String.raw`Backward pass from $LF_F = 12$. A feeds both C and D, so it takes the smaller LS.`,
          tex: String.raw`\begin{aligned} &F: 9\leftarrow12,\quad D: 4\leftarrow9,\quad E: 7\leftarrow9,\quad C: 4\leftarrow7 \\ &B: 0\leftarrow4,\quad A: LF = \min(4,4) = 4,\ LS = 2 \end{aligned}`,
        },
        {
          text: String.raw`Total float $TF = LS - ES$: A = 2, B = 0, C = 2, D = 0, E = 2, F = 0. The critical path is **B–D–F** (4 + 5 + 3 = 12 days).`,
        },
        {
          text: String.raw`Free float: A has $FF = \min(2, 4) - 2 = 0$ because C starts right after it; C has $FF = 5 - 5 = 0$; E has $FF = 9 - 7 = 2$. The 2 days of float on path A–C–E is shared, and only the last activity, E, owns it as free float.`,
        },
      ],
      answer: String.raw`Duration = 12 days; critical path B–D–F; TF(A, C, E) = 2 days, FF(E) = 2 days, all others zero.`,
    },
    {
      type: "table",
      caption: "Summary of the worked example",
      head: ["Activity", "t", "ES", "EF", "LS", "LF", "TF", "FF"],
      rows: [
        ["A", "2", "0", "2", "2", "4", "2", "0"],
        ["B", "4", "0", "4", "0", "4", "0", "0"],
        ["C", "3", "2", "5", "4", "7", "2", "0"],
        ["D", "5", "4", "9", "4", "9", "0", "0"],
        ["E", "2", "5", "7", "7", "9", "2", "2"],
        ["F", "3", "9", "12", "9", "12", "0", "0"],
      ],
    },
    { type: "heading", id: "delays", text: "Effect of delays" },
    {
      type: "paragraph",
      text: String.raw`If a single activity is delayed by $\Delta$ days and nothing else changes, the project is delayed by $\max(0,\ \Delta - TF)$. A delay larger than the float can create a **new** critical path, so after any change re-run the forward pass rather than relying on the old float values when more than one activity is affected.`,
    },
    {
      type: "callout",
      tone: "exam",
      title: "Fast check for the duration",
      text: String.raw`For small networks, list every path and add its durations. The longest sum is the duration, and an activity's total float equals the duration minus the length of the longest path passing through it. In the example, the longest path through C is A–C–E–F = 10 days, so TF(C) = 12 − 10 = 2 days.`,
    },
    { type: "check", questionId: "psad-q13" },
    { type: "check", questionId: "psad-q14" },
  ],
  formulaIds: ["psad-f-cpm-float"],
  questionIds: ["psad-q13", "psad-q14"],
};

export const lessons: Lesson[] = [
  equilibriumReactions,
  shearMomentDiagrams,
  rcSinglyReinforced,
  columnBuckling,
  cpmScheduling,
];
