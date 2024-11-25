import { Container } from 'typedi';
import { Pool } from 'mysql2/promise';
import OpenAI from 'openai';
import { Redis } from 'ioredis';

export default async ({ pool, openai, redis }: { pool: Pool; openai: OpenAI, redis : Redis }) => {
    Container.set('redis', redis);
    Container.set('pool', pool);
    Container.set('openai', openai);

    console.log('Dependencies injected successfully!');
};
