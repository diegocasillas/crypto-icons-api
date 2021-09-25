# Crypto Icons API

This project is a service for serving the icons created and maintained by the
[Cryptocurrency Icons](https://github.com/atomiclabs/cryptocurrency-icons) project.

This service is a fork from [reddavis/Crypto-Icons-API](https://github.com/reddavis/Crypto-Icons-API).

This fork supports responses in SVG format by default and optionally in PNG format by using the query parameter `?png=true`.

## API

```
GET api/:style/:currency/:size
```

### Styles

- `black`
- `white`
- `color`
- `icon`

### Override Colors

By default both `color` and `icon` styles have a color assigned from the original
assets created by the
[Cryptocurrency Icons](https://github.com/atomiclabs/cryptocurrency-icons) project.

You can optionally override these colors by passing your own hexidecimal value
as the last value to API calls for these styles only. The hexidecimal value
you pass should not include the `#` prefix.

### Examples

```
GET api/color/eth/600
```

```
GET api/black/btc/200
```

```
GET api/icon/btc/ff00ff
```

### Get response in PNG format

By default the service returns SVGs. You can get responses in PNG format by setting the `?png=true` query parameter.

### Examples

```
GET api/icon/btc/200?png=true
```

## License

All the SVG files are under the same license as the [Cryptocurrency Icons](https://github.com/atomiclabs/cryptocurrency-icons) project.

The rest of the project is MIT.
