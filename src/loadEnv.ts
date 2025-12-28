import dotenv from 'dotenv';
import path from 'path';

const env = process.env.NODE_ENV || 'development';
const envFile = `.env.${env}`;
//console.log(envFile,{ path: path.resolve(__dirname, `../${envFile}`) } ,"<<line 6")
dotenv.config({ path: path.resolve(__dirname, `../${envFile}`) })


import './server'