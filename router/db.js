// const { Pool } = require('pg');
import {Pool} from 'pg';
// Database configuration


export const query = (text, params) => pool.query(text, params);