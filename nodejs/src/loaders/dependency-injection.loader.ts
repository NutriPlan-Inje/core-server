import { Container } from 'typedi';
import { Pool } from 'mysql2/promise';
import { Redis } from 'ioredis';

export default async ({ pool, redis }: { pool: Pool, redis : Redis }) => {
    Container.set('pool', pool);
    Container.set('redis', redis);

    console.log('Dependencies injected successfully!');
};
