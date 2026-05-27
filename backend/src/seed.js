import { addSubmission } from "./store.js";

// Each fixture is a small persona used to populate the dashboard on first load.
// Likert values are 1–5 written in their *raw* form (reverse scoring is applied by the scorer).
const fixtures = [
  {
    name: "Aarav Mehta",
    roll: "BCA-2026-01",
    email: "aarav.m@bca.example",
    likert: {
      shi1: 5, shi2: 5, shi3: 4, shi4: 5, shi5: 5,
      sei1: 5, sei2: 5, sei3: 2, sei4: 5, sei5: 1,
      ati1: 4, ati2: 5, ati3: 4, ati4: 5,
      swi1: 2, swi2: 2, swi3: 2, swi4: 1
    },
    diagnostic: { ds1: 1, ds2: 2, ds3: 1, ds4: 0 }
  },
  {
    name: "Priya Nair",
    roll: "BCA-2026-02",
    email: "priya.n@bca.example",
    likert: {
      shi1: 4, shi2: 4, shi3: 4, shi4: 3, shi5: 4,
      sei1: 4, sei2: 4, sei3: 3, sei4: 4, sei5: 2,
      ati1: 4, ati2: 4, ati3: 3, ati4: 4,
      swi1: 3, swi2: 2, swi3: 3, swi4: 2
    },
    diagnostic: { ds1: 1, ds2: 2, ds3: 1, ds4: 0 }
  },
  {
    name: "Rohan Verma",
    roll: "BCA-2026-03",
    email: "rohan.v@bca.example",
    likert: {
      shi1: 2, shi2: 1, shi3: 2, shi4: 2, shi5: 1,
      sei1: 2, sei2: 2, sei3: 4, sei4: 2, sei5: 4,
      ati1: 3, ati2: 2, ati3: 3, ati4: 2,
      swi1: 3, swi2: 3, swi3: 4, swi4: 3
    },
    diagnostic: { ds1: 0, ds2: 2, ds3: 1, ds4: 1 }
  },
  {
    name: "Sara Khan",
    roll: "BCA-2026-04",
    email: "sara.k@bca.example",
    likert: {
      shi1: 5, shi2: 4, shi3: 4, shi4: 5, shi5: 4,
      sei1: 3, sei2: 3, sei3: 4, sei4: 3, sei5: 4,
      ati1: 4, ati2: 4, ati3: 4, ati4: 4,
      swi1: 5, swi2: 4, swi3: 5, swi4: 4
    },
    diagnostic: { ds1: 1, ds2: 2, ds3: 1, ds4: 0 }
  },
  {
    name: "Devansh Iyer",
    roll: "BCA-2026-05",
    email: "devansh.i@bca.example",
    likert: {
      shi1: 3, shi2: 3, shi3: 3, shi4: 3, shi5: 3,
      sei1: 3, sei2: 3, sei3: 3, sei4: 3, sei5: 3,
      ati1: 3, ati2: 3, ati3: 3, ati4: 3,
      swi1: 3, swi2: 3, swi3: 3, swi4: 3
    },
    diagnostic: { ds1: 1, ds2: 2, ds3: 0, ds4: 0 }
  },
  {
    name: "Aisha Bose",
    roll: "BCA-2026-06",
    email: "aisha.b@bca.example",
    likert: {
      shi1: 4, shi2: 5, shi3: 5, shi4: 4, shi5: 4,
      sei1: 5, sei2: 4, sei3: 2, sei4: 4, sei5: 1,
      ati1: 5, ati2: 4, ati3: 5, ati4: 5,
      swi1: 2, swi2: 1, swi3: 2, swi4: 2
    },
    diagnostic: { ds1: 1, ds2: 2, ds3: 1, ds4: 0 }
  },
  {
    name: "Karan Joshi",
    roll: "BCA-2026-07",
    email: "karan.j@bca.example",
    likert: {
      shi1: 2, shi2: 2, shi3: 3, shi4: 2, shi5: 2,
      sei1: 3, sei2: 2, sei3: 3, sei4: 3, sei5: 3,
      ati1: 2, ati2: 2, ati3: 3, ati4: 2,
      swi1: 4, swi2: 4, swi3: 5, swi4: 4
    },
    diagnostic: { ds1: 0, ds2: 0, ds3: 0, ds4: 2 }
  },
  {
    name: "Meera Pillai",
    roll: "BCA-2026-08",
    email: "meera.p@bca.example",
    likert: {
      shi1: 4, shi2: 4, shi3: 5, shi4: 4, shi5: 5,
      sei1: 4, sei2: 5, sei3: 2, sei4: 4, sei5: 2,
      ati1: 4, ati2: 4, ati3: 4, ati4: 5,
      swi1: 3, swi2: 3, swi3: 3, swi4: 2
    },
    diagnostic: { ds1: 1, ds2: 2, ds3: 1, ds4: 0 }
  },
  {
    name: "Vihaan Shah",
    roll: "BCA-2026-09",
    email: "vihaan.s@bca.example",
    likert: {
      shi1: 2, shi2: 3, shi3: 2, shi4: 2, shi5: 3,
      sei1: 2, sei2: 2, sei3: 4, sei4: 2, sei5: 4,
      ati1: 2, ati2: 3, ati3: 2, ati4: 3,
      swi1: 3, swi2: 3, swi3: 4, swi4: 4
    },
    diagnostic: { ds1: 3, ds2: 0, ds3: 3, ds4: 2 }
  },
  {
    name: "Neha Kapoor",
    roll: "BCA-2026-10",
    email: "neha.k@bca.example",
    likert: {
      shi1: 5, shi2: 4, shi3: 5, shi4: 5, shi5: 4,
      sei1: 5, sei2: 5, sei3: 1, sei4: 5, sei5: 1,
      ati1: 5, ati2: 5, ati3: 4, ati4: 5,
      swi1: 1, swi2: 2, swi3: 2, swi4: 1
    },
    diagnostic: { ds1: 1, ds2: 2, ds3: 1, ds4: 0 }
  }
];

export function seedClass() {
  for (const f of fixtures) {
    addSubmission(f);
  }
}
