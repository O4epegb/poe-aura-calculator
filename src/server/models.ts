import * as express from 'express';

export interface Request extends express.Request {}
export interface Response extends express.Response {}
export interface NextFunction extends express.NextFunction {}
