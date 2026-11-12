import createError from 'http-errors';
import express, { json, urlencoded } from 'express';
import path, { join } from 'path';
const __dirname = path.resolve();
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import artistsRouter from './routes/artists.ts';
import createFromDBRouter from './routes/createFromDB.ts';
import indexRouter from './routes/index.ts';
import loginRouter from './routes/login.ts';
import runRouter from './routes/run.ts';
import refreshRouter from './routes/refresh.ts';
import tracksRouter from './routes/tracks.ts';

var app = express();

// Set up mongoose connection
import { set, connect } from "mongoose";
set("strictQuery", false);
const mongoDB = process.env.MONGODB!;

main().catch((err) => console.log(err));
async function main() {
  await connect(mongoDB);
}

// view engine setup
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'src/views/static')))

app.use('/', indexRouter);
app.use('/artists', artistsRouter);
app.use('/createFromDB', createFromDBRouter);
app.use('/login', loginRouter);
app.use('/run', runRouter);
app.use('/refresh', refreshRouter);
app.use('/tracks', tracksRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err: any, req: any, res: any, next: any) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
