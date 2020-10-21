# SkyGallery
Powered by [Skynet](https://siasky.net/)

Example album: https://skygallery.xyz/a/AAAtpYuAvllPMKe-eKYGC4MLX2ASJrLyFMGg2YfRF8BwsQ

## Why use SkyGallery?
- Files are stored with a 10x redundancy on a decentralized storage network called [Sia](https://sia.tech/) for high availability and speed
- Video support including user selectable thumbnails
- Really good mobile experince including swipe to scroll in the album fullscreen view
- You can add titles and album cards to exisitng albums, allowing for nested collections
- 100% free, if you use a public free skynet webportal (like [skyportal.xyz](https://skyportal.xyz/) or [siasky.net](https://siasky.net/))
- No anoying ads, cookie notices, trackers or paywalls
- You can also use your own sia node, this gives you the advantage of not having to trust any portal as well as having your files pined for as long as you want. With this you also have to pay for storage an traffic, but the costs on sia are a fraction of common hosting prices
- Easy to use UI with click to copy share links and iframe embed support
- Album meta data is stored as an open json file uploaded to skynet together with the images
- Totally client side, files are processed (compressed and resized for thumbnails) by the browser before uploading


Example video: https://skygallery.xyz/a/AAD2afVSNvnGJ_pgqq9yWIQd374Bkyr2ie-S0uIqT6vHVA

## Screenshots

<img src="src/assets/skygallery.gif?raw=true" width="100%">

![Homepage with portal selector](https://skyportal.xyz/TABU16Lx2h-ibArlejKa_ziYUa2Td2xwMjj07YXzRAhRVQ)
![New Album Page](https://skyportal.xyz/fAcjmBg0tco6gn5FBCz-tYNtufEc-9dY29S-5oeqD258gg)
![Link existing albums](https://skyportal.xyz/_AAvHeqddp9cvarGVRYIIwJ4g08tXHpwVR62V2KOBRppCQ)
![Fullscreen view with exif data](https://skyportal.xyz/PAC0y100KKW-HPWuRAqr7dZOQpM464qO_K_hko6Mwowmhg)

## Upcoming features
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
