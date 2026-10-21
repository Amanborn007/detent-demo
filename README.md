# detent-demo

A tiny slugify library. It exists as the target repo for the [Detent](https://github.com/Amanborn007/detent) worked example.

```js
import { slugify } from "detent-demo";
slugify("Crème Brûlée"); // "creme-brulee"
slugify("Hello brave new world", { maxLength: 13 }); // "hello-brave"
```

Run the tests with `npm test`.
