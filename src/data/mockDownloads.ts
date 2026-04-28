import { DownloadItem } from '@/types';

const FILES: Array<{ name: string; mime: DownloadItem['mimeType']; size: number }> = [
  { name: 'pro-browser-press-kit.pdf', mime: 'application/pdf', size: 12_300_000 },
  { name: 'mountain-wallpaper-4k.jpg', mime: 'image/jpeg', size: 2_500_000 },
  { name: 'team-meeting.mp4', mime: 'video/mp4', size: 480_000_000 },
  { name: 'quarterly-report.xlsx', mime: 'application/vnd.openxmlformats', size: 1_200_000 },
  { name: 'release-notes.txt', mime: 'text/plain', size: 24_000 },
  { name: 'pro-browser-elite-1.0.0.apk', mime: 'application/vnd.android.package-archive', size: 84_000_000 },
  { name: 'invoice-2024-04.pdf', mime: 'application/pdf', size: 320_000 },
  { name: 'product-photos.zip', mime: 'application/zip', size: 245_000_000 },
  { name: 'music-favorites.mp3', mime: 'audio/mpeg', size: 7_200_000 },
  { name: 'design-spec.fig', mime: 'application/figma', size: 38_000_000 },
  { name: 'engineering-roadmap.docx', mime: 'application/msword', size: 1_400_000 },
  { name: 'snapshot.png', mime: 'image/png', size: 4_900_000 },
  { name: 'hike-trail.gpx', mime: 'application/gpx+xml', size: 80_000 },
  { name: 'travel-guide-tokyo.pdf', mime: 'application/pdf', size: 28_000_000 },
  { name: 'react-native-tutorials.zip', mime: 'application/zip', size: 124_000_000 },
];

const STATUSES: DownloadItem['status'][] = ['completed', 'completed', 'completed', 'in_progress', 'paused', 'failed'];

export const DOWNLOADS: DownloadItem[] = FILES.map((f, idx) => ({
  id: `dl-${idx + 1}`,
  fileName: f.name,
  url: `https://download.example.com/files/${f.name}?id=${idx + 1}`,
  mimeType: f.mime,
  sizeBytes: f.size,
  downloadedAt: Date.now() - idx * 1000 * 60 * 73,
  status: STATUSES[idx % STATUSES.length],
  progress:
    STATUSES[idx % STATUSES.length] === 'completed'
      ? 1
      : STATUSES[idx % STATUSES.length] === 'in_progress'
      ? 0.4 + (idx % 6) * 0.08
      : STATUSES[idx % STATUSES.length] === 'paused'
      ? 0.3
      : 0.7,
  destinationPath: `/storage/Downloads/${f.name}`,
  source: 'pro-browser-elite',
  description: `Downloaded ${f.name} from a saved page.`,
  tags: ['download', f.mime.split('/')[0]],
}));

export function getDownloadById(id: string): DownloadItem | undefined {
  return DOWNLOADS.find((d) => d.id === id);
}
