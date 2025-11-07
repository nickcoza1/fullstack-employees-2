import db from "#db/client";

await db.connect();
await seedEmployees();
await db.end();
console.log("🌱 Database seeded.");

async function seedEmployees() {
  // wipe it to be safe
  await db.query("DELETE FROM employees;");

  const employees = [
    ["Alice Johnson", "1990-01-05", 70000],
    ["Bob Smith", "1985-03-12", 65000],
    ["Carol Davis", "1992-07-23", 72000],
    ["David Lee", "1988-11-02", 68000],
    ["Emily Brown", "1995-04-17", 63000],
    ["Frank Wilson", "1991-09-30", 75000],
    ["Grace Kim", "1989-06-14", 71000],
    ["Henry Clark", "1993-12-25", 69000],
    ["Irene Lopez", "1994-08-08", 64000],
    ["Jack Turner", "1987-02-19", 80000],
  ];

  // insert them in one go
  for (const [name, birthday, salary] of employees) {
    await db.query(
      `
      INSERT INTO employees (name, birthday, salary)
      VALUES ($1, $2, $3);
      `,
      [name, birthday, salary],
    );
  }
}