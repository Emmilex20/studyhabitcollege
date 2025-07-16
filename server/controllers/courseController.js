import mongoose from 'mongoose'
import Course from '../models/Course.js';
import User from '../models/User.js';
import Student from '../models/Student.js';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
const getCourses = async (req, res) => {
  try {
    let query = {};
    console.log('BEFORE condition:', query);
    console.log('Looking for teacher:', req.user._id.toString());

const debugCourse = await Course.findOne({
  teacher: new mongoose.Types.ObjectId(req.user._id)
});

console.log('Sample matching course:', debugCourse);


    if (req.user.role === 'teacher') {
  console.log('✅ Inside teacher block');
  query.teacher = req.user._id;
}  else if (req.user.role === 'student') {
      const studentProfile = await Student.findOne({ user: req.user._id });
      if (!studentProfile) {
        return res.status(404).json({ message: 'Student profile not found.' });
      }
      query._id = { $in: studentProfile.courses };
    } else if (req.user.role === 'parent') {
      const children = await Student.find({ parent: req.user._id }).select('courses');
      const courseIds = children.flatMap(child => child.courses);
      query._id = { $in: courseIds };
    }
    
console.log('AFTER setting query.teacher:', query);

    const courses = await Course.find(query)
  .populate('teacher', 'firstName lastName email role')
  .lean();

for (const course of courses) {
  const enrolledStudents = await Student.find({ enrolledCourses: course._id })
    .populate('user', 'firstName lastName email')
    .select('studentId user');

  course.students = enrolledStudents;
}

      console.log('Found courses:', courses);


    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Private
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'firstName lastName email');
    if (course) {
      res.status(200).json(course);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = async (req, res) => {
  const { name, code, description, teacher, yearLevel, academicYear, term } = req.body;

  if (!name || !code || !yearLevel) {
    return res.status(400).json({ message: 'Please enter all required course fields' });
  }

  try {
    const courseExists = await Course.findOne({ $or: [{ name }, { code }] });
    if (courseExists) {
      return res.status(400).json({ message: 'Course with this name or code already exists' });
    }

    let assignedTeacher = null;
    if (teacher) {
      const existingTeacher = await User.findOne({ _id: teacher, role: 'teacher' });
      if (!existingTeacher) {
        return res.status(400).json({ message: 'Provided teacher ID is invalid or not a teacher' });
      }
      assignedTeacher = existingTeacher._id;
    }

    const course = new Course({
      name,
      code,
      description,
      teacher: assignedTeacher,
      yearLevel,
      academicYear,
      term,
    });

    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = async (req, res) => {
  const { name, code, description, teacher, yearLevel } = req.body;

  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    let assignedTeacher = course.teacher;
    if (teacher !== undefined) {
      if (!teacher) {
        assignedTeacher = null;
      } else {
        const existingTeacher = await User.findOne({ _id: teacher, role: 'teacher' });
        if (!existingTeacher) {
          return res.status(400).json({ message: 'Provided teacher ID is invalid or not a teacher' });
        }
        assignedTeacher = existingTeacher._id;
      }
    }

    course.name = name || course.name;
    course.code = code || course.code;
    course.description = description || course.description;
    course.teacher = assignedTeacher;
    course.yearLevel = yearLevel || course.yearLevel;

    const updatedCourse = await course.save();
    res.status(200).json(updatedCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (course) {
      res.status(200).json({ message: 'Course removed' });
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};
