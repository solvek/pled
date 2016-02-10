# API Reference
    <a name="Pled"></a>
## Pled
**Kind**: global class  

* [Pled](#Pled)
    * [new Pled(options)](#new_Pled_new)
    * [.handleRequest()](#Pled+handleRequest)
    * [.execute()](#Pled+execute) ⇒
    * [.loadCache()](#Pled+loadCache) ⇒ <code>[Promise.&lt;CacheStatus&gt;](#CacheStatus)</code>

<a name="new_Pled_new"></a>
### new Pled(options)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> &#124; <code>Array.&lt;string&gt;</code> |  | Pled options object or array of sources |
| options.sources | <code>Array.&lt;string&gt;</code> |  | Sources of m3u files. Each source is either a path to local file of a url to an http file (starting from "http://" or "https://") |
| [options.filters] | <code>[Array.&lt;FilterFunction&gt;](#FilterFunction)</code> |  | Sequence of filters |
| [options.cachePath] | <code>string</code> |  | Path to cache file |
| [options.cacheTime] | <code>int</code> | <code>5*24*60*60*1000</code> | Time for cache in milliseconds. By default 5 days |
| [options.forceReload] | <code>boolean</code> |  | If cache file is specified this parameter allows to not use the cache but regenerate content (however resulting content still can be saved to the cache) |

<a name="Pled+handleRequest"></a>
### pled.handleRequest()
It is possible to use Pled in pair with [Express.js](http://expressjs.com/). Handles HTTP request.
See `samples` directory for an example.

**Kind**: instance method of <code>[Pled](#Pled)</code>  
<a name="Pled+execute"></a>
### pled.execute() ⇒
Processes play list sources and generates resulting playlist as string

**Kind**: instance method of <code>[Pled](#Pled)</code>  
**Returns**: Promise with a string value - content of m3u  
<a name="Pled+loadCache"></a>
### pled.loadCache() ⇒ <code>[Promise.&lt;CacheStatus&gt;](#CacheStatus)</code>
Loads playlist from cache file.

**Kind**: instance method of <code>[Pled](#Pled)</code>  

# API Documentation Generating
* Do not modify `api.md` it will be regenerated. Modify 'tools/api.hbs' instead.
* Regenerate readme: `npm run-script docs`

