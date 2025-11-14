# Video Player Component

A professional, responsive video player built with Video.js and HLS.js support for streaming M3U8 content.

## Features

- **HLS Streaming Support**: Native support for M3U8 streams via Video.js
- **Responsive Design**: 16:9 aspect ratio with fluid layout
- **Mobile Optimized**: Touch-friendly controls with `playsInline` support
- **Loading States**: Visual loading indicator with spinner
- **Error Handling**: Graceful error states with user-friendly messages
- **Dynamic Source Updates**: Automatically updates when `videoUrl` prop changes
- **Autoplay Support**: Configurable autoplay with fallback handling
- **Custom Styling**: Themed controls matching the app design
- **Picture-in-Picture**: Native PiP support
- **Fullscreen**: Full-screen playback support

## Usage

```tsx
import VideoPlayer from "@/components/player/video-player";

<VideoPlayer
  videoUrl="https://example.com/stream.m3u8"
  autoplay={true}
  poster="https://example.com/poster.jpg"
  onError={(error) => console.error("Video error:", error)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `videoUrl` | `string` | **Required** | The M3U8 stream URL to play |
| `autoplay` | `boolean` | `true` | Whether to start playback automatically |
| `poster` | `string` | `undefined` | Poster image URL displayed before playback |
| `onError` | `(error: any) => void` | `undefined` | Callback fired when a video error occurs |

## Implementation Details

### HLS Configuration

The player uses Video.js with the following configuration:
- VHS (Video.js HTTP Streaming) with native override
- Responsive and fluid layout
- 16:9 aspect ratio
- Enhanced control bar with inline volume and PiP toggle

### Error States

The component handles errors gracefully by:
1. Displaying an error icon and message
2. Calling the `onError` callback if provided
3. Stopping the loading indicator

### Source Updates

When the `videoUrl` prop changes:
1. The error state is cleared
2. Loading state is activated
3. The new source is loaded
4. Autoplay is attempted (if enabled)

### Cleanup

The player is properly disposed when the component unmounts to prevent memory leaks.

## Styling

Custom Video.js styles are defined in `app/globals.css`:
- Blue accent color matching the app theme
- Transparent control bar with backdrop blur
- Responsive touch targets for mobile
- Circular big play button with hover effects

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (including iOS)
- Mobile browsers: Optimized with `playsInline`

## Dependencies

- `video.js`: ^8.21.0
- `@types/video.js`: Latest (dev dependency)
- `hls.js`: ^1.5.20 (peer dependency via Video.js)
