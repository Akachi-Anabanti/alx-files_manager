// server file
//
import express from 'express';
import routes from './routes';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

routes(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
