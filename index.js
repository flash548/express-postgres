const express = require('express')
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'me',
  host: 'localhost',
  database: 'students',
  password: '',
  port: 5432,
})


const app = express()
const port = 3000
app.use(express.json())


// for sake of convenience including the query functions in this file as well....
// FYI schema is ....
//
// FOR STUDENTS table:
// Column |  Type   | Collation | Nullable |               Default                
// --------+---------+-----------+----------+--------------------------------------
//  id     | integer |           | not null | nextval('students_id_seq'::regclass)
//  name   | text    |           |          | 
//
// FOR GRADES table:
// Column   |  Type   | Collation | Nullable |              Default               
// ------------+---------+-----------+----------+------------------------------------
//  id         | integer |           | not null | nextval('grades_id_seq'::regclass)
//  grade      | text    |           |          | 
//  student_id | integer |           |          | 
// Indexes:
//     "grades_pkey" PRIMARY KEY, btree (id)
// Foreign-key constraints:
//     "grades_student_id_fkey" FOREIGN KEY (student_id) REFERENCES students(id)


const getStudents = (req, res) => {
    if (!req.query.search) {
        pool.query('SELECT * FROM students ORDER BY id ASC', (error, results) => {
            if (error) {
              throw error
            }
            res.send(results.rows)
        })
    }
    else {
        pool.query('SELECT * FROM students WHERE name = $1 ORDER BY id ASC', [req.query.search.toLowerCase()], (error, results) => {
            if (error) {
              throw error
            }
            res.send(results.rows)
        })
    }
}

const getStudentById = (req, res) => {
    pool.query('SELECT * FROM students WHERE id = $1', [req.params.studentId], (error, results) => {
        if (error) {
          throw error
        }
        res.send(results.rows)
    })
}

const getGradesById = (req, res) => {
    pool.query('SELECT * FROM grades WHERE student_id = $1', [req.params.studentId], (error, results) => {
        if (error) {
          throw error
        }
        res.send(results.rows)
    })
}

const addGradeById = (req, res) => {
    pool.query('INSERT INTO grades (grade, student_id) VALUES ($1, $2) RETURNING *', [req.body.grade, req.body.id], (error, results) => {
        if (error) {
          throw error
        }
        res.send(results.rows)
    })

}

// wasnt rquired, but wanted to test it out (adds grade BY NAME)
const addGradeByName = (req, res) => {
    pool.query('INSERT INTO grades (grade, student_id) VALUES ($1, (SELECT id from students WHERE name = $2)) RETURNING *', [req.body.grade, req.body.name], (error, results) => {
        if (error) {
          throw error
        }
        res.send(results.rows)
    })

}

const addNewStudent = (req, res) => {
    pool.query('INSERT INTO students (name) VALUES ($1) RETURNING *', [req.body.name], (error, results) => {
        if (error) {
          throw error
        }
        res.send(results.rows);
    })
}

/* ROUTES */
 
// dumps all student records, if 'search' param not given....
//  ....otherwise dump's records matching 'search' param
app.get('/students', (req,res)=> { getStudents(req, res); });

// dumps a student's record (by-id)
app.get('/students/:studentId', (req,res)=> { getStudentById(req,res); });

// gets grades for student (by-id)
app.get('/grades/:studentId', (req,res)=> { getGradesById(req, res); });
    
// adds a grade to an existing user (by-id)
app.post('/grade/id', (req,res)=> { addGradeById(req, res); });

// adds a grade to an existing user (by-NAME)
app.post('/grade/name', (req,res)=> { addGradeByName(req, res); });

// adds a new student to the db
app.post('/register', (req,res)=> { addNewStudent(req, res); });

app.listen(port, () => console.log(`DB app listening at http://localhost:${port}`));