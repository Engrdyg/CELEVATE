import type { Question } from "@/lib/content/types";

export const questions: Question[] = [
  // ---------------------------------------------------------------- Chapter 1
  {
    id: "mste-q01",
    subjectId: "mste",
    chapterId: "mste-ch1",
    topic: "Law of sines",
    difficulty: "easy",
    stem: String.raw`In triangle ABC, angle $A = 40^\circ$, angle $B = 65^\circ$, and side $a = 12$ m (opposite angle A). Find side $b$.`,
    choices: [
      { id: "A", text: "8.51 m" },
      { id: "B", text: "16.92 m" },
      { id: "C", text: "18.03 m" },
      { id: "D", text: "13.32 m" },
    ],
    answer: "B",
    solution: {
      summary: String.raw`Pair $a$ with $\sin A$ and $b$ with $\sin B$ in the law of sines: $b = 16.92$ m.`,
      steps: [
        {
          text: "Write the law of sines for the pair of sides a and b.",
          tex: String.raw`\frac{b}{\sin 65^\circ} = \frac{12}{\sin 40^\circ}`,
        },
        {
          text: "Solve for b.",
          tex: String.raw`b = \frac{12\sin 65^\circ}{\sin 40^\circ} = \frac{12(0.90631)}{0.64279} = 16.92\text{ m}`,
        },
      ],
      formulaIds: ["mste-f-sine-law"],
      commonErrors: [
        String.raw`Inverting the ratio, $12\sin 40^\circ/\sin 65^\circ = 8.51$ m.`,
        String.raw`Using angle $C = 75^\circ$ instead of $B$, which gives side $c = 18.03$ m.`,
        "Leaving the calculator in radian mode (13.32 m).",
      ],
    },
    relatedLessonIds: ["mste-l-solution-of-triangles"],
  },
  {
    id: "mste-q02",
    subjectId: "mste",
    chapterId: "mste-ch1",
    topic: "Law of cosines",
    difficulty: "medium",
    stem: String.raw`Two sides of a triangular lot measure 25 m and 40 m, and the angle between them is $110^\circ$. Find the length of the third side.`,
    choices: [
      { id: "A", text: "39.26 m" },
      { id: "B", text: "59.94 m" },
      { id: "C", text: "47.17 m" },
      { id: "D", text: "53.94 m" },
    ],
    answer: "D",
    solution: {
      summary: String.raw`SAS data calls for the law of cosines; with an obtuse angle the third side is longer than $\sqrt{a^2+b^2}$: $c = 53.94$ m.`,
      steps: [
        {
          text: "Apply the law of cosines with the included angle.",
          tex: String.raw`c^2 = 25^2 + 40^2 - 2(25)(40)\cos 110^\circ`,
        },
        {
          text: String.raw`Since $\cos 110^\circ = -0.34202$, the last term becomes positive.`,
          tex: String.raw`c^2 = 625 + 1600 + 684.04 = 2909.04`,
        },
        {
          text: "Take the square root.",
          tex: String.raw`c = 53.94\text{ m}`,
        },
      ],
      formulaIds: ["mste-f-cosine-law"],
      commonErrors: [
        String.raw`Dropping the negative sign of $\cos 110^\circ$, which gives 39.26 m.`,
        String.raw`Ignoring the angle and using the Pythagorean theorem (47.17 m).`,
        String.raw`Using $4ab\cos C$ instead of $2ab\cos C$ (59.94 m).`,
      ],
    },
    relatedLessonIds: ["mste-l-solution-of-triangles"],
  },
  {
    id: "mste-q03",
    subjectId: "mste",
    chapterId: "mste-ch1",
    topic: "Heights and distances",
    difficulty: "hard",
    stem: String.raw`From point P on level ground, the angle of elevation to the top of a tower is $32^\circ$. After walking 50 m directly toward the tower to point Q, the angle of elevation becomes $47^\circ$. Neglecting the height of the observer, find the height of the tower.`,
    figure: "right-triangle",
    choices: [
      { id: "A", text: "74.87 m" },
      { id: "B", text: "54.25 m" },
      { id: "C", text: "102.37 m" },
      { id: "D", text: "141.29 m" },
    ],
    answer: "A",
    solution: {
      summary: String.raw`Solve the oblique triangle P–Q–Top with the law of sines, then use the right triangle at Q: $h = 74.87$ m.`,
      steps: [
        {
          text: String.raw`In triangle P–Q–Top, the angle at Q is $180^\circ - 47^\circ = 133^\circ$, so the angle at the top is the difference of the elevation angles.`,
          tex: String.raw`\angle \text{Top} = 180^\circ - 32^\circ - 133^\circ = 15^\circ`,
        },
        {
          text: "Law of sines for the slant distance from Q to the top.",
          tex: String.raw`Q\text{Top} = \frac{50\sin 32^\circ}{\sin 15^\circ} = 102.37\text{ m}`,
        },
        {
          text: "The tower height is the vertical leg of the right triangle at Q.",
          tex: String.raw`h = 102.37\sin 47^\circ = 74.87\text{ m}`,
        },
        {
          text: "Check with the cotangent form.",
          tex: String.raw`h = \frac{50}{\cot 32^\circ - \cot 47^\circ} = \frac{50}{1.60033 - 0.93252} = 74.87\text{ m}`,
        },
      ],
      formulaIds: ["mste-f-sine-law"],
      commonErrors: [
        String.raw`Multiplying the slant distance Q–Top by $\sin 32^\circ$ instead of $\sin 47^\circ$ (54.25 m).`,
        "Stopping at the slant distance (102.37 m) or the slant distance from P (141.29 m).",
      ],
    },
    relatedLessonIds: ["mste-l-solution-of-triangles"],
  },

  // ---------------------------------------------------------------- Chapter 2
  {
    id: "mste-q04",
    subjectId: "mste",
    chapterId: "mste-ch2",
    topic: "Optimization",
    difficulty: "medium",
    stem: "A rectangular lot beside a straight river is to be fenced on three sides only; the side along the river needs no fence. If 240 m of fencing is available, what is the maximum area that can be enclosed?",
    choices: [
      { id: "A", text: String.raw`$3600\text{ m}^2$` },
      { id: "B", text: String.raw`$6400\text{ m}^2$` },
      { id: "C", text: String.raw`$7200\text{ m}^2$` },
      { id: "D", text: String.raw`$14\,400\text{ m}^2$` },
    ],
    answer: "C",
    solution: {
      summary: String.raw`With $2x + y = 240$, $A = x(240 - 2x)$ peaks at $x = 60$ m, $y = 120$ m: $A = 7200$ m².`,
      steps: [
        {
          text: "Let x be each side perpendicular to the river and y the side parallel to it. Express the area in one variable.",
          tex: String.raw`2x + y = 240 \;\Rightarrow\; A = x(240 - 2x) = 240x - 2x^2`,
        },
        {
          text: "Set the derivative to zero.",
          tex: String.raw`\frac{dA}{dx} = 240 - 4x = 0 \;\Rightarrow\; x = 60\text{ m}`,
        },
        {
          text: String.raw`Confirm a maximum ($A'' = -4 < 0$) and compute the area.`,
          tex: String.raw`y = 240 - 2(60) = 120\text{ m}, \qquad A = 60(120) = 7200\text{ m}^2`,
        },
      ],
      formulaIds: ["mste-f-critical-point-test"],
      commonErrors: [
        "Fencing all four sides and taking a 60 m square (3600 m²).",
        "Assuming the three fenced sides are equal at 80 m each (6400 m²).",
      ],
    },
    relatedLessonIds: ["mste-l-derivatives-optimization"],
  },
  {
    id: "mste-q05",
    subjectId: "mste",
    chapterId: "mste-ch2",
    topic: "Optimization",
    difficulty: "medium",
    stem: String.raw`An open-top cylindrical tank (bottom and side only) must hold $10\text{ m}^3$. Find the radius that minimizes the sheet metal used.`,
    choices: [
      { id: "A", text: "1.168 m" },
      { id: "B", text: "1.471 m" },
      { id: "C", text: "2.942 m" },
      { id: "D", text: "1.784 m" },
    ],
    answer: "B",
    solution: {
      summary: String.raw`Minimizing $S = \pi r^2 + 2V/r$ gives $r^3 = V/\pi$, so $r = 1.471$ m (and $h = r$).`,
      steps: [
        {
          text: "Express the surface area in terms of r using the volume constraint.",
          tex: String.raw`V = \pi r^2 h \;\Rightarrow\; h = \frac{V}{\pi r^2}, \qquad S = \pi r^2 + 2\pi r h = \pi r^2 + \frac{2V}{r}`,
        },
        {
          text: "Differentiate and set to zero.",
          tex: String.raw`\frac{dS}{dr} = 2\pi r - \frac{2V}{r^2} = 0 \;\Rightarrow\; r^3 = \frac{V}{\pi}`,
        },
        {
          text: "Substitute the required volume.",
          tex: String.raw`r = \left(\frac{10}{\pi}\right)^{1/3} = 1.471\text{ m}`,
        },
        {
          text: String.raw`The second derivative $2\pi + 4V/r^3 > 0$ confirms a minimum; the height also equals 1.471 m.`,
        },
      ],
      formulaIds: ["mste-f-critical-point-test"],
      commonErrors: [
        String.raw`Including a top cover, which gives $r = (V/2\pi)^{1/3} = 1.168$ m.`,
        "Reporting the diameter (2.942 m) instead of the radius.",
      ],
    },
    relatedLessonIds: ["mste-l-derivatives-optimization"],
  },
  {
    id: "mste-q06",
    subjectId: "mste",
    chapterId: "mste-ch2",
    topic: "Binomial probability",
    difficulty: "medium",
    stem: "Five percent of the concrete hollow blocks from a supplier are defective. If 10 blocks are selected at random, what is the probability that exactly 2 are defective? Assume independent selections.",
    choices: [
      { id: "A", text: "0.0746" },
      { id: "B", text: "0.0017" },
      { id: "C", text: "0.0861" },
      { id: "D", text: "0.0674" },
    ],
    answer: "A",
    solution: {
      summary: String.raw`Binomial with $n = 10$, $p = 0.05$, $r = 2$: $P = 45(0.05)^2(0.95)^8 = 0.0746$.`,
      steps: [
        {
          text: "Count the arrangements of 2 defectives among 10 blocks.",
          tex: String.raw`\binom{10}{2} = \frac{10!}{2!\,8!} = 45`,
        },
        {
          text: "Apply the binomial formula.",
          tex: String.raw`P(X = 2) = 45(0.05)^2(0.95)^8 = 45(0.0025)(0.66342) = 0.0746`,
        },
      ],
      formulaIds: ["mste-f-binomial-probability"],
      commonErrors: [
        String.raw`Omitting $\binom{10}{2}$, which gives 0.0017.`,
        String.raw`Computing "at least 2" instead of "exactly 2" (0.0861).`,
        String.raw`Using $(0.95)^{10}$ instead of $(0.95)^8$ (0.0674).`,
      ],
    },
    relatedLessonIds: ["mste-l-probability-basics"],
  },

  // ---------------------------------------------------------------- Chapter 3
  {
    id: "mste-q07",
    subjectId: "mste",
    chapterId: "mste-ch3",
    topic: "Differential leveling",
    difficulty: "easy",
    stem: "The elevation of BM-A is 125.430 m. A level run to BM-B records: BS on BM-A = 1.425 m, FS on TP-1 = 2.310 m, BS on TP-1 = 0.875 m, FS on BM-B = 1.940 m. Find the elevation of BM-B.",
    figure: "differential-leveling",
    choices: [
      { id: "A", text: "127.380 m" },
      { id: "B", text: "131.980 m" },
      { id: "C", text: "124.545 m" },
      { id: "D", text: "123.480 m" },
    ],
    answer: "D",
    solution: {
      summary: String.raw`Elev BM-B = 125.430 + (1.425 + 0.875) − (2.310 + 1.940) = 123.480 m.`,
      steps: [
        {
          text: "First setup: height of instrument and elevation of TP-1.",
          tex: String.raw`HI_1 = 125.430 + 1.425 = 126.855, \quad \text{Elev}_{TP1} = 126.855 - 2.310 = 124.545\text{ m}`,
        },
        {
          text: "Second setup: backsight on TP-1, foresight on BM-B.",
          tex: String.raw`HI_2 = 124.545 + 0.875 = 125.420, \quad \text{Elev}_{BMB} = 125.420 - 1.940 = 123.480\text{ m}`,
        },
        {
          text: "Arithmetic check.",
          tex: String.raw`125.430 + 2.300 - 4.250 = 123.480\text{ m}`,
        },
      ],
      formulaIds: ["mste-f-height-of-instrument"],
      commonErrors: [
        "Subtracting backsights and adding foresights (127.380 m).",
        "Adding every reading to the starting elevation (131.980 m).",
        "Stopping at the turning point TP-1 (124.545 m).",
      ],
    },
    relatedLessonIds: ["mste-l-differential-leveling"],
  },
  {
    id: "mste-q08",
    subjectId: "mste",
    chapterId: "mste-ch3",
    topic: "Curvature and refraction",
    difficulty: "easy",
    stem: "A level sight is taken on a rod 1.5 km away. What is the combined correction for Earth curvature and atmospheric refraction?",
    choices: [
      { id: "A", text: "0.177 m" },
      { id: "B", text: "0.101 m" },
      { id: "C", text: "0.152 m" },
      { id: "D", text: "0.025 m" },
    ],
    answer: "C",
    solution: {
      summary: String.raw`$h_{cr} = 0.0675(1.5)^2 = 0.152$ m.`,
      steps: [
        {
          text: "Use the combined formula with K in kilometers.",
          tex: String.raw`h_{cr} = 0.0675K^2 = 0.0675(1.5)^2 = 0.0675(2.25)`,
        },
        {
          text: "Evaluate.",
          tex: String.raw`h_{cr} = 0.152\text{ m}`,
        },
      ],
      formulaIds: ["mste-f-curvature-refraction"],
      commonErrors: [
        String.raw`Using the curvature coefficient 0.0785 alone (0.177 m).`,
        String.raw`Forgetting to square K (0.101 m).`,
        "Computing only the refraction part (0.025 m).",
      ],
    },
    relatedLessonIds: ["mste-l-differential-leveling"],
  },
  {
    id: "mste-q09",
    subjectId: "mste",
    chapterId: "mste-ch3",
    topic: "Latitudes and departures",
    difficulty: "medium",
    stem: String.raw`A traverse course has a bearing of N $35^\circ 20'$ E and a length of 120.50 m. What is its departure?`,
    choices: [
      { id: "A", text: "+69.69 m (east)" },
      { id: "B", text: "+98.30 m (east)" },
      { id: "C", text: "+69.46 m (east)" },
      { id: "D", text: "−69.69 m (west)" },
    ],
    answer: "A",
    solution: {
      summary: String.raw`Dep $= L\sin\beta = 120.50\sin 35.3333^\circ = +69.69$ m, positive because the course heads east.`,
      steps: [
        {
          text: "Convert the bearing angle to decimal degrees.",
          tex: String.raw`35^\circ 20' = 35 + \frac{20}{60} = 35.3333^\circ`,
        },
        {
          text: "Departure is the east–west component.",
          tex: String.raw`\text{Dep} = 120.50\sin 35.3333^\circ = 120.50(0.57833) = 69.69\text{ m}`,
        },
        {
          text: String.raw`The bearing ends in E, so the departure is positive. (The latitude would be $120.50\cos 35.3333^\circ = +98.30$ m, north.)`,
        },
      ],
      formulaIds: ["mste-f-latitude-departure"],
      commonErrors: [
        "Using cosine, which gives the latitude (98.30 m).",
        String.raw`Entering $35^\circ 20'$ as 35.20° (69.46 m).`,
        "Assigning a negative sign to an easterly course.",
      ],
    },
    relatedLessonIds: ["mste-l-traverse-computations"],
  },
  {
    id: "mste-q10",
    subjectId: "mste",
    chapterId: "mste-ch3",
    topic: "Area by coordinates",
    difficulty: "hard",
    stem: "The corners of a four-sided lot, taken in order, have coordinates (E, N) in meters: A (1000.00, 1000.00), B (1120.00, 1015.00), C (1150.00, 1095.00), D (1030.00, 1110.00). Find the area of the lot.",
    figure: "closed-traverse",
    choices: [
      { id: "A", text: String.raw`$22\,800\text{ m}^2$` },
      { id: "B", text: String.raw`$11\,400\text{ m}^2$` },
      { id: "C", text: String.raw`$12\,060\text{ m}^2$` },
      { id: "D", text: String.raw`$5\,700\text{ m}^2$` },
    ],
    answer: "B",
    solution: {
      summary: String.raw`Shift the origin to A and apply the shoelace formula: $A = \tfrac{1}{2}(22\,800) = 11\,400$ m² (1.14 ha).`,
      steps: [
        {
          text: "Subtract 1000 from every coordinate to keep the numbers small (a shift does not change area).",
          tex: String.raw`A(0, 0),\; B(120, 15),\; C(150, 95),\; D(30, 110)`,
        },
        {
          text: String.raw`Compute the cross products $x_i y_{i+1} - x_{i+1} y_i$ around the polygon, including the closing term D→A.`,
          tex: String.raw`\begin{aligned} AB&: 0(15) - 120(0) = 0 \\ BC&: 120(95) - 150(15) = 9150 \\ CD&: 150(110) - 30(95) = 13\,650 \\ DA&: 30(0) - 0(110) = 0 \end{aligned}`,
        },
        {
          text: "Sum and halve.",
          tex: String.raw`A = \tfrac{1}{2}\left|\,0 + 9150 + 13\,650 + 0\,\right| = \tfrac{1}{2}(22\,800) = 11\,400\text{ m}^2`,
        },
      ],
      formulaIds: ["mste-f-area-by-coordinates"],
      commonErrors: [
        String.raw`Forgetting the factor $\tfrac{1}{2}$ (22,800 m²).`,
        "Approximating with the averages of opposite sides, which is only exact for a rectangle (about 12,060 m²).",
      ],
    },
    relatedLessonIds: ["mste-l-traverse-computations"],
  },

  // ---------------------------------------------------------------- Chapter 4
  {
    id: "mste-q11",
    subjectId: "mste",
    chapterId: "mste-ch4",
    topic: "Degree of curve",
    difficulty: "easy",
    stem: String.raw`A simple curve has a degree of curve of $4^\circ$ using the arc basis with a 20-m arc. What is its radius?`,
    choices: [
      { id: "A", text: "286.54 m" },
      { id: "B", text: "143.24 m" },
      { id: "C", text: "286.48 m" },
      { id: "D", text: "572.96 m" },
    ],
    answer: "C",
    solution: {
      summary: String.raw`$R = 1145.916/D = 1145.916/4 = 286.48$ m.`,
      steps: [
        {
          text: "On the arc basis, a 20-m arc subtends the angle D.",
          tex: String.raw`\frac{D}{20} = \frac{360^\circ}{2\pi R} \;\Rightarrow\; R = \frac{1145.916}{D}`,
        },
        {
          text: "Substitute D = 4°.",
          tex: String.raw`R = \frac{1145.916}{4} = 286.48\text{ m}`,
        },
      ],
      formulaIds: ["mste-f-degree-of-curve-arc"],
      commonErrors: [
        String.raw`Using the chord basis $R = 10/\sin(D/2)$, which gives 286.54 m.`,
        "Using a 10-m or 40-m arc length by mistake (143.24 m or 572.96 m).",
      ],
    },
    relatedLessonIds: ["mste-l-horizontal-simple-curves"],
  },
  {
    id: "mste-q12",
    subjectId: "mste",
    chapterId: "mste-ch4",
    topic: "Stationing of simple curves",
    difficulty: "medium",
    stem: String.raw`A simple curve of radius 300 m connects two tangents that intersect at station 10+250.000 with an intersection angle of $36^\circ$. Find the station of the PT.`,
    figure: "simple-curve",
    choices: [
      { id: "A", text: "10+347.476" },
      { id: "B", text: "10+337.934" },
      { id: "C", text: "10+344.248" },
      { id: "D", text: "10+341.020" },
    ],
    answer: "D",
    solution: {
      summary: String.raw`Sta. PT = (PI − T) + L = 10+152.524 + 188.496 = 10+341.020.`,
      steps: [
        {
          text: "Tangent distance.",
          tex: String.raw`T = 300\tan 18^\circ = 97.476\text{ m}`,
        },
        {
          text: "Station of the PC.",
          tex: String.raw`\text{Sta. PC} = 10250.000 - 97.476 = 10152.524`,
        },
        {
          text: "Length of curve.",
          tex: String.raw`L = \frac{\pi(300)(36^\circ)}{180^\circ} = 188.496\text{ m}`,
        },
        {
          text: "Station of the PT is the PC station plus the arc length.",
          tex: String.raw`\text{Sta. PT} = 10152.524 + 188.496 = 10341.020 \;\Rightarrow\; 10{+}341.020`,
        },
      ],
      formulaIds: ["mste-f-tangent-distance", "mste-f-length-of-curve"],
      commonErrors: [
        "Taking Sta. PT = Sta. PI + T (10+347.476).",
        "Adding the long chord instead of the arc length to the PC (10+337.934).",
        "Adding half the curve length to the PI (10+344.248).",
      ],
    },
    relatedLessonIds: ["mste-l-horizontal-simple-curves"],
  },
  {
    id: "mste-q13",
    subjectId: "mste",
    chapterId: "mste-ch4",
    topic: "Vertical parabolic curves",
    difficulty: "hard",
    stem: String.raw`A symmetrical parabolic summit curve 200 m long connects a $+3\%$ grade to a $-2\%$ grade. The PVI is at station 5+100 with elevation 150.00 m. Find the elevation of the highest point on the curve.`,
    figure: "vertical-curve",
    choices: [
      { id: "A", text: "148.80 m" },
      { id: "B", text: "148.75 m" },
      { id: "C", text: "150.00 m" },
      { id: "D", text: "148.00 m" },
    ],
    answer: "A",
    solution: {
      summary: String.raw`The high point is $x = g_1L/(g_1 - g_2) = 120$ m from the PVC (sta. 5+120), at elevation 148.80 m.`,
      steps: [
        {
          text: "Elevation and station of the PVC (half the curve length before the PVI).",
          tex: String.raw`\text{Elev}_{PVC} = 150.00 - 0.03(100) = 147.00\text{ m at sta. } 5{+}000`,
        },
        {
          text: "Locate the highest point, where the slope of the curve is zero.",
          tex: String.raw`x = \frac{g_1 L}{g_1 - g_2} = \frac{0.03(200)}{0.03 - (-0.02)} = 120\text{ m}`,
        },
        {
          text: "Elevation on the parabola at x = 120 m.",
          tex: String.raw`y = 147.00 + 0.03(120) + \frac{(-0.02 - 0.03)}{2(200)}(120)^2 = 147.00 + 3.60 - 1.80 = 148.80\text{ m}`,
        },
      ],
      formulaIds: ["mste-f-vertical-curve-elevation"],
      commonErrors: [
        "Assuming the high point is at the middle of the curve (148.75 m); it is only there when the grades are equal and opposite.",
        "Taking the PVI elevation (150.00 m), which lies above the curve.",
        "Reporting the PVT elevation (148.00 m).",
      ],
    },
    relatedLessonIds: ["mste-l-vertical-parabolic-curves"],
  },
  {
    id: "mste-q14",
    subjectId: "mste",
    chapterId: "mste-ch4",
    topic: "Stopping sight distance",
    difficulty: "hard",
    stem: "Compute the stopping sight distance for a design speed of 90 km/h on a 4% downgrade. Use a perception–reaction time of 2.5 s and a coefficient of longitudinal friction of 0.30.",
    choices: [
      { id: "A", text: "168.8 m" },
      { id: "B", text: "156.3 m" },
      { id: "C", text: "185.2 m" },
      { id: "D", text: "122.7 m" },
    ],
    answer: "C",
    solution: {
      summary: String.raw`$SSD = 0.278(90)(2.5) + \dfrac{90^2}{254(0.30 - 0.04)} = 62.55 + 122.65 = 185.2$ m.`,
      steps: [
        {
          text: "Reaction distance: the vehicle travels at full speed during the perception–reaction time.",
          tex: String.raw`d_r = 0.278(90)(2.5) = 62.55\text{ m}`,
        },
        {
          text: "Braking distance on a downgrade: gravity assists the motion, so the grade is subtracted from f.",
          tex: String.raw`d_b = \frac{90^2}{254(0.30 - 0.04)} = \frac{8100}{66.04} = 122.65\text{ m}`,
        },
        {
          text: "Add the two components.",
          tex: String.raw`SSD = 62.55 + 122.65 = 185.2\text{ m}`,
        },
      ],
      formulaIds: ["mste-f-stopping-sight-distance"],
      commonErrors: [
        "Ignoring the grade (168.8 m).",
        "Adding the grade as if it were an upgrade (156.3 m).",
        "Leaving out the reaction distance (122.7 m).",
      ],
    },
    relatedLessonIds: ["mste-l-sight-distance-traffic-flow"],
  },
  {
    id: "mste-q15",
    subjectId: "mste",
    chapterId: "mste-ch4",
    topic: "Traffic flow",
    difficulty: "easy",
    stem: "On a freeway lane, the observed density is 40 veh/km and the space-mean speed is 54 km/h. What is the flow rate?",
    choices: [
      { id: "A", text: "1.35 veh/h" },
      { id: "B", text: "2,160 veh/h" },
      { id: "C", text: "21,600 veh/h" },
      { id: "D", text: "600 veh/h" },
    ],
    answer: "B",
    solution: {
      summary: String.raw`$q = k v_s = 40(54) = 2160$ veh/h.`,
      steps: [
        {
          text: "Apply the fundamental relation with consistent units (veh/km × km/h).",
          tex: String.raw`q = k\,v_s = 40\ \tfrac{\text{veh}}{\text{km}} \times 54\ \tfrac{\text{km}}{\text{h}} = 2160\ \text{veh/h}`,
        },
        {
          text: "Optional check: the average headway is 3600/2160 = 1.67 s.",
          tex: String.raw`h = \frac{3600}{2160} = 1.67\text{ s}`,
        },
      ],
      formulaIds: ["mste-f-traffic-flow"],
      commonErrors: [
        String.raw`Converting speed to m/s (15 m/s) while keeping density in veh/km (600 "veh/h").`,
        String.raw`Dividing speed by density instead of multiplying (1.35).`,
      ],
    },
    relatedLessonIds: ["mste-l-sight-distance-traffic-flow"],
  },
];
