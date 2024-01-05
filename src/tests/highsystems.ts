'use strict';

/* Dependencies */
import * as dotenv from 'dotenv';
import ava from 'ava';

import { HighSystems, HighSystemsOptions } from '../client';

/* Tests */
dotenv.config();

const HS_INSTANCE = process.env.HS_INSTANCE;
const HS_USERTOKEN = process.env.HS_USERTOKEN;

if(!HS_INSTANCE || !HS_USERTOKEN){
	throw new Error('Please check your .env file');
}

const hsOptions: HighSystemsOptions = {
	instance: HS_INSTANCE,
	userToken: HS_USERTOKEN,

	userAgent: 'Testing',

	connectionLimit: 10,
	connectionLimitPeriod: 1000,
	errorOnConnectionLimit: false,

	proxy: false
};

const hs = new HighSystems(hsOptions);

ava.serial('toJSON()', async (t) => {
	return t.truthy(JSON.stringify(hs.toJSON()) === JSON.stringify(hsOptions));
});

ava.serial('fromJSON()', async (t) => {
	hs.fromJSON(hsOptions);

	return t.truthy(JSON.stringify(hs.toJSON()) === JSON.stringify(hsOptions));
});

ava.serial('FromJSON()', async (t) => {
	const nQb = HighSystems.fromJSON(hsOptions);

	return t.truthy(JSON.stringify(nQb.toJSON()) === JSON.stringify(hsOptions));
});

ava.serial('getRecords', async (t) => {
	const results = await hs.getRecords({
		appid: 'grin4pcqqquude',
		tableid: 'lr511k2i3nlxyp',
		columns: 'id'
	});

	return t.truthy(results[0] !== undefined);
});
