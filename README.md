# pg-simple-wrapper [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
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

## License

MIT © [Kirk Bulis](http://github.com/kbulis)

[npm-image]: https://badge.fury.io/js/pg-simple-wrapper.svg
[npm-url]: https://npmjs.org/package/pg-simple-wrapper
[travis-image]: https://travis-ci.org/kbulis/pg-simple-wrapper.svg?branch=master
[travis-url]: https://travis-ci.org/kbulis/pg-simple-wrapper
[daviddm-image]: https://david-dm.org/kbulis/pg-simple-wrapper.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/kbulis/pg-simple-wrapper
