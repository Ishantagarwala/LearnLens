import { addSubmission, clearStore } from "./store.js";

const fixtures = [
  {
    name: "Aarav Mehta",
    roll: "BCA-2026-01",
    email: "aarav.m@bca.example",
    likert: {
      shi1: 5, shi2: 5, shi3: 4, shi4: 5, shi5: 5,
      sei1: 5, sei2: 5, sei3: 5, sei4: 5, sei5: 5,
      ati1: 2, ati2: 2, ati3: 5, ati4: 5, ati5: 5, // ati1, ati2 are reverse
      swi1: 2, swi2: 4, swi3: 4, swi4: 5, swi5: 5  // swi1 is reverse
    },
    diagnostic: {
      ds1: 0, // MCQ 1: A
      ds2: 1, // MCQ 2: for(i=1;i<=10;i++)
      ds3: "printf(\"Hello World\");",
      ds4: "Remove semicolon from end of for loop statement"
    },
    metadata: {
      stream: "Science",
      prior_coding: "Yes",
      device_availability: "Laptop + Phone",
      study_hours: 3,
      sleep_hours: 8,
      confusing_part: "Pointers and dynamic array allocation",
      support_type: "1:1 doubt-clinic"
    }
  },
  {
    name: "Priya Nair",
    roll: "BCA-2026-02",
    email: "priya.n@bca.example",
    likert: {
      shi1: 4, shi2: 4, shi3: 4, shi4: 3, shi5: 4,
      sei1: 4, sei2: 4, sei3: 4, sei4: 4, sei5: 4,
      ati1: 3, ati2: 2, ati3: 4, ati4: 4, ati5: 4,
      swi1: 3, swi2: 3, swi3: 3, swi4: 3, swi5: 4
    },
    diagnostic: {
      ds1: 0,
      ds2: 1,
      ds3: "printf(\"Hello World\");",
      ds4: "The for loop shouldn't have a semicolon at the end"
    },
    metadata: {
      stream: "Commerce",
      prior_coding: "No",
      device_availability: "Laptop + Phone",
      study_hours: 2,
      sleep_hours: 7,
      confusing_part: "Understanding loops and loop counters",
      support_type: "Peer study group"
    }
  },
  {
    name: "Rohan Verma",
    roll: "BCA-2026-03",
    email: "rohan.v@bca.example",
    likert: {
      shi1: 2, shi2: 1, shi3: 2, shi4: 2, shi5: 1,
      sei1: 2, sei2: 2, sei3: 3, sei4: 2, sei5: 3,
      ati1: 4, ati2: 4, ati3: 3, ati4: 2, ati5: 2,
      swi1: 4, swi2: 2, swi3: 3, swi4: 2, swi5: 2
    },
    diagnostic: {
      ds1: 1, // Wrong
      ds2: 2, // Wrong
      ds3: "print('Hello')",
      ds4: "i don't know"
    },
    metadata: {
      stream: "Arts",
      prior_coding: "No",
      device_availability: "Phone only",
      study_hours: 1,
      sleep_hours: 5,
      confusing_part: "Basic syntax structure and compiling",
      support_type: "Extra lab slot"
    }
  },
  {
    name: "Sara Khan",
    roll: "BCA-2026-04",
    email: "sara.k@bca.example",
    likert: {
      shi1: 5, shi2: 4, shi3: 4, shi4: 5, shi5: 4,
      sei1: 3, sei2: 3, sei3: 4, sei4: 3, sei5: 4,
      ati1: 4, ati2: 4, ati3: 4, ati4: 4, ati5: 4,
      swi1: 5, swi2: 2, swi3: 2, swi4: 3, swi5: 4
    },
    diagnostic: {
      ds1: 0,
      ds2: 1,
      ds3: "printf(\"Hello World\");",
      ds4: "semicolon error at the end of the loop header"
    },
    metadata: {
      stream: "Science",
      prior_coding: "Yes",
      device_availability: "Laptop + Phone",
      study_hours: 3.5,
      sleep_hours: 6,
      confusing_part: "Function prototypes and scoping",
      support_type: "Printed notes"
    }
  },
  {
    name: "Devansh Iyer",
    roll: "BCA-2026-05",
    email: "devansh.i@bca.example",
    likert: {
      shi1: 3, shi2: 3, shi3: 3, shi4: 3, shi5: 3,
      sei1: 3, sei2: 3, sei3: 3, sei4: 3, sei5: 3,
      ati1: 3, ati2: 3, ati3: 3, ati4: 3, ati5: 3,
      swi1: 3, swi2: 3, swi3: 3, swi4: 3, swi5: 3
    },
    diagnostic: {
      ds1: 0,
      ds2: 1,
      ds3: "printf(\"Hello\");", // partial correct
      ds4: "semicolon"
    },
    metadata: {
      stream: "Commerce",
      prior_coding: "No",
      device_availability: "Lab only",
      study_hours: 2,
      sleep_hours: 7,
      confusing_part: "Conditionals (if/else)",
      support_type: "1:1 doubt-clinic"
    }
  },
  {
    name: "Aisha Bose",
    roll: "BCA-2026-06",
    email: "aisha.b@bca.example",
    likert: {
      shi1: 4, shi2: 5, shi3: 5, shi4: 4, shi5: 4,
      sei1: 5, sei2: 4, sei3: 5, sei4: 4, sei5: 5,
      ati1: 2, ati2: 2, ati3: 5, ati4: 5, ati5: 5,
      swi1: 2, swi2: 5, swi3: 4, swi4: 4, swi5: 5
    },
    diagnostic: {
      ds1: 0,
      ds2: 1,
      ds3: "printf(\"Hello World\\n\");",
      ds4: "There is an extra semicolon on the loop line, remove it."
    },
    metadata: {
      stream: "Science",
      prior_coding: "Yes",
      device_availability: "Laptop + Phone",
      study_hours: 4,
      sleep_hours: 7.5,
      confusing_part: "Nested structures and typedefs",
      support_type: "Short video tutorial"
    }
  },
  {
    name: "Karan Joshi",
    roll: "BCA-2026-07",
    email: "karan.j@bca.example",
    likert: {
      shi1: 2, shi2: 2, shi3: 3, shi4: 2, shi5: 2,
      sei1: 3, sei2: 2, sei3: 2, sei4: 3, sei5: 3,
      ati1: 4, ati2: 4, ati3: 3, ati4: 2, ati5: 3,
      swi1: 5, swi2: 2, swi3: 2, swi4: 3, swi5: 2
    },
    diagnostic: {
      ds1: 2, // wrong
      ds2: 0, // wrong
      ds3: "printf('Hello')",
      ds4: "syntax issue"
    },
    metadata: {
      stream: "Arts",
      prior_coding: "No",
      device_availability: "Phone only",
      study_hours: 1.5,
      sleep_hours: 6,
      confusing_part: "Understanding loops and arrays",
      support_type: "Extra lab slot"
    }
  },
  {
    name: "Meera Pillai",
    roll: "BCA-2026-08",
    email: "meera.p@bca.example",
    likert: {
      shi1: 4, shi2: 4, shi3: 5, shi4: 4, shi5: 5,
      sei1: 4, sei2: 5, sei3: 4, sei4: 4, sei5: 4,
      ati1: 3, ati2: 2, ati3: 4, ati4: 5, ati5: 4,
      swi1: 3, swi2: 4, swi3: 3, swi4: 4, swi5: 4
    },
    diagnostic: {
      ds1: 0,
      ds2: 1,
      ds3: "printf(\"Hello World\");",
      ds4: "The semicolon makes it an empty loop, which runs nothing. Remove ;"
    },
    metadata: {
      stream: "Science",
      prior_coding: "No",
      device_availability: "Laptop + Phone",
      study_hours: 3,
      sleep_hours: 7,
      confusing_part: "Recursion logic",
      support_type: "Short video tutorial"
    }
  },
  {
    name: "Vihaan Shah",
    roll: "BCA-2026-09",
    email: "vihaan.s@bca.example",
    likert: {
      shi1: 2, shi2: 3, shi3: 2, shi4: 2, shi5: 3,
      sei1: 2, sei2: 2, sei3: 2, sei4: 2, sei5: 2,
      ati1: 4, ati2: 3, ati3: 2, ati4: 3, ati5: 2,
      swi1: 4, swi2: 3, swi3: 4, swi4: 3, swi5: 3
    },
    diagnostic: {
      ds1: 0,
      ds2: 2, // wrong
      ds3: "print(\"Hello World\");",
      ds4: "Loop semicolon issue"
    },
    metadata: {
      stream: "Other",
      prior_coding: "No",
      device_availability: "Lab only",
      study_hours: 1.5,
      sleep_hours: 6.5,
      confusing_part: "Everything, especially variables",
      support_type: "Extra lab slot"
    }
  },
  {
    name: "Neha Kapoor",
    roll: "BCA-2026-10",
    email: "neha.k@bca.example",
    likert: {
      shi1: 5, shi2: 4, shi3: 5, shi4: 5, shi5: 4,
      sei1: 5, sei2: 5, sei3: 4, sei4: 5, sei5: 5,
      ati1: 1, ati2: 2, ati3: 5, ati4: 5, ati5: 5,
      swi1: 1, swi2: 5, swi3: 4, swi4: 4, swi5: 5
    },
    diagnostic: {
      ds1: 0,
      ds2: 1,
      ds3: "printf(\"Hello World\");",
      ds4: "Semicolon after the loop breaks the logic."
    },
    metadata: {
      stream: "Science",
      prior_coding: "Yes",
      device_availability: "Laptop + Phone",
      study_hours: 3.5,
      sleep_hours: 8,
      confusing_part: "Multidimensional arrays",
      support_type: "1:1 doubt-clinic"
    }
  }
];

export function seedClass() {
  clearStore();
  for (const f of fixtures) {
    addSubmission(f);
  }
}
