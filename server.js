const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({path:'./.env'});

//In case of  any Unhandaled Rejection like database shutdown (ssync code)
//Errors like console.log(x)
//We put it right at the top so the this will excute first before any error occur
process.on('uncaughtException', err =>{
  console.log('Error: ', err.name, ', Message: ', err.message)
  process.exit(1);
})

const app = require('./app');

const database = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);
mongoose.connect( database, {
  useNewUrlParser:true,
  useCreateIndex:true,
  useFindAndModify:true
}).then(()=>console.log('Connection successfully created'));


const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});

//In case of  any Unhandaled Rejection like database shutdown (Async code)
process.on('unhandledRejection', err =>{
  console.log('Error: ', err.name, ', Message: ', err.message)
  server.close(()=>{
    process.exit(1);
  })
})

