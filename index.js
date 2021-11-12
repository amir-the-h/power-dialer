// import env variables from .env file
require('dotenv').config();
const app = require('./routes');
const port = process.env.PORT || 3000

// run the express app
app.listen(port, () => {
  console.log(`Listenting on http://localhost:${port}`);
});
