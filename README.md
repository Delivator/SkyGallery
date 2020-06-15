# SkyGallery
Powered by [Skynet](https://siasky.net/)

Example album: https://skygallery.xyz/a/EADikasKV2EdYiqli2TsgzSX6QJgdyvfR2JCl2guBRu9zg

## Why use SkyGallery?
- Files are stored with a 10x redundancy on a decentralized storage network called [Sia](https://sia.tech/) for high availability and speed
- 100% free, if you use a public free skynet webportal (like [skyportal.xyz](https://skyportal.xyz/) or [siasky.net](https://siasky.net/))
- No anoying ads, cookie notices, trackers or paywalls
- You can also use your own sia node, this gives you the advantage of not having to trust any portal as well as having your files pined for as long as you want. With this you also have to pay for storage an traffic, but the costs on sia are a fraction of common hosting prices.
- Easy to use UI with click to copy share links and iframe embed support
- Album meta data is stored as an open json file uploaded to skynet together with the images
- totally client side, files are processed (compressed and resized for thumbnails) by the browser before uploading


Example video: https://cdn.skyportal.xyz/AAAm08XnTmP4BtcMGaLeVWZSvScnPCDgEWJtgkvSNUtgVw

## Screenshots

<img src="src/assets/skygallery.gif?raw=true" width="100%">

![Homepage](https://cdn.skyportal.xyz/dAD_sdc4v1L0MW3FvPSkmZnVgyY-FgC5pkjgGsbFruO4ng)
![New Album Page](https://cdn.skyportal.xyz/fADx1p3Ar6eVfG-Rkjy-CmnL91qnKe1o5RWvYYkML3G8qw)

## Upcoming features
- Linking to other albums in your album
- Adding a location/map

## Project setup
`npm install`

### Compiles and hot-reloads for development
`npm run serve`

### Compiles and minifies for production
`npm run build`

### Build and upload to Skynet
`npm run publish`

### Lints and fixes files
`npm run lint`
