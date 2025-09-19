// middleware/validateSalary.js
export const validateSalary = (req, res, next) => {
  const { Base_Salary, Net_Salary, Month } = req.body;
  
  if (!Base_Salary || Base_Salary <= 0) {
    return res.status(400).json({ message: "Valid base salary is required" });
  }
  
  if (!Net_Salary || Net_Salary < 0) {
    return res.status(400).json({ message: "Net salary must be positive" });
  }
  
  if (!Month) {
    return res.status(400).json({ message: "Month is required" });
  }
  
  next();
};
