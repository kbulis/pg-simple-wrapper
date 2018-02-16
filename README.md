[![npm][npm]][npm-url] [![deps][deps]][deps-url]

# pg-simple-wrapper
Simple wrapper around postgresql transactions using pg.

## Install
Include with "npm install" or "yarn add":

```bash
yarn add pg-simple-wrapper --dev
```

## Usage

Really simple query-forming wrapper around pg that cleans up (a bit) sql statement
generation for common operations (select list, insert single, access single, etc.).

Used as a typescript module.

```javascript
import { Xaxion } from 'pg-simple-wrapper';

class ModelRepository {

  client: Xaxion;

  async accessPooled(pooledCode: string): Promise<Pooled> {
    return this.client.access<Pooled>(ModelPooled, 'pooledId', {
      props: '* from "pooled" as p',
      where: 'p."ucode" = $#',
      param: [
        pooledCode,
      ]
    });
  }

  // ...

}
```

That's a trivial example, but should give you an idea of how it works. Keep in mind
that in the above example, ModelPooled must have the following "construction":

```javascript
 export interface Pooled {

  ucode: string;

  // ...

}
```

```javascript
import { Xaxion } from 'pg-simple-wrapper';
import { Pooled } from './Pooled';

export class ModelPooled implements Pooled {

  constructor(private client: Xaxion, private id: number, that: {
    ucode: string,
  }) {
    this.ucode = that.ucode;
  }

  ucode: string = '';

  // ...
  
}
```

[npm]: https://img.shields.io/npm/v/pg-simple-wrapper.svg
[npm-url]: https://npmjs.com/package/pg-simple-wrapper

[deps]: https://david-dm.org/kbulis/pg-simple-wrapper.svg
[deps-url]: https://david-dm.org/kbulis/pg-simple-wrapper
