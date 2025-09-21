import Salary from "../models/Salary.js";

// CREATE
export const createSalary = async (req, res) => {
  try {
    const salary = new Salary(req.body);
    await salary.save();
    res.status(201).json(salary);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// READ ALL
export const getAllSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find();
    res.json(salaries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// READ ONE
export const getSalaryById = async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id);
    if (!salary) return res.status(404).json({ error: "Salary not found" });
    res.json(salary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
export const updateSalary = async (req, res) => {
  try {
    const salary = await Salary.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!salary) return res.status(404).json({ error: "Salary not found" });
    res.json(salary);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// DELETE
export const deleteSalary = async (req, res) => {
  try {
    const salary = await Salary.findByIdAndDelete(req.params.id);
    if (!salary) return res.status(404).json({ error: "Salary not found" });
    res.json({ message: "Salary deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
