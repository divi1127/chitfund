import express from 'express';
import Employee from '../models/Employee.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    console.log(`📋 Employees: Fetching all employees (requested by ${req.user.userId})`);
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    console.error('❌ Employees: Error fetching:', error.message);
    res.status(500).json({ message: 'Server error fetching employees' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const employee = await Employee.findOne({ id: req.params.id });
    if (!employee) {
      console.error(`❌ Employees: Not found - ${req.params.id}`);
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error('❌ Employees: Error fetching:', error.message);
    res.status(500).json({ message: 'Server error fetching employee' });
  }
});

router.post('/', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const employee = new Employee(req.body);
    const saved = await employee.save();
    console.log(`✅ Employees: Created ${saved.name} (${saved.id})`);
    res.status(201).json(saved);
  } catch (error) {
    console.error('❌ Employees: Error creating:', error.message);
    res.status(400).json({ message: 'Error creating employee: ' + error.message });
  }
});

router.put('/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const employee = await Employee.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!employee) {
      console.error(`❌ Employees: Not found for update - ${req.params.id}`);
      return res.status(404).json({ message: 'Employee not found' });
    }
    console.log(`✅ Employees: Updated ${employee.name}`);
    res.json(employee);
  } catch (error) {
    console.error('❌ Employees: Error updating:', error.message);
    res.status(400).json({ message: 'Error updating employee: ' + error.message });
  }
});

router.delete('/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const employee = await Employee.findOneAndDelete({ id: req.params.id });
    if (!employee) {
      console.error(`❌ Employees: Not found for delete - ${req.params.id}`);
      return res.status(404).json({ message: 'Employee not found' });
    }
    console.log(`✅ Employees: Deleted ${employee.name}`);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('❌ Employees: Error deleting:', error.message);
    res.status(500).json({ message: 'Server error deleting employee' });
  }
});

export default router;
