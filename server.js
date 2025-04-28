// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const cors = require('cors'); 
// const app = express();


// app.use(cors());
// app.use(bodyParser.json());


// mongoose.connect('mongodb://127.0.0.1:27017/formdb', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => console.log('MongoDB connected'))
//   .catch(err => console.log(err));


// const Form = require('./FormModel');


// app.post('/submit-form', async (req, res) => {
//   try {
//     const { name, email, message } = req.body;

//     const newForm = new Form({ name, email, message });
//     await newForm.save();
    
//     res.json({ message: 'Form submitted successfully!' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error submitting form' });
//   }
// });


// app.get('/forms', async (req, res) => {
//   try {
//     const forms = await Form.find();
//     res.json(forms);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error fetching forms' });
//   }
// });


// app.put('/forms/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, email, message } = req.body;

//     const updatedForm = await Form.findByIdAndUpdate(id, { name, email, message }, { new: true });
    
//     if (!updatedForm) {
//       return res.status(404).json({ message: 'Form not found' });
//     }

//     res.json({ message: 'Form updated successfully!', updatedForm });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error updating form' });
//   }
// });


// app.delete('/forms/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const deletedForm = await Form.findByIdAndDelete(id);
    
//     if (!deletedForm) {
//       return res.status(404).json({ message: 'Form not found' });
//     }

//     res.json({ message: 'Form deleted successfully!' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error deleting form' });
//   }
// });

// // Server Start
// const PORT = 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

const express = require('express');
const cassandra = require('cassandra-driver');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4, validate: uuidValidate } = require('uuid');
const { Uuid } = cassandra.types;

const app = express();
app.use(cors());
app.use(bodyParser.json());

const client = new cassandra.Client({
  contactPoints: ['127.0.0.1'],
  localDataCenter: 'datacenter1',
  keyspace: 'prn22510027_db'
});

app.post('/submit-form', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const id = uuidv4();

    const query = 'INSERT INTO users (id, name, email, message) VALUES (?, ?, ?, ?)';
    await client.execute(query, [id, name, email, message]);

    res.json({ message: 'Form submitted successfully!', id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error submitting form' });
  }
});

app.get('/forms', async (req, res) => {
  try {
    const query = 'SELECT * FROM users';
    const result = await client.execute(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching forms' });
  }
});

app.put('/forms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, message } = req.body;

    if (!uuidValidate(id)) {
      return res.status(400).json({ message: 'Invalid UUID format' });
    }

    const query = 'UPDATE users SET name = ?, email = ?, message = ? WHERE id = ?';
    await client.execute(query, [name, email, message, Uuid.fromString(id)], { prepare: true });

    res.json({ message: 'Form updated successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating form' });
  }
});

app.delete('/forms/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!uuidValidate(id)) {
      return res.status(400).json({ message: 'Invalid UUID format' });
    }

    const query = 'DELETE FROM users WHERE id = ?';
    await client.execute(query, [Uuid.fromString(id)], { prepare: true });

    res.json({ message: 'Form deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting form' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
