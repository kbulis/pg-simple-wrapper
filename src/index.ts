import * as persist from 'pg';

/**
 * Xaxion implementation.
 * 
 * Simple wrapper around pg library for abstracting postgres database access.
 * Really, pg does all the heavy lifting, but you may find, as I did, that
 * this little wrapper cleans up a lot of what you intend in your data access
 * layer code.
 * 
 * Note that this approach very much assumes you wrap row data with a model
 * class that constructs with a numeric (serial) row id. As well, the rest
 * of the class' properties should match the column names one for one. If
 * you maintain a json column called "value", then it will be spread into
 * the initialization object during model object construction. Get those
 * aspects in place and you should be in good shape.
 * 
 * @author Kirk Bulis
 */
export class Xaxion {

  constructor(private client: persist.PoolClient) {
  }

  async select<T>(M: { new(x: Xaxion, id: number, props: any): T }, idLabel: string, options: { props: string, where: string, extra?: { prop: any, pred: string }[], order?: string, limit?: number, index?: number, param: any[]}): Promise<T[]> {
    const { props, where, extra, order, limit, index, param } = options;

    if (props) {
      let query: string = `select ${props} where ${where}${extra ? extra.map((e) => e.prop ? e.pred : '').reduce((p, c) => c ? (p + ' and ' + c) : p, '') : ``}${order ? ` order by ${order}` : ``}${limit ? ` limit ${limit} offset ${index}` : ``};`;

      if (query.indexOf('$#') > 0) {
        for (let cur = 0, nxt = 0, idx = 1; (nxt = query.indexOf('$#', cur)) > 0; ++idx) {
          query = query.slice(0, nxt) + '$' + idx + query.slice(nxt + 2);
        }
      }

      try {
        const result = await this.client.query(query, [
          ...(param ? param : []),
          ...(extra ? extra.filter((e) => e.prop) : []),
        ]);

        return result.rows.map(row => new M(this, row[idLabel], {
          ...row.value,
          ...row,
        }));
      }
      catch (eX) {
        throw eX;
      }
    }

    throw new Error('Missing options');
  }

  async access<T>(M: { new(x: Xaxion, id: number, props: any): T }, idLabel: string, options: { props: string, where: string, extra?: { prop: any, pred: string }[], param: any[]}): Promise<T> {
    const { props, where, extra, param } = options;

    if (props) {
      let query: string = `select ${props} where ${where}${extra ? extra.map((e) => e.prop ? e.pred : '').reduce((p, c) => c ? (p + ' and ' + c) : p, '') : ``};`;

      if (query.indexOf('$#') > 0) {
        for (let cur = 0, nxt = 0, idx = 1; (nxt = query.indexOf('$#', cur)) > 0; ++idx) {
          query = query.slice(0, nxt) + '$' + idx + query.slice(nxt + 2);
        }
      }

      try {
        const result = await this.client.query(query, [
          ...(param ? param : []),
          ...(extra ? extra.filter((e) => e.prop) : []),
        ]);

        if (result.rowCount > 0) {
          return new M(this, result.rows[0][idLabel], {
            ...result.rows[0].value,
            ...result.rows[0],
          });
        }
      }
      catch (eX) {
        throw eX;
      }

      throw new Error('Entity not accessed');
    }

    throw new Error('Missing options');
  }
  
  async insert<T>(M: { new(x: Xaxion, id: number, props: any): T }, idLabel: string, options: { props: string, param: any[]}): Promise<T> {
    const { props, param } = options;

    if (props) {
      let query: string = `insert into ${props} values(${param ? param.reduce((p, c, i) => p += (p ? ', ' : '') + '$' + (i + 1), '') : ``}) returning *;`;

      if (query.indexOf('$#') > 0) {
        for (let cur = 0, nxt = 0, idx = 1; (nxt = query.indexOf('$#', cur)) > 0; ++idx) {
          query = query.slice(0, nxt) + '$' + idx + query.slice(nxt + 2);
        }
      }

      try {
        const result = await this.client.query(query, [
          ...(param ? param : []),
        ]);

        if (result.rowCount > 0) {
          return new M(this, result.rows[0][idLabel], {
            ...result.rows[0].value,
            ...result.rows[0],
          });
        }
      }
      catch (eX) {
        throw eX;
      }

      throw new Error('Entity not inserted');
    }

    throw new Error('Missing options');
  }

  async fetch(idLabel: string, query: string, values?: any[] | undefined): Promise<any> {
    return (await this.client.query(query, values)).rows[0][idLabel];
  }

  async query(statement: string, values?: any[] | undefined): Promise<persist.QueryResult> {
    return await this.client.query(statement, values);
  }

  async release(): Promise<void> {
    await this.client.query('rollback');
    this.client.release();
  }

}
