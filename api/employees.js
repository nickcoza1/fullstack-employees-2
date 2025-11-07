// api/employees.js
import express from "express";
import db from "#db/client";

const router = express.Router();

// helper: id must be all digits (so "1e10" is NOT valid)
function isValidId(value) {
  return /^\d+$/.test(value);
}

// GET /employees
router.get("/", async (req, res, next) => {
  try {
    const { rows } = await db.query("SELECT * FROM employees;");
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /employees/:id
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // invalid shape like "1e10"
    if (!isValidId(id)) {
      return res.status(400).json({ error: "id must be a positive integer" });
    }

    const { rows } = await db.query(
      "SELECT * FROM employees WHERE id = $1;",
      [id]
    );

    // shape is fine but no employee → 404
    if (rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /employees
router.post("/", async (req, res, next) => {
  try {
    const { name, birthday, salary } = req.body || {};
    if (!name || !birthday || typeof salary !== "number") {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { rows } = await db.query(
      `
      INSERT INTO employees (name, birthday, salary)
      VALUES ($1, $2, $3)
      RETURNING *;
      `,
      [name, birthday, salary]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /employees/:id
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, birthday, salary } = req.body || {};

    // body validations (tests do these)
    if (!req.body) {
      return res.status(400).json({ error: "Request body required" });
    }
    if (!name || !birthday || typeof salary !== "number") {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // id shape
    if (!isValidId(id)) {
      return res.status(400).json({ error: "id must be a positive integer" });
    }

    const { rows } = await db.query(
      `
      UPDATE employees
      SET name = $1,
          birthday = $2,
          salary = $3
      WHERE id = $4
      RETURNING *;
      `,
      [name, birthday, salary, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /employees/:id
router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;

  // bad id like "1e10"
  if (!isValidId(id)) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }

  try {
    const result = await db.query(
      "DELETE FROM employees WHERE id = $1 RETURNING *;",
      [id]
    );

    // id was fine but row doesn't exist → 404
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // success → 204
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

export default router;
